/**
 * B5.3 — 3-layer audio mixer (Node-only).
 *
 * Lives under scripts/ rather than src/lib/affirmations/ because it
 * shells out to ffmpeg via child_process. Cloudflare Workers can't
 * execute ffmpeg (no subprocess; ffmpeg.wasm exceeds CPU + memory
 * budget for 5-30 min mixes). The Worker cron route enqueues
 * deliveries; this module does the actual mixing out-of-band when
 * scripts/process-daily-mixes.mjs polls for queued rows.
 *
 * Layers:
 *   1. Music     — looped to target_length, 0 dB (unity)
 *   2. Solfeggio — sum of sine waves at solfeggio_hz, attenuated to
 *                   -13 dB combined (spec: -12 to -15)
 *   3. Affirmation — looped, subliminal at -25 dB (spec: -20 to -30)
 *
 * Output: 320 kbps MP3, stereo, 44.1 kHz.
 *
 * dB → linear scale:
 *   gain = 10 ^ (db / 20)
 *
 *   -13 dB ≈ 0.2239
 *   -25 dB ≈ 0.0562
 */

import { spawn } from 'node:child_process';
import { mkdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const FFMPEG_BIN = process.env.FFMPEG_BIN ?? 'ffmpeg';

const SOLFEGGIO_GAIN_DB = -13;
const AFFIRMATION_GAIN_DB = -25;

function dbToGain(db) {
  return Math.pow(10, db / 20);
}

async function downloadTo(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(destPath, buf);
  const st = await stat(destPath);
  if (st.size < 256) throw new Error(`download too small (${st.size}B) from ${url}`);
  return destPath;
}

function runFfmpeg(args, { logTag = 'ffmpeg' } = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(FFMPEG_BIN, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    proc.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) return resolve(undefined);
      reject(new Error(`${logTag} exited ${code}\n${stderr.slice(-2000)}`));
    });
  });
}

/**
 * Build the -filter_complex chain that produces a single [out] stream:
 *   [0] = music
 *   [1] = affirmation
 *   sine sources are generated inside the filter graph.
 */
function buildFilterGraph(targetSeconds, solfeggioHz) {
  const solfeggioGain = dbToGain(SOLFEGGIO_GAIN_DB);
  const affirmationGain = dbToGain(AFFIRMATION_GAIN_DB);

  // Each individual sine gets gain / sqrt(N) so the sum lands near
  // the target combined gain (incoherent equal-amplitude sum).
  const perSineGain = solfeggioGain / Math.sqrt(Math.max(1, solfeggioHz.length));

  // Generate the sine inputs (one per Hz).
  const sineLines = solfeggioHz.map((hz, i) =>
    `sine=frequency=${hz}:sample_rate=44100:duration=${targetSeconds},` +
    `aformat=channel_layouts=stereo,volume=${perSineGain.toFixed(4)}[s${i}]`,
  );

  // Mix all sines into a single [solf] stream.
  const sineMixLine =
    solfeggioHz.length === 1
      ? `[s0]anull[solf]`
      : `${solfeggioHz.map((_, i) => `[s${i}]`).join('')}amix=inputs=${solfeggioHz.length}:normalize=0[solf]`;

  // Music: loop forever, trim to target length, force stereo.
  const musicLine =
    `[0]aloop=loop=-1:size=2e9,atrim=duration=${targetSeconds},` +
    `aformat=channel_layouts=stereo,asetpts=N/SR/TB[music]`;

  // Affirmation: loop, trim, attenuate, force stereo.
  const affirmLine =
    `[1]aloop=loop=-1:size=2e9,atrim=duration=${targetSeconds},` +
    `aformat=channel_layouts=stereo,volume=${affirmationGain.toFixed(4)},` +
    `asetpts=N/SR/TB[affirm]`;

  // Final mix: amix with explicit weights to avoid auto-normalization.
  // Music at 1.0, solfeggio at 1.0 (already attenuated), affirmation at
  // 1.0 (already attenuated). normalize=0 preserves the relative gains.
  const finalMix =
    `[music][solf][affirm]amix=inputs=3:weights=1 1 1:normalize=0,` +
    `alimiter=limit=0.95[out]`;

  return [...sineLines, sineMixLine, musicLine, affirmLine, finalMix].join(';');
}

/**
 * mix3LayerAudio
 *
 * @param {object} opts
 * @param {string} opts.musicUrl
 * @param {string} opts.affirmationUrl
 * @param {number[]} opts.solfeggioHz
 * @param {number} opts.targetLengthSeconds
 * @param {string} [opts.workDir] - tmp dir (auto-created if omitted)
 * @returns {Promise<{ outputPath: string, sizeBytes: number, durationSeconds: number }>}
 */
export async function mix3LayerAudio({
  musicUrl,
  affirmationUrl,
  solfeggioHz,
  targetLengthSeconds,
  workDir,
}) {
  if (!musicUrl) throw new Error('musicUrl required');
  if (!affirmationUrl) throw new Error('affirmationUrl required');
  if (!Array.isArray(solfeggioHz) || solfeggioHz.length === 0) {
    throw new Error('solfeggioHz must be a non-empty number array');
  }
  if (!targetLengthSeconds || targetLengthSeconds < 30) {
    throw new Error(`targetLengthSeconds must be >= 30 (got ${targetLengthSeconds})`);
  }

  const id = randomUUID();
  const dir = workDir ?? path.join(tmpdir(), `daily-mix-${id}`);
  await mkdir(dir, { recursive: true });

  const musicPath  = path.join(dir, 'music.mp3');
  const affirmPath = path.join(dir, 'affirm.mp3');
  const outputPath = path.join(dir, 'mix.mp3');

  let cleanup = true;

  try {
    await Promise.all([
      downloadTo(musicUrl, musicPath),
      downloadTo(affirmationUrl, affirmPath),
    ]);

    const filter = buildFilterGraph(targetLengthSeconds, solfeggioHz);

    const args = [
      '-y',
      '-i', musicPath,
      '-i', affirmPath,
      '-filter_complex', filter,
      '-map', '[out]',
      '-c:a', 'libmp3lame',
      // 192 kbps stereo: 30-min mix ≈ 43 MB, fits Supabase 50 MB project cap.
      // Music is ambient + Solfeggio sine + subliminal voice; no audible
      // benefit from 320 kbps for this material.
      '-b:a', '192k',
      '-ar', '44100',
      '-ac', '2',
      '-metadata', 'comment=HERR daily delivery — Bianca D. McCall, M.A., LMFT',
      outputPath,
    ];

    await runFfmpeg(args, { logTag: 'ffmpeg mix' });

    const st = await stat(outputPath);
    cleanup = false; // caller is responsible for cleanup of outputPath
    return {
      outputPath,
      workDir: dir,
      sizeBytes: st.size,
      durationSeconds: targetLengthSeconds,
    };
  } finally {
    if (cleanup) {
      await rm(dir, { recursive: true, force: true }).catch(() => {});
    }
  }
}
