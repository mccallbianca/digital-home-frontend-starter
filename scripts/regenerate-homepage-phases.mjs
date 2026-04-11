#!/usr/bin/env node
/**
 * HERR — Regenerate Home Page Phase Images (Regulate + Reprogram)
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

const IMAGES = [
  {
    id: 'phase-regulate',
    localFile: 'phase-regulate-v2.jpg',
    storagePath: 'homepage/phase-regulate.jpg',
    prompt: `Photorealistic cinematic editorial photography. Shot on 35mm film. Heavy film grain. Dark near-black background (#0A0A0F). Single dramatic light source. Warm natural skin tones. Fully clothed subjects at all times. No text. No logos. No watermarks.

Close-up portrait of a serene Asian woman in her mid-20s, eyes closed, hands gently resting on her chest, soft golden light illuminating her face, wearing a dark fitted top, dark moody background, cinematic film grain, shallow depth of field, warm safe atmosphere, professional studio lighting.

Square 1:1 composition.`,
  },
  {
    id: 'phase-reprogram',
    localFile: 'phase-reprogram-v2.jpg',
    storagePath: 'homepage/phase-reprogram.jpg',
    prompt: `Photorealistic cinematic editorial photography. Shot on 35mm film. Heavy film grain. Dark near-black background (#0A0A0F). Single dramatic light source. Warm natural skin tones. Fully clothed subjects at all times. No text. No logos. No watermarks.

Portrait of a confident Caucasian male athlete in his early 20s, strong jawline, looking forward with determination, wearing a dark athletic performance top, dark moody background with dramatic side lighting, cinematic film grain, shallow depth of field, championship arena atmosphere, professional studio lighting.

Square 1:1 composition.`,
  },
];

async function generate(prompt) {
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
        input: { prompt, aspect_ratio: '1:1', output_format: 'jpg', output_quality: 90, safety_tolerance: 2 },
      }),
    }
  );
  if (!res.ok) { const err = await res.text(); throw new Error(`Start failed: ${res.status} — ${err}`); }
  const { id } = await res.json();

  process.stdout.write('   Generating');
  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const poll = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { Authorization: `Bearer ${REPLICATE_API_TOKEN}` },
    });
    const data = await poll.json();
    if (data.status === 'succeeded') {
      process.stdout.write(' done\n');
      return Array.isArray(data.output) ? data.output[0] : data.output;
    }
    if (data.status === 'failed' || data.status === 'canceled') throw new Error(`${data.status}: ${data.error}`);
    process.stdout.write('.');
  }
  throw new Error('Timed out');
}

async function main() {
  console.log('  HERR — Home Page Phase Image Regenerator\n');

  for (let i = 0; i < IMAGES.length; i++) {
    const img = IMAGES[i];
    console.log(`  [${img.id}]`);
    try {
      const url = await generate(img.prompt);

      console.log('   Downloading...');
      const res = await fetch(url);
      const buffer = Buffer.from(await res.arrayBuffer());

      const localPath = path.resolve(__dirname, '..', 'public', 'images', img.localFile);
      fs.writeFileSync(localPath, buffer);
      console.log(`   Local: ${localPath}`);

      const { error } = await supabase.storage.from('images').upload(img.storagePath, buffer, { contentType: 'image/jpeg', upsert: true });
      if (error) throw new Error(`Upload: ${error.message}`);
      const { data } = supabase.storage.from('images').getPublicUrl(img.storagePath);
      console.log(`   Supabase: ${data.publicUrl}\n`);
    } catch (err) {
      console.error(`   FAILED: ${err.message}\n`);
    }

    // Rate limit pause
    if (i < IMAGES.length - 1) {
      console.log('   Waiting 12s for rate limit...\n');
      await new Promise((r) => setTimeout(r, 12000));
    }
  }
  console.log('  Done.');
}

main();
