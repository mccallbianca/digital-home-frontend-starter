/**
 * ECQO Clinical Configuration — WS2 Spec
 * =========================================
 * All thresholds marked "Pending calibration" in the WS2 spec (Section 7)
 * are configurable via environment variables with sensible defaults.
 *
 * ECQO Risk Index formula:
 *   (ECQ mean × 0.4) + (PeSAS mean × 0.35) + (MAPS inverse mean × 0.25)
 *
 * Risk Tiers:
 *   Low Concern      → below LOW_CONCERN_MAX
 *   Moderate Unease   → LOW_CONCERN_MAX to MODERATE_UNEASE_MAX
 *   Elevated Disruption → above MODERATE_UNEASE_MAX
 */

// ── Risk Index Weights ──────────────────────────────────────
export const ECQO_WEIGHTS = {
  ECQ: 0.4,
  PeSAS: 0.35,
  MAPS_INVERSE: 0.25,
} as const;

// ── Risk Tier Thresholds ────────────────────────────────────
export function getThresholds() {
  return {
    LOW_CONCERN_MAX: parseFloat(process.env.ECQO_LOW_CONCERN_MAX || '2.0'),
    MODERATE_UNEASE_MAX: parseFloat(process.env.ECQO_MODERATE_UNEASE_MAX || '3.5'),
  };
}

// ── Risk Tier Enum ──────────────────────────────────────────
export type RiskTier = 'LOW_CONCERN' | 'MODERATE_UNEASE' | 'ELEVATED_DISRUPTION';

export function assignRiskTier(ecqoRiskIndex: number): RiskTier {
  const t = getThresholds();
  if (ecqoRiskIndex < t.LOW_CONCERN_MAX) return 'LOW_CONCERN';
  if (ecqoRiskIndex <= t.MODERATE_UNEASE_MAX) return 'MODERATE_UNEASE';
  return 'ELEVATED_DISRUPTION';
}

// ── Re-Assessment Intervals (days) ──────────────────────────
export function getReassessmentDays(tier: RiskTier): number | null {
  if (tier === 'LOW_CONCERN') return parseInt(process.env.ECQO_REASSESS_LOW_CONCERN || '90');
  if (tier === 'MODERATE_UNEASE') return parseInt(process.env.ECQO_REASSESS_MODERATE_UNEASE || '30');
  // Elevated Disruption: continuous until moderator clears
  return null;
}

// ── Activity Mode Expansion ─────────────────────────────────
export function getModeExpansionDays(): number {
  return parseInt(process.env.ECQO_MODE_EXPANSION_DAYS || '14');
}

// ── Script Duration Limits ──────────────────────────────────
export function getElevatedMaxScriptMinutes(): number {
  return parseInt(process.env.ECQO_ELEVATED_MAX_SCRIPT_MIN || '10');
}

// ── Safety SLAs ─────────────────────────────────────────────
export function getSafetySLAs() {
  return {
    TIER1_NOTIFY_SECONDS: parseInt(process.env.ECQO_TIER1_NOTIFY_SECONDS || '60'),
    TIER2_NOTIFY_HOURS: parseInt(process.env.ECQO_TIER2_NOTIFY_HOURS || '24'),
    SAFETY_RETENTION_YEARS: parseInt(process.env.ECQO_SAFETY_RETENTION_YEARS || '7'),
  };
}

// ── Moderator Contact ───────────────────────────────────────
export function getModeratorEmail(): string {
  return process.env.ECQO_MODERATOR_EMAIL || 'moderator@h3rr.com';
}

// ── Onboarding Phases ───────────────────────────────────────
export type OnboardingPhase =
  | 'PHASE_1_BASELINE'
  | 'PHASE_2_ACTIVITY_MODES'
  | 'PHASE_3_IDENTITY_ANCHORS'
  | 'PHASE_4_SAFETY'
  | 'PHASE_5_HANDOFF';

// ── Activity Modes ──────────────────────────────────────────
export const ACTIVITY_MODES = [
  'WORKOUT',
  'DRIVING',
  'SLEEP',
  'MORNING',
  'DEEP_WORK',
  'LOVE_FAMILY',
  'ABUNDANCE',
  'HEALING',
] as const;

export type ActivityMode = (typeof ACTIVITY_MODES)[number];

// ── Communication Styles ────────────────────────────────────
export type CommunicationStyle = 'DIRECT' | 'REFLECTIVE' | 'POETIC' | 'PRACTICAL';

// ── Domain Scores Structure ─────────────────────────────────
export interface DomainScores {
  meaning: number;       // Q1 — MAPS + ECQ meaninglessness
  isolation: number;     // Q2 — ECQ isolation
  death: number;         // Q3 — ECQ death + PeSAS perturbation
  freedom: number;       // Q4 — ECQ freedom + MAPS agency
  identity: number;      // Q5 — MAPS authenticity
  perturbation: number;  // Q6 — PeSAS current state (1-10 scale)
}

// ── Safety Trigger Types ────────────────────────────────────
export type SafetyTriggerType =
  | 'SUICIDAL_IDEATION'
  | 'HOMICIDAL_IDEATION'
  | 'ABUSE_DISCLOSURE'
  | 'ELEVATED_DISRUPTION'
  | 'SEVERE_PERTURBATION'
  | 'DISSOCIATIVE_FEATURES'
  | 'SUBSTANCE_INDICATORS'
  | 'TRAUMA_FLOODING';

// ── Script Handoff Data Structure (Phase 5) ─────────────────
export interface ScriptHandoffData {
  // Required fields (Section 6.2)
  user_id: string;
  risk_tier: RiskTier;
  ecqo_risk_index: number;
  domain_scores: DomainScores;
  active_modes: ActivityMode[];
  primary_mode: ActivityMode;
  core_values: string[];
  defining_achievement: {
    description: string;
    emotional_signature: string;
    identity_language: string;
  };
  aspirational_identity: {
    description: string;
    gap_assessment: string;
    pathway_clarity: string;
  };
  self_language_words: string[];
  consent_status: {
    platform: boolean;
    voice_clone: boolean;
    screening: boolean;
    data_sharing: boolean;
    research: boolean;
  };
  safety_flags: Array<{
    type: SafetyTriggerType;
    source_phase: OnboardingPhase;
    timestamp: string;
    resolution: string;
  }>;

  // Optional fields (Section 6.3)
  significant_relationship?: {
    relationship_type: string;
    quality_of_being_known: string;
    relational_language: string;
  };
  cultural_context?: {
    self_identified_background: string;
    language_preference: string;
    cultural_values: string;
  };
  athletic_background?: {
    sport: string;
    level: string;
    transition_status: string;
    identity_fusion_score: number;
  };
  spiritual_framework?: {
    tradition: string;
    active_practice: boolean;
    crisis_status: boolean;
  };
  improvement_lever?: string;
  communication_style?: CommunicationStyle;
}
