/**
 * ECQO Scoring Engine — WS2 Section 2.3
 * =======================================
 * Calculates the ECQO Risk Index from conversational responses.
 *
 * ECQO Risk Index = (ECQ mean × 0.4) + (PeSAS mean × 0.35) + (MAPS inverse mean × 0.25)
 *
 * The 6 conversational questions map to 3 validated instruments:
 *   Q1 → MAPS (meaning presence) + ECQ (meaninglessness)
 *   Q2 → ECQ (isolation)
 *   Q3 → ECQ (death/mortality) + PeSAS (perturbation)
 *   Q4 → ECQ (freedom/responsibility) + MAPS (agency)
 *   Q5 → MAPS (authenticity)
 *   Q6 → PeSAS (current perturbation) — 1-10 scale
 *
 * Scoring approach:
 *   Claude analyzes each free-text response and assigns scores
 *   on a 1-5 scale (matching the Likert scales from the validated instruments).
 *   Q6 uses a 1-10 scale directly from the user.
 */

import { ECQO_WEIGHTS, assignRiskTier, type DomainScores, type RiskTier } from '@/lib/ecqo-config';

// ── Score Extraction Prompt for Claude ──────────────────────
// This is sent as a separate analysis call after each response
export const SCORE_EXTRACTION_PROMPT = `You are a clinical scoring assistant for the ECQO assessment system. Based on the user's conversational response, assign scores on the validated instrument scales.

Score each applicable instrument item on a 1-5 scale where:
1 = Severe concern / complete absence of the positive construct
2 = Significant concern / minimal presence
3 = Moderate / mixed
4 = Mild concern / good presence
5 = No concern / strong presence

For ECQ subscales (higher = more existential concern, so INVERT for risk):
- ECQ measures distress, so 5 = high distress, 1 = low distress
- Report as-is (the formula handles inversion)

For MAPS subscales (higher = more meaning/purpose):
- MAPS measures positive constructs, so 5 = high meaning, 1 = low meaning
- These get inverted in the formula (MAPS_inverse = 6 - score)

For PeSAS (higher = more perturbation/agitation):
- PeSAS measures distress, so 5 = high perturbation, 1 = calm

Respond with ONLY a JSON object, no explanation:
{
  "ecq_scores": [number or null for each ECQ-relevant item],
  "pesas_scores": [number or null for each PeSAS-relevant item],
  "maps_scores": [number or null for each MAPS-relevant item],
  "domain_score": number,
  "confidence": number (0-1, how confident you are in this scoring),
  "risk_signals": [string array of any concerning patterns detected]
}`;

// ── Question-to-Instrument Mapping ──────────────────────────
export const QUESTION_INSTRUMENT_MAP = {
  0: { // Q1: Meaning/Meaninglessness
    ecq_domains: ['meaninglessness'],    // ECQ Items 7-9
    maps_domains: ['meaning_presence'],  // MAPS Items 1-3
    pesas_domains: [],
  },
  1: { // Q2: Isolation/Connection
    ecq_domains: ['isolation'],          // ECQ Items 10-13
    maps_domains: [],
    pesas_domains: [],
  },
  2: { // Q3: Death/Mortality + Perturbation
    ecq_domains: ['death_mortality'],    // ECQ Items 1-3
    maps_domains: [],
    pesas_domains: ['perturbation'],     // PeSAS Items 1-2
  },
  3: { // Q4: Freedom/Responsibility + Agency
    ecq_domains: ['freedom_responsibility'], // ECQ Items 4-6
    maps_domains: ['agency'],            // MAPS Items 4-5
    pesas_domains: [],
  },
  4: { // Q5: Identity/Authenticity
    ecq_domains: [],
    maps_domains: ['authenticity'],      // MAPS Items 6-8
    pesas_domains: [],
  },
  5: { // Q6: Global Perturbation (1-10 scale)
    ecq_domains: [],
    maps_domains: [],
    pesas_domains: ['current_state'],    // PeSAS Items 3-5
  },
} as const;

// ── Types ───────────────────────────────────────────────────
export interface QuestionScores {
  questionIndex: number;
  ecq_scores: number[];
  pesas_scores: number[];
  maps_scores: number[];
  domain_score: number;
  confidence: number;
  risk_signals: string[];
}

export interface ECQOAssessment {
  ecqo_risk_index: number;
  risk_tier: RiskTier;
  ecq_mean: number;
  pesas_mean: number;
  maps_inverse_mean: number;
  domain_scores: DomainScores;
  question_scores: QuestionScores[];
}

// ── Calculate ECQO Risk Index ───────────────────────────────
export function calculateECQORiskIndex(questionScores: QuestionScores[]): ECQOAssessment {
  // Collect all instrument scores across all questions
  const allECQ: number[] = [];
  const allPeSAS: number[] = [];
  const allMAPS: number[] = [];

  for (const qs of questionScores) {
    allECQ.push(...qs.ecq_scores.filter(s => s > 0));
    allPeSAS.push(...qs.pesas_scores.filter(s => s > 0));
    allMAPS.push(...qs.maps_scores.filter(s => s > 0));
  }

  // Calculate means (with fallback to midpoint if no scores)
  const ecq_mean = allECQ.length > 0
    ? allECQ.reduce((a, b) => a + b, 0) / allECQ.length
    : 3.0;

  const pesas_mean = allPeSAS.length > 0
    ? allPeSAS.reduce((a, b) => a + b, 0) / allPeSAS.length
    : 3.0;

  const maps_raw_mean = allMAPS.length > 0
    ? allMAPS.reduce((a, b) => a + b, 0) / allMAPS.length
    : 3.0;

  // MAPS is inverse scored: higher meaning = lower risk
  const maps_inverse_mean = 6 - maps_raw_mean;

  // ECQO Risk Index formula
  const ecqo_risk_index =
    (ecq_mean * ECQO_WEIGHTS.ECQ) +
    (pesas_mean * ECQO_WEIGHTS.PeSAS) +
    (maps_inverse_mean * ECQO_WEIGHTS.MAPS_INVERSE);

  // Clamp to 0-5 range
  const clamped = Math.max(0, Math.min(5, ecqo_risk_index));

  // Build domain scores from question-level data
  const domain_scores: DomainScores = {
    meaning: getQuestionDomainScore(questionScores, 0),
    isolation: getQuestionDomainScore(questionScores, 1),
    death: getQuestionDomainScore(questionScores, 2),
    freedom: getQuestionDomainScore(questionScores, 3),
    identity: getQuestionDomainScore(questionScores, 4),
    perturbation: getQuestionDomainScore(questionScores, 5),
  };

  return {
    ecqo_risk_index: Math.round(clamped * 100) / 100,
    risk_tier: assignRiskTier(clamped),
    ecq_mean: Math.round(ecq_mean * 100) / 100,
    pesas_mean: Math.round(pesas_mean * 100) / 100,
    maps_inverse_mean: Math.round(maps_inverse_mean * 100) / 100,
    domain_scores,
    question_scores: questionScores,
  };
}

// ── Helper: get domain score for a specific question ────────
function getQuestionDomainScore(scores: QuestionScores[], questionIndex: number): number {
  const qs = scores.find(s => s.questionIndex === questionIndex);
  return qs?.domain_score ?? 3.0;
}

// ── Parse Q6 perturbation score from user message ───────────
export function extractPerturbationScore(userMessage: string): number | null {
  // Look for a number 1-10 in the response
  const match = userMessage.match(/\b([1-9]|10)\b/);
  if (match) {
    return parseInt(match[1]);
  }
  return null;
}

// ── Parse Claude's score extraction response ────────────────
export function parseScoreExtraction(
  claudeResponse: string,
  questionIndex: number
): QuestionScores {
  try {
    // Try to parse as JSON
    const cleaned = claudeResponse.trim();
    const parsed = JSON.parse(cleaned);

    return {
      questionIndex,
      ecq_scores: Array.isArray(parsed.ecq_scores)
        ? parsed.ecq_scores.filter((s: unknown) => typeof s === 'number')
        : [],
      pesas_scores: Array.isArray(parsed.pesas_scores)
        ? parsed.pesas_scores.filter((s: unknown) => typeof s === 'number')
        : [],
      maps_scores: Array.isArray(parsed.maps_scores)
        ? parsed.maps_scores.filter((s: unknown) => typeof s === 'number')
        : [],
      domain_score: typeof parsed.domain_score === 'number' ? parsed.domain_score : 3.0,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
      risk_signals: Array.isArray(parsed.risk_signals) ? parsed.risk_signals : [],
    };
  } catch {
    // If parsing fails, return neutral midpoint scores
    return {
      questionIndex,
      ecq_scores: [3],
      pesas_scores: [3],
      maps_scores: [3],
      domain_score: 3.0,
      confidence: 0.3,
      risk_signals: ['score_extraction_parse_failure'],
    };
  }
}
