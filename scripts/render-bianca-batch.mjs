#!/usr/bin/env node
/**
 * Pipeline A spot-check runner.
 *
 * Mirrors src/lib/affirmations/render-bianca-master.ts but as a local
 * Node script so Bianca can spot-check the voice output without going
 * through the auth-gated Worker route.
 *
 * Usage:
 *   node scripts/render-bianca-batch.mjs --limit=5
 *   node scripts/render-bianca-batch.mjs --limit=50 --no-skip-flagged
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const BIANCA_VOICE_ID = 'XzFFCA8sHgwlJV4VkNtp';
const BIANCA_BUCKET = 'affirmations-bianca';
const BIANCA_VOICE_SETTINGS = {
  stability: 0.35,
  similarity_boost: 0.78,
  style: 0.45,
  use_speaker_boost: true,
  speed: 0.88,
};

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);
const LIMIT = parseInt(args.limit ?? '5', 10);
const PRIORITY = args.priority ?? null;

// FIX-3 A1 — core priority order (only used when --priority=core):
//   risk_tier='low_concern', cultural_routing='default', and domain
//   priority below (lower = first to render).
const DOMAIN_RANK = {
  meaning: 1, identity: 2, connection: 3, freedom: 4,
  guilt: 5, spiritual: 6, mortality: 7,
};

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ELEVENLABS_KEY = process.env.ELEVENLABS_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Supabase env missing');
if (!ELEVENLABS_KEY) throw new Error('ELEVENLABS_API_KEY missing');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function substitute(text, values) {
  return text.replace(/\{([a-z_0-9]+)\}/gi, (_, k) => (values[k] != null ? values[k] : `{${k}}`));
}

async function elevenLabsTTS(text) {
  const res = await fetch(`${ELEVENLABS_API_URL}/${BIANCA_VOICE_ID}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_KEY,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: BIANCA_VOICE_SETTINGS,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(`ElevenLabs ${res.status}: ${body.slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }
  return new Uint8Array(await res.arrayBuffer());
}

async function renderOne(tpl) {
  if (tpl.bianca_audio_url) return { skipped: true, reason: 'already_rendered' };
  if (tpl.status === 'flagged_review') return { skipped: true, reason: 'flagged_review' };

  const rendered = substitute(tpl.full_template_text, tpl.fallback_slot_values || {});
  const audio = await elevenLabsTTS(rendered);
  const path = `${tpl.activity_mode}/${tpl.existential_domain}/${tpl.risk_tier}/week-${tpl.week_of_month}/${tpl.id}.mp3`;

  const { error: upErr } = await supabase.storage
    .from(BIANCA_BUCKET)
    .upload(path, audio, {
      contentType: 'audio/mpeg',
      cacheControl: 'public, max-age=31536000, immutable',
      upsert: true,
    });
  if (upErr) throw new Error(`upload: ${upErr.message}`);

  const { data: pub } = supabase.storage.from(BIANCA_BUCKET).getPublicUrl(path);
  const { error: updErr } = await supabase
    .from('affirmation_template_library')
    .update({
      bianca_audio_url: pub.publicUrl,
      status: 'voice_rendered',
      updated_at: new Date().toISOString(),
    })
    .eq('id', tpl.id);
  if (updErr) throw new Error(`db update: ${updErr.message}`);

  return { skipped: false, url: pub.publicUrl, bytes: audio.byteLength, path, text: rendered };
}

async function checkElevenLabsBalance(requireRemaining) {
  const res = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
    headers: { 'xi-api-key': ELEVENLABS_KEY },
  });
  if (!res.ok) {
    throw new Error(`ElevenLabs balance check failed: ${res.status}`);
  }
  const data = await res.json();
  const remaining = (data.character_limit ?? 0) - (data.character_count ?? 0);
  console.log(`ElevenLabs balance: ${remaining.toLocaleString()} / ${(data.character_limit ?? 0).toLocaleString()} chars remaining (tier: ${data.tier})`);
  if (requireRemaining && remaining < requireRemaining) {
    throw new Error(
      `Pre-flight failed: ${remaining.toLocaleString()} chars remaining is below required ${requireRemaining.toLocaleString()}. Refill ElevenLabs credits or lower the gate.`,
    );
  }
  return remaining;
}

async function main() {
  console.log(`Pipeline A — limit=${LIMIT}${PRIORITY ? ` priority=${PRIORITY}` : ''}`);

  // FIX-3 A1 — explicit balance gate for partial-render execution.
  // The user-specified gate (270,000 chars) blocks accidental rip of
  // the full library when the monthly allotment is low.
  const minRequired = args['min-credits'] ? parseInt(args['min-credits'], 10) : 0;
  if (minRequired > 0) {
    await checkElevenLabsBalance(minRequired);
  } else if (PRIORITY === 'core') {
    // Soft display only — caller didn't gate explicitly.
    await checkElevenLabsBalance(0);
  }

  let q = supabase
    .from('affirmation_template_library')
    .select('id, activity_mode, existential_domain, risk_tier, week_of_month, full_template_text, fallback_slot_values, placeholder_slots, status, bianca_audio_url')
    .is('bianca_audio_url', null)
    .eq('status', 'pending_voice');

  if (PRIORITY === 'core') {
    q = q.eq('risk_tier', 'low_concern').eq('cultural_routing', 'default');
  }

  // Fetch a wide window when priority sort is on so we can apply domain
  // ranking in JS before slicing to LIMIT.
  const fetchWindow = PRIORITY === 'core' ? Math.max(LIMIT * 4, 200) : LIMIT;
  q = q.order('created_at', { ascending: true }).limit(fetchWindow);
  let { data: pending, error } = await q;
  if (error) throw error;

  if (PRIORITY === 'core' && pending) {
    pending = pending
      .slice()
      .sort((a, b) => (DOMAIN_RANK[a.existential_domain] ?? 99) - (DOMAIN_RANK[b.existential_domain] ?? 99))
      .slice(0, LIMIT);
  } else if (pending) {
    pending = pending.slice(0, LIMIT);
  }

  if (!pending || pending.length === 0) {
    console.log('no pending_voice templates');
    process.exit(0);
  }

  console.log(`found ${pending.length} pending templates\n`);

  let rendered = 0;
  let failed = 0;
  const results = [];

  // Concurrency = 3 chunked worker pool. Within each chunk we await
  // Promise.all; the next chunk only starts once all 3 settle. Simpler
  // than a rolling pool and respects ElevenLabs throughput on Creator
  // tier (which throttles at ~5 concurrent for cloned voices).
  const CONCURRENCY = parseInt(args.concurrency ?? '3', 10);
  let stopOnAuth = false;

  async function renderWithRetry(tpl, idx) {
    const tag = `[${idx + 1}/${pending.length}] ${tpl.activity_mode}/${tpl.existential_domain}/${tpl.risk_tier}/week-${tpl.week_of_month}`;
    try {
      const r = await renderOne(tpl);
      if (r.skipped) {
        console.log(`${tag} SKIP (${r.reason})`);
        return;
      }
      console.log(`${tag} OK ${(r.bytes / 1024).toFixed(0)}KB · ${r.url}`);
      rendered += 1;
      results.push({ tpl: tpl.id, ...r });
    } catch (err) {
      const status = err.status ?? 0;
      // Retry once on 5xx / 429 with 2s backoff.
      if (status === 429 || (status >= 500 && status < 600)) {
        await new Promise((r) => setTimeout(r, 2000));
        try {
          const r = await renderOne(tpl);
          if (!r.skipped) {
            console.log(`${tag} OK (retry) ${(r.bytes / 1024).toFixed(0)}KB · ${r.url}`);
            rendered += 1;
            results.push({ tpl: tpl.id, ...r });
            return;
          }
        } catch (err2) {
          console.log(`${tag} FAIL after retry: ${err2.message}`);
          failed += 1;
          return;
        }
      }
      // Hard stop on auth / 4xx (config issue — pointless to keep burning).
      if (status >= 400 && status < 500 && status !== 429) {
        stopOnAuth = true;
        console.log(`${tag} HARD STOP (${status}): ${err.message}`);
      } else {
        console.log(`${tag} FAIL ${err.message}`);
      }
      failed += 1;
    }
  }

  for (let i = 0; i < pending.length; i += CONCURRENCY) {
    if (stopOnAuth) break;
    const chunk = pending.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map((tpl, j) => renderWithRetry(tpl, i + j)));
  }

  console.log(`\n── done ──`);
  console.log(`rendered: ${rendered}`);
  console.log(`failed:   ${failed}`);
  console.log(`spend est: $${(rendered * 0.30).toFixed(2)}`);
  if (results.length > 0) {
    console.log(`\nSpot-check URLs:`);
    results.forEach((r) => console.log(`  ${r.url}`));
  }
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
