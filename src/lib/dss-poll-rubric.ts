/**
 * DSS 2026 Live Poll — server-only ECQO existential scoring rubric.
 *
 * SERVER-ONLY. Importing this module from a client component must
 * fail at build time. The 'server-only' import below is the Next.js
 * sentinel that enforces this guarantee.
 *
 * Why server-only:
 *   - The domain weighting is the substantive intellectual content of
 *     the rubric. If exposed, audience members could reverse-engineer
 *     the math to nudge the room into a tier of their choosing.
 *   - Tier thresholds are also server-only for the same reason.
 *   - Tier label and interpretation strings live here because the
 *     /api/dss-poll/score route is the single boundary at which they
 *     cross from server to client, and only after the reveal flag has
 *     been set.
 *
 * The shared file (dss-poll-shared.ts) holds anything safe to render
 * client-side: question text, Likert labels, color tokens, AUTO_REVEAL_THRESHOLD.
 */

import "server-only";

import type { Domain, LikertValue, Tier } from "./dss-poll-shared";
import { DOMAINS } from "./dss-poll-shared";

/**
 * Database row shape for dss_poll_responses. Mirrors the migration
 * exactly. Local to this file so we do not have to amend the global
 * Database type for a single ephemeral event.
 */
export interface DssPollResponseRow {
  id: string;
  session_id: string;
  q1_value: LikertValue;
  q2_value: LikertValue;
  q3_value: LikertValue;
  q4_value: LikertValue;
  q5_value: LikertValue;
  created_at: string;
}

export interface PollResponse {
  q1_value: LikertValue;
  q2_value: LikertValue;
  q3_value: LikertValue;
  q4_value: LikertValue;
  q5_value: LikertValue;
}

/**
 * Question -> Domain weighted contributions.
 *
 * Each row is a partial map from Domain to weight in [0, 1]. The
 * weights for each question must sum to 1.0. Domains not listed for
 * a question contribute 0 from that question.
 *
 * Q1 (document/message refinement): Identity 0.4, Purpose 0.3, Connection 0.3
 * Q2 (mild-to-moderate problem solving): Freedom 0.4, Identity 0.3, Connection 0.3
 * Q3 (moderate-to-severe problem solving): Isolation 0.5, Freedom 0.3, Connection 0.2
 * Q4 (counseling/therapy/significant decisions): Isolation 0.5, Meaning 0.3, Connection 0.2
 * Q5 (existential concerns): Meaning 0.4, Mortality 0.3, Purpose 0.3
 */
const RUBRIC: ReadonlyArray<Readonly<Partial<Record<Domain, number>>>> = [
  { Identity: 0.4, Purpose: 0.3, Connection: 0.3 },
  { Freedom: 0.4, Identity: 0.3, Connection: 0.3 },
  { Isolation: 0.5, Freedom: 0.3, Connection: 0.2 },
  { Isolation: 0.5, Meaning: 0.3, Connection: 0.2 },
  { Meaning: 0.4, Mortality: 0.3, Purpose: 0.3 },
];

/**
 * Per-domain max contribution per response = 4 * sum of weights
 * touching that domain, where 4 is the max Likert value.
 *
 * Computed once at module load.
 */
const DOMAIN_MAX_PER_RESPONSE: Readonly<Record<Domain, number>> = (() => {
  const acc: Record<Domain, number> = {
    Identity: 0,
    Purpose: 0,
    Connection: 0,
    Freedom: 0,
    Isolation: 0,
    Meaning: 0,
    Mortality: 0,
  };
  for (const q of RUBRIC) {
    for (const k of Object.keys(q) as Domain[]) {
      acc[k] += q[k] ?? 0;
    }
  }
  for (const k of Object.keys(acc) as Domain[]) {
    acc[k] *= 4;
  }
  return acc;
})();

/**
 * Per-response, single-domain contribution.
 *
 *   contribution[D] = sum over Q of (likert(Q) * weight(Q, D))
 */
function contributionForDomain(domain: Domain, r: PollResponse): number {
  const v: LikertValue[] = [
    r.q1_value,
    r.q2_value,
    r.q3_value,
    r.q4_value,
    r.q5_value,
  ];
  let sum = 0;
  for (let i = 0; i < RUBRIC.length; i++) {
    const w = RUBRIC[i][domain];
    if (w !== undefined) sum += v[i] * w;
  }
  return sum;
}

export interface DomainScore {
  domain: Domain;
  /** 0 to 100, normalized to that domain's max possible per response. */
  score: number;
}

export interface ScoreResult {
  responseCount: number;
  domainScores: DomainScore[];
  tier: Tier;
  tierLabel: string;
  tierInterpretation: string;
}

// Plain-language one-liners shown beneath the tier label on the
// public dashboard (/dss-poll/results) and the failsafe (/dss-poll/demo).
// Updated 2026-05-02: shortened from the original interpretation copy
// so the audience can read and absorb the read at conference distance
// without the speaker explaining clinical jargon.
const TIER_TEXT: Record<Tier, { label: string; interpretation: string }> = {
  stable: {
    label: "Stable and Engaged",
    interpretation:
      "This room is using AI in low-existential-load ways. Most uses are practical, not personal.",
  },
  monitoring: {
    label: "Monitoring Recommended",
    interpretation:
      "This room is touching some existential domains through AI. Worth paying attention to how AI is being used for personal matters.",
  },
  human_review: {
    label: "Human Review Required",
    interpretation:
      "This room is processing significant existential material through AI. Human clinical engagement is the appropriate next step.",
  },
  engagement_gap: {
    label: "Engagement Gap",
    interpretation:
      "Not enough responses yet to assess this room. Increase participation.",
  },
};

const MIN_RESPONSES_FOR_TIER = 10;

/**
 * Run the rubric over every response for the active session. Returns
 * group domain_scores normalized to 0-100, plus the resulting tier and
 * its label and interpretation strings.
 *
 * Below MIN_RESPONSES_FOR_TIER, the result is the "engagement_gap"
 * tier with all domain scores forced to zero, which the dashboard
 * renders as flat bars.
 */
export function scoreResponses(responses: PollResponse[]): ScoreResult {
  const responseCount = responses.length;

  if (responseCount < MIN_RESPONSES_FOR_TIER) {
    return {
      responseCount,
      domainScores: DOMAINS.map((d) => ({ domain: d, score: 0 })),
      tier: "engagement_gap",
      tierLabel: TIER_TEXT.engagement_gap.label,
      tierInterpretation: TIER_TEXT.engagement_gap.interpretation,
    };
  }

  const domainScores: DomainScore[] = DOMAINS.map((domain) => {
    const max = DOMAIN_MAX_PER_RESPONSE[domain];
    if (max === 0) return { domain, score: 0 };
    let total = 0;
    for (const r of responses) total += contributionForDomain(domain, r);
    const meanContribution = total / responseCount;
    const raw = (meanContribution / max) * 100;
    const clamped = Math.max(0, Math.min(100, raw));
    return { domain, score: Math.round(clamped * 10) / 10 };
  });

  const tier = computeTier(domainScores.map((d) => d.score));
  return {
    responseCount,
    domainScores,
    tier,
    tierLabel: TIER_TEXT[tier].label,
    tierInterpretation: TIER_TEXT[tier].interpretation,
  };
}

/**
 * Severity tier from the seven domain scores.
 *
 *   Stable          : all 7 < 35
 *   Monitoring      : 1 or 2 in [35, 60], rest < 35
 *   Human Review    : any > 60, OR 3+ in [35, 60]
 *   Engagement Gap  : handled before this function is called (count < 10)
 */
function computeTier(scores: number[]): Tier {
  const inAmber = scores.filter((s) => s >= 35 && s <= 60).length;
  const anyOver60 = scores.some((s) => s > 60);

  if (anyOver60) return "human_review";
  if (inAmber >= 3) return "human_review";
  if (inAmber >= 1) return "monitoring";
  return "stable";
}

/**
 * Score a single response in isolation. Used by /api/dss-poll/send-results
 * to generate each voter's personal seven-domain breakdown for their
 * results email. The engagement_gap branch does not apply here because
 * the sample size is the voter themselves; we always score and tier.
 */
export function scoreSingleResponse(r: PollResponse): ScoreResult {
  const domainScores: DomainScore[] = DOMAINS.map((domain) => {
    const max = DOMAIN_MAX_PER_RESPONSE[domain];
    if (max === 0) return { domain, score: 0 };
    const contribution = contributionForDomain(domain, r);
    const raw = (contribution / max) * 100;
    const clamped = Math.max(0, Math.min(100, raw));
    return { domain, score: Math.round(clamped * 10) / 10 };
  });

  const tier = computeTier(domainScores.map((d) => d.score));
  return {
    responseCount: 1,
    domainScores,
    tier,
    tierLabel: TIER_TEXT[tier].label,
    tierInterpretation: TIER_TEXT[tier].interpretation,
  };
}
