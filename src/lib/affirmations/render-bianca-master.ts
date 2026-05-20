/**
 * Pipeline A — Bianca Master Voice render.
 *
 * For a single affirmation_template_library row:
 *   1. Substitute placeholder slots with fallback_slot_values
 *   2. POST to ElevenLabs /v1/text-to-speech/{voiceId} with the locked-in
 *      voice settings for Bianca's clone (XzFFCA8sHgwlJV4VkNtp)
 *   3. Upload the returned mp3 to the public `affirmations-bianca` Storage
 *      bucket at {activity_mode}/{existential_domain}/{risk_tier}/{week}/{id}.mp3
 *   4. Update the template row with bianca_audio_url + status='voice_rendered'
 *
 * Templates with status='flagged_review' are skipped — they're waiting on
 * clinician review (Bianca eye-checks WS1 false-flags during voice recording).
 *
 * One render at a time. The batch route handles concurrency + rate-limit
 * backoff. Keep this primitive simple and testable.
 */

import { createClient } from '@supabase/supabase-js';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const BIANCA_VOICE_ID = 'XzFFCA8sHgwlJV4VkNtp';
const BIANCA_BUCKET = 'affirmations-bianca';

/**
 * Voice settings locked in per B5.2 spec.
 * ElevenLabs expects floats in 0.0-1.0 range for stability/similarity/style.
 * The spec gave percentage-style integers (35, 78, 45) so we divide by 100.
 */
const BIANCA_VOICE_SETTINGS = {
  stability: 0.35,
  similarity_boost: 0.78,
  style: 0.45,
  use_speaker_boost: true,
  speed: 0.88,
};

interface TemplateRow {
  id: string;
  activity_mode: string;
  existential_domain: string;
  risk_tier: string;
  week_of_month: number;
  full_template_text: string;
  fallback_slot_values: Record<string, string>;
  placeholder_slots: string[];
  status: string;
  bianca_audio_url: string | null;
}

export interface BiancaRenderResult {
  template_id: string;
  audio_url: string;
  storage_path: string;
  bytes: number;
  duration_estimate_seconds: number | null;
  skipped?: boolean;
  reason?: string;
}

/**
 * Substitute {placeholder_slot} occurrences in template text with the
 * given values. Slots not present in `values` are left as the literal
 * {slot_name} text — but in Pipeline A the caller passes
 * fallback_slot_values which covers every slot the template uses.
 */
export function substitutePlaceholders(
  text: string,
  values: Record<string, string>,
): string {
  return text.replace(/\{([a-z_0-9]+)\}/gi, (_, key: string) => {
    const v = values[key];
    return v === undefined || v === null ? `{${key}}` : v;
  });
}

function getSupabase() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service-role env not configured');
  return createClient(url, key);
}

async function fetchTemplate(templateId: string): Promise<TemplateRow> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('affirmation_template_library')
    .select('id, activity_mode, existential_domain, risk_tier, week_of_month, full_template_text, fallback_slot_values, placeholder_slots, status, bianca_audio_url')
    .eq('id', templateId)
    .single();
  if (error) throw new Error(`fetchTemplate ${templateId}: ${error.message}`);
  return data as TemplateRow;
}

async function elevenLabsTTS(text: string): Promise<ArrayBuffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY not configured');

  const res = await fetch(`${ELEVENLABS_API_URL}/${BIANCA_VOICE_ID}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: BIANCA_VOICE_SETTINGS,
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
 * Main entry point. Pipeline A primitive — one template.
 */
export async function renderTemplateInBiancaVoice(
  templateId: string,
): Promise<BiancaRenderResult> {
  const supabase = getSupabase();
  const tpl = await fetchTemplate(templateId);

  if (tpl.bianca_audio_url) {
    return {
      template_id: tpl.id,
      audio_url: tpl.bianca_audio_url,
      storage_path: '',
      bytes: 0,
      duration_estimate_seconds: null,
      skipped: true,
      reason: 'already_rendered',
    };
  }

  if (tpl.status === 'flagged_review') {
    return {
      template_id: tpl.id,
      audio_url: '',
      storage_path: '',
      bytes: 0,
      duration_estimate_seconds: null,
      skipped: true,
      reason: 'flagged_for_clinician_review',
    };
  }

  // 1. Substitute placeholders with fallback values
  const rendered = substitutePlaceholders(
    tpl.full_template_text,
    tpl.fallback_slot_values || {},
  );

  // 2. ElevenLabs TTS
  const audioBuf = await elevenLabsTTS(rendered);
  const audioBytes = audioBuf.byteLength;

  // 3. Upload to public bucket. Path: {mode}/{domain}/{tier}/week-{N}/{id}.mp3
  const storagePath =
    `${tpl.activity_mode}/${tpl.existential_domain}/${tpl.risk_tier}/week-${tpl.week_of_month}/${tpl.id}.mp3`;

  const { error: upErr } = await supabase.storage
    .from(BIANCA_BUCKET)
    .upload(storagePath, audioBuf, {
      contentType: 'audio/mpeg',
      cacheControl: 'public, max-age=31536000, immutable',
      upsert: true,
    });
  if (upErr) throw new Error(`storage upload ${tpl.id}: ${upErr.message}`);

  const { data: pub } = supabase.storage.from(BIANCA_BUCKET).getPublicUrl(storagePath);
  const audio_url = pub.publicUrl;

  // 4. Update template row
  const { error: updErr } = await supabase
    .from('affirmation_template_library')
    .update({
      bianca_audio_url: audio_url,
      status: 'voice_rendered',
      updated_at: new Date().toISOString(),
    })
    .eq('id', tpl.id);
  if (updErr) throw new Error(`template update ${tpl.id}: ${updErr.message}`);

  return {
    template_id: tpl.id,
    audio_url,
    storage_path: storagePath,
    bytes: audioBytes,
    duration_estimate_seconds: null,
  };
}
