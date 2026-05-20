#!/usr/bin/env node
/**
 * B5.3 — Queued-delivery mixer + delivery sender.
 *
 * Pulls user_daily_deliveries rows where status='queued' (or one
 * specific delivery_id via --delivery-id), runs the 3-layer ffmpeg
 * mix, uploads to the affirmations-daily-mixes bucket, flips the row
 * to status='ready' (then 'delivered' after the notification fires),
 * and sends the user a Resend email with the deeplink.
 *
 * Usage:
 *   node scripts/process-daily-mixes.mjs                 # all queued
 *   node scripts/process-daily-mixes.mjs --limit=5       # cap
 *   node scripts/process-daily-mixes.mjs --delivery-id=<uuid>   # one row
 *   node scripts/process-daily-mixes.mjs --no-send       # mix only, skip email
 *
 * Env required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY
 * (RESEND_API_KEY optional unless --no-send is omitted).
 *
 * This script is intended to run from:
 *   - Bianca's laptop (manual smoke tests)
 *   - GitHub Actions workflow (.github/workflows/daily-delivery-mix.yml)
 *   - any external worker with ffmpeg available
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { mix3LayerAudio } from './lib-mix-3-layer-audio.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);

const LIMIT = parseInt(args.limit ?? '20', 10);
const DELIVERY_ID = args['delivery-id'] || null;
const SEND_EMAIL = args['no-send'] !== true;

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.h3rr.com';
const RESEND_FROM = process.env.RESEND_FROM_EMAIL || 'HERR <noreply@h3rr.com>';
const BUCKET = 'affirmations-daily-mixes';
const SIGNED_URL_EXPIRY_SECONDS = 60 * 60 * 24 * 2; // 48h: gives the daily push 24h + buffer

if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Supabase env missing');
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fetchQueued() {
  if (DELIVERY_ID) {
    const { data, error } = await supabase
      .from('user_daily_deliveries')
      .select('*')
      .eq('id', DELIVERY_ID)
      .single();
    if (error) throw new Error(`fetch ${DELIVERY_ID}: ${error.message}`);
    return [data];
  }
  const { data, error } = await supabase
    .from('user_daily_deliveries')
    .select('*')
    .in('status', ['queued', 'failed'])
    .order('created_at', { ascending: true })
    .limit(LIMIT);
  if (error) throw new Error(`fetch queued: ${error.message}`);
  return data ?? [];
}

async function markStatus(id, patch) {
  const { error } = await supabase
    .from('user_daily_deliveries')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(`mark ${id}: ${error.message}`);
}

async function uploadMix(localPath, userId, deliveryDate, activityMode) {
  const buf = await readFile(localPath);
  const storagePath = `${userId}/${deliveryDate}/${activityMode}.mp3`;
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buf, {
      contentType: 'audio/mpeg',
      cacheControl: 'private, max-age=86400',
      upsert: true,
    });
  if (upErr) throw new Error(`upload ${storagePath}: ${upErr.message}`);
  const { data: signed, error: signErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_EXPIRY_SECONDS);
  if (signErr || !signed) throw new Error(`signed url: ${signErr?.message ?? 'no url'}`);
  return { storagePath, signedUrl: signed.signedUrl };
}

async function sendEmail(toEmail, signedUrl, mode, domain) {
  if (!SEND_EMAIL) return { skipped: true };
  if (!RESEND_API_KEY) return { skipped: true, reason: 'RESEND_API_KEY missing' };

  const subject = `Your HERR delivery is ready — ${mode}`;
  const html = `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1a1a1a;line-height:1.6">
      <p style="font-size:18px;margin:0 0 16px">Today's anchor is ready.</p>
      <p style="margin:0 0 8px"><b>Mode:</b> ${mode}</p>
      <p style="margin:0 0 24px"><b>Focus:</b> ${domain}</p>
      <p style="margin:0 0 24px">A 3-layer mix tuned to your week. Listen with the activity that fits the mode — your nervous system does the rest.</p>
      <p style="margin:0 0 32px">
        <a href="${SITE_URL}/dashboard/sound?play=daily" style="display:inline-block;background:#1a1a1a;color:#fff;padding:14px 28px;text-decoration:none;border-radius:4px;font-size:15px">Open in HERR</a>
      </p>
      <p style="font-size:13px;color:#666;margin:0">Bianca D. McCall, M.A., LMFT — Founder</p>
    </div>
  `.trim();

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: toEmail,
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = await res.json().catch(() => ({}));
  return { sent: true, id: data.id ?? null };
}

async function processOne(row) {
  const tag = `[${row.id.slice(0, 8)}] ${row.activity_mode}/${row.existential_domain_targeted}`;
  process.stdout.write(`${tag} ... mixing ... `);

  await markStatus(row.id, { status: 'mixing' });

  let workDir = null;
  try {
    const { outputPath, workDir: dir, sizeBytes } = await mix3LayerAudio({
      musicUrl: row.music_url,
      affirmationUrl: row.user_audio_url,
      solfeggioHz: row.solfeggio_hz,
      targetLengthSeconds: row.target_length_seconds,
    });
    workDir = dir;
    process.stdout.write(`${(sizeBytes / 1024 / 1024).toFixed(2)}MB uploaded ... `);

    const { storagePath, signedUrl } = await uploadMix(
      outputPath,
      row.user_id,
      row.delivery_date,
      row.activity_mode,
    );

    await markStatus(row.id, {
      status: 'ready',
      final_mix_url: signedUrl,
      final_mix_storage_path: storagePath,
    });

    // Look up email for delivery notification
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, preferred_name')
      .eq('id', row.user_id)
      .maybeSingle();

    let emailResult = { skipped: true };
    if (profile?.email) {
      try {
        emailResult = await sendEmail(
          profile.email,
          signedUrl,
          row.activity_mode,
          row.existential_domain_targeted,
        );
        if (emailResult.sent) {
          await markStatus(row.id, {
            status: 'delivered',
            delivered_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        // Ready but notification failed — don't roll status back
        process.stdout.write(`(email failed: ${err.message}) `);
      }
    }

    console.log(`OK ${emailResult.sent ? 'delivered' : emailResult.skipped ? 'ready (no email)' : 'ready'}`);
    console.log(`     ${signedUrl}`);
    return { ok: true, signedUrl };
  } catch (err) {
    await markStatus(row.id, {
      status: 'failed',
      error_message: err.message?.slice(0, 500) ?? String(err),
    }).catch(() => {});
    console.log(`FAIL ${err.message}`);
    return { ok: false, error: err.message };
  } finally {
    if (workDir) await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

async function main() {
  console.log(
    `B5.3 mix processor — limit=${LIMIT}${DELIVERY_ID ? ` delivery_id=${DELIVERY_ID}` : ''}` +
      ` send_email=${SEND_EMAIL}`,
  );
  const queued = await fetchQueued();
  if (queued.length === 0) {
    console.log('no queued deliveries');
    process.exit(0);
  }
  console.log(`processing ${queued.length} rows\n`);

  let ok = 0;
  let fail = 0;
  for (const row of queued) {
    const r = await processOne(row);
    if (r.ok) ok += 1; else fail += 1;
  }

  console.log(`\n── done ──`);
  console.log(`ok:   ${ok}`);
  console.log(`fail: ${fail}`);
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
