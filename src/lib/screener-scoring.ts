/**
 * ECQO Screener Scoring
 *
 * Shared between the authenticated server-rendered results page
 * (src/app/(member)/dashboard/screener/results/page.tsx) and the
 * public client-rendered results page
 * (src/app/(marketing)/screener/results/page.tsx).
 *
 * The screener is 15 questions across 5 domains × 3 questions each:
 *   meaning   (indices 0–2)
 *   identity  (indices 3–5)
 *   freedom   (indices 6–8)
 *   isolation (indices 9–11)
 *   mortality (indices 12–14)
 *
 * Each response is a 1–5 Likert score. Domain averages + overall
 * average are computed by simple arithmetic mean per domain.
 */

export const DOMAINS = ['meaning', 'identity', 'freedom', 'isolation', 'mortality'] as const;

export type Domain = typeof DOMAINS[number];

export interface RawResponse {
  question_index: number;
  response: number;
}

export interface DomainScore {
  domain: string;
  avg: number;
}

export interface ScoredResult {
  overallAvg: number;
  scores: DomainScore[];
}

/**
 * Compute domain averages + overall average from a list of raw responses.
 * Rounds each domain to 1 decimal place to match the existing rendered output.
 */
export function scoreResponses(responses: RawResponse[]): ScoredResult {
  const tallies: Record<string, { total: number; count: number }> = {};
  for (const domain of DOMAINS) {
    tallies[domain] = { total: 0, count: 0 };
  }

  for (const r of responses) {
    const domain = DOMAINS[Math.floor(r.question_index / 3)];
    if (tallies[domain]) {
      tallies[domain].total += r.response;
      tallies[domain].count += 1;
    }
  }

  let overallTotal = 0;
  let overallCount = 0;
  const scores: DomainScore[] = DOMAINS.map((d) => {
    const t = tallies[d];
    const avg = t.count > 0 ? t.total / t.count : 0;
    overallTotal += t.total;
    overallCount += t.count;
    return { domain: d, avg: Math.round(avg * 10) / 10 };
  });

  const overallAvg = overallCount > 0 ? overallTotal / overallCount : 0;

  return {
    overallAvg: Math.round(overallAvg * 10) / 10,
    scores,
  };
}

/**
 * Convert a client-side responses map (question_index → score) into
 * the same shape the authenticated server page receives from Supabase.
 */
export function responsesMapToList(
  map: Record<number | string, number>
): RawResponse[] {
  return Object.entries(map).map(([idx, val]) => ({
    question_index: typeof idx === 'string' ? parseInt(idx, 10) : idx,
    response: Number(val),
  }));
}

/* ── localStorage contract ─────────────────────────────────────── */

export const STORAGE_KEY_RESPONSES = 'ecqo_pending_screener_responses';
export const STORAGE_KEY_CRISIS = 'ecqo_pending_crisis_flag';

export interface PendingCrisisFlag {
  domain: 'mortality';
  score: 5;
  response_id: number;
  created_at: string;
  severity: 'red';
}
