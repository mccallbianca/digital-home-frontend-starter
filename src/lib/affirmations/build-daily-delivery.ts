/**
 * B5.3 — Daily delivery orchestrator.
 *
 * For a single (user, deliveryDate, mode), picks the day's:
 *   - affirmation template (matched on activity_mode × existential_domain
 *     × risk_tier × week-of-month × cultural_routing)
 *   - music track from ecqo_sound_tracks
 *   - Solfeggio frequency (driven by week-of-month frequency tier)
 *   - target_length (mode-specific)
 *   - audio source (Bianca master vs user_clone)
 *
 * Writes a user_daily_deliveries row with status='queued' and the
 * ingredient URLs. The actual ffmpeg mixing is handled out-of-band by
 * scripts/process-daily-mixes.mjs (Workers can't run ffmpeg.wasm for
 * 5-30 min audio inside the CPU budget).
 *
 * This module is safe to call from a Cloudflare Worker — it only
 * touches Supabase + cheap arithmetic.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ── Constants ───────────────────────────────────────────────────────

/**
 * member_activity_modes uses hyphenated values ('deep-work', 'love-family')
 * while affirmation_template_library + ecqo_sound_tracks use joined values
 * ('deepwork', 'lovefamily'). Normalize before querying templates/tracks.
 */
export function normalizeMode(mode: string): string {
  return mode.replace(/-/g, '').toLowerCase();
}

/**
 * Mode → target length in seconds. Roughly aligned to the activity's
 * natural duration so the loop count stays sensible.
 */
const MODE_TARGET_LENGTH_SECONDS: Record<string, number> = {
  workout: 30 * 60,
  driving: 25 * 60,
  sleep: 30 * 60,
  morning: 10 * 60,
  deepwork: 25 * 60,
  lovefamily: 10 * 60,
  abundance: 15 * 60,
  healing: 20 * 60,
};

/**
 * Week-of-month → Solfeggio frequency cycle. Built from the B5.1 generator
 * frequency_tier scheme so the daily mix's Hz layer matches the chosen
 * template's emotional tone bucket.
 */
const SOLFEGGIO_BY_WEEK: Record<number, { tier: 'low' | 'median' | 'high'; hz: number[] }> = {
  1: { tier: 'low',    hz: [174, 285] },
  2: { tier: 'median', hz: [396, 417, 432] },
  3: { tier: 'high',   hz: [528, 639] },
  4: { tier: 'high',   hz: [741, 852, 963] },
};

/**
 * Member tier → set of ecqo_sound_tracks tier_access values they can pull
 * from. The tier_access column is binary ('collective' | 'personalized_elite')
 * so collective members only get collective tracks; everyone else gets both.
 */
const TIER_ACCESS_BY_MEMBER_TIER: Record<string, string[]> = {
  collective:   ['collective'],
  personalized: ['collective', 'personalized_elite'],
  elite:        ['collective', 'personalized_elite'],
};

// ── Helpers ─────────────────────────────────────────────────────────

function getSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service-role env not configured');
  return createClient(url, key);
}

function isoDate(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function weekOfMonth(d: Date): 1 | 2 | 3 | 4 {
  const day = d.getUTCDate();
  if (day <= 7) return 1;
  if (day <= 14) return 2;
  if (day <= 21) return 3;
  return 4;
}

function firstOfMonth(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

// ── Existential-domain selection ────────────────────────────────────

/**
 * Map of the 8 existential_responses questions to template domains.
 * Index matches the QUESTIONS array in /api/cron/monthly-reset/route.ts.
 *
 *   0: Meaning & Purpose          → meaning
 *   1: Connection to something    → spiritual
 *   2: Comfort with uncertainty   → freedom
 *   3: Inner voice                → identity
 *   4: Isolation                  → connection
 *   5: Identity clarity           → identity
 *   6: Mortality                  → mortality
 *   7: Sense of aliveness         → meaning
 *
 * Response is 1-5 Likert. The "lowest-scoring" domain = average response
 * is closest to 1, which means the most distress / most need.
 */
const QUESTION_DOMAIN_MAP: Record<number, string> = {
  0: 'meaning',
  1: 'spiritual',
  2: 'freedom',
  3: 'identity',
  4: 'connection',
  5: 'identity',
  6: 'mortality',
  7: 'meaning',
};

const DEFAULT_DOMAIN_ROTATION = [
  'meaning', 'connection', 'freedom', 'identity', 'spiritual',
  'guilt', 'mortality',
];

async function pickTargetDomain(
  supabase: SupabaseClient,
  userId: string,
  fallbackSeed: number,
): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('existential_responses')
    .select('question_index, response, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(64); // last few sittings is fine; we just need recent snapshot

  if (error || !data || data.length === 0) {
    return DEFAULT_DOMAIN_ROTATION[fallbackSeed % DEFAULT_DOMAIN_ROTATION.length];
  }

  // Take latest response per question_index
  const latest: Record<number, number> = {};
  for (const row of data as Array<{ question_index: number; response: number }>) {
    if (latest[row.question_index] === undefined) latest[row.question_index] = row.response;
  }

  // Aggregate by domain (mean)
  const domainScores: Record<string, { sum: number; n: number }> = {};
  for (const [idxStr, resp] of Object.entries(latest)) {
    const idx = Number(idxStr);
    const dom = QUESTION_DOMAIN_MAP[idx];
    if (!dom) continue;
    if (!domainScores[dom]) domainScores[dom] = { sum: 0, n: 0 };
    domainScores[dom].sum += resp;
    domainScores[dom].n += 1;
  }

  let lowest = '';
  let lowestMean = Infinity;
  for (const [dom, { sum, n }] of Object.entries(domainScores)) {
    if (n === 0) continue;
    const mean = sum / n;
    if (mean < lowestMean) {
      lowestMean = mean;
      lowest = dom;
    }
  }
  return lowest || DEFAULT_DOMAIN_ROTATION[fallbackSeed % DEFAULT_DOMAIN_ROTATION.length];
}

// ── Risk tier ──────────────────────────────────────────────────────

/**
 * Best-effort risk_tier read. Falls back to 'low_concern' when no
 * snapshot exists yet (new users) — that's the most defensible default
 * given mortality/identity templates are gated to low_concern only.
 */
async function readRiskTier(
  supabase: SupabaseClient,
  userId: string,
): Promise<'low_concern' | 'moderate_unease' | 'elevated_disruption'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  // screener_snapshots is referenced from migration 20260514 — assume cols
  // like (member_id, risk_tier, snapshot_date) but tolerate either shape.
  const { data } = await sb
    .from('screener_snapshots')
    .select('risk_tier, member_id, user_id, snapshot_date, created_at')
    .or(`member_id.eq.${userId},user_id.eq.${userId}`)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .maybeSingle();
  const tier = (data?.risk_tier as string | undefined) ?? '';
  if (tier === 'low_concern' || tier === 'moderate_unease' || tier === 'elevated_disruption') {
    return tier;
  }
  return 'low_concern';
}

// ── Public types ───────────────────────────────────────────────────

export interface DailyDeliveryRecipe {
  user_id: string;
  delivery_date: string;
  activity_mode: string;
  template_id: string;
  music_track_id: string | null;
  solfeggio_hz: number[];
  week_of_month: number;
  frequency_tier: 'low' | 'median' | 'high';
  existential_domain_targeted: string;
  risk_tier: 'low_concern' | 'moderate_unease' | 'elevated_disruption';
  cultural_routing: string;
  user_audio_url: string;
  voice_source: 'bianca' | 'user_clone';
  music_url: string;
  target_length_seconds: number;
  status: string;
  delivery_id: string;
}

// ── Main entry ─────────────────────────────────────────────────────

export async function buildDailyDeliveryForUser(
  userId: string,
  deliveryDate: Date = new Date(),
  activityModeOverride?: string,
): Promise<DailyDeliveryRecipe> {
  const supabase = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // 1. Read profile + member tier
  const { data: profile, error: profileErr } = await db
    .from('profiles')
    .select('id, email, timezone, preferred_name')
    .eq('id', userId)
    .single();
  if (profileErr || !profile) throw new Error(`profile ${userId} not found: ${profileErr?.message ?? 'no row'}`);

  const { data: member } = await db
    .from('members')
    .select('tier, status')
    .eq('email', profile.email)
    .maybeSingle();
  const memberTier = (member?.tier as string | undefined) ?? 'collective';
  const tierAccess = TIER_ACCESS_BY_MEMBER_TIER[memberTier] ?? ['collective'];

  // 2. Pick activity_mode (override OR rotate user's active modes)
  let activityMode: string;
  if (activityModeOverride) {
    activityMode = normalizeMode(activityModeOverride);
  } else {
    const { data: modeRows } = await db
      .from('member_activity_modes')
      .select('mode')
      .eq('member_id', userId)
      .eq('active', true);
    const modes: string[] = (modeRows ?? []).map((r: { mode: string }) => normalizeMode(r.mode));
    if (modes.length === 0) {
      const { data: prefs } = await db
        .from('user_preferences')
        .select('activity_modes, genre_preference')
        .eq('user_id', userId)
        .maybeSingle();
      const raw = (prefs?.activity_modes as string[] | undefined) ?? ['morning'];
      modes.push(...raw.map(normalizeMode));
    }
    // Rotate by day-of-year
    const dayOfYear = Math.floor(
      (deliveryDate.getTime() - new Date(deliveryDate.getUTCFullYear(), 0, 0).getTime()) / 86400000,
    );
    activityMode = modes[dayOfYear % modes.length];
  }

  // 3. Read identity anchors (cultural_routing + VCP flags)
  const { data: anchors } = await db
    .from('user_identity_anchors')
    .select('cultural_routing, voice_clone_id, voice_clone_plus_subscriber')
    .eq('user_id', userId)
    .maybeSingle();
  const cultural = (anchors?.cultural_routing as string | undefined) ?? 'default';
  const isVCP = !!anchors?.voice_clone_plus_subscriber && !!anchors?.voice_clone_id;

  // 4. Week-of-month → frequency tier + Solfeggio Hz
  const wk = weekOfMonth(deliveryDate);
  const { tier: frequencyTier, hz: solfeggioHz } = SOLFEGGIO_BY_WEEK[wk];

  // 5. Risk tier (with safe fallback)
  const riskTier = await readRiskTier(supabase, userId);

  // 6. Target domain (lowest-scoring existential domain)
  const fallbackSeed = (deliveryDate.getUTCFullYear() * 31 + deliveryDate.getUTCMonth() * 4 + wk) >>> 0;
  const targetDomain = await pickTargetDomain(supabase, userId, fallbackSeed);

  // 7. Pick template — preferred cultural routing first, fallback to default.
  //    For non-VCP users we MUST have bianca_audio_url set, because Pipeline B
  //    won't be invoked. So we filter on `not is null` for those.
  //
  //    Strategy: try strict (mode + domain + tier + week + cultural), then
  //    loosen by dropping week, then by dropping domain. At each step we
  //    prefer rows that already have bianca_audio_url so the daily mixer
  //    has audio to consume right away.
  const tplCols = 'id, activity_mode, existential_domain, risk_tier, week_of_month, cultural_routing, bianca_audio_url, status, full_template_text, fallback_slot_values, placeholder_slots';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function findTemplate(loosen: 'none' | 'week' | 'domain'): Promise<any> {
    let q = db
      .from('affirmation_template_library')
      .select(tplCols)
      .eq('activity_mode', activityMode)
      .eq('risk_tier', riskTier)
      .in('cultural_routing', [cultural, 'default'])
      .in('status', ['pending_voice', 'voice_rendered']);
    if (loosen === 'none') {
      q = q.eq('existential_domain', targetDomain).eq('week_of_month', wk);
    } else if (loosen === 'week') {
      q = q.eq('existential_domain', targetDomain);
    }
    // Non-VCP users can only use templates with rendered audio.
    if (!isVCP) q = q.not('bianca_audio_url', 'is', null);
    const { data } = await q.limit(16);
    if (!data || data.length === 0) return null;
    // Prefer user's cultural routing, then prefer rendered audio.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sorted = (data as any[]).slice().sort((a, b) => {
      const aCul = a.cultural_routing === cultural ? 0 : 1;
      const bCul = b.cultural_routing === cultural ? 0 : 1;
      if (aCul !== bCul) return aCul - bCul;
      const aRen = a.bianca_audio_url ? 0 : 1;
      const bRen = b.bianca_audio_url ? 0 : 1;
      return aRen - bRen;
    });
    return sorted[0];
  }

  let template = await findTemplate('none');
  if (!template) template = await findTemplate('week');
  if (!template) template = await findTemplate('domain');

  if (!template) {
    throw new Error(`no template available for mode=${activityMode} domain=${targetDomain} tier=${riskTier} week=${wk}${!isVCP ? ' (requires bianca_audio_url for non-VCP)' : ''}`);
  }

  // 8. Resolve audio_url
  //    VCP path: ensure user_personalized_affirmations row exists for this
  //              template + current month; reuse its user_audio_url.
  //    Non-VCP : reuse template.bianca_audio_url (must exist — if it
  //              doesn't, the template hasn't been rendered yet).
  let userAudioUrl: string;
  let voiceSource: 'bianca' | 'user_clone';
  if (isVCP) {
    const { data: vcpRow } = await db
      .from('user_personalized_affirmations')
      .select('user_audio_url, status')
      .eq('user_id', userId)
      .eq('template_id', template.id)
      .eq('generated_for_month', firstOfMonth(deliveryDate))
      .maybeSingle();
    if (vcpRow?.user_audio_url) {
      userAudioUrl = vcpRow.user_audio_url;
      voiceSource = 'user_clone';
    } else if (template.bianca_audio_url) {
      // Fall back to Bianca master while Pipeline B catches up
      userAudioUrl = template.bianca_audio_url;
      voiceSource = 'bianca';
    } else {
      throw new Error(`VCP user ${userId} has no personalized render and template ${template.id} has no bianca_audio_url`);
    }
  } else {
    if (!template.bianca_audio_url) {
      throw new Error(`template ${template.id} has no bianca_audio_url — run Pipeline A first`);
    }
    userAudioUrl = template.bianca_audio_url;
    voiceSource = 'bianca';
  }

  // 9. Pick music track
  const { data: prefs } = await db
    .from('user_preferences')
    .select('genre_preference')
    .eq('user_id', userId)
    .maybeSingle();
  const preferredGenre = (prefs?.genre_preference as string | undefined) ?? null;

  let musicTrack: { id: string; public_url: string; mode: string } | null = null;
  if (preferredGenre) {
    const { data: byGenre } = await db
      .from('ecqo_sound_tracks')
      .select('id, public_url, mode, genre, tier_access')
      .eq('genre', preferredGenre)
      .eq('mode', activityMode)
      .in('tier_access', tierAccess)
      .eq('status', 'active')
      .limit(4);
    musicTrack = (byGenre ?? [])[0] ?? null;
  }
  if (!musicTrack) {
    const { data: anyTrack } = await db
      .from('ecqo_sound_tracks')
      .select('id, public_url, mode, genre, tier_access')
      .eq('mode', activityMode)
      .in('tier_access', tierAccess)
      .eq('status', 'active')
      .limit(8);
    musicTrack = (anyTrack ?? [])[0] ?? null;
  }
  if (!musicTrack) {
    throw new Error(`no music track for mode=${activityMode} tier_access=${tierAccess.join('|')}`);
  }

  // 10. Target length
  const targetLength = MODE_TARGET_LENGTH_SECONDS[activityMode] ?? 15 * 60;

  // 11. Upsert delivery row with status='queued'
  const row = {
    user_id: userId,
    delivery_date: isoDate(deliveryDate),
    activity_mode: activityMode,
    template_id: template.id,
    music_track_id: musicTrack.id,
    solfeggio_hz: solfeggioHz,
    week_of_month: wk,
    frequency_tier: frequencyTier,
    existential_domain_targeted: targetDomain,
    risk_tier: riskTier,
    cultural_routing: cultural,
    user_audio_url: userAudioUrl,
    voice_source: voiceSource,
    music_url: musicTrack.public_url,
    target_length_seconds: targetLength,
    status: 'queued' as const,
    updated_at: new Date().toISOString(),
  };

  const { data: upserted, error: upErr } = await db
    .from('user_daily_deliveries')
    .upsert(row, { onConflict: 'user_id,delivery_date,activity_mode' })
    .select('id')
    .single();
  if (upErr) throw new Error(`upsert delivery: ${upErr.message}`);

  return {
    delivery_id: upserted.id,
    ...row,
  };
}
