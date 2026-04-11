#!/usr/bin/env node
/**
 * HERR — How It Works Step Image Regenerator
 * ───────────────────────────────────────────────────────────────
 * Generates brand-safe AI hero images for How It Works steps.
 * Uploads to Supabase Storage and saves locally.
 *
 * Uses: Replicate Flux 1.1 Pro → Supabase Storage + local /public/images/
 *
 * Run:  node scripts/regenerate-step-images.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// ── Load .env.local ───────────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '.env.local');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const eqIndex = trimmed.indexOf('=');
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key] && value) {
      process.env[key] = value;
    }
  }
  console.log('  Loaded .env.local\n');
} else {
  console.error('  .env.local not found at', envPath);
  process.exit(1);
}

// ── Config ────────────────────────────────────────────────────────────────────
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!REPLICATE_API_TOKEN) { console.error('Missing REPLICATE_API_TOKEN'); process.exit(1); }
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) { console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Negative prompt (always enforced) ─────────────────────────────────────────
const NEGATIVE = [
  'nudity', 'exposed skin', 'shirtless', 'bare chest', 'cleavage',
  'exposed torso', 'partial nudity', 'inappropriate',
  'distorted features', 'extra fingers', 'extra limbs', 'deformed hands',
  'blurry face', 'disfigured', 'uncanny valley', 'mannequin', 'plastic skin',
  'cartoon', 'illustration', 'anime', 'CGI', '3D render',
  'stock photo', 'watermark', 'text overlay', 'text', 'low quality',
  'oversaturated',
].join(', ');

// ── Brand style prefix ────────────────────────────────────────────────────────
const BRAND = `Photorealistic cinematic editorial photography. Shot on 35mm film. Heavy film grain. Dark near-black background (#0A0A0F). Single dramatic light source. Warm natural skin tones. Fully clothed subjects at all times. Intentional sparse composition. No text. No logos. No watermarks. Netflix documentary × TED stage × championship arena aesthetic.`;

// ── Step image definitions ────────────────────────────────────────────────────
const STEPS = [
  {
    id: 'step-01-assess',
    filename: 'step-01-assess-v2.jpg',
    storagePath: 'how-it-works/step-01-assess.jpg',
    prompt: `${BRAND}

Portrait of a contemplative Black woman in a dark tailored blazer, seated in a dimly lit room, one hand resting on her temple, gazing downward with quiet introspection. Single violet-cobalt light from the left side. Near-black background. The weight of self-examination. The moment before truth is spoken aloud.

Diverse professional subject. Square 1:1 composition.`,
  },
  {
    id: 'step-02-regulate',
    filename: 'step-02-regulate-v2.jpg',
    storagePath: 'how-it-works/step-02-regulate.jpg',
    prompt: `${BRAND}

Close-up portrait of a serene Black woman with eyes closed, hands gently resting on her chest, soft golden light illuminating her face, wearing a dark fitted top with high neckline. Dark moody background. Cinematic film grain. Shallow depth of field. Warm and safe atmosphere. Professional studio lighting. The embodiment of nervous system safety. A breath held in stillness.

Diverse professional subject. Square 1:1 composition.`,
  },
  {
    id: 'step-03-clone-voice',
    filename: 'step-03-clone-voice-v2.jpg',
    storagePath: 'how-it-works/step-03-clone-voice.jpg',
    prompt: `${BRAND}

Close-up of a professional condenser studio microphone in the foreground, with a Black woman in dark clothing slightly blurred behind it, her lips slightly parted, about to speak into the mic. Single magenta-pink accent light from the right. Deep shadows. Near-black background. The intimate moment of voice capture. Recording booth atmosphere.

Square 1:1 composition.`,
  },
  {
    id: 'step-04-reprogram',
    filename: 'step-04-reprogram-v2.jpg',
    storagePath: 'how-it-works/step-04-reprogram.jpg',
    prompt: `${BRAND}

A confident Black woman wearing sleek over-ear headphones, eyes gently closed, chin slightly lifted, expression of quiet power and self-possession. Wearing a dark turtleneck. Violet and warm pink light from above and the side. Near-black background. The moment of receiving — when the reprogrammed inner voice speaks. Deep absorption.

Diverse professional subject. Square 1:1 composition.`,
  },
];

// ── Replicate API ─────────────────────────────────────────────────────────────

async function generateImage(prompt) {
  const response = await fetch(
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
          prompt,
          aspect_ratio: '1:1',
          output_format: 'jpg',
          output_quality: 90,
          safety_tolerance: 2,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Replicate start failed: ${response.status} — ${err}`);
  }

  const prediction = await response.json();
  return pollPrediction(prediction.id);
}

async function pollPrediction(predictionId, maxIterations = 120) {
  process.stdout.write('   Generating');
  for (let i = 0; i < maxIterations; i++) {
    await new Promise((r) => setTimeout(r, 3000));

    const res = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      { headers: { Authorization: `Bearer ${REPLICATE_API_TOKEN}` } }
    );

    if (!res.ok) throw new Error(`Poll failed: ${res.status}`);
    const data = await res.json();

    if (data.status === 'succeeded') {
      process.stdout.write(' done\n');
      return Array.isArray(data.output) ? data.output[0] : data.output;
    }
    if (data.status === 'failed' || data.status === 'canceled') {
      throw new Error(`Prediction ${data.status}: ${data.error}`);
    }
    process.stdout.write('.');
  }
  throw new Error('Image generation timed out after 6 minutes');
}

// ── Upload & Save ─────────────────────────────────────────────────────────────

async function downloadBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function uploadToSupabase(buffer, storagePath) {
  const { error } = await supabase.storage
    .from('images')
    .upload(storagePath, buffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from('images').getPublicUrl(storagePath);
  return data.publicUrl;
}

function saveLocal(buffer, filename) {
  const localPath = path.resolve(__dirname, '..', 'public', 'images', filename);
  fs.writeFileSync(localPath, buffer);
  return localPath;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('  HERR — How It Works Step Image Regenerator');
  console.log('  Using Flux 1.1 Pro via Replicate');
  console.log(`  Generating ${STEPS.length} images...\n`);

  // Allow skipping steps via CLI: node script.mjs --skip=step-01-assess,step-02-regulate
  const skipArg = process.argv.find((a) => a.startsWith('--skip='));
  const skipIds = skipArg ? skipArg.split('=')[1].split(',') : [];

  const results = [];

  for (const step of STEPS) {
    if (skipIds.includes(step.id)) {
      console.log(`\n  [${step.id}] — SKIPPED`);
      continue;
    }
    console.log(`\n  [${step.id}]`);
    try {
      // Generate
      const imageUrl = await generateImage(step.prompt);

      // Download
      console.log('   Downloading...');
      const buffer = await downloadBuffer(imageUrl);

      // Save locally
      const localPath = saveLocal(buffer, step.filename);
      console.log(`   Local: ${localPath}`);

      // Upload to Supabase Storage
      console.log(`   Uploading to images/${step.storagePath}`);
      const publicUrl = await uploadToSupabase(buffer, step.storagePath);
      console.log(`   Supabase: ${publicUrl}`);

      results.push({ id: step.id, status: 'ok', localFile: step.filename, publicUrl });
    } catch (err) {
      console.error(`   FAILED: ${err.message}`);
      results.push({ id: step.id, status: 'failed', error: err.message });
    }

    // Rate limit pause between requests (Replicate limits to 6/min on low-credit accounts)
    console.log('   Waiting 12s for rate limit...');
    await new Promise((r) => setTimeout(r, 12000));
  }

  // Summary
  console.log('\n' + '─'.repeat(60));
  console.log('  Results:\n');
  for (const r of results) {
    if (r.status === 'ok') {
      console.log(`  ✓ ${r.id}`);
      console.log(`    Local: /images/${r.localFile}`);
      console.log(`    URL:   ${r.publicUrl}\n`);
    } else {
      console.log(`  ✗ ${r.id}: ${r.error}\n`);
    }
  }
}

main();
