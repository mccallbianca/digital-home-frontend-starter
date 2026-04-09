#!/usr/bin/env node
/**
 * EMERGENCY FIX — Regenerates the hero image for the identity/career transition article.
 * Uses Flux 1.1 Pro with a safe, fully-clothed, human-looking, subject-appropriate prompt.
 */

import fs from 'fs';
import { createClient } from '/Users/bdmccall/Desktop/digital-home/digital-home-backend-starter/node_modules/@supabase/supabase-js/dist/index.mjs';

const REPLICATE_API_KEY = 'process.env.REPLICATE_API_TOKEN';
const SUPABASE_URL = 'https://uyhfdtrvlhdhrhniysvw.supabase.co';
const SUPABASE_SERVICE_KEY = 'process.env.SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE = {
  slug: 'what-existential-psychology-reveals-about-identity-after-career-transition',
  title: 'What Existential Psychology Reveals About Identity After Career Transition',
};

// SAFE PROMPT — fully clothed, photorealistic, no nudity, subject-appropriate
const PROMPT = `Photorealistic cinematic portrait photography. A professional Black woman in her late thirties, fully clothed in a dark tailored blazer and trousers, standing alone in a quiet empty boardroom or hallway. She is looking out a floor-to-ceiling window into darkness, one hand resting on the glass. Her posture is reflective and composed — the weight of identity transition visible in her stillness. Single cobalt blue light source from the left. Near-black background. Film grain. No nudity. No exposed skin beyond face and hands. Shot on 35mm film. Photorealistic. Not illustrated. Not CGI. Not animated. Real human appearance. 16:9 widescreen.`;

async function startGeneration() {
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
        output_quality: 92,
        safety_tolerance: 2,
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
    const data = await res.json();
    if (data.status === 'succeeded') { process.stdout.write(' ✓\n'); return data.output; }
    if (data.status === 'failed' || data.status === 'canceled') throw new Error(`Prediction ${data.status}: ${data.error}`);
    process.stdout.write('.');
  }
  throw new Error('Timed out');
}

async function uploadToSupabase(imageUrl, slug) {
  console.log('📥  Downloading image...');
  const imgRes = await fetch(imageUrl);
  const buffer = Buffer.from(await imgRes.arrayBuffer());

  const fileName = `blog/${slug}-hero.jpg`;
  console.log(`☁️   Uploading to Supabase Storage: images/${fileName}`);

  const { error } = await supabase.storage.from('images').upload(fileName, buffer, {
    contentType: 'image/jpeg',
    upsert: true,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName);
  console.log(`✓  URL: ${urlData.publicUrl}`);
  return urlData.publicUrl;
}

async function updateDatabase(slug, imageUrl) {
  console.log('🗄️   Updating database...');
  const { data, error } = await supabase
    .from('content_objects')
    .update({ featured_image_url: imageUrl })
    .eq('slug', slug)
    .select();
  if (error) throw new Error(`DB update failed: ${error.message}`);
  console.log(`✓  ${data.length} row(s) updated`);
}

async function main() {
  console.log(`\n🔄  EMERGENCY IMAGE FIX`);
  console.log(`    "${ARTICLE.title}"\n`);

  try {
    process.stdout.write('🎨  Starting Flux 1.1 Pro generation...\n');
    const prediction = await startGeneration();
    const output = await pollPrediction(prediction.id);
    const imageUrl = Array.isArray(output) ? output[0] : output;

    const publicUrl = await uploadToSupabase(imageUrl, ARTICLE.slug);
    await updateDatabase(ARTICLE.slug, publicUrl);

    console.log('\n' + '─'.repeat(60));
    console.log('✅  Fixed! New image is live.');
    console.log(`    ${publicUrl}\n`);
  } catch (err) {
    console.error('\n❌  Error:', err.message);
    process.exit(1);
  }
}

main();
