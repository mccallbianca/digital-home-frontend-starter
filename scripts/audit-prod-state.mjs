#!/usr/bin/env node
/**
 * One-shot read-only DB audit for the production-state investigation.
 * Prints JSON sections that the agent reads back. NO writes.
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function section(name, fn) {
  console.log(`\n=== ${name} ===`);
  try { const r = await fn(); console.log(JSON.stringify(r, null, 2)); }
  catch (e) { console.log('ERR', e.message); }
}

// AUDIT 1 — Pipeline A state
await section('A1.status_breakdown', async () => {
  const { data } = await sb.from('affirmation_template_library').select('status', { count: 'exact', head: false });
  const breakdown = {};
  for (const r of data || []) {
    breakdown[r.status] = (breakdown[r.status] || 0) + 1;
  }
  return breakdown;
});
await section('A1.has_audio_url', async () => {
  const { count } = await sb.from('affirmation_template_library').select('id', { count: 'exact', head: true }).not('bianca_audio_url', 'is', null);
  return { count };
});
await section('A1.bucket_objects', async () => {
  const { data, error } = await sb.storage.from('affirmations-bianca').list('', { limit: 1, offset: 0 });
  if (error) return { error: error.message };
  // To count files we'd recursively walk the bucket — top-level shows the folders. Listing with limit only counts top-level. Approximate by directly listing a known prefix.
  const { data: workout } = await sb.storage.from('affirmations-bianca').list('workout', { limit: 1000 });
  return { top_level: data?.length, workout_subdirs: workout?.length, note: 'top-level dirs only; recursion via SQL not available via JS SDK' };
});
await section('A1.storage_objects_count_via_sql', async () => {
  // Use the storage REST API via rpc if available, else NULL
  const { data, error } = await sb.rpc('count_storage_objects', { bucket: 'affirmations-bianca' });
  if (error) return { error: error.message, note: 'rpc not present — running raw SQL via Postgres function would require it; skipping' };
  return { count: data };
});

// AUDIT 2 — Affirmation playback table presence
await section('A2.affirmation_scripts_exists', async () => {
  const { data, error } = await sb.from('affirmation_scripts').select('*').limit(3);
  if (error) return { exists: false, error: error.message };
  return { exists: true, sample_count: data?.length, sample: data };
});
await section('A2.template_library_with_audio_sample', async () => {
  const { data, error } = await sb.from('affirmation_template_library').select('id,activity_mode,existential_domain,risk_tier,bianca_audio_url,status').not('bianca_audio_url', 'is', null).limit(3);
  if (error) return { error: error.message };
  return { count: data?.length, sample: data };
});

// AUDIT 3 — ecqo_sound_tracks genres
await section('A3.genres', async () => {
  const { data, error } = await sb.from('ecqo_sound_tracks').select('genre');
  if (error) return { error: error.message };
  const counts = {};
  for (const r of data || []) counts[r.genre] = (counts[r.genre] || 0) + 1;
  return counts;
});

// AUDIT 4 — community / threads / circles schema
await section('A4.community_tables', async () => {
  // try a bunch of likely names; we'll get an error if the table doesn't exist
  const tables = ['community_threads', 'community_posts', 'circles', 'circles_threads', 'threads', 'herr_nation_threads', 'beta_lab_threads', 'community_circles'];
  const out = {};
  for (const t of tables) {
    const { error, count } = await sb.from(t).select('id', { count: 'exact', head: true });
    out[t] = error ? `MISSING (${error.message})` : `EXISTS (${count ?? 0} rows)`;
  }
  return out;
});
await section('A4.community_threads_sample', async () => {
  const { data, error } = await sb.from('community_threads').select('*').order('created_at',{ascending:false}).limit(3);
  if (error) return { error: error.message };
  return { count: data?.length, latest: data };
});

// AUDIT 5 — daily reflection / journal posts
await section('A5.journal_posts_exists', async () => {
  const { data, error } = await sb.from('journey_posts').select('*').order('created_at',{ascending:false}).limit(3);
  if (error) return { exists: false, error: error.message };
  return { exists: true, count: data?.length, sample: data?.map(r => ({ id: r.id, category: r.category, member_id: r.member_id, media_type: r.media_type, created_at: r.created_at, has_body: !!r.body })) };
});
await section('A5.daily_reflections_exists', async () => {
  const { data, error } = await sb.from('daily_reflections').select('*').limit(1);
  if (error) return { exists: false, error: error.message };
  return { exists: true, sample_present: data?.length > 0 };
});

// AUDIT 8 — profiles display_name unique
await section('A8.profiles_display_name_unique', async () => {
  const { data, error } = await sb.rpc('show_columns', { tbl: 'profiles' });
  if (error) return { rpc_unavailable: error.message };
  return data;
});

// AUDIT 8 — alternative via information_schema query (won't work via supabase-js;
// must check via raw column existence)
await section('A8.profiles_has_display_name_column', async () => {
  const { data, error } = await sb.from('profiles').select('id,display_name').limit(1);
  if (error) return { has_column: false, error: error.message };
  return { has_column: true, sample_value: data?.[0] };
});

// AUDIT 6 — settings sources
await section('A6.user_preferences_sample', async () => {
  const { data, error } = await sb.from('user_preferences').select('*').limit(3);
  if (error) return { error: error.message };
  return { sample: data };
});
await section('A6.member_activity_modes_sample', async () => {
  const { data, error } = await sb.from('member_activity_modes').select('*').limit(5);
  if (error) return { error: error.message };
  return { sample: data };
});

// AUDIT 10 — push subscriptions
await section('A10.push_subscriptions_exists', async () => {
  const { data, error } = await sb.from('push_subscriptions').select('*').limit(1);
  if (error) return { exists: false, error: error.message };
  return { exists: true, sample_count: data?.length };
});

console.log('\n=== DONE ===');
