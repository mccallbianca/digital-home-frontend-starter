#!/usr/bin/env node
/**
 * HERR — Regenerate Phase Reprogram image (home page)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '.env.local');

const envContent = fs.readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
  const eqIndex = trimmed.indexOf('=');
  const key = trimmed.slice(0, eqIndex).trim();
  const value = trimmed.slice(eqIndex + 1).trim();
  if (!process.env[key] && value) process.env[key] = value;
}

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const PROMPT = `Photorealistic cinematic editorial photography. Shot on 35mm film. Heavy film grain. Dark near-black background (#0A0A0F). Single dramatic light source. Warm natural skin tones. Fully clothed subjects at all times. No text. No logos. No watermarks.

Portrait of a confident Caucasian male athlete in his early 20s, strong jawline, wearing sleek matte black over-ear headphones, looking forward with determination, wearing a dark athletic performance top, dark moody background with dramatic side lighting, cinematic film grain, shallow depth of field, championship arena atmosphere, professional studio lighting.

Square 1:1 composition.`;

async function main() {
  console.log('  Generating phase-reprogram image (with headphones)...\n');

  const res = await fetch(
    'https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
        Prefer: 'respond-async',
      },
      body: JSON.stringify({
        input: { prompt: PROMPT, aspect_ratio: '1:1', output_format: 'jpg', output_quality: 90, safety_tolerance: 2 },
      }),
    }
  );
  if (!res.ok) { console.error(`Start failed: ${res.status} — ${await res.text()}`); process.exit(1); }
  const { id } = await res.json();

  process.stdout.write('  Generating');
  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const poll = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { Authorization: `Bearer ${REPLICATE_API_TOKEN}` },
    });
    const data = await poll.json();
    if (data.status === 'succeeded') {
      process.stdout.write(' done\n');
      const imageUrl = Array.isArray(data.output) ? data.output[0] : data.output;

      console.log('  Downloading...');
      const imgRes = await fetch(imageUrl);
      const buffer = Buffer.from(await imgRes.arrayBuffer());

      const localPath = path.resolve(__dirname, '..', 'public', 'images', 'phase-reprogram-v3.jpg');
      fs.writeFileSync(localPath, buffer);
      console.log(`  Local: ${localPath}`);

      const { error } = await supabase.storage.from('images').upload('homepage/phase-reprogram.jpg', buffer, { contentType: 'image/jpeg', upsert: true });
      if (error) { console.error(`  Upload failed: ${error.message}`); process.exit(1); }
      const { data: urlData } = supabase.storage.from('images').getPublicUrl('homepage/phase-reprogram.jpg');
      console.log(`  Supabase: ${urlData.publicUrl}`);
      console.log('\n  Done.');
      return;
    }
    if (data.status === 'failed' || data.status === 'canceled') { console.error(`\n  ${data.status}: ${data.error}`); process.exit(1); }
    process.stdout.write('.');
  }
}

main();
