#!/usr/bin/env node
/**
 * Generates the HERR journal article hero image via Flux 1.1 Pro (Replicate).
 * Uploads to Supabase Storage and updates content_objects.featured_image_url.
 */

import fs from 'fs';
import { createClient } from '/Users/bdmccall/Desktop/digital-home/digital-home-backend-starter/node_modules/@supabase/supabase-js/dist/index.mjs';

const REPLICATE_API_KEY = 'process.env.REPLICATE_API_TOKEN';
const SUPABASE_URL = 'https://uyhfdtrvlhdhrhniysvw.supabase.co';
const SUPABASE_SERVICE_KEY = 'process.env.SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE = {
  slug: 'why-high-performers-struggle-to-quiet-their-inner-critic',
  title: 'Why High Performers Struggle to Quiet Their Inner Critic',
};

const PROMPT = `Cinematic editorial photography. A professional athlete in a dark quiet locker room or training facility, sitting alone in stillness after a session — head slightly bowed, hands clasped, in deep internal reflection. The inner voice present but unspoken. Single cobalt blue light from the left with faint hot pink rim light from behind. Near-black background #0A0A0F. Sparse intentional composition. Dark minimal athletic clothing. Upper body frame. No faces visible. Film grain heavy. Shot on 35mm film. No text. No logos. 16:9 widescreen.`;

async function startGeneration() {
  console.log('🎨  Generating hero image via Flux 1.1 Pro...');
  const response = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REPLICATE_API_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'respond-async',
    },
    body: JSON.stringify({
      input: {
        prompt: PROMPT,
        aspect_ratio: '16:9',
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

  return await response.json();
}

async function pollPrediction(predictionId, maxIterations = 120) {
  process.stdout.write('   Generating');
  for (let i = 0; i < maxIterations; i++) {
    await new Promise(r => setTimeout(r, 3000));

    const res = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { Authorization: `Bearer ${REPLICATE_API_KEY}` },
    });

    if (!res.ok) throw new Error(`Poll failed: ${res.status}`);
    const data = await res.json();

    if (data.status === 'succeeded') {
      process.stdout.write(' ✓\n');
      return data.output;
    }
    if (data.status === 'failed' || data.status === 'canceled') {
      throw new Error(`Prediction ${data.status}: ${data.error}`);
    }
    process.stdout.write('.');
  }
  throw new Error('Timed out after 6 minutes');
}

async function uploadToSupabase(imageUrl, slug) {
  console.log('📥  Downloading image...');
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`Download failed: ${imgRes.status}`);
  const buffer = Buffer.from(await imgRes.arrayBuffer());

  const fileName = `blog/${slug}-hero.jpg`;
  console.log(`☁️   Uploading to Supabase Storage: images/${fileName}`);

  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(fileName, buffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName);
  console.log(`✓  Public URL: ${urlData.publicUrl}`);
  return urlData.publicUrl;
}

async function updateDatabase(slug, imageUrl) {
  console.log('🗄️   Updating featured_image_url in content_objects...');

  const { data, error } = await supabase
    .from('content_objects')
    .update({ featured_image_url: imageUrl })
    .eq('slug', slug)
    .select();

  if (error) throw new Error(`DB update failed: ${error.message}`);
  console.log(`✓  Database updated: ${data.length} row(s) affected`);
  return data;
}

async function main() {
  console.log(`\n🔄  HERR Journal Hero — Flux 1.1 Pro`);
  console.log(`    Article: "${ARTICLE.title}"\n`);

  try {
    const prediction = await startGeneration();
    const output = await pollPrediction(prediction.id);
    const imageUrl = Array.isArray(output) ? output[0] : output;

    const publicUrl = await uploadToSupabase(imageUrl, ARTICLE.slug);
    await updateDatabase(ARTICLE.slug, publicUrl);

    console.log('\n' + '─'.repeat(60));
    console.log('✅  Done! Hero image is live.');
    console.log(`    ${publicUrl}`);
    console.log('\n    Redeploy the frontend to pull the updated DB image.\n');
  } catch (err) {
    console.error('\n❌  Error:', err.message);
    process.exit(1);
  }
}

main();
