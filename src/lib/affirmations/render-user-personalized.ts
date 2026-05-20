/**
 * Pipeline B — Per-user personalized affirmation render.
 *
 * For a single (user, template) pair:
 *   1. Read user_identity_anchors for the user
 *   2. Substitute template placeholders with the user's actual slot values
 *      (fallback_slot_values from the template fills any missing slots)
 *   3. Decide voice source:
 *        - VCP subscriber + voice_clone_id present → user_clone (ElevenLabs
 *          with the user's voice_clone_id)
 *        - otherwise → bianca (use the existing bianca_audio_url from the
 *          template; no new render needed)
 *   4. For user_clone renders: upload to PRIVATE `voice-samples` bucket at
 *      affirmations-user/{user_id}/{template_id}.mp3 and serve via 24h
 *      signed URL per HIPAA / SAMHSA / EU AI Act privacy guidance.
 *   5. Upsert into user_personalized_affirmations (unique on
 *      user_id + template_id + generated_for_month).
 */

import { createClient } from '@supabase/supabase-js';
import { substitutePlaceholders } from './render-bianca-master';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const USER_AUDIO_BUCKET = 'voice-samples';   // existing PRIVATE bucket
const SIGNED_URL_EXPIRY_SECONDS = 60 * 60 * 24;

interface TemplateRow {
  id: string;
  full_template_text: string;
  fallback_slot_values: Record<string, string>;
  placeholder_slots: string[];
  bianca_audio_url: string | null;
  status: string;
}

interface IdentityAnchors {
  user_id: string;
  self_word_1: string | null;
  self_word_2: string | null;
  self_word_3: string | null;
  core_value_1: string | null;
  core_value_2: string | null;
  defining_achievement_description: string | null;
  defining_achievement_language: string | null;
  aspirational_phrase: string | null;
  relational_identity: string | null;
  voice_clone_id: string | null;
  voice_clone_plus_subscriber: boolean;
}

export interface UserRenderResult {
  user_id: string;
  template_id: string;
  rendered_script_text: string;
  user_audio_url: string;
  voice_source: 'bianca' | 'user_clone';
  generated_for_month: string;
  status: 'rendered' | 'pending_render' | 'failed';
}

function getSupabase() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service-role env not configured');
  return createClient(url, key);
}

function currentMonthDate(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

async function userClonedTTS(text: string, voiceCloneId: string): Promise<ArrayBuffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY not configured');

  // Looser stability for cloned voices — the user's own clone benefits from
  // some natural variation. similarity stays high to keep the clone fidelity.
  const res = await fetch(`${ELEVENLABS_API_URL}/${voiceCloneId}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.45,
        similarity_boost: 0.85,
        style: 0.30,
        use_speaker_boost: true,
        speed: 0.90,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(`ElevenLabs ${res.status}: ${body.slice(0, 300)}`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return await res.arrayBuffer();
}

/**
 * Build a substitution map from the user's anchors. Missing values fall back
 * to the template's fallback_slot_values.
 */
function buildSubstitutionMap(
  anchors: IdentityAnchors | null,
  templateFallbacks: Record<string, string>,
): Record<string, string> {
  const sub: Record<string, string> = { ...templateFallbacks };
  if (!anchors) return sub;
  const map: Record<string, string | null> = {
    self_word_1: anchors.self_word_1,
    self_word_2: anchors.self_word_2,
    self_word_3: anchors.self_word_3,
    core_value_1: anchors.core_value_1,
    core_value_2: anchors.core_value_2,
    defining_achievement_language: anchors.defining_achievement_language,
    aspirational_phrase: anchors.aspirational_phrase,
    relational_identity: anchors.relational_identity,
  };
  for (const [k, v] of Object.entries(map)) {
    if (v != null && v.trim().length > 0) sub[k] = v;
  }
  return sub;
}

/**
 * Main entry point. Pipeline B primitive — one (user, template) pair.
 */
export async function renderUserAffirmation(
  userId: string,
  templateId: string,
): Promise<UserRenderResult> {
  const supabase = getSupabase();

  // Fetch template
  const { data: tpl, error: tplErr } = await supabase
    .from('affirmation_template_library')
    .select('id, full_template_text, fallback_slot_values, placeholder_slots, bianca_audio_url, status')
    .eq('id', templateId)
    .single();
  if (tplErr || !tpl) throw new Error(`template ${templateId} not found: ${tplErr?.message ?? 'no row'}`);
  const template = tpl as TemplateRow;

  if (template.status === 'flagged_review') {
    throw new Error(`template ${templateId} is flagged_review — clinician must clear before rendering for users`);
  }

  // Fetch user anchors
  const { data: anchorRow, error: anchorErr } = await supabase
    .from('user_identity_anchors')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (anchorErr) throw new Error(`anchors fetch ${userId}: ${anchorErr.message}`);
  const anchors = anchorRow as IdentityAnchors | null;

  // Substitute placeholders
  const subMap = buildSubstitutionMap(anchors, template.fallback_slot_values || {});
  const renderedText = substitutePlaceholders(template.full_template_text, subMap);

  const month = currentMonthDate();
  const isVCP = !!anchors?.voice_clone_plus_subscriber && !!anchors?.voice_clone_id;
  const voiceSource: 'bianca' | 'user_clone' = isVCP ? 'user_clone' : 'bianca';

  let audioUrl = '';
  let audioStoragePath: string | null = null;

  if (voiceSource === 'bianca') {
    // Non-VCP users get the Bianca master render that's already in
    // affirmations-bianca. No new ElevenLabs call needed.
    if (!template.bianca_audio_url) {
      throw new Error(`template ${templateId} has no bianca_audio_url yet — run Pipeline A first`);
    }
    audioUrl = template.bianca_audio_url;
  } else {
    // VCP — render with user's cloned voice and store privately.
    if (!anchors?.voice_clone_id) {
      throw new Error(`user ${userId} marked VCP but voice_clone_id is missing`);
    }
    const audio = await userClonedTTS(renderedText, anchors.voice_clone_id);
    audioStoragePath = `affirmations-user/${userId}/${template.id}.mp3`;

    const { error: upErr } = await supabase.storage
      .from(USER_AUDIO_BUCKET)
      .upload(audioStoragePath, audio, {
        contentType: 'audio/mpeg',
        cacheControl: 'private, max-age=3600',
        upsert: true,
      });
    if (upErr) throw new Error(`storage upload ${userId}/${template.id}: ${upErr.message}`);

    const { data: signed, error: signErr } = await supabase.storage
      .from(USER_AUDIO_BUCKET)
      .createSignedUrl(audioStoragePath, SIGNED_URL_EXPIRY_SECONDS);
    if (signErr || !signed) throw new Error(`signed url ${userId}/${template.id}: ${signErr?.message ?? 'no url'}`);
    audioUrl = signed.signedUrl;
  }

  // Upsert into user_personalized_affirmations.
  // ON CONFLICT (user_id, template_id, generated_for_month) → update audio + status.
  const upsertRow = {
    user_id: userId,
    template_id: template.id,
    rendered_script_text: renderedText,
    substituted_slots: subMap,
    user_audio_url: audioUrl,
    audio_storage_path: audioStoragePath,
    voice_source: voiceSource,
    voice_id: voiceSource === 'user_clone' ? anchors?.voice_clone_id ?? null : 'XzFFCA8sHgwlJV4VkNtp',
    status: 'rendered' as const,
    generated_for_month: month,
    rendered_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error: insErr } = await supabase
    .from('user_personalized_affirmations')
    .upsert(upsertRow, { onConflict: 'user_id,template_id,generated_for_month' });
  if (insErr) throw new Error(`upsert personalized ${userId}/${template.id}: ${insErr.message}`);

  return {
    user_id: userId,
    template_id: template.id,
    rendered_script_text: renderedText,
    user_audio_url: audioUrl,
    voice_source: voiceSource,
    generated_for_month: month,
    status: 'rendered',
  };
}
