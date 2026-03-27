/**
 * AI Traffic Detection
 * Detects visitors arriving from AI assistants:
 * ChatGPT, Perplexity, Claude, Gemini, Copilot, etc.
 *
 * Detection signals:
 * 1. Referrer URL patterns (most reliable)
 * 2. User-Agent strings (for bot crawlers)
 * 3. URL parameters (some AI tools append identifiers)
 */

export interface AIReferralInfo {
  isAI: true;
  source: string;
  confidence: "high" | "medium" | "low";
}

interface AIPattern {
  // Match against referrer hostname
  referrerDomains?: string[];
  // Match against referrer path
  referrerPaths?: string[];
  // Match against User-Agent substring
  userAgentPatterns?: string[];
  // The AI source name
  source: string;
}

const AI_PATTERNS: AIPattern[] = [
  {
    source: "chatgpt",
    referrerDomains: ["chat.openai.com", "chatgpt.com"],
    userAgentPatterns: ["ChatGPT", "GPTBot"],
  },
  {
    source: "perplexity",
    referrerDomains: ["perplexity.ai", "www.perplexity.ai"],
    userAgentPatterns: ["PerplexityBot"],
  },
  {
    source: "claude",
    referrerDomains: ["claude.ai", "www.claude.ai"],
    userAgentPatterns: ["ClaudeBot", "Claude-Web"],
  },
  {
    source: "gemini",
    referrerDomains: ["gemini.google.com", "bard.google.com"],
    userAgentPatterns: ["Google-Extended"],
  },
  {
    source: "copilot",
    referrerDomains: ["copilot.microsoft.com", "www.bing.com/chat"],
    userAgentPatterns: ["CopilotBot"],
  },
  {
    source: "you",
    referrerDomains: ["you.com"],
    userAgentPatterns: ["YouBot"],
  },
  {
    source: "phind",
    referrerDomains: ["phind.com", "www.phind.com"],
    userAgentPatterns: ["PhindBot"],
  },
  {
    source: "meta-ai",
    referrerDomains: ["meta.ai", "www.meta.ai"],
    userAgentPatterns: ["MetaAI"],
  },
];

/**
 * Detect if a visitor came from an AI assistant.
 * Checks referrer first (high confidence), then user-agent (medium confidence).
 */
export function detectAIReferral(
  referrer: string | null,
  userAgent: string | null
): AIReferralInfo | null {
  // 1. Check referrer (high confidence)
  if (referrer) {
    try {
      const url = new URL(referrer);
      const hostname = url.hostname.toLowerCase();

      for (const pattern of AI_PATTERNS) {
        if (pattern.referrerDomains) {
          for (const domain of pattern.referrerDomains) {
            if (hostname === domain || hostname.endsWith(`.${domain}`)) {
              return { isAI: true, source: pattern.source, confidence: "high" };
            }
          }
        }
      }
    } catch {
      // Invalid referrer URL — skip
    }
  }

  // 2. Check user-agent (medium confidence — could be a bot crawl, not a click)
  if (userAgent) {
    const ua = userAgent.toLowerCase();
    for (const pattern of AI_PATTERNS) {
      if (pattern.userAgentPatterns) {
        for (const uaPattern of pattern.userAgentPatterns) {
          if (ua.includes(uaPattern.toLowerCase())) {
            return { isAI: true, source: pattern.source, confidence: "medium" };
          }
        }
      }
    }
  }

  return null;
}

/**
 * Check URL params for AI-related tracking parameters.
 * Some AI tools may append identifiers like ?ref=chatgpt.
 */
export function detectAIFromParams(url: URL): AIReferralInfo | null {
  const params = 'searchParams' in url ? url.searchParams : url;
  if (!params || typeof params.get !== 'function') return null;
  const ref = params.get("ref") || params.get("via");
  if (!ref) return null;

  const refLower = ref.toLowerCase();
  for (const pattern of AI_PATTERNS) {
    if (refLower.includes(pattern.source)) {
      return { isAI: true, source: pattern.source, confidence: "low" };
    }
  }

  return null;
}
