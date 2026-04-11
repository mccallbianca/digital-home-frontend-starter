#!/usr/bin/env node
/**
 * HERR — Regenerate Step 02 (Regulate) image only
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

Close-up portrait of a serene Caucasian woman in her mid-20s with eyes closed, hands gently resting on her chest, soft golden light illuminating her face, wearing a dark fitted top with high neckline. Dark moody background. Cinematic film grain. Shallow depth of field. Warm and safe atmosphere. Professional studio lighting. The embodiment of nervous system safety. A breath held in stillness.

Square 1:1 composition.`;

async function main() {
  console.log('  Generating step-02-regulate image...\n');

  // Generate via Replicate
  const startRes = await fetch(
    'https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
        Prefer: 'respond-async',
      },
      body: JSON.stringify({
        input: {
          prompt: PROMPT,
          aspect_ratio: '1:1',
          output_format: 'jpg',
          output_quality: 90,
          safety_tolerance: 2,
        },
      }),
    }
  );

  if (!startRes.ok) {
    const err = await startRes.text();
    console.error(`Start failed: ${startRes.status} — ${err}`);
    process.exit(1);
  }

  const { id } = await startRes.json();
  process.stdout.write('  Generating');

  // Poll
  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { Authorization: `Bearer ${REPLICATE_API_TOKEN}` },
    });
    const data = await res.json();

    if (data.status === 'succeeded') {
      process.stdout.write(' done\n');
      const imageUrl = Array.isArray(data.output) ? data.output[0] : data.output;

      // Download
      console.log('  Downloading...');
      const imgRes = await fetch(imageUrl);
      const buffer = Buffer.from(await imgRes.arrayBuffer());

      // Save locally
      const localPath = path.resolve(__dirname, '..', 'public', 'images', 'step-02-regulate-v2.jpg');
      fs.writeFileSync(localPath, buffer);
      console.log(`  Local: ${localPath}`);

      // Upload to Supabase
      const { error } = await supabase.storage.from('images').upload(
        'how-it-works/step-02-regulate.jpg', buffer,
        { contentType: 'image/jpeg', upsert: true }
      );
      if (error) { console.error(`  Upload failed: ${error.message}`); process.exit(1); }

      const { data: urlData } = supabase.storage.from('images').getPublicUrl('how-it-works/step-02-regulate.jpg');
      console.log(`  Supabase: ${urlData.publicUrl}`);
      console.log('\n  Done.');
      return;
    }

    if (data.status === 'failed' || data.status === 'canceled') {
      console.error(`\n  Prediction ${data.status}: ${data.error}`);
      process.exit(1);
    }
    process.stdout.write('.');
  }
  console.error('\n  Timed out');
  process.exit(1);
}

main();
