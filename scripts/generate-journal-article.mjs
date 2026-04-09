#!/usr/bin/env node
/**
 * HERR Journal Article Generator — Automated
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates a full journal article + hero image and publishes to Supabase.
 * Run manually: node scripts/generate-journal-article.mjs
 * Or triggered by automated schedule (Tuesdays + Thursdays).
 *
 * IMAGE SAFETY RULES (enforced on every generation):
 *   ✅ Fully clothed subjects — always. No exceptions.
 *   ✅ Photorealistic human appearance — no CGI, no mannequin, no illustration
 *   ✅ Subject-matter relevant — image must reflect the article topic
 *   ✅ Brand-consistent — dark backgrounds, cobalt/pink/violet/gold light, film grain
 *   ✅ safety_tolerance: 2 (strict) on all Replicate calls
 *   ❌ No nudity, no exposed torsos, no inappropriate content
 *   ❌ No AI-generated images of Bianca D. McCall, LMFT
 */

import { createClient } from '/Users/bdmccall/Desktop/digital-home/digital-home-backend-starter/node_modules/@supabase/supabase-js/dist/index.mjs';

const REPLICATE_API_KEY = 'process.env.REPLICATE_API_TOKEN';
const OPENAI_API_KEY = 'process.env.OPENAI_API_KEY';
const SUPABASE_URL = 'https://uyhfdtrvlhdhrhniysvw.supabase.co';
const SUPABASE_SERVICE_KEY = 'process.env.SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── ARTICLE TOPIC POOL ────────────────────────────────────────────────────────
// Rotated weekly. Add new topics here — system picks the next unpublished one.
const ARTICLE_TOPICS = [
  {
    title: 'The Neuroscience of the Inner Voice: Why What You Say to Yourself Changes Everything',
    slug: 'neuroscience-inner-voice-reprogramming',
    target_keyword: 'inner voice reprogramming neuroscience',
    pillar: 'Science',
    image_brief: 'A professional person in dark clothing seated at a minimal desk, eyes closed, wearing over-ear headphones. Deep in focused listening. Violet light from above left. Near-black background. Photorealistic. Fully clothed. Film grain. Cinematic. 16:9.',
    summary: 'The inner voice is not a metaphor — it is a neurological system. What you say to yourself activates real neural pathways that shape your identity, performance, and emotional regulation.',
  },
  {
    title: 'Why Athletes Make the Best Therapy Clients (And the Hardest)',
    slug: 'athletes-therapy-identity-performance',
    target_keyword: 'athletes mental health therapy identity',
    pillar: 'Performance',
    image_brief: 'Photorealistic cinematic portrait. A professional male athlete, fully clothed in dark athletic wear, sitting alone on a bench in a dimly lit locker room. Head slightly bowed, elbows on knees, hands clasped in deep reflection. Cobalt blue light from the left. Near-black background. Film grain. Photorealistic. Not illustrated. 16:9.',
    summary: 'Athletes are trained to override their inner voice — to push through doubt, pain, and fear. That same skill becomes the barrier when they need to actually hear themselves.',
  },
  {
    title: 'The Five Existential Concerns Every High Performer Is Navigating Right Now',
    slug: 'five-existential-concerns-high-performers',
    target_keyword: 'existential concerns high performers identity',
    pillar: 'Existential',
    image_brief: 'Photorealistic cinematic photography. A professional woman in her forties, fully clothed in a dark blazer, standing alone at a floor-to-ceiling window at night, looking out at city lights below. One hand resting on the glass. Cobalt light from the window. Thoughtful expression. Near-black interior. Film grain. 16:9.',
    summary: 'Meaning, identity, freedom, isolation, mortality — these are not abstract philosophical questions. They are the live concerns underneath every performance conversation Bianca D. McCall, LMFT has in the clinical room.',
  },
  {
    title: 'What Happens to Identity When the Season Ends',
    slug: 'identity-after-season-ends-athletic-transition',
    target_keyword: 'athlete identity transition after career',
    pillar: 'Transition',
    image_brief: 'Photorealistic wide-angle cinematic photography. An empty basketball court at night, viewed from mid-court. A single person, fully clothed in street clothes, stands alone near the three-point line looking up at the scoreboard. Single cobalt spotlight from above. Near-black background. Film grain. No crowds. 16:9.',
    summary: 'The jersey comes off. The schedule disappears. And what is left is the identity question most athletes have never had to answer: who am I when performance is not the answer?',
  },
  {
    title: 'I AM Declarations vs. Affirmations: Why the Grammar of Identity Matters',
    slug: 'i-am-declarations-vs-affirmations-identity-science',
    target_keyword: 'I AM affirmations identity reprogramming science',
    pillar: 'Science',
    image_brief: 'Extreme macro cinematic close-up of a human mouth and jaw, side profile, caught mid-breath as if about to speak. The lips are slightly parted. Hot pink and magenta light from above. Near-black background. Fully clothed shoulder visible at frame edge. Film grain. Photorealistic. 16:9.',
    summary: '"I AM" is not a motivational phrase. It is the most direct activation of the self-schema — the neural architecture that organizes how you understand yourself. Here is why that matters.',
  },
  {
    title: 'Regulation Before Reprogramming: The Clinical Sequence Most Wellness Tools Skip',
    slug: 'regulation-before-reprogramming-clinical-sequence',
    target_keyword: 'nervous system regulation reprogramming sequence',
    pillar: 'Science',
    image_brief: 'Photorealistic cinematic close-up photography. A person in a dark fitted turtleneck, seen from the collarbone up, chin slightly raised, eyes closed, in a deep slow exhale. The chest and throat are still. Cobalt light from the left side. Near-black background. Peaceful. Composed. Film grain. 16:9.',
    summary: 'HERR™ sequences regulation before reprogramming — not as a feature choice, but because the neuroscience demands it. An unregulated nervous system cannot absorb identity-level change.',
  },
  {
    title: 'The Executive Who Cannot Stop Working: Identity, Worth, and the Productivity Trap',
    slug: 'executive-identity-worth-productivity-trap',
    target_keyword: 'executive identity burnout productivity worth',
    pillar: 'Performance',
    image_brief: 'Photorealistic cinematic portrait. A professional man in his fifties, fully clothed in a dark suit, sitting at the end of a long conference table alone, hands folded, looking straight ahead. Gold accent light from above right. Cobalt ambient light. Near-black background. Weight of responsibility in his stillness. Film grain. 16:9.',
    summary: 'For high-achieving executives, the inner voice has learned one thing above all else: your worth is your output. Here is what happens when the output stops — and how to rewire what comes next.',
  },
  {
    title: 'Polyvagal Theory in Plain Language: What Your Nervous System Is Actually Doing',
    slug: 'polyvagal-theory-nervous-system-plain-language',
    target_keyword: 'polyvagal theory nervous system regulation explained',
    pillar: 'Science',
    image_brief: 'Photorealistic cinematic photography. A woman in her thirties, fully clothed in dark athletic wear, lying on a yoga mat in a dim room, one hand on her chest, eyes closed, in deep breathwork. Single violet light from above. Near-black background. Still. Safe. Film grain. 16:9.',
    summary: 'Stephen Porges\' Polyvagal Theory explains why talk therapy alone cannot rewire trauma — and why HERR™ begins with the body before the inner voice. Here is what it means in plain language.',
  },
];

// ── UTILITIES ─────────────────────────────────────────────────────────────────

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function estimateReadTime(content) {
  const words = content.split(/\s+/).length;
  return Math.max(3, Math.ceil(words / 200));
}

// ── STEP 1: Pick next unpublished topic ───────────────────────────────────────

async function getNextTopic() {
  // Get all published/draft slugs
  const { data } = await supabase
    .from('content_objects')
    .select('slug')
    .in('status', ['published', 'draft']);

  const existingSlugs = new Set((data || []).map(r => r.slug));

  // Find first topic not yet in DB
  const next = ARTICLE_TOPICS.find(t => !existingSlugs.has(t.slug));
  if (!next) throw new Error('All topics already published! Add new topics to ARTICLE_TOPICS.');
  return next;
}

// ── STEP 2: Generate article content via OpenAI ───────────────────────────────

async function generateArticleContent(topic) {
  console.log('✍️   Writing article with GPT-4...');

  const systemPrompt = `You are the editorial voice of HERR™ — a clinical wellness brand founded by Bianca D. McCall, LMFT.
Your writing is:
- Clinically grounded but human and accessible
- Direct, confident, and never generic
- Written from a position of expertise without being preachy
- Brand voice: intelligent, warm, sovereign. Like a brilliant therapist who has also played professional sports.
- Always refer to the brand as HERR™ (with trademark symbol)
- Never use wellness clichés ("journey", "self-care", "healing space", etc.)
Always write in second person ("you") or third person. Never first person singular.`;

  const userPrompt = `Write a complete HERR™ journal article on this topic:

Title: "${topic.title}"
Target keyword: ${topic.target_keyword}
Pillar: ${topic.pillar}
Summary: ${topic.summary}

Requirements:
- 700–900 words
- 4–5 sections with clear H2 subheadings
- Open with a strong clinical or real-world hook — no generic intros
- Weave in the HERR™ methodology naturally (not as sales copy)
- Reference Bianca D. McCall, LMFT as the founder/clinical authority where appropriate
- End with a clear, non-pushy call to awareness (not "buy now" language)
- Return ONLY the article body as clean markdown. No title, no metadata.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`OpenAI error: ${err.error?.message}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// ── STEP 3: Generate hero image via Flux 1.1 Pro ──────────────────────────────

async function generateHeroImage(topic) {
  console.log('🎨  Generating hero image via Flux 1.1 Pro...');

  // Wrap the brief with strict safety rules
  const safePrompt = `${topic.image_brief}

CRITICAL REQUIREMENTS: All subjects must be FULLY CLOTHED at all times. No exposed torsos, no nudity, no partial nudity. Photorealistic human appearance — not CGI mannequin, not illustration, not 3D render. Real human skin texture and proportions. HERR brand: near-black background (#0A0A0F), single dramatic light source (cobalt, violet, gold, or pink), heavy film grain, cinematic composition.`;

  const response = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REPLICATE_API_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'respond-async',
    },
    body: JSON.stringify({
      input: {
        prompt: safePrompt,
        aspect_ratio: '16:9',
        output_format: 'jpg',
        output_quality: 92,
        safety_tolerance: 2, // strict — rejects anything borderline
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Replicate start failed: ${response.status} ${err}`);
  }

  const prediction = await response.json();
  return pollPrediction(prediction.id);
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
  throw new Error('Image generation timed out');
}

// ── STEP 4: Upload image to Supabase Storage ──────────────────────────────────

async function uploadImage(output, slug) {
  const imageUrl = Array.isArray(output) ? output[0] : output;
  console.log('📥  Downloading image...');
  const res = await fetch(imageUrl);
  const buffer = Buffer.from(await res.arrayBuffer());

  const fileName = `blog/${slug}-hero.jpg`;
  const { error } = await supabase.storage.from('images').upload(fileName, buffer, {
    contentType: 'image/jpeg',
    upsert: true,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from('images').getPublicUrl(fileName);
  console.log(`✓  Uploaded: ${data.publicUrl}`);
  return data.publicUrl;
}

// ── STEP 5: Save to Supabase DB ───────────────────────────────────────────────

async function saveArticle(topic, content, imageUrl) {
  console.log('🗄️   Saving article to database...');

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('content_objects')
    .upsert({
      slug: topic.slug,
      title: topic.title,
      content_type: 'article',
      body: content,
      featured_image_url: imageUrl,
      target_keyword: topic.target_keyword,
      pillar_topic: topic.pillar,
      status: 'published',
      published_at: now,
      read_time_minutes: estimateReadTime(content),
      author_name: 'Bianca D. McCall, LMFT',
      meta_description: topic.summary,
    }, { onConflict: 'slug' })
    .select();

  if (error) throw new Error(`DB save failed: ${error.message}`);
  console.log(`✓  Article saved: ${topic.slug}`);
  return data;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n📰  HERR™ Journal Article Generator');
  console.log(`    ${new Date().toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}\n`);

  try {
    // 1. Pick next topic
    const topic = await getNextTopic();
    console.log(`📌  Topic: "${topic.title}"\n`);

    // 2. Generate content + image in parallel for speed
    const [content, imageOutput] = await Promise.all([
      generateArticleContent(topic),
      generateHeroImage(topic),
    ]);

    // 3. Upload image
    const imageUrl = await uploadImage(imageOutput, topic.slug);

    // 4. Save everything
    await saveArticle(topic, content, imageUrl);

    console.log('\n' + '─'.repeat(60));
    console.log(`✅  Published: "${topic.title}"`);
    console.log(`    https://www.h3rr.com/journal/${topic.slug}\n`);

  } catch (err) {
    console.error('\n❌  Error:', err.message);
    process.exit(1);
  }
}

main();
