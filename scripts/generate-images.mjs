#!/usr/bin/env node
/**
 * HERR Image Generator
 * Generates all 20 website images using DALL-E 3 (OpenAI).
 *
 * Run from project root:
 *   node scripts/generate-images.mjs
 *
 * Images are saved to: public/images/
 * After generation, src props in page files are updated automatically.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Load API key from .env.local (frontend or backend) ───────────────────────
function loadEnvKey(key) {
  // Try frontend .env.local first, then backend
  const paths = [
    path.join(__dirname, '../.env.local'),
    path.join(__dirname, '../../digital-home-backend-starter/.env.local'),
  ];
  for (const envPath of paths) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(new RegExp(`^${key}=(.+)`, 'm'));
      if (match) return match[1].trim();
    } catch { /* file not found, try next */ }
  }
  return null;
}

const OPENAI_API_KEY = loadEnvKey('OPENAI_API_KEY');
const OUTPUT_DIR = path.join(__dirname, '../public/images');

if (!OPENAI_API_KEY) {
  console.error('❌  OPENAI_API_KEY not found in .env.local');
  process.exit(1);
}

// ── Image definitions ─────────────────────────────────────────────────────────
// size options: '1024x1024' | '1024x1792' | '1792x1024'

const IMAGES = [
  // ── Home page ──────────────────────────────────────────────────────────────
  {
    filename: 'hero-im-herr-portrait.webp',
    size: '1792x1024',
    prompt: `Cinematic portrait photography. A lone human figure stands in stillness, centered, against a near-black background (#0A0A0F). Deep cobalt blue light emanates from slightly above and behind, creating a luminous blue halo at the edges of the silhouette. A faint magenta-pink rim light traces the left side of the figure. The face is partially visible — serene, sovereign. Shot on 35mm film. Film grain texture. High contrast. No text. No logos. Ultra-dark atmosphere. The figure embodies quiet power and self-possession.`,
  },
  {
    filename: 'phase-regulate-open-hand.webp',
    size: '1792x1024',
    prompt: `Extreme close-up macro photography of an open human palm resting in complete stillness, photographed from slightly above. The hand is neither masculine nor feminine — it simply is. Lit by soft violet and deep purple light from the left side. Near-black background. The skin catches light at the edges of the fingers. Cinematic. Shot on 35mm film. Film grain texture. No text. Clinical calm. The body at rest. Safety.`,
  },
  {
    filename: 'phase-reprogram-fist.webp',
    size: '1792x1024',
    prompt: `Extreme close-up photography of a closed fist held in sovereign stillness at mid-frame, photographed straight on. Lit by magenta-pink light from the right, creating a warm glow along the knuckles and fingers. Near-black background. Not aggressive — determined. Empowered. Cinematic. Shot on 35mm film. Film grain texture. No text. The fist of someone who has decided.`,
  },
  {
    filename: 'dim-existential-figure-void.webp',
    size: '1792x1024',
    prompt: `Cinematic photography. A tiny solitary human figure stands at the center of an impossibly vast, near-infinite dark space. Viewed from extreme distance. A faint cobalt blue light source exists far above, barely illuminating the top of the void. The figure is almost imperceptibly small against the darkness. Existential scale. Near-black. The weight of infinite space pressing in. Shot on 35mm film. Film grain. No text. Breathtaking in scale and solitude.`,
  },
  {
    filename: 'dim-emotional-eye-release.webp',
    size: '1792x1024',
    prompt: `Extreme close-up portrait photography of a closed human eye shot in profile. The eye is completely relaxed — releasing, not crying. Muscles soft. Eyelashes catching violet and purple light from the side. Near-black background. The sensation of finally letting go. Safety. Cinematic. Shot on 35mm film. Film grain texture. No text. The nervous system coming to rest.`,
  },
  {
    filename: 'dim-executive-hand-decides.webp',
    size: '1792x1024',
    prompt: `Close-up photography of a decisive hand resting flat on a dark glass or reflective surface, photographed from above at a slight angle. Lit by cobalt blue light from the left and warm gold light from the right — two light sources creating a dramatic split. Near-black background. The hand of an executive. Leadership in stillness. Cinematic. Shot on 35mm film. Film grain texture. No text.`,
  },

  // ── Campaign portraits ─────────────────────────────────────────────────────
  {
    filename: 'campaign-im-herr-01.webp',
    size: '1024x1792',
    prompt: `Cinematic portrait photography. A Black woman in her late twenties to early thirties. Shot in stillness, facing directly toward camera. Neutral expression of absolute sovereign self-possession — not smiling, not stern. Simply present. Lit by magenta-violet light from the left side, creating a dramatic rim. Near-black background. Cinematic. Shot on 35mm film. Film grain texture. No text. No logos. Full upper body frame.`,
  },
  {
    filename: 'campaign-im-herr-02.webp',
    size: '1024x1792',
    prompt: `Cinematic portrait photography. A Latino man in his early thirties looking directly at camera with quiet determination. The gaze is calm, unwavering, self-possessed. Lit by deep cobalt blue light from the right side. Near-black background. Cinematic. Shot on 35mm film. Film grain texture. No text. No logos. Full upper body frame. He knows who he is.`,
  },
  {
    filename: 'campaign-im-herr-03.webp',
    size: '1024x1792',
    prompt: `Cinematic portrait photography. A non-binary person with androgynous features, a knowing expression, looking directly at camera. Gender presentation is beautifully ambiguous. Lit by violet mid-tone light, slightly diffused. Near-black background. Cinematic. Shot on 35mm film. Film grain texture. No text. No logos. Full upper body frame. The inner voice has no gender.`,
  },
  {
    filename: 'campaign-im-herr-04.webp',
    size: '1024x1792',
    prompt: `Cinematic portrait photography. A White man in his fifties with executive presence. Eyes closed. One hand rests on his chest over his heart. Expression of deep stillness and interior focus — not weakness, profound strength turning inward. Lit by warm gold light against near-black background. Cinematic. Shot on 35mm film. Film grain texture. No text. No logos. Full upper body frame.`,
  },
  {
    filename: 'campaign-im-herr-05.webp',
    size: '1024x1792',
    prompt: `Cinematic portrait photography. An Asian woman with an athlete's muscular build. Mid-breath, chest slightly expanded, eyes just beginning to open and tilt upward. The posture of someone awakening into power. Lit by magenta-violet light from above. Near-black background. Cinematic. Shot on 35mm film. Film grain texture. No text. No logos. Full upper body frame. Performance and wellness united.`,
  },
  {
    filename: 'campaign-im-herr-06.webp',
    size: '1024x1792',
    prompt: `Cinematic portrait photography. An Indigenous-presenting person in sovereign stillness with a direct, unhurried gaze at camera. Expression of deep rootedness and collective belonging. Lit by a mixture of cobalt blue and gold light. Near-black background. Cinematic. Shot on 35mm film. Film grain texture. No text. No logos. Full upper body frame. We are all here.`,
  },

  // ── Founder ────────────────────────────────────────────────────────────────
  {
    filename: 'founder-bianca-mccall-lmft.webp',
    size: '1024x1792',
    prompt: `Cinematic portrait photography. A professional Black woman therapist and clinician, 40s, standing in composed authority. She looks slightly off-camera with an expression of deep intelligence and warm conviction — someone who has seen the inside of human suffering and built something to address it. Cobalt light from the left with a soft magenta-pink rim light at the right edge. Near-black background. Clinical sophistication meets human warmth. Shot on 35mm film. Film grain texture. No text. No logos. PLACEHOLDER — to be replaced with actual founder photograph.`,
  },

  // ── CTA ────────────────────────────────────────────────────────────────────
  {
    filename: 'cta-begin-reprogramming-threshold.webp',
    size: '1792x1024',
    prompt: `Cinematic photography. A lone human figure walks toward a distant, glowing point of light at the far end of a long, dark architectural corridor or passageway. Viewed from behind — we see the back of the figure, small against the vast darkness. Gold and magenta-pink light emanates from the threshold ahead. The figure is moving toward it. Near-black. Shot on 35mm film. Film grain texture. No text. The moment of beginning.`,
  },

  // ── About page ─────────────────────────────────────────────────────────────
  {
    filename: 'about-hero-voice-frequency.webp',
    size: '1792x1024',
    prompt: `Abstract cinematic art. Sound waves visualized as luminous light trails — cobalt blue and magenta-pink frequency lines flowing horizontally across near-black space. Like a voice captured as light and energy. Some lines are thick and bright, others thin and faint, like harmonics. No human figures. No faces. Abstract but deeply human in feeling. Shot on 35mm film. Film grain. No text. The voice made visible.`,
  },
  {
    filename: 'about-arena-after.webp',
    size: '1792x1024',
    prompt: `Cinematic photography. An empty professional basketball arena or gymnasium photographed from the court level, wide angle, looking toward the empty stadium seating. All the lights are dimmed except a residual ambient cobalt-blue glow. No players. No spectators. No game. Just the silence of the space after everything has ended. Haunting emptiness. Near-black. Shot on 35mm film. Film grain. No text. The silence that asks: who are you now?`,
  },

  // ── How It Works ──────────────────────────────────────────────────────────
  {
    filename: 'how-it-works-hero-double-exposure.webp',
    size: '1792x1024',
    prompt: `Double exposure cinematic photography. Two overlapping human figure silhouettes blended in near-black space — one lit by deep cobalt blue light, one by magenta-pink light. The two figures overlap at the center, their lights blending into violet where they meet. Abstract, ghostly, deeply human. No faces visible — only the presence of the figures as light and shadow. Film grain. No text. The duality of regulate and reprogram.`,
  },
  {
    filename: 'step-01-assess.webp',
    size: '1024x1024',
    prompt: `Cinematic portrait. A human figure, head slightly bowed, eyes closed, hands loosely folded — in a posture of deep inward contemplation and honest self-examination. Lit by violet light from above, creating a halo at the crown. Near-black background. The posture of someone finally looking at what has been conducting their life. Shot on 35mm film. Film grain texture. No text. The beginning of honest assessment.`,
  },
  {
    filename: 'step-02-regulate.webp',
    size: '1024x1024',
    prompt: `Cinematic photography. A human torso and lower face, mid-deep-breath, chest noticeably expanded and lifted. Lit by cobalt blue light from the left side, creating a sharp, clean rim along the ribcage. Near-black background. The body in the deliberate act of regulated breathing. Not yoga — clinical. The nervous system actively choosing safety. Shot on 35mm film. Film grain texture. No text.`,
  },
  {
    filename: 'step-03-clone-voice.webp',
    size: '1024x1024',
    prompt: `Extreme close-up product photography of a professional studio condenser microphone, photographed in magenta-pink light from below, creating a dramatic upward glow along the mesh body. Near-black background. The microphone is the only subject — it commands the frame. Cinematic. Shot on 35mm film. Film grain texture. No text. The instrument through which the voice will be captured and returned.`,
  },
  {
    filename: 'step-04-reprogram.webp',
    size: '1024x1024',
    prompt: `Cinematic portrait. A person wearing professional over-ear headphones, eyes closed, face tilted slightly upward, in a state of complete, absorbed stillness. They are receiving something important. Lit by violet and magenta-pink light from above and slightly behind. Near-black background. The expression is one of deep internal shift — this is the moment reprogramming reaches the subconscious. Shot on 35mm film. Film grain texture. No text.`,
  },
];

// ── Utility: generate one image via DALL-E 3 ─────────────────────────────────
async function generateImage(prompt, size) {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      size,
      quality: 'hd',
      style: 'natural',
      n: 1,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message ?? JSON.stringify(err));
  }

  const data = await response.json();
  return data.data[0].url;
}

// ── Utility: download image and convert to WebP ───────────────────────────────
async function downloadAndConvert(url, filename) {
  const tmpPng  = path.join(OUTPUT_DIR, filename.replace('.webp', '._tmp.png'));
  const outWebp = path.join(OUTPUT_DIR, filename);

  // Download the PNG from OpenAI's CDN
  const imgResponse = await fetch(url);
  if (!imgResponse.ok) throw new Error(`Download failed: ${imgResponse.status}`);
  const buffer = await imgResponse.arrayBuffer();
  fs.writeFileSync(tmpPng, Buffer.from(buffer));

  // Convert PNG → WebP using macOS sips (built-in, no extra install)
  try {
    execSync(`sips -s format webp "${tmpPng}" --out "${outWebp}" 2>/dev/null`, { stdio: 'pipe' });
    fs.unlinkSync(tmpPng);
  } catch {
    // sips WebP not supported on this macOS version — rename PNG to .webp
    // (browsers and Next.js handle PNG content regardless of .webp extension)
    fs.renameSync(tmpPng, outWebp);
    console.log(`    ↳ Saved as PNG (sips WebP unavailable — swap for WebP later if needed)`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const failed = [];

  console.log(`\n🎨  HERR Image Generator`);
  console.log(`    Generating ${IMAGES.length} images with DALL-E 3 HD`);
  console.log(`    Output: ${OUTPUT_DIR}\n`);

  for (let i = 0; i < IMAGES.length; i++) {
    const img = IMAGES[i];
    const tag = `[${String(i + 1).padStart(2, '0')}/${IMAGES.length}]`;

    console.log(`${tag} ${img.filename}`);
    console.log(`    ${img.size} · generating...`);

    try {
      const url = await generateImage(img.prompt, img.size);
      await downloadAndConvert(url, img.filename);
      console.log(`    ✓ Saved\n`);
    } catch (err) {
      console.error(`    ✗ FAILED: ${err.message}\n`);
      failed.push(img.filename);
    }

    // Rate limit: wait between requests
    if (i < IMAGES.length - 1) {
      await new Promise((r) => setTimeout(r, 3500));
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('─'.repeat(60));
  console.log(`✅  Generated: ${IMAGES.length - failed.length}/${IMAGES.length}`);

  if (failed.length > 0) {
    console.log(`\n❌  Failed (${failed.length}):`);
    failed.forEach((f) => console.log(`    ${f}`));
    console.log('\nRun this script again to retry failed images.');
  }

  console.log('\n📁  Images saved to: public/images/');
  console.log('🚀  Next step: run npm run deploy to publish the site with real images.\n');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
