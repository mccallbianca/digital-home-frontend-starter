/**
 * POST /api/affirmations/generate
 *
 * Generates a personalized HERR affirmation script via Claude API,
 * converts to MP3 via ElevenLabs, stores in Supabase Storage (PRIVATE bucket),
 * returns a 24-hour signed URL for clinical-grade audio delivery.
 *
 * ECQO SAFE SOURCE CODE — Clinical Privacy Standard:
 * The voice-samples bucket is PRIVATE. Audio access is granted via
 * time-limited signed URLs (24h expiry) compliant with HIPAA, EU AI Act,
 * and SAMHSA best practices for behavioral health data.
 *
 * Body: { userId: string, activityMode: string }
 * Returns: { scriptId, script, audioUrl, activityMode }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logAgentInteraction } from '@/lib/security/audit-log';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_DEFAULT_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'; // Adam fallback

// Signed URL expiry — 24 hours in seconds. Cron regenerates daily.
const SIGNED_URL_EXPIRY_SECONDS = 60 * 60 * 24;

const MODE_CONTEXT: Record<string, string> = {
  'workout':     'The member is about to train. Focus on physical power, discipline, and embodied strength. Use energizing, commanding cadence.',
  'driving':     'The member is in their car. Focus on direction, control, and intentional movement. Calm authority.',
  'sleep':       'The member is preparing for sleep. Use slow, soothing cadence. Focus on safety, release, and subconscious receptivity.',
  'morning':     'The member is starting their day. Focus on clarity, fresh identity, and the power of first declarations.',
  'deep-work':   'The member is entering focused creative or intellectual work. Focus on mastery, concentration, and protected output.',
  'love-family': 'The member is connecting with loved ones. Focus on emotional presence, secure attachment, and heart-centered identity.',
  'abundance':   'The member is cultivating wealth and career alignment. Focus on worthiness, receiving, and financial identity.',
  'healing':     'The member is in a healing or recovery process. Focus on grace, patience, and becoming. Gentle, compassionate tone.',
};

function buildSystemPrompt(mode: string, sc
cd ~/Desktop/digital-home/digital-home-frontend-starter && cat > src/app/api/affirmations/generate/route.ts << 'EOF'
/**
 * POST /api/affirmations/generate
 *
 * Generates a personalized HERR affirmation script via Claude API,
 * converts to MP3 via ElevenLabs, stores in Supabase Storage (PRIVATE bucket),
 * returns a 24-hour signed URL for clinical-grade audio delivery.
 *
 * ECQO SAFE SOURCE CODE — Clinical Privacy Standard:
 * The voice-samples bucket is PRIVATE. Audio access is granted via
 * time-limited signed URLs (24h expiry) compliant with HIPAA, EU AI Act,
 * and SAMHSA best practices for behavioral health data.
 *
 * Body: { userId: string, activityMode: string }
 * Returns: { scriptId, script, audioUrl, activityMode }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logAgentInteraction } from '@/lib/security/audit-log';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_DEFAULT_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'; // Adam fallback

// Signed URL expiry — 24 hours in seconds. Cron regenerates daily.
const SIGNED_URL_EXPIRY_SECONDS = 60 * 60 * 24;

const MODE_CONTEXT: Record<string, string> = {
  'workout':     'The member is about to train. Focus on physical power, discipline, and embodied strength. Use energizing, commanding cadence.',
  'driving':     'The member is in their car. Focus on direction, control, and intentional movement. Calm authority.',
  'sleep':       'The member is preparing for sleep. Use slow, soothing cadence. Focus on safety, release, and subconscious receptivity.',
  'morning':     'The member is starting their day. Focus on clarity, fresh identity, and the power of first declarations.',
  'deep-work':   'The member is entering focused creative or intellectual work. Focus on mastery, concentration, and protected output.',
  'love-family': 'The member is connecting with loved ones. Focus on emotional presence, secure attachment, and heart-centered identity.',
  'abundance':   'The member is cultivating wealth and career alignment. Focus on worthiness, receiving, and financial identity.',
  'healing':     'The member is in a healing or recovery process. Focus on grace, patience, and becoming. Gentle, compassionate tone.',
};

function buildSystemPrompt(mode: string, screenerData: string): string {
  const modeCtx = MODE_CONTEXT[mode] || MODE_CONTEXT['morning'];
  return `You are HERR — Human Existential Response and Reprogramming. You generate personalized affirmation scripts.

HERR PROTOCOL — TWO PHASES:

PHASE 1 — REGULATE (Second person, somatic):
Write 3-4 sentences addressing the listener directly ("you"). Use nervous system calming language:
- Somatic awareness cues (breath, body, ground)
- Present-moment anchoring
- Permission to arrive as they are

PHASE 2 — REPROGRAM (First person, identity-level I AM declarations):
Write 8-12 I AM declarations. Each must be:
- First person, present tense
- Identity-level (who I AM, not what I do)
- Specific to the activity mode and the member's existential profile
- Emotionally resonant, not generic

ACTIVITY MODE: ${mode}
${modeCtx}

MEMBER EXISTENTIAL PROFILE:
${screenerData}

OUTPUT FORMAT:
Return the script as plain text. Start with the Regulate section, then a blank line, then the Reprogram section. No headers, no labels, no markdown. Just the script text that will be spoken aloud.`;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, activityMode } = await req.json();
    if (!userId || !activityMode) {
      return NextResponse.json({ error: 'userId and activityMode required' }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Fetch member's screener responses
    const { data: responses } = await supabase
      .from('existential_responses')
      .select('question_index, response')
      .eq('user_id', userId)
      .order('question_index');

    const screenerData = responses && responses.length > 0
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? responses.map((r: any) => `Q${r.question_index + 1}: ${r.response}/5`).join(', ')
      : 'No screener data available — use general existential wellness framing.';

    // Fetch member's profile for personalization
    const { data: profile } = await supabase
      .from('profiles')
      .select('preferred_name, first_name')
      .eq('id', userId)
      .single();

    const memberName = profile?.preferred_name || profile?.first_name || '';
    const nameContext = memberName ? `\nMember's name: ${memberName}. You may use it once in the Regulate section.` : '';

    // Generate script via Claude API
    const claudeStartTime = Date.now();
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Generate a HERR affirmation script for the ${activityMode} activity mode.${nameContext}`,
        }],
        system: buildSystemPrompt(activityMode, screenerData),
      }),
    });

    if (!claudeRes.ok) {
      const err = await claudeRes.text();
      console.error('[affirmations/generate] Claude error:', err);
      return NextResponse.json({ error: 'Script generation failed' }, { status: 500 });
    }

    const claudeData = await claudeRes.json();
    const script = claudeData.content?.[0]?.text || '';
    const claudeDuration = Date.now() - claudeStartTime;

    // ── AI Audit Log (EU AI Act / America's AI Action Plan) ──
    await logAgentInteraction({
      memberId: userId,
      model: 'claude-sonnet-4-20250514',
      promptText: `Generate affirmation script for ${activityMode} mode`,
      outputText: script,
      mode: 'affirmation',
      durationMs: claudeDuration,
    });

    if (!script) {
      return NextResponse.json({ error: 'Empty script returned' }, { status: 500 });
    }

    // Insert script into database
    const { data: scriptRow, error: insertErr } = await supabase
      .from('affirmation_scripts')
      .insert({
        member_id: userId,
        script,
        activity_mode: activityMode,
        delivered: true,
      })
      .select('id')
      .single();

    if (insertErr) {
      console.error('[affirmations/generate] DB insert error:', insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    // Generate audio via ElevenLabs (if API key is configured)
    let audioUrl: string | null = null;

    if (ELEVENLABS_API_KEY) {
      // Check if member has a cloned voice
      const { data: voiceConsent } = await supabase
        .from('voice_consents')
        .select('voice_clone_id')
        .eq('user_id', userId)
        .single();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const voiceId = (voiceConsent as any)?.voice_clone_id || DEFAULT_VOICE_ID;

      try {
        const ttsRes = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
          {
            method: 'POST',
            headers: {
              'xi-api-key': ELEVENLABS_API_KEY,
              'Content-Type': 'application/json',
              'Accept': 'audio/mpeg',
            },
            body: JSON.stringify({
              text: script,
              model_id: 'eleven_multilingual_v2',
              voice_settings: {
                stability: 0.6,
                similarity_boost: 0.8,
                style: 0.3,
              },
            }),
          }
        );

        if (ttsRes.ok) {
          const audioBuffer = await ttsRes.arrayBuffer();
          const fileName = `affirmations/${userId}/${scriptRow.id}.mp3`;

          // Upload to Supabase Storage (PRIVATE bucket)
          const { error: uploadErr } = await supabase.storage
            .from('voice-samples')
            .upload(fileName, audioBuffer, {
              contentType: 'audio/mpeg',
              upsert: true,
            });

          if (!uploadErr) {
            // ── ECQO SAFE SOURCE CODE: Clinical-grade signed URL ──
            // Bucket is PRIVATE. Generate time-limited signed URL (24h)
            // for HIPAA / EU AI Act / SAMHSA compliance.
            const { data: signedUrlData, error: signErr } = await supabase.storage
              .from('voice-samples')
              .createSignedUrl(fileName, SIGNED_URL_EXPIRY_SECONDS);

            if (!signErr && signedUrlData?.signedUrl) {
              audioUrl = signedUrlData.signedUrl;
            } else {
              console.error('[affirmations/generate] Signed URL error:', signErr);
            }
          }
        }
      } catch (audioErr) {
        console.error('[affirmations/generate] ElevenLabs error:', audioErr);
        // Non-fatal — script is still saved
      }
    }

    // Update script with audio URL (signed, 24h expiry)
    if (audioUrl) {
      await supabase
        .from('affirmation_scripts')
        .update({ audio_url: audioUrl })
        .eq('id', scriptRow.id);
    }

    return NextResponse.json({
      scriptId: scriptRow.id,
      script,
      audioUrl,
      activityMode,
    });

  } catch (err) {
    console.error('[affirmations/generate] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
