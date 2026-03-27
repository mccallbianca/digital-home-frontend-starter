/**
 * Visitor Profiling
 * Manages anonymous visitor identity via cookies.
 * No PII until email capture — just an anonymous ID + behavioral data.
 */

import { type ResolvedSource } from "@/lib/attribution/source";

export interface VisitorProfile {
  anonymousId: string;
  segment: string;
  visitCount: number;
  firstSource: string | null;
  firstMedium: string | null;
  latestSource: string | null;
  latestMedium: string | null;
  isAITraffic: boolean;
  aiSource: string | null;
  pagesViewed: string[];
  contentAffinities: string[];
  deviceType: string | null;
}

export const VISITOR_COOKIE_NAME = "bb_vid";
export const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * Generate a new anonymous visitor ID.
 * Uses crypto.randomUUID() which is available in edge runtimes.
 */
export function generateVisitorId(): string {
  return crypto.randomUUID();
}

/**
 * Determine visitor segment based on behavior.
 * Segments drive personalization rules.
 */
export function assignSegment(profile: Partial<VisitorProfile>): string {
  const visits = profile.visitCount || 0;
  const pages = profile.pagesViewed?.length || 0;
  const medium = profile.latestMedium;
  const isAI = profile.isAITraffic;

  // AI traffic gets its own segment
  if (isAI) return "ai-referred";

  // First-time visitors
  if (visits <= 1) return "first-visit";

  // Returning but low engagement
  if (visits <= 3 && pages < 5) return "returning-visitor";

  // Content-engaged: viewed 5+ pages or visited 3+ times
  if (pages >= 5 || visits >= 3) return "content-engaged";

  // High engagement: many visits + many pages
  if (visits >= 5 && pages >= 10) return "high-engagement";

  // Social referral
  if (medium === "social") return "social-referral";

  // Email subscriber (will be set by lead capture, not here)
  // "email-subscriber" — set when lead opts in

  return "returning-visitor";
}

/**
 * Detect device type from User-Agent string.
 */
export function detectDeviceType(userAgent: string | null): "mobile" | "tablet" | "desktop" | null {
  if (!userAgent) return null;
  const ua = userAgent.toLowerCase();

  if (/tablet|ipad|playbook|silk/.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android(?!.*tablet)|blackberry|opera mini|iemobile/.test(ua)) return "mobile";
  return "desktop";
}
