#!/usr/bin/env node
/**
 * Generate all remaining DALL-E replacement images via Flux 1.1 Pro (Replicate).
 * Saves directly to public/images/ as .jpg files.
 * Runs sequentially to avoid timeout issues.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images');
const REPLICATE_API_KEY = 'process.env.REPLICATE_API_TOKEN';

// All remaining images to generate (skipping step-01 and step-03 which already exist)
const IMAGES = [
  {
    filename: 'step-02-regulate',
    aspect_ratio: '4:5',
    prompt: 'Extreme cinematic close-up of a human chest and jaw, side profile view. The chest is rising in a deep inhale. Deep cobalt backlight from behind. Shoulder and strong jaw visible at frame edge. Body finally safe. Near-black background #0A0A0F. Film grain heavy. Cinematic photography. No faces visible. 4:5 portrait. Shot on 35mm film.',
  },
  {
    filename: 'step-04-reprogram',
    aspect_ratio: '4:5',
    prompt: 'STUDIO PORTRAIT. Pitch black background #0A0A0F. A person wearing over-ear headphones, eyes closed. Expression of deep interior arrival — not peace, completion. The reprogramming is happening inside. Magenta-violet light from above, single dramatic source. Dark minimal clothing. Film grain heavy. Sovereign stillness. Cinematic. Shot on 35mm.',
  },
  {
    filename: 'how-it-works-hero-double-exposure',
    aspect_ratio: '16:9',
    prompt: 'Double exposure cinematic photograph. A powerfully built woman standing in stillness, eyes closed. Her silhouette is partially transparent, overlaid with abstract sound frequency waveforms in cobalt and pink light. Near-black background #0A0A0F. Single cobalt light source from the left, hot pink rim light from behind. Film grain. No text. Editorial fashion photography. 16:9 widescreen.',
  },
  {
    filename: 'cta-begin-reprogramming-threshold',
    aspect_ratio: '16:9',
    prompt: 'Cinematic wide shot of a lone human figure walking away from camera through a long dark corridor toward a warm gold-pink light source at the far end. Extreme depth. Near-black walls. The figure is small against the vast dark space. Gold and pink light at the threshold. Film grain heavy. Cinematic photography. No faces visible. 16:9. Shot on 35mm film.',
  },
  {
    filename: 'about-hero-voice-frequency',
    aspect_ratio: '16:9',
    prompt: 'Abstract cinematic photography. No humans. A close-up of glowing sound frequency waveforms floating in complete darkness. Cobalt blue and hot pink light trails forming audio waveform patterns. Near-black background #0A0A0F. The waveforms are the only light source. Film grain heavy. Minimal editorial composition. 16:9. Shot on 35mm film.',
  },
  {
    filename: 'about-arena-after',
    aspect_ratio: '4:3',
    prompt: 'Cinematic wide-angle photograph of an empty basketball arena viewed from court level. No people. The seats recede into darkness. A single cobalt blue light illuminates the backboard and rim at the far end. Near-black everywhere else. Dramatic depth and emptiness. The moment after the career ends. Film grain heavy. Shot on 35mm film. 4:3.',
  },
  {
    filename: 'phase-regulate-open-hand',
    aspect_ratio: '3:2',
    prompt: 'Macro cinematic close-up of an open human palm facing upward, at rest in complete stillness. Violet and cobalt light from above left, dramatic single source. Near-black background #0A0A0F. The hand is the entire frame. Deep shadow in the palm lines. Skin texture visible. Film grain heavy. Shot on 35mm film. 3:2 landscape.',
  },
  {
    filename: 'phase-reprogram-fist',
    aspect_ratio: '3:2',
    prompt: 'Macro cinematic close-up of a closed human fist, knuckles facing camera, held in sovereign stillness. Hot pink and magenta light from above, single dramatic source. Near-black background #0A0A0F. The fist is the entire frame. Skin texture visible. Power without aggression. Film grain heavy. Shot on 35mm film. 3:2 landscape.',
  },
  {
    filename: 'dim-existential-figure-void',
    aspect_ratio: '4:3',
    prompt: 'Cinematic wide shot. An impossibly tiny human figure stands at the bottom center of the frame. Above and around them: infinite near-black void #0A0A0F. A single shaft of cobalt light descends from above onto the figure. The scale makes the human look dwarfed by existence. Existential scale. Film grain heavy. Shot on 35mm film. 4:3.',
  },
  {
    filename: 'dim-emotional-eye-release',
    aspect_ratio: '4:3',
    prompt: 'Extreme macro close-up of a single human eye, closed. Violet light from the left. A single tear on the lash line, catching the light. The eyelid is at peace, not distress — release, not sadness. Near-black background. Film grain heavy. No other face features visible, just the closed eye and tear. Cinematic. Shot on 35mm. 4:3.',
  },
  {
    filename: 'dim-executive-hand-decides',
    aspect_ratio: '4:3',
    prompt: 'Cinematic close-up of a confident human hand resting flat on a dark glass surface — like a boardroom table or executive desk. Cobalt light from the left, gold accent light from above right. The hand is decisive, still, present. Near-black background #0A0A0F. Reflection in the glass surface. Film grain heavy. Shot on 35mm. 4:3.',
  },
];

async function startGeneration(prompt, aspect_ratio) {
  const response = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REPLICATE_API_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'respond-async',
    },
    body: JSON.stringify({
      input: {
        prompt,
        aspect_ratio,
        output_format: 'jpg',
        output_quality: 90,
        safety_tolerance: 5,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Replicate start failed: ${response.status} ${err}`);
  }

  const prediction = await response.json();
  return prediction;
}

async function pollPrediction(predictionId, maxIterations = 120) {
  for (let i = 0; i < maxIterations; i++) {
    await new Promise(r => setTimeout(r, 3000));

    const res = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { Authorization: `Bearer ${REPLICATE_API_KEY}` },
    });

    if (!res.ok) throw new Error(`Poll failed: ${res.status}`);
    const data = await res.json();

    if (data.status === 'succeeded') return data.output;
    if (data.status === 'failed' || data.status === 'canceled') {
      throw new Error(`Prediction ${data.status}: ${data.error}`);
    }

    process.stdout.write('.');
  }
  throw new Error('Timed out after 6 minutes');
}

async function downloadAndSave(url, filename) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const outputPath = path.join(OUTPUT_DIR, `${filename}.jpg`);
  fs.writeFileSync(outputPath, buffer);
  return outputPath;
}

async function main() {
  console.log(`\n🎨  HERR Image Generator — Remaining Images`);
  console.log(`    Generating ${IMAGES.length} images via Flux 1.1 Pro\n`);

  let successCount = 0;
  const failed = [];

  for (const img of IMAGES) {
    // Skip if already exists
    const outputPath = path.join(OUTPUT_DIR, `${img.filename}.jpg`);
    if (fs.existsSync(outputPath)) {
      console.log(`⏭️   Skipping ${img.filename}.jpg (already exists)`);
      successCount++;
      continue;
    }

    process.stdout.write(`\n📸  ${img.filename} [${img.aspect_ratio}] — generating`);

    try {
      // Wait 12s between requests to respect rate limit (6/min burst of 1)
      if (successCount > 0 || failed.length > 0) {
        process.stdout.write(' [rate-limit pause 12s]');
        await new Promise(r => setTimeout(r, 12000));
      }

      const prediction = await startGeneration(img.prompt, img.aspect_ratio);
      const output = await pollPrediction(prediction.id);

      const imageUrl = Array.isArray(output) ? output[0] : output;
      await downloadAndSave(imageUrl, img.filename);

      console.log(`\n✅  Saved: ${img.filename}.jpg`);
      successCount++;
    } catch (err) {
      console.log(`\n❌  Failed: ${img.filename} — ${err.message}`);
      failed.push(img.filename);
    }
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`✅  Done! ${successCount}/${IMAGES.length} images generated.`);
  if (failed.length > 0) {
    console.log(`❌  Failed: ${failed.join(', ')}`);
  }
  console.log('');
}

main().catch(err => {
  console.error('\n❌  Fatal error:', err.message);
  process.exit(1);
});
