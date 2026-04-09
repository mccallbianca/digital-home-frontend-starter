#!/usr/bin/env node
/**
 * Generates a hero image for the HERR journal article and uploads to Supabase Storage.
 * Updates the featured_image_url in content_objects table.
 * Uses @supabase/supabase-js from the backend project's node_modules.
 */

import { createClient } from '/Users/bdmccall/Desktop/digital-home/digital-home-backend-starter/node_modules/@supabase/supabase-js/dist/index.mjs';

const SUPABASE_URL = 'https://uyhfdtrvlhdhrhniysvw.supabase.co';
const SUPABASE_SERVICE_KEY = 'process.env.SUPABASE_SERVICE_ROLE_KEY';
const OPENAI_API_KEY = 'process.env.OPENAI_API_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── HERR-branded image prompt ─────────────────────────────────────────────────
const IMAGE_PROMPT = `Cinematic editorial photography. A professional athlete in a dark, quiet locker room or training facility, sitting alone in stillness after a session — head slightly bowed, hands clasped, in deep internal reflection. The inner voice present but unspoken. Cobalt blue light from the left with faint pink rim light from behind. Near-black background. Sparse, intentional composition. Shot on 35mm film. Film grain. No text. No logos. No faces visible. Upper body frame.`;

const ARTICLE = {
  slug: 'why-high-performers-struggle-to-quiet-their-inner-critic',
  title: 'Why High Performers Struggle to Quiet Their Inner Critic',
};

async function generateImage() {
  console.log('🎨  Generating hero image via DALL-E 3...');
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: IMAGE_PROMPT,
      size: '1792x1024',
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

async function uploadToSupabase(imageUrl, slug) {
  console.log('📥  Downloading image...');
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`Download failed: ${imgRes.status}`);
  const buffer = Buffer.from(await imgRes.arrayBuffer());

  const fileName = `blog/${slug}-hero.png`;
  console.log(`☁️   Uploading to Supabase Storage: images/${fileName}`);

  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(fileName, buffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(fileName);

  const publicUrl = urlData.publicUrl;
  console.log(`✓  Public URL: ${publicUrl}`);
  return publicUrl;
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
  console.log(`\n🔄  HERR Journal Hero Image Generator`);
  console.log(`    Article: "${ARTICLE.title}"\n`);

  try {
    const imageUrl = await generateImage();
    console.log('✓  Image generated\n');

    const publicUrl = await uploadToSupabase(imageUrl, ARTICLE.slug);

    await updateDatabase(ARTICLE.slug, publicUrl);

    console.log('\n─'.repeat(60));
    console.log('✅  Done! Hero image is live.');
    console.log(`    Image URL: ${publicUrl}`);
    console.log('\n    Redeploy the frontend to see it live on the journal page.');
  } catch (err) {
    console.error('\n❌  Error:', err.message);
    process.exit(1);
  }
}

main();
