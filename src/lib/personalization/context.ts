/**
 * Visitor Context for Server Components
 * Reads the x-visitor-* headers set by middleware.
 *
 * Usage in Server Components:
 *   const visitor = await getVisitorContext();
 *   if (visitor.segment === "first-visit") { ... }
 */

import { headers } from "next/headers";

export interface VisitorContext {
  visitorId: string;
  segment: string;
  isNewVisitor: boolean;
  source: string;
  medium: string;
  campaign: string | null;
  isAITraffic: boolean;
  aiSource: string | null;
}

/**
 * Get the visitor context from middleware-injected headers.
 * Safe to call in any Server Component.
 */
export async function getVisitorContext(): Promise<VisitorContext> {
  const headerStore = await headers();

  return {
    visitorId: headerStore.get("x-visitor-id") || "unknown",
    segment: headerStore.get("x-visitor-segment") || "first-visit",
    isNewVisitor: headerStore.get("x-visitor-new") === "1",
    source: headerStore.get("x-attribution-source") || "direct",
    medium: headerStore.get("x-attribution-medium") || "none",
    campaign: headerStore.get("x-attribution-campaign") || null,
    isAITraffic: headerStore.get("x-ai-traffic") === "1",
    aiSource: headerStore.get("x-ai-source") || null,
  };
}
