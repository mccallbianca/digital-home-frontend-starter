/**
 * ECQO Security Layer — Risk Alignment Check (Layer 3)
 *
 * Cross-references content with the member's ECQO Risk Index tier.
 * Escalates Elevated Disruption content within 24 hours per ECQO_TIER2_NOTIFY_HOURS.
 */

export type RiskTier = 'low_concern' | 'moderate_unease' | 'elevated_disruption';

const LOW_CONCERN_MAX = parseFloat(process.env.ECQO_LOW_CONCERN_MAX || '2.0');
const MODERATE_UNEASE_MAX = parseFloat(process.env.ECQO_MODERATE_UNEASE_MAX || '3.5');

export interface RiskCheckResult {
  tier: RiskTier;
  escalate: boolean;
  reason?: string;
}

/**
 * Determine the risk tier from a composite ECQO Risk Index score.
 */
export function getRiskTier(score: number): RiskTier {
  if (score <= LOW_CONCERN_MAX) return 'low_concern';
  if (score <= MODERATE_UNEASE_MAX) return 'moderate_unease';
  return 'elevated_disruption';
}

/**
 * Layer 3 — Cross-reference user content with their ECQO risk tier.
 * Elevated Disruption members get escalated for review within 24 hours.
 */
export function checkRiskAlignment(
  riskScore: number | null,
  contentFlag: 'crisis' | 'harm' | 'policy_violation' | 'clean',
): RiskCheckResult {
  if (riskScore === null) {
    return { tier: 'low_concern', escalate: false };
  }

  const tier = getRiskTier(riskScore);

  // Any flagged content from Elevated Disruption members gets escalated
  if (tier === 'elevated_disruption' && contentFlag !== 'clean') {
    return {
      tier,
      escalate: true,
      reason: `Elevated Disruption member with ${contentFlag} content — escalating per ECQO protocol`,
    };
  }

  // Moderate unease with crisis/harm flags also escalates
  if (tier === 'moderate_unease' && (contentFlag === 'crisis' || contentFlag === 'harm')) {
    return {
      tier,
      escalate: true,
      reason: `Moderate Unease member with ${contentFlag} content — escalating`,
    };
  }

  return { tier, escalate: false };
}
