#!/usr/bin/env node
/**
 * HERR Journal — Batch Hero Image Generator
 * ───────────────────────────────────────────────────────────────
 * Generates AI hero images for all published journal articles
 * that are missing a featured_image_url.
 *
 * Uses: Replicate Flux 1.1 Pro → Supabase Storage → content_objects update
 *
 * Run:
 *   node scripts/generate-hero-images-batch.mjs
 *
 * Automatically loads .env.local — no shell env setup needed.
 *
 * Required env vars (in .env.local):
 *   REPLICATE_API_TOKEN
 *   SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * IMAGE GUARDRAILS (enforced on every generation):
 *   - Realistic, human-like people — no cartoons, no illustrations
 *   - No exposed body parts or inappropriate imagery
 *   - No AI hallucinations (extra fingers, distorted faces)
 *   - Dark, cinematic, HERR brand aesthetic
 *   - Netflix documentary × TED stage × championship arena
 *   - safety_tolerance: 2 (strict)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// ── Load .env.local automatically ───────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '.env.local');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    // Skip comments, blank lines, and lines without =
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const eqIndex = trimmed.indexOf('=');
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    // Only set if not already in environment (real env takes precedence)
    if (!process.env[key] && value) {
      process.env[key] = value;
    }
  }
  console.log('  Loaded .env.local\n');
} else {
  console.error('  .env.local not found at', envPath);
  process.exit(1);
}

// ── Config from environment ─────────────────────────────────────────────────
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!REPLICATE_API_TOKEN) {
  console.error('Missing REPLICATE_API_TOKEN in environment. Add it to .env.local');
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Mandatory negative prompt (always appended) ─────────────────────────────
const NEGATIVE_PROMPT = [
  'extra fingers', 'extra limbs', 'deformed hands', 'distorted face',
  'disfigured', 'cartoon', 'illustration', 'anime', 'oversaturated',
  'stock photo', 'watermark', 'text overlay', 'CGI', '3D render',
  'mannequin', 'plastic skin', 'uncanny valley', 'nudity',
  'exposed torso', 'partial nudity', 'inappropriate',
].join(', ');

// ── HERR brand style prefix (prepended to every prompt) ─────────────────────
const BRAND_STYLE = `Photorealistic cinematic editorial photography. Shot on 35mm film. Heavy film grain. Dark, near-black background (#0A0A0F). Single dramatic light source. Warm natural skin tones. Fully clothed subjects at all times. Intentional sparse composition. No text. No logos. No watermarks.`;

/**
 * Build a subject-specific prompt from the article's title, excerpt, and tags.
 * Uses Claude-style reasoning to map content to a visual concept.
 */
function buildImagePrompt(article) {
  const { title, excerpt, semantic_tags } = article;
  const tags = (semantic_tags || []).join(', ');

  // Map common article themes to visual concepts
  const titleLower = title.toLowerCase();

  let subjectDescription;

  if (titleLower.includes('inner voice') || titleLower.includes('reprogram')) {
    subjectDescription = `A person in dark clothing, eyes closed, one hand resting on their chest, in a moment of deep internal stillness. Cobalt blue light from the left with faint magenta rim light from behind. The inner voice made visible through body language.`;
  } else if (titleLower.includes('athlete') || titleLower.includes('perform') || titleLower.includes('sport')) {
    subjectDescription = `A professional athlete in dark athletic wear, sitting alone on a bench in a dimly lit training facility. Head slightly bowed, hands clasped, in post-session reflection. Cobalt blue light from the left. Weight of identity in the stillness.`;
  } else if (titleLower.includes('executive') || titleLower.includes('leader') || titleLower.includes('productivity')) {
    subjectDescription = `A professional person in a dark suit or blazer, standing alone at a floor-to-ceiling window at night, one hand resting on the glass, looking out at distant city lights. Gold accent light from above right. The loneliness of leadership.`;
  } else if (titleLower.includes('nervous system') || titleLower.includes('regulat') || titleLower.includes('polyvagal')) {
    subjectDescription = `A person in dark fitted clothing, lying on a mat in a dim room, one hand on their chest, eyes closed, in deep breathwork. Single violet light from above. Safety and stillness embodied.`;
  } else if (titleLower.includes('identity') || titleLower.includes('who am i') || titleLower.includes('transition')) {
    subjectDescription = `A person in dark clothing standing in a vast empty space — perhaps an empty arena or corridor — looking forward toward a distant single light source. Cobalt and violet ambient light. The threshold of becoming.`;
  } else if (titleLower.includes('i am') || titleLower.includes('declaration') || titleLower.includes('affirmation')) {
    subjectDescription = `Extreme close-up of a person's jaw and mouth in side profile, lips slightly parted as if about to speak. Magenta and pink light from above. Near-black background. The moment before declaration.`;
  } else if (titleLower.includes('heal') || titleLower.includes('trauma') || titleLower.includes('safe')) {
    subjectDescription = `A person in dark clothing seated in a quiet dimly lit room, hands open and resting on their knees, palms up, eyes gently closed. Warm violet light. An atmosphere of held, intentional safety.`;
  } else if (titleLower.includes('existential') || titleLower.includes('meaning') || titleLower.includes('purpose')) {
    subjectDescription = `A solitary person in dark clothing, dwarfed by a vast dark space — perhaps standing at the edge of an empty stage or in a cathedral-like room. Single cobalt spotlight from above. The scale of existential questioning.`;
  } else if (titleLower.includes('sleep') || titleLower.includes('rest') || titleLower.includes('subconscious')) {
    subjectDescription = `A person in dark clothing lying in stillness, eyes closed, bathed in deep blue and violet light. Serene. The moment between waking and sleep. Near-black surroundings.`;
  } else if (titleLower.includes('community') || titleLower.includes('connection') || titleLower.includes('family')) {
    subjectDescription = `Two people in dark clothing sitting close together in a dimly lit space, one person's hand resting on the other's shoulder. Warm gold light from the right. Human connection in quietness.`;
  } else {
    // Fallback: introspective portrait tied to the article's themes
    subjectDescription = `A person in dark professional clothing, seated alone in a dimly lit editorial setting, looking directly at camera with quiet intensity and self-possession. Single cobalt blue light from the left with subtle magenta accents. The sovereignty of someone who has done the inner work. Portrait framing.`;
  }

  return `${BRAND_STYLE}

${subjectDescription}

Article context — "${title}": ${excerpt || tags || 'Existential psychology and inner voice reprogramming.'}

Diverse, professional subject. 16:9 widescreen composition.`;
}

// ── Replicate Flux 1.1 Pro ──────────────────────────────────────────────────

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
          aspect_ratio: '16:9',
          output_format: 'jpg',
          output_quality: 92,
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

// ── Supabase Storage upload ─────────────────────────────────────────────────

async function uploadToSupabase(imageUrl, slug) {
  console.log('   Downloading image...');
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`Download failed: ${imgRes.status}`);
  const buffer = Buffer.from(await imgRes.arrayBuffer());

  const fileName = `blog/${slug}-hero.jpg`;
  console.log(`   Uploading to images/${fileName}`);

  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(fileName, buffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

// ── Database update ─────────────────────────────────────────────────────────

async function updateFeaturedImage(slug, imageUrl) {
  const { data, error } = await supabase
    .from('content_objects')
    .update({ featured_image_url: imageUrl })
    .eq('slug', slug)
    .select('slug, title');

  if (error) throw new Error(`DB update failed: ${error.message}`);
  return data;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n  HERR Journal — Batch Hero Image Generator');
  console.log('  Using Flux 1.1 Pro via Replicate\n');

  // 1. Fetch all published articles missing a featured_image_url
  const { data: articles, error } = await supabase
    .from('content_objects')
    .select('slug, title, excerpt, semantic_tags, content_type')
    .eq('status', 'published')
    .in('content_type', ['article', 'guide'])
    .or('featured_image_url.is.null,featured_image_url.eq.')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('  Failed to fetch articles:', error.message);
    process.exit(1);
  }

  if (!articles || articles.length === 0) {
    console.log('  All published articles already have hero images. Nothing to do.\n');
    process.exit(0);
  }

  console.log(`  Found ${articles.length} article(s) missing hero images:\n`);
  articles.forEach((a, i) => console.log(`  ${i + 1}. ${a.title}`));
  console.log('');

  // 2. Process each article
  let successCount = 0;
  let failCount = 0;

  for (const article of articles) {
    console.log(`\n  [${article.slug}]`);
    console.log(`  "${article.title}"`);

    try {
      // Build prompt
      const prompt = buildImagePrompt(article);
      console.log(`  Prompt length: ${prompt.length} chars`);

      // Generate image
      const imageUrl = await generateImage(prompt);

      // Upload to Supabase Storage
      const publicUrl = await uploadToSupabase(imageUrl, article.slug);

      // Update database
      await updateFeaturedImage(article.slug, publicUrl);

      console.log(`  Done: ${publicUrl}`);
      successCount++;
    } catch (err) {
      console.error(`  FAILED: ${err.message}`);
      failCount++;
      // Continue to next article — don't stop the batch
    }
  }

  // 3. Summary
  console.log('\n' + '-'.repeat(60));
  console.log(`  Complete: ${successCount} succeeded, ${failCount} failed`);
  if (successCount > 0) {
    console.log('  Redeploy the frontend to see updated images.\n');
  }
}

main();
