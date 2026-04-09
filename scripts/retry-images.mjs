#!/usr/bin/env node
/**
 * Retry script for the 7 failed HERR images.
 * Uses 70-second delay between requests to respect rate limits (1 img/min).
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvKey(key) {
  const paths = [
    path.join(__dirname, '../.env.local'),
    path.join(__dirname, '../../digital-home-backend-starter/.env.local'),
  ];
  for (const envPath of paths) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(new RegExp(`^${key}=(.+)`, 'm'));
      if (match) return match[1].trim();
    } catch { /* continue */ }
  }
  return null;
}

const OPENAI_API_KEY = loadEnvKey('OPENAI_API_KEY');
const OUTPUT_DIR = path.join(__dirname, '../public/images');

const RETRY_IMAGES = [
  // Rate-limited failures — same prompts, just slower
  {
    filename: 'phase-regulate-open-hand.webp',
    size: '1792x1024',
    prompt: `Extreme close-up macro photography of an open human palm resting in stillness, photographed from slightly above. Soft violet and purple light from the left. Near-black background. Film grain. No text. Cinematic calm.`,
  },
  {
    filename: 'phase-reprogram-fist.webp',
    size: '1792x1024',
    prompt: `Extreme close-up photography of a closed fist held in stillness, lit by magenta-pink light from the right. Near-black background. Determined, empowered. Cinematic. Film grain. No text.`,
  },
  {
    filename: 'dim-existential-figure-void.webp',
    size: '1792x1024',
    prompt: `Cinematic photography. A tiny solitary human figure stands alone in a vast, near-infinite dark void. Faint cobalt blue light from far above. Existential scale. Near-black. Shot on 35mm film. Film grain. No text.`,
  },
  {
    filename: 'dim-emotional-eye-release.webp',
    size: '1792x1024',
    prompt: `Extreme close-up of a closed human eye in profile. Eyelashes catching violet light from the side. Near-black background. The eye is relaxed, releasing. Cinematic. Shot on 35mm film. Film grain. No text.`,
  },
  {
    filename: 'dim-executive-hand-decides.webp',
    size: '1792x1024',
    prompt: `A decisive hand resting flat on a dark glass surface, photographed from above. Cobalt blue light from the left and warm gold light from the right. Near-black background. Cinematic. Film grain. No text.`,
  },

  // Content filter failures — simplified prompts
  {
    filename: 'campaign-im-herr-05.webp',
    size: '1024x1792',
    prompt: `Cinematic portrait photography. An East Asian woman, strong and composed, eyes just opening and tilting upward, mid-breath. Lit by magenta-violet light from above. Near-black background. Shot on 35mm film. Film grain. No text. No logos. Upper body frame.`,
  },
  {
    filename: 'founder-bianca-mccall-lmft.webp',
    size: '1024x1792',
    prompt: `Cinematic portrait photography. A professional Black woman in her forties, composed and authoritative, looking slightly off-camera with quiet confidence and intelligence. Cobalt light from the left with soft pink rim light at right. Near-black background. Shot on 35mm film. Film grain. No text. No logos.`,
  },
];

async function generateImage(prompt, size) {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'dall-e-3', prompt, size, quality: 'hd', style: 'natural', n: 1 }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message ?? JSON.stringify(err));
  }
  const data = await response.json();
  return data.data[0].url;
}

async function downloadAndConvert(url, filename) {
  const tmpPng  = path.join(OUTPUT_DIR, filename.replace('.webp', '._tmp.png'));
  const outWebp = path.join(OUTPUT_DIR, filename);
  const imgResponse = await fetch(url);
  if (!imgResponse.ok) throw new Error(`Download failed: ${imgResponse.status}`);
  const buffer = await imgResponse.arrayBuffer();
  fs.writeFileSync(tmpPng, Buffer.from(buffer));
  try {
    execSync(`sips -s format webp "${tmpPng}" --out "${outWebp}" 2>/dev/null`, { stdio: 'pipe' });
    fs.unlinkSync(tmpPng);
  } catch {
    fs.renameSync(tmpPng, outWebp);
    console.log(`    ↳ Saved as PNG`);
  }
}

async function wait(ms) {
  process.stdout.write(`    ⏳ Waiting ${ms/1000}s for rate limit...`);
  await new Promise(r => setTimeout(r, ms));
  process.stdout.write(` done\n`);
}

async function main() {
  console.log(`\n🔄  HERR Image Retry (${RETRY_IMAGES.length} images)`);
  console.log(`    Using 70s delay between requests (rate limit: 1/min)\n`);

  const failed = [];

  for (let i = 0; i < RETRY_IMAGES.length; i++) {
    const img = RETRY_IMAGES[i];
    console.log(`[${String(i+1).padStart(2,'0')}/${RETRY_IMAGES.length}] ${img.filename}`);
    try {
      const url = await generateImage(img.prompt, img.size);
      await downloadAndConvert(url, img.filename);
      console.log(`    ✓ Saved\n`);
    } catch (err) {
      console.error(`    ✗ FAILED: ${err.message}\n`);
      failed.push(img.filename);
    }
    if (i < RETRY_IMAGES.length - 1) await wait(70000);
  }

  console.log('─'.repeat(60));
  console.log(`✅  Generated: ${RETRY_IMAGES.length - failed.length}/${RETRY_IMAGES.length}`);
  if (failed.length > 0) {
    console.log(`❌  Still failed: ${failed.join(', ')}`);
  } else {
    console.log(`\nAll images complete! Run npm run deploy to go live.`);
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
