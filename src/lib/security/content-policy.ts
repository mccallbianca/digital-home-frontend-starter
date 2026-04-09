/**
 * ECQO Security Layer — Content Policy (Layer 2)
 *
 * Detects crisis language, harmful content, and community guideline violations.
 * Triggers Tier 1 notification within 60 seconds for crisis detection.
 * Surfaces 988 Suicide & Crisis Lifeline resources.
 */

// ── Crisis keywords (Tier 1 — immediate) ──────────────────────
const CRISIS_PATTERNS = [
  /\b(kill\s*(myself|me)|suicide|suicidal|end\s*(my|it\s*all)|want\s*to\s*die|don'?t\s*want\s*to\s*(live|be\s*here|exist))\b/i,
  /\b(overdose|slit|hang\s*myself|jump\s*(off|from)|gun\s*to)\b/i,
  /\b(plan\s*to\s*(die|end|kill)|no\s*reason\s*to\s*live|better\s*off\s*dead)\b/i,
  /\b(self[\s-]?harm|cutting\s*(myself|my)|burning\s*myself)\b/i,
];

// ── Harm to others (Tier 1 — immediate) ──────────────────────
const HARM_PATTERNS = [
  /\b(kill\s*(him|her|them|someone|you)|murder|shoot|stab|attack)\b/i,
  /\b(bomb|explosive|weapon)\b/i,
  /\b(abuse|assault|trafficking)\b/i,
];

// ── Content policy violations (Tier 2 — within 24 hours) ──────
const POLICY_VIOLATION_PATTERNS = [
  /\b(spam|scam|phishing|pyramid\s*scheme)\b/i,
  /\b(hate\s*speech|racist|homophobic|slur)\b/i,
  /\b(doxx|doxing|personal\s*information)\b/i,
];

export type ContentFlag = 'crisis' | 'harm' | 'policy_violation' | 'clean';

export interface ContentPolicyResult {
  flag: ContentFlag;
  tier: 1 | 2 | 0;
  reason?: string;
  crisisResources?: string;
}

const CRISIS_RESOURCES = `If you're experiencing a crisis, you are not alone.\n\n988 Suicide & Crisis Lifeline: Call or text 988\nCrisis Text Line: Text HOME to 741741\n\nThese services are free, confidential, and available 24/7.`;

/**
 * Layer 2 — Content policy check.
 * Returns flag type, notification tier, and optional crisis resources.
 */
export function checkContentPolicy(text: string): ContentPolicyResult {
  if (!text) return { flag: 'clean', tier: 0 };

  // Check crisis patterns first (Tier 1 — 60 second notification SLA)
  for (const pattern of CRISIS_PATTERNS) {
    if (pattern.test(text)) {
      return {
        flag: 'crisis',
        tier: 1,
        reason: 'Crisis language detected — safety protocol activated',
        crisisResources: CRISIS_RESOURCES,
      };
    }
  }

  // Check harm patterns (Tier 1)
  for (const pattern of HARM_PATTERNS) {
    if (pattern.test(text)) {
      return {
        flag: 'harm',
        tier: 1,
        reason: 'Potential harm content detected',
      };
    }
  }

  // Check policy violations (Tier 2 — 24 hour notification SLA)
  for (const pattern of POLICY_VIOLATION_PATTERNS) {
    if (pattern.test(text)) {
      return {
        flag: 'policy_violation',
        tier: 2,
        reason: 'Community guideline concern',
      };
    }
  }

  return { flag: 'clean', tier: 0 };
}
