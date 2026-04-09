/**
 * POST /api/onboarding/chat
 * ============================
 * The brain of the ECQO clinical onboarding system.
 *
 * Accepts: { phase, questionIndex, userMessage, conversationHistory, userId, userName }
 * Returns: { aiMessage, phase, questionIndex, scores?, safetyFlag?, completed?, modes?, identityAnchors? }
 *
 * This route:
 *   1. Checks safety signals in the user's message (Phase 4 overlay)
 *   2. Sends conversation to Claude with phase-specific system prompt
 *   3. Extracts scores from Claude's analysis (Phase 1)
 *   4. Stores responses in Supabase
 *   5. Notifies moderator on safety triggers (via Resend)
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createAdminClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { sanitizeInput } from '@/lib/security/sanitize';
import { logAgentInteraction } from '@/lib/security/audit-log';
import {
  PHASE_1_SYSTEM_PROMPT,
  PHASE_2_SYSTEM_PROMPT,
  PHASE_3_SYSTEM_PROMPT,
  SAFETY_RESPONSE_SUICIDAL,
  SAFETY_RESPONSE_HARM,
  SAFETY_RESPONSE_ABUSE,
  SAFETY_RESPONSE_DISSOCIATIVE,
  SAFETY_RESPONSE_TRAUMA_FLOODING,
  SAFETY_RESPONSE_SUBSTANCE,
} from '@/lib/ecqo/system-prompts';
import {
  checkSafetySignals,
  checkElevatedDisruption,
  SAFETY_ANALYSIS_PROMPT,
  type SafetyCheckResult,
} from '@/lib/ecqo/safety-screening';
import {
  SCORE_EXTRACTION_PROMPT,
  QUESTION_INSTRUMENT_MAP,
  calculateECQORiskIndex,
  parseScoreExtraction,
  extractPerturbationScore,
  type QuestionScores,
} from '@/lib/ecqo/scoring';
import {
  getModeratorEmail,
  assignRiskTier,
  type OnboardingPhase,
} from '@/lib/ecqo-config';

// ── Initialize clients (lazy to ensure env vars are loaded) ─
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';

function getAnthropic() {
  return new Anthropic({
    apiKey: ANTHROPIC_KEY,
  });
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

// ── Types ───────────────────────────────────────────────────
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  phase: OnboardingPhase;
  questionIndex: number;
  userMessage: string;
  conversationHistory: ChatMessage[];
  userId: string;
  userName?: string;
  questionScores?: QuestionScores[];   // accumulated Phase 1 scores
}

interface SafetyAnalysis {
  suicidal_ideation: boolean;
  homicidal_ideation: boolean;
  abuse_indicators: boolean;
  dissociative_features: boolean;
  trauma_flooding: boolean;
  substance_indicators: boolean;
  distress_level: string;
  communication_style: string;
}

// ── Main Handler ────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const {
      phase,
      questionIndex,
      userMessage,
      conversationHistory,
      userId,
      userName,
      questionScores: prevScores,
    } = body;

    if (!userId || !phase) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, phase' },
        { status: 400 }
      );
    }

    // ── Step 0: Sanitize user input (Layer 1) ──────────────
    const sanitized = sanitizeInput(userMessage, 5000);
    if (sanitized.blocked) {
      return NextResponse.json(
        { error: 'Something in your message couldn\'t be processed. Please try rephrasing.' },
        { status: 400 }
      );
    }
    const cleanUserMessage = sanitized.clean || userMessage;

    // ── Step 1: Pattern-based safety check ──────────────────
    // Check for perturbation score from Q6
    let perturbationScore: number | undefined;
    if (phase === 'PHASE_1_BASELINE' && questionIndex === 5) {
      const extracted = extractPerturbationScore(cleanUserMessage);
      if (extracted !== null) {
        perturbationScore = extracted;
      }
    }

    const safetyCheck = checkSafetySignals(cleanUserMessage, phase, perturbationScore);

    if (safetyCheck.triggered && safetyCheck.shouldPauseOnboarding) {
      // Log safety flag + notify moderator + return safety response
      await handleSafetyTrigger(safetyCheck, userId, phase, questionIndex, userMessage);

      return NextResponse.json({
        aiMessage: safetyCheck.safetyResponse,
        phase,
        questionIndex,
        safetyFlag: {
          type: safetyCheck.triggerType,
          severity: safetyCheck.severity,
          shouldPauseOnboarding: true,
        },
      });
    }

    // ── Step 2: Get system prompt for current phase ─────────
    const systemPrompt = getSystemPrompt(phase, userName);

    // ── Step 3: Build conversation for Claude ───────────────
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    // Add conversation history
    for (const msg of conversationHistory) {
      // Strip safety analysis tags from assistant messages before sending back
      const cleanContent = msg.role === 'assistant'
        ? msg.content.replace(/<safety_analysis>[\s\S]*?<\/safety_analysis>/g, '').trim()
        : msg.content;
      messages.push({ role: msg.role, content: cleanContent });
    }

    // Add current user message
    if (cleanUserMessage) {
      messages.push({ role: 'user', content: cleanUserMessage });
    }

    // ── Step 4: Call Claude for conversational response ─────
    const startTime = Date.now();
    const response = await getAnthropic().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt + '\n\n' + SAFETY_ANALYSIS_PROMPT,
      messages: messages.length > 0 ? messages : [{ role: 'user', content: 'Hello, I\'m ready to begin.' }],
    });
    const durationMs = Date.now() - startTime;

    // Extract text from response
    const fullResponse = response.content
      .filter(block => block.type === 'text')
      .map(block => block.type === 'text' ? block.text : '')
      .join('');

    // ── AI Audit Log (EU AI Act / America's AI Action Plan) ──
    await logAgentInteraction({
      memberId: userId,
      model: 'claude-sonnet-4-20250514',
      promptText: cleanUserMessage || '',
      outputText: fullResponse,
      mode: 'onboarding',
      riskTier: safetyCheck.triggered ? 'elevated' : undefined,
      safetyFlag: safetyCheck.triggered,
      durationMs,
    });

    // Separate visible message from safety analysis
    const { visibleMessage, safetyAnalysis } = parseSafetyAnalysis(fullResponse);

    // ── Step 5: Check Claude's safety analysis ──────────────
    if (safetyAnalysis) {
      const claudeSafetyCheck = evaluateClaudeSafetyAnalysis(safetyAnalysis, phase);
      if (claudeSafetyCheck.triggered && claudeSafetyCheck.shouldPauseOnboarding) {
        // Map trigger type to the appropriate safety response
        const safetyResponseMap: Record<string, string> = {
          SUICIDAL_IDEATION: SAFETY_RESPONSE_SUICIDAL,
          HOMICIDAL_IDEATION: SAFETY_RESPONSE_HARM,
          ABUSE_DISCLOSURE: SAFETY_RESPONSE_ABUSE,
          DISSOCIATIVE_FEATURES: SAFETY_RESPONSE_DISSOCIATIVE,
          TRAUMA_FLOODING: SAFETY_RESPONSE_TRAUMA_FLOODING,
          SUBSTANCE_INDICATORS: SAFETY_RESPONSE_SUBSTANCE,
        };
        const resolvedResponse = claudeSafetyCheck.safetyResponse
          || safetyResponseMap[claudeSafetyCheck.triggerType || '']
          || SAFETY_RESPONSE_SUICIDAL;

        claudeSafetyCheck.safetyResponse = resolvedResponse;
        await handleSafetyTrigger(claudeSafetyCheck, userId, phase, questionIndex, userMessage);
        return NextResponse.json({
          aiMessage: resolvedResponse,
          phase,
          questionIndex,
          safetyFlag: {
            type: claudeSafetyCheck.triggerType,
            severity: claudeSafetyCheck.severity,
            shouldPauseOnboarding: true,
          },
        });
      }
    }

    // ── Step 6: Score extraction for Phase 1 ────────────────
    let newQuestionScore: QuestionScores | null = null;

    if (phase === 'PHASE_1_BASELINE' && userMessage && questionIndex >= 0 && questionIndex <= 5) {
      newQuestionScore = await extractScores(userMessage, questionIndex);
    }

    // ── Step 7: Calculate assessment if Phase 1 complete ────
    let assessment = null;
    if (phase === 'PHASE_1_BASELINE' && questionIndex === 5 && newQuestionScore) {
      const allScores = [...(prevScores || []), newQuestionScore];
      assessment = calculateECQORiskIndex(allScores);

      // Check for Elevated Disruption tier
      if (assessment.risk_tier === 'ELEVATED_DISRUPTION') {
        const elevatedCheck = checkElevatedDisruption();
        await handleSafetyTrigger(elevatedCheck, userId, phase, questionIndex, 'Elevated Disruption tier assigned');

        // Save assessment to DB first
        await saveRiskAssessment(userId, assessment);

        return NextResponse.json({
          aiMessage: elevatedCheck.safetyResponse,
          phase,
          questionIndex,
          assessment,
          safetyFlag: {
            type: 'ELEVATED_DISRUPTION',
            severity: 'TIER_2',
            shouldPauseOnboarding: true,
          },
        });
      }

      // Save assessment for non-elevated tiers
      await saveRiskAssessment(userId, assessment);
    }

    // ── Step 8: Store conversational response ───────────────
    if (userMessage) {
      await storeConversationalResponse(
        userId,
        phase,
        questionIndex,
        visibleMessage,
        userMessage,
        newQuestionScore
      );
    }

    // ── Step 9: Build response ──────────────────────────────
    const responseData: Record<string, unknown> = {
      aiMessage: visibleMessage,
      phase,
      questionIndex,
      communicationStyle: safetyAnalysis?.communication_style || null,
    };

    if (newQuestionScore) {
      responseData.questionScore = newQuestionScore;
    }

    if (assessment) {
      responseData.assessment = assessment;
    }

    // Non-pausing safety flag (e.g., substance indicators)
    if (safetyCheck.triggered && !safetyCheck.shouldPauseOnboarding) {
      responseData.safetyFlag = {
        type: safetyCheck.triggerType,
        severity: safetyCheck.severity,
        shouldPauseOnboarding: false,
      };
      // Still log it
      await handleSafetyTrigger(safetyCheck, userId, phase, questionIndex, userMessage);
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('[ECQO Chat Error]', error);

    // If Claude API fails, signal the frontend to fall back to static form
    const isAnthropicError = error instanceof Anthropic.APIError;
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('[ECQO Chat Details]', { errorMessage, errorStack, isAnthropicError });

    return NextResponse.json(
      {
        error: 'Onboarding chat service temporarily unavailable.',
        fallback: true,
        details: isAnthropicError ? `Claude API: ${errorMessage}` : errorMessage,
      },
      { status: isAnthropicError ? 503 : 500 }
    );
  }
}

// ── Helper: Get system prompt for phase ─────────────────────
function getSystemPrompt(phase: OnboardingPhase, userName?: string): string {
  let prompt = '';
  switch (phase) {
    case 'PHASE_1_BASELINE':
      prompt = PHASE_1_SYSTEM_PROMPT;
      break;
    case 'PHASE_2_ACTIVITY_MODES':
      prompt = PHASE_2_SYSTEM_PROMPT;
      break;
    case 'PHASE_3_IDENTITY_ANCHORS':
      prompt = PHASE_3_SYSTEM_PROMPT;
      break;
    default:
      prompt = PHASE_1_SYSTEM_PROMPT;
  }

  if (userName) {
    prompt += `\n\nThe user's name is ${userName}. Use it naturally (not every message).`;
  }

  return prompt;
}

// ── Helper: Parse safety analysis from Claude response ──────
function parseSafetyAnalysis(fullResponse: string): {
  visibleMessage: string;
  safetyAnalysis: SafetyAnalysis | null;
} {
  const safetyMatch = fullResponse.match(/<safety_analysis>([\s\S]*?)<\/safety_analysis>/);

  let safetyAnalysis: SafetyAnalysis | null = null;
  if (safetyMatch) {
    try {
      safetyAnalysis = JSON.parse(safetyMatch[1].trim());
    } catch {
      // Parsing failed, continue without safety analysis
    }
  }

  // Remove safety analysis block from visible message
  const visibleMessage = fullResponse
    .replace(/<safety_analysis>[\s\S]*?<\/safety_analysis>/g, '')
    .trim();

  return { visibleMessage, safetyAnalysis };
}

// ── Helper: Evaluate Claude's safety analysis ───────────────
function evaluateClaudeSafetyAnalysis(
  analysis: SafetyAnalysis,
  phase: OnboardingPhase
): SafetyCheckResult {
  // Priority order matches Section 5.2

  if (analysis.suicidal_ideation) {
    return {
      triggered: true,
      triggerType: 'SUICIDAL_IDEATION',
      safetyResponse: null,  // Will use pattern-matched response from safety-screening
      severity: 'TIER_1',
      shouldPauseOnboarding: true,
    };
  }

  if (analysis.homicidal_ideation) {
    return {
      triggered: true,
      triggerType: 'HOMICIDAL_IDEATION',
      safetyResponse: null,
      severity: 'TIER_1',
      shouldPauseOnboarding: true,
    };
  }

  if (analysis.abuse_indicators) {
    return {
      triggered: true,
      triggerType: 'ABUSE_DISCLOSURE',
      safetyResponse: null,
      severity: 'TIER_1',
      shouldPauseOnboarding: true,
    };
  }

  if (analysis.dissociative_features) {
    return {
      triggered: true,
      triggerType: 'DISSOCIATIVE_FEATURES',
      safetyResponse: null,
      severity: 'TIER_2',
      shouldPauseOnboarding: true,
    };
  }

  if (analysis.trauma_flooding) {
    return {
      triggered: true,
      triggerType: 'TRAUMA_FLOODING',
      safetyResponse: null,
      severity: 'TIER_2',
      shouldPauseOnboarding: true,
    };
  }

  if (analysis.substance_indicators) {
    return {
      triggered: true,
      triggerType: 'SUBSTANCE_INDICATORS',
      safetyResponse: null,
      severity: 'TIER_3',
      shouldPauseOnboarding: false,
    };
  }

  return {
    triggered: false,
    triggerType: null,
    safetyResponse: null,
    severity: null,
    shouldPauseOnboarding: false,
  };
}

// ── Helper: Extract scores via Claude ───────────────────────
async function extractScores(
  userMessage: string,
  questionIndex: number
): Promise<QuestionScores> {
  const instrumentMap = QUESTION_INSTRUMENT_MAP[questionIndex as keyof typeof QUESTION_INSTRUMENT_MAP];

  try {
    const scoreResponse = await getAnthropic().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: SCORE_EXTRACTION_PROMPT,
      messages: [{
        role: 'user',
        content: `Question ${questionIndex + 1} (domains: ${JSON.stringify(instrumentMap)}):\nUser response: "${userMessage}"\n\nScore this response.`,
      }],
    });

    const scoreText = scoreResponse.content
      .filter(block => block.type === 'text')
      .map(block => block.type === 'text' ? block.text : '')
      .join('');

    return parseScoreExtraction(scoreText, questionIndex);
  } catch (error) {
    console.error('[ECQO Score Extraction Error]', error);
    // Return neutral scores on failure
    return {
      questionIndex,
      ecq_scores: [3],
      pesas_scores: [3],
      maps_scores: [3],
      domain_score: 3.0,
      confidence: 0.2,
      risk_signals: ['extraction_api_failure'],
    };
  }
}

// ── Helper: Store conversational response in Supabase ───────
async function storeConversationalResponse(
  userId: string,
  phase: OnboardingPhase,
  questionIndex: number,
  aiMessage: string,
  userMessage: string,
  scores: QuestionScores | null
) {
  try {
    const supabase = createAdminClient();
    const domainMap: Record<number, string> = {
      0: 'meaning',
      1: 'isolation',
      2: 'death',
      3: 'freedom',
      4: 'identity',
      5: 'perturbation',
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('conversational_responses').insert({
      user_id: userId,
      phase,
      question_index: questionIndex,
      ai_message: aiMessage,
      user_message: userMessage,
      domain: phase === 'PHASE_1_BASELINE' ? domainMap[questionIndex] || null : null,
      extracted_score: scores?.domain_score || null,
      metadata: scores ? {
        ecq_scores: scores.ecq_scores,
        pesas_scores: scores.pesas_scores,
        maps_scores: scores.maps_scores,
        confidence: scores.confidence,
        risk_signals: scores.risk_signals,
      } : {},
    });
  } catch (error) {
    console.error('[ECQO Store Response Error]', error);
    // Non-fatal — continue even if storage fails
  }
}

// ── Helper: Save risk assessment to Supabase ────────────────
async function saveRiskAssessment(
  userId: string,
  assessment: ReturnType<typeof calculateECQORiskIndex>
) {
  try {
    const supabase = createAdminClient();

    // Calculate reassess date based on tier
    let reassessAt: string | null = null;
    if (assessment.risk_tier === 'LOW_CONCERN') {
      const days = parseInt(process.env.ECQO_REASSESS_LOW_CONCERN || '90');
      reassessAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    } else if (assessment.risk_tier === 'MODERATE_UNEASE') {
      const days = parseInt(process.env.ECQO_REASSESS_MODERATE_UNEASE || '30');
      reassessAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('risk_assessments').insert({
      user_id: userId,
      ecqo_risk_index: assessment.ecqo_risk_index,
      risk_tier: assessment.risk_tier,
      domain_scores: assessment.domain_scores,
      ecq_mean: assessment.ecq_mean,
      pesas_mean: assessment.pesas_mean,
      maps_inverse_mean: assessment.maps_inverse_mean,
      reassess_at: reassessAt,
    });
  } catch (error) {
    console.error('[ECQO Save Assessment Error]', error);
  }
}

// ── Helper: Handle safety trigger ───────────────────────────
async function handleSafetyTrigger(
  safetyCheck: SafetyCheckResult,
  userId: string,
  phase: OnboardingPhase,
  questionIndex: number,
  userMessage: string
) {
  const supabase = createAdminClient();
  const moderatorEmail = getModeratorEmail();

  // 1. Log to safety_flags table (immutable audit)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('safety_flags').insert({
      user_id: userId,
      trigger_type: safetyCheck.triggerType,
      source_phase: phase,
      source_question: questionIndex,
      ai_response_delivered: safetyCheck.safetyResponse?.substring(0, 1000) || null,
      user_message_trigger: userMessage.substring(0, 1000),
      moderator_email: moderatorEmail,
      metadata: {
        severity: safetyCheck.severity,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[ECQO Safety Flag Log Error]', error);
  }

  // 2. Notify moderator via Resend
  try {
    const severityLabel = safetyCheck.severity === 'TIER_1' ? '🔴 TIER 1 — IMMEDIATE'
      : safetyCheck.severity === 'TIER_2' ? '🟠 TIER 2 — URGENT'
      : '🟡 TIER 3 — FLAGGED';

    await getResend().emails.send({
      from: process.env.RESEND_FROM_ADDRESS || 'HERR by ECQO Holdings <hello@h3rr.com>',
      to: moderatorEmail,
      subject: `${severityLabel} | HERR Safety Flag — ${safetyCheck.triggerType}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; padding: 24px; background: #111118; color: #F0EEE9; border-radius: 8px;">
          <h2 style="color: ${safetyCheck.severity === 'TIER_1' ? '#EF4444' : safetyCheck.severity === 'TIER_2' ? '#F97316' : '#EAB308'}; margin-bottom: 16px;">
            ${severityLabel}
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr><td style="padding: 8px 0; color: rgba(240,238,233,0.5); width: 140px;">Trigger Type</td><td style="padding: 8px 0; font-weight: 600;">${safetyCheck.triggerType}</td></tr>
            <tr><td style="padding: 8px 0; color: rgba(240,238,233,0.5);">User ID</td><td style="padding: 8px 0; font-family: monospace; font-size: 12px;">${userId}</td></tr>
            <tr><td style="padding: 8px 0; color: rgba(240,238,233,0.5);">Phase</td><td style="padding: 8px 0;">${phase}</td></tr>
            <tr><td style="padding: 8px 0; color: rgba(240,238,233,0.5);">Question Index</td><td style="padding: 8px 0;">${questionIndex}</td></tr>
            <tr><td style="padding: 8px 0; color: rgba(240,238,233,0.5);">Timestamp</td><td style="padding: 8px 0;">${new Date().toISOString()}</td></tr>
          </table>
          <div style="background: rgba(240,238,233,0.04); padding: 16px; border-left: 3px solid ${safetyCheck.severity === 'TIER_1' ? '#EF4444' : '#F97316'}; margin-bottom: 16px;">
            <p style="color: rgba(240,238,233,0.5); font-size: 12px; margin: 0 0 8px;">User Message (Triggering)</p>
            <p style="margin: 0;">${userMessage.substring(0, 500)}</p>
          </div>
          <p style="color: rgba(240,238,233,0.5); font-size: 12px;">
            This is an automated safety notification from the HERR onboarding system.<br>
            Review in Supabase Dashboard → safety_flags table.
          </p>
        </div>
      `,
    });

    // Update the flag with notification timestamp
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('safety_flags')
      .update({ moderator_notified_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('trigger_type', safetyCheck.triggerType)
      .is('moderator_notified_at', null)
      .order('created_at', { ascending: false })
      .limit(1);

  } catch (error) {
    console.error('[ECQO Moderator Notification Error]', error);
  }
}
