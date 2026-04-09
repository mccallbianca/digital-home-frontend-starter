#!/usr/bin/env node
/**
 * Fix Phase 01 (Regulate) and Phase 02 (Reprogram) images
 * Replaces abstract hands/fists with photorealistic human subjects
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPLICATE_API_KEY = 'process.env.REPLICATE_API_TOKEN';

const IMAGES = [
  {
    filename: 'phase-regulate-open-hand.jpg',
    prompt: `Photorealistic portrait photograph of a Black woman in her late 30s, eyes closed, head slightly tilted back, face serene and peaceful, taking a slow deep breath with chest gently expanded. She is wearing a soft dark navy ribbed turtleneck. Cinematic cobalt blue side lighting sculpts her face and neck. Shallow depth of field. Dark charcoal background. Fine film grain texture. The image conveys nervous system safety, calm, and stillness. No hands visible. Face and upper chest only. Shot on 85mm lens. Professional editorial photography. No text, no watermarks.`,
    negativePrompt: 'hands, fingers, fist, illustration, CGI, cartoon, nude, exposed skin, bright backgrounds, white backgrounds, cheerful expression, smiling, harsh lighting, AI art style',
  },
  {
    filename: 'phase-reprogram-fist.jpg',
    prompt: `Photorealistic portrait photograph of a Black man in his early 40s wearing over-ear headphones, eyes closed, head bowed slightly forward in deep absorbed listening. He is wearing a dark fitted black long-sleeve shirt. Soft magenta-pink and violet rim lighting from the right side, cobalt accent from the left. Dark near-black background. Fine film grain. Expression of deep inner concentration and transformation. Upper body and face. Shot on 85mm lens. Cinematic editorial photography. The image conveys personal reprogramming, I AM declarations, the inner voice. No text, no watermarks.`,
    negativePrompt: 'fist, hands, fingers, illustration, CGI, cartoon, nude, exposed skin, bright backgrounds, white backgrounds, happy expression, AI art style, low quality',
  },
];

async function callReplicate(prompt, negativePrompt) {
  console.log('  Submitting to Replicate...');
  const res = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLICATE_API_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'wait',
    },
    body: JSON.stringify({
      input: {
        prompt,
        negative_prompt: negativePrompt,
        aspect_ratio: '3:2',
        output_format: 'jpg',
        output_quality: 92,
        safety_tolerance: 2,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Replicate error ${res.status}: ${err}`);
  }

  const data = await res.json();

  // Poll if not complete
  let prediction = data;
  while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
    console.log(`  Status: ${prediction.status} — polling...`);
    await new Promise(r => setTimeout(r, 3000));
    const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      headers: { 'Authorization': `Bearer ${REPLICATE_API_KEY}` },
    });
    prediction = await pollRes.json();
  }

  if (prediction.status === 'failed') {
    throw new Error(`Generation failed: ${prediction.error}`);
  }

  const output = prediction.output;
  const url = Array.isArray(output) ? output[0] : output;
  return url;
}

async function downloadImage(url, outputPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download: ${res.status}`);
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(buffer));
  console.log(`  Saved: ${path.basename(outputPath)}`);
}

async function main() {
  const publicImages = path.join(__dirname, '..', 'public', 'images');

  for (const img of IMAGES) {
    console.log(`\nGenerating: ${img.filename}`);
    try {
      const imageUrl = await callReplicate(img.prompt, img.negativePrompt);
      console.log(`  Image URL: ${imageUrl}`);
      const outPath = path.join(publicImages, img.filename);
      await downloadImage(imageUrl, outPath);
      console.log(`  ✅ Done: ${img.filename}`);
    } catch (err) {
      console.error(`  ❌ Failed: ${err.message}`);
    }
  }

  console.log('\nAll done. Run `npm run deploy` to push changes.');
}

main();
