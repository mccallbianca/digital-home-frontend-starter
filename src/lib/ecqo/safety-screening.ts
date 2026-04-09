/**
 * ECQO Phase 4 — Safety Screening Overlay
 * =========================================
 * Real-time trigger detection running during ALL phases.
 * Per WS2 Section 5: HERR is a wellness product, not a clinical
 * intervention, but the onboarding surfaces genuine existential
 * material that may reveal need for clinical routing.
 *
 * This module analyzes user messages for safety signals and
 * returns appropriate responses + flags.
 */

import type { SafetyTriggerType, OnboardingPhase } from '@/lib/ecqo-config';
import {
  SAFETY_RESPONSE_SUICIDAL,
  SAFETY_RESPONSE_HARM,
  SAFETY_RESPONSE_ABUSE,
  SAFETY_RESPONSE_ELEVATED,
  SAFETY_RESPONSE_PERTURBATION,
  SAFETY_RESPONSE_DISSOCIATIVE,
  SAFETY_RESPONSE_TRAUMA_FLOODING,
  SAFETY_RESPONSE_SUBSTANCE,
} from './system-prompts';

// ── Signal Detection Patterns ───────────────────────────────
// These are keyword/phrase patterns for initial screening.
// The API route also asks Claude to analyze for subtler signals.

const SUICIDAL_PATTERNS = [
  /\b(want to die|kill myself|end (my|it all)|suicide|suicidal)\b/i,
  /\b(don'?t want to (be here|live|exist|wake up))\b/i,
  /\b(better off (dead|without me))\b/i,
  /\b(no reason to (live|go on|keep going))\b/i,
  /\b(wish I (was|were) dead|wish I hadn'?t been born)\b/i,
  /\b(thinking about ending|plan to end)\b/i,
  /\b(cut(ting)? myself|hurt(ing)? myself|self[- ]?harm)\b/i,
];

const HOMICIDAL_PATTERNS = [
  /\b(kill (someone|them|him|her|that person))\b/i,
  /\b(want to hurt (someone|them|him|her|people))\b/i,
  /\b(going to (shoot|stab|attack|bomb))\b/i,
  /\b(homicid|murder(ing)?)\b/i,
];

const ABUSE_PATTERNS = [
  /\b(he|she|they|my partner|my parent|my (dad|father|mom|mother)|my (husband|wife|boyfriend|girlfriend)) (hit|hits|beat|beats|abuse|abuses|molest|rapes?|hurt|choke|chokes)\b/i,
  /\b(being (abused|beaten|molested|raped|assaulted))\b/i,
  /\b(child abuse|elder abuse|sexual abuse|domestic violence)\b/i,
  /\b(someone is (hurting|hitting|abusing) (my|a) (child|kid|son|daughter|mother|father|parent|grandparent))\b/i,
];

const DISSOCIATIVE_PATTERNS = [
  /\b(don'?t (know|feel like) (who I am|I'?m real))\b/i,
  /\b(feel(ing)? (disconnected|detached|unreal|numb|nothing|empty))\b/i,
  /\b(out of (my )?body|dissociat|depersonaliz|derealiz)\b/i,
  /\b(watching myself from (outside|above))\b/i,
  /\b(feel like I'?m not (here|real|myself))\b/i,
];

const SUBSTANCE_PATTERNS = [
  /\b(drunk|high|wasted|loaded|fucked up|tripping|rolling) right now\b/i,
  /\b(just (took|did|used|shot up|smoked|drank))\b/i,
  /\b(can'?t stop (drinking|using|smoking))\b/i,
  /\b(on (meth|heroin|cocaine|crack|pills|benzos|xanax))\b/i,
];

const TRAUMA_FLOODING_PATTERNS = [
  /\b(can'?t (stop crying|breathe|think))\b/i,
  /\b(having a (panic attack|breakdown|flashback))\b/i,
  /\b(everything is (falling apart|too much|overwhelming))\b/i,
  /\b(I ('m |am )(shaking|hyperventilating|spiraling))\b/i,
];

// ── Safety Check Result ─────────────────────────────────────
export interface SafetyCheckResult {
  triggered: boolean;
  triggerType: SafetyTriggerType | null;
  safetyResponse: string | null;
  severity: 'TIER_1' | 'TIER_2' | 'TIER_3' | null;  // 1=immediate, 2=urgent, 3=flagged
  shouldPauseOnboarding: boolean;
}

// ── Main Safety Check Function ──────────────────────────────
export function checkSafetySignals(
  userMessage: string,
  _phase: OnboardingPhase,
  perturbationScore?: number
): SafetyCheckResult {
  const noTrigger: SafetyCheckResult = {
    triggered: false,
    triggerType: null,
    safetyResponse: null,
    severity: null,
    shouldPauseOnboarding: false,
  };

  // Check in priority order (most dangerous first)

  // 1. Suicidal ideation (any level)
  if (SUICIDAL_PATTERNS.some(p => p.test(userMessage))) {
    return {
      triggered: true,
      triggerType: 'SUICIDAL_IDEATION',
      safetyResponse: SAFETY_RESPONSE_SUICIDAL,
      severity: 'TIER_1',
      shouldPauseOnboarding: true,
    };
  }

  // 2. Homicidal ideation
  if (HOMICIDAL_PATTERNS.some(p => p.test(userMessage))) {
    return {
      triggered: true,
      triggerType: 'HOMICIDAL_IDEATION',
      safetyResponse: SAFETY_RESPONSE_HARM,
      severity: 'TIER_1',
      shouldPauseOnboarding: true,
    };
  }

  // 3. Active abuse disclosure
  if (ABUSE_PATTERNS.some(p => p.test(userMessage))) {
    return {
      triggered: true,
      triggerType: 'ABUSE_DISCLOSURE',
      safetyResponse: SAFETY_RESPONSE_ABUSE,
      severity: 'TIER_1',
      shouldPauseOnboarding: true,
    };
  }

  // 4. Dissociative features (during identity capture)
  if (DISSOCIATIVE_PATTERNS.some(p => p.test(userMessage))) {
    return {
      triggered: true,
      triggerType: 'DISSOCIATIVE_FEATURES',
      safetyResponse: SAFETY_RESPONSE_DISSOCIATIVE,
      severity: 'TIER_2',
      shouldPauseOnboarding: true,
    };
  }

  // 5. Trauma flooding
  if (TRAUMA_FLOODING_PATTERNS.some(p => p.test(userMessage))) {
    return {
      triggered: true,
      triggerType: 'TRAUMA_FLOODING',
      safetyResponse: SAFETY_RESPONSE_TRAUMA_FLOODING,
      severity: 'TIER_2',
      shouldPauseOnboarding: true,
    };
  }

  // 6. Substance indicators
  if (SUBSTANCE_PATTERNS.some(p => p.test(userMessage))) {
    return {
      triggered: true,
      triggerType: 'SUBSTANCE_INDICATORS',
      safetyResponse: SAFETY_RESPONSE_SUBSTANCE,
      severity: 'TIER_3',
      shouldPauseOnboarding: false, // flag but don't interrupt
    };
  }

  // 7. Severe perturbation (from Q6 score)
  if (perturbationScore !== undefined && perturbationScore <= 2) {
    return {
      triggered: true,
      triggerType: 'SEVERE_PERTURBATION',
      safetyResponse: SAFETY_RESPONSE_PERTURBATION,
      severity: 'TIER_1',
      shouldPauseOnboarding: true,
    };
  }

  return noTrigger;
}

// ── Elevated Disruption Check (post-scoring) ────────────────
export function checkElevatedDisruption(): SafetyCheckResult {
  return {
    triggered: true,
    triggerType: 'ELEVATED_DISRUPTION',
    safetyResponse: SAFETY_RESPONSE_ELEVATED,
    severity: 'TIER_2',
    shouldPauseOnboarding: true,
  };
}

// ── Claude-assisted Safety Analysis ─────────────────────────
// This prompt is appended to Claude's analysis to catch subtle signals
// that keyword patterns miss
export const SAFETY_ANALYSIS_PROMPT = `Additionally, analyze the user's message for these safety signals and include your assessment in a JSON block at the very end of your response, wrapped in <safety_analysis> tags:
- suicidal_ideation: boolean (any level, including passive)
- homicidal_ideation: boolean
- abuse_indicators: boolean (child, elder, dependent adult, domestic)
- dissociative_features: boolean (identity confusion, depersonalization, derealization)
- trauma_flooding: boolean (emotional overwhelm, flashbacks, panic)
- substance_indicators: boolean (current intoxication or active use)
- distress_level: "none" | "mild" | "moderate" | "severe"
- communication_style: "DIRECT" | "REFLECTIVE" | "POETIC" | "PRACTICAL"

Example:
<safety_analysis>
{"suicidal_ideation":false,"homicidal_ideation":false,"abuse_indicators":false,"dissociative_features":false,"trauma_flooding":false,"substance_indicators":false,"distress_level":"none","communication_style":"DIRECT"}
</safety_analysis>

CRITICAL: The safety_analysis block must ALWAYS be present but must NEVER be visible in your conversational response to the user. Place it at the very end after your response.`;
