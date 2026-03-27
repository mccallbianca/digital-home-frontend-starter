/**
 * Unified Source Resolution
 * Combines UTM params, referrer detection, and AI traffic detection
 * into a single resolved attribution source.
 *
 * Priority:
 * 1. UTM parameters (explicit, highest trust)
 * 2. AI referral detection (special tracking)
 * 3. Standard referrer detection
 * 4. Direct / unknown
 */

import { parseUTM, hasUTMParams, type UTMParams } from "./utm";
import { detectReferrer, type ReferrerInfo } from "./referrer";
import { detectAIReferral, detectAIFromParams, type AIReferralInfo } from "./ai-referral";

export interface ResolvedSource {
  source: string;
  medium: string;
  campaign: string | null;
  referrer: string | null;
  referrerDomain: string | null;
  isAITraffic: boolean;
  aiSource: string | null;
}

/**
 * Resolve the full attribution source for a request.
 */
export function resolveSource(
  url: URL,
  referrer: string | null,
  userAgent: string | null
): ResolvedSource {
  // Check for AI traffic first — we want to flag this regardless of UTMs
  const aiResult = detectAIReferral(referrer, userAgent) || detectAIFromParams(url);

  // 1. UTM params take priority for source/medium
  if (hasUTMParams(url)) {
    const utm = parseUTM(url);
    return {
      source: utm.source || "unknown",
      medium: utm.medium || "unknown",
      campaign: utm.campaign,
      referrer,
      referrerDomain: extractDomain(referrer),
      isAITraffic: aiResult !== null,
      aiSource: aiResult?.source || null,
    };
  }

  // 2. AI referral (when no UTMs)
  if (aiResult) {
    return {
      source: aiResult.source,
      medium: "ai-referral",
      campaign: null,
      referrer,
      referrerDomain: extractDomain(referrer),
      isAITraffic: true,
      aiSource: aiResult.source,
    };
  }

  // 3. Standard referrer
  const referrerInfo = detectReferrer(referrer);
  if (referrerInfo) {
    return {
      source: referrerInfo.source,
      medium: referrerInfo.medium,
      campaign: null,
      referrer,
      referrerDomain: referrerInfo.domain,
      isAITraffic: false,
      aiSource: null,
    };
  }

  // 4. Direct
  return {
    source: "direct",
    medium: "none",
    campaign: null,
    referrer: null,
    referrerDomain: null,
    isAITraffic: false,
    aiSource: null,
  };
}

function extractDomain(referrer: string | null): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname;
  } catch {
    return null;
  }
}

// Re-export everything for convenience
export { parseUTM, hasUTMParams, type UTMParams } from "./utm";
export { detectReferrer, type ReferrerInfo } from "./referrer";
export { detectAIReferral, type AIReferralInfo } from "./ai-referral";
