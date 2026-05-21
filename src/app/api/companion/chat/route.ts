/**
 * POST /api/companion/chat
 *
 * ECQO Conversational AI Companion — text-mode MVP.
 *
 *   Body:    { message: string, conversation_id?: string }
 *   Returns: {
 *     response,            // assistant text
 *     conversation_id,     // pass back next turn
 *     safety_flag,         // true if WS3 fired
 *     safety_severity,     // green | yellow | red
 *     turn_id              // companion_messages.id of the assistant turn
 *   }
 *
 * Pipeline (per WS1/3/4/6):
 *   1. Auth → resolve user.
 *   2. Sanitize incoming message.
 *   3. WS3 safety screen — if Tier 1/2 fires, return crisis response
 *      verbatim, write user+assistant rows with safety_severity='red',
 *      DO NOT call Claude.
 *   4. Load user_identity_anchors (read-only) for the prompt.
 *   5. Load last 10 companion_messages for this user as conversation context.
 *   6. Load most recent risk_assessment for the prompt.
 *   7. Substitute the COMPANION_SYSTEM_PROMPT tokens.
 *   8. Call Anthropic Claude (claude-sonnet-4-20250514) with system +
 *      assembled history + new user message.
 *   9. Persist user + assistant turns to companion_messages.
 *  10. Log to agent_logs (mode='companion').
 *
 * Reuses safety-screening + audit-log + sanitize libs that already
 * power /api/onboarding/chat.
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { randomUUID } from 'node:crypto';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { sanitizeInput } from '@/lib/security/sanitize';
import { logAgentInteraction } from '@/lib/security/audit-log';
import { COMPANION_SYSTEM_PROMPT } from '@/lib/ecqo/system-prompts';
import { checkSafetySignals } from '@/lib/ecqo/safety-screening';

const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
const MAX_HISTORY_TURNS = 10;
const MAX_OUTPUT_TOKENS = 600;

let _anthropic: Anthropic | null = null;
function getAnthropic(): Anthropic {
  if (_anthropic) return _anthropic;
  const apiKey = process.env.ANTHROPIC_API_KEY ?? '';
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');
  _anthropic = new Anthropic({ apiKey });
  return _anthropic;
}

// ── helpers ─────────────────────────────────────────────────────────

type IdentityAnchorsRow = {
  self_word_1: string | null;
  self_word_2: string | null;
  self_word_3: string | null;
  core_value_1: string | null;
  core_value_2: string | null;
  defining_achievement_description: string | null;
  defining_achievement_language: string | null;
  aspirational_phrase: string | null;
  relational_identity: string | null;
};

function formatAnchorsForPrompt(anchors: IdentityAnchorsRow | null, preferredName: string | null): string {
  if (!anchors) {
    return JSON.stringify({
      preferred_name: preferredName,
      note: 'No Phase 3 anchors captured yet. Greet warmly by name (if available), ask one open question about what they care about today, and let them lead.',
    }, null, 2);
  }
  return JSON.stringify({
    preferred_name: preferredName,
    self_words: [anchors.self_word_1, anchors.self_word_2, anchors.self_word_3].filter(Boolean),
    core_values: [anchors.core_value_1, anchors.core_value_2].filter(Boolean),
    defining_achievement: anchors.defining_achievement_description ?? null,
    defining_achievement_language: anchors.defining_achievement_language ?? null,
    aspirational_phrase: anchors.aspirational_phrase ?? null,
    relational_identity: anchors.relational_identity ?? null,
  }, null, 2);
}

function severityForTier(tier: 'TIER_1' | 'TIER_2' | 'TIER_3' | null): 'green' | 'yellow' | 'red' {
  if (tier === 'TIER_1') return 'red';
  if (tier === 'TIER_2') return 'red';
  if (tier === 'TIER_3') return 'yellow';
  return 'green';
}

// ── route ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const rawMessage = typeof body.message === 'string' ? body.message : '';
  const conversationIdInput = typeof body.conversation_id === 'string' ? body.conversation_id : null;

  if (!rawMessage.trim()) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }

  // Sanitize. The shared sanitizer also blocks obvious prompt-injection
  // tokens and oversize payloads.
  const sanitized = sanitizeInput(rawMessage, 4000);
  if (sanitized.blocked) {
    return NextResponse.json({ error: 'Message contained content we could not process. Try rephrasing.' }, { status: 400 });
  }
  const cleanMessage = sanitized.clean;

  // Generate or reuse conversation id.
  const conversationId = conversationIdInput && /^[0-9a-f-]{36}$/i.test(conversationIdInput)
    ? conversationIdInput
    : randomUUID();

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  // ── Profile + anchors (read-only)
  const { data: profile } = await db
    .from('profiles')
    .select('preferred_name, first_name')
    .eq('id', user.id)
    .maybeSingle();
  const preferredName: string | null = profile?.preferred_name || profile?.first_name || null;

  const { data: anchorRow } = await db
    .from('user_identity_anchors')
    .select('self_word_1, self_word_2, self_word_3, core_value_1, core_value_2, defining_achievement_description, defining_achievement_language, aspirational_phrase, relational_identity')
    .eq('user_id', user.id)
    .maybeSingle();

  // ── WS3 safety screen on the raw user message — BEFORE any LLM call.
  // The phase arg is unused inside checkSafetySignals (prefixed _) but the
  // signature still typechecks against OnboardingPhase; pass PHASE_4_SAFETY
  // since this is post-onboarding free-form chat.
  const safety = checkSafetySignals(cleanMessage, 'PHASE_4_SAFETY', undefined);
  if (safety.triggered && safety.shouldPauseOnboarding) {
    const severity = severityForTier(safety.severity);
    // Persist both turns so the conversation thread shows the crisis hand-off.
    await db.from('companion_messages').insert([
      {
        user_id: user.id,
        conversation_id: conversationId,
        role: 'user',
        content: cleanMessage,
        safety_flag: true,
        safety_severity: severity,
        risk_domains: safety.triggerType ? [safety.triggerType] : null,
        arai_phase: null,
      },
      {
        user_id: user.id,
        conversation_id: conversationId,
        role: 'assistant',
        content: safety.safetyResponse ?? '',
        safety_flag: true,
        safety_severity: severity,
        risk_domains: safety.triggerType ? [safety.triggerType] : null,
        arai_phase: 'full',
      },
    ]);
    return NextResponse.json({
      response: safety.safetyResponse,
      conversation_id: conversationId,
      safety_flag: true,
      safety_severity: severity,
      risk_domains: safety.triggerType ? [safety.triggerType] : [],
      safety_handoff: true,
    });
  }

  // ── Risk tier + lowest domain (best-effort)
  const { data: riskRow } = await db
    .from('risk_assessments')
    .select('risk_tier, lowest_domain')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const riskTier: string = riskRow?.risk_tier ?? 'UNKNOWN';
  const lowestDomain: string = riskRow?.lowest_domain ?? 'unknown';

  // ── Conversation history (last N turns, both roles)
  const { data: historyRows } = await db
    .from('companion_messages')
    .select('role, content, created_at')
    .eq('user_id', user.id)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(MAX_HISTORY_TURNS);
  type HistRow = { role: 'user' | 'assistant' | 'system'; content: string; created_at: string };
  const history = ((historyRows ?? []) as HistRow[]).slice().reverse(); // chronological for the model

  const historyForPrompt = history.length === 0
    ? '(none yet — this is the first turn of this conversation)'
    : history.map((m, i) => `[${i + 1}] ${m.role}: ${m.content}`).join('\n');

  // ── Assemble the system prompt
  const systemPrompt = COMPANION_SYSTEM_PROMPT
    .replace('{IDENTITY_ANCHORS_JSON}', formatAnchorsForPrompt(anchorRow as IdentityAnchorsRow | null, preferredName))
    .replace('{CONVERSATION_HISTORY}', historyForPrompt)
    .replace('{RISK_TIER}', riskTier)
    .replace('{LOWEST_DOMAIN}', lowestDomain);

  // Build the Anthropic messages array — full chronological history + new user turn.
  const messages = history.map((m) => ({
    role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
    content: m.content,
  }));
  messages.push({ role: 'user' as const, content: cleanMessage });

  // ── Call Claude
  const startMs = Date.now();
  let assistantText = '';
  let inputTokens: number | undefined;
  let outputTokens: number | undefined;
  try {
    const completion = await getAnthropic().messages.create({
      model: CLAUDE_MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: systemPrompt,
      messages,
    });
    for (const block of completion.content) {
      if (block.type === 'text') assistantText += block.text;
    }
    inputTokens = completion.usage?.input_tokens;
    outputTokens = completion.usage?.output_tokens;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logAgentInteraction({
      memberId: user.id,
      model: CLAUDE_MODEL,
      mode: 'companion',
      promptText: systemPrompt + '\n\n' + cleanMessage,
      outputText: `ERROR: ${msg}`,
      riskTier: riskTier,
      safetyFlag: false,
      durationMs: Date.now() - startMs,
    }).catch(() => {});
    return NextResponse.json({ error: 'Companion is having trouble responding right now. Try again in a moment.' }, { status: 502 });
  }
  const durationMs = Date.now() - startMs;
  assistantText = assistantText.trim();

  // ── Persist user + assistant turns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: inserted } = await (db as any)
    .from('companion_messages')
    .insert([
      {
        user_id: user.id,
        conversation_id: conversationId,
        role: 'user',
        content: cleanMessage,
        safety_flag: false,
        safety_severity: 'green',
        tokens_in: inputTokens ?? null,
        tokens_out: 0,
      },
      {
        user_id: user.id,
        conversation_id: conversationId,
        role: 'assistant',
        content: assistantText,
        safety_flag: false,
        safety_severity: 'green',
        arai_phase: 'full',
        tokens_in: 0,
        tokens_out: outputTokens ?? null,
      },
    ])
    .select('id, role');
  type InsertedRow = { id: string; role: string };
  const assistantTurnId = ((inserted ?? []) as InsertedRow[]).find((r) => r.role === 'assistant')?.id ?? null;

  // ── Audit log
  await logAgentInteraction({
    memberId: user.id,
    model: CLAUDE_MODEL,
    mode: 'companion',
    promptText: systemPrompt + '\n\n' + cleanMessage,
    outputText: assistantText,
    riskTier: riskTier === 'UNKNOWN' ? undefined : riskTier,
    safetyFlag: false,
    durationMs,
  }).catch(() => {});

  return NextResponse.json({
    response: assistantText,
    conversation_id: conversationId,
    safety_flag: false,
    safety_severity: 'green',
    turn_id: assistantTurnId,
    tokens: { in: inputTokens, out: outputTokens },
  });
}
