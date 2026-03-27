/**
 * Standard Referrer Detection
 * Classifies referrer URLs into known sources and mediums.
 */

export interface ReferrerInfo {
  source: string;
  medium: string;
  domain: string;
}

interface ReferrerPattern {
  domains: string[];
  source: string;
  medium: string;
}

const REFERRER_PATTERNS: ReferrerPattern[] = [
  // Search engines
  { domains: ["google.com", "google.co"], source: "google", medium: "organic" },
  { domains: ["bing.com"], source: "bing", medium: "organic" },
  { domains: ["duckduckgo.com"], source: "duckduckgo", medium: "organic" },
  { domains: ["yahoo.com"], source: "yahoo", medium: "organic" },
  { domains: ["yandex.com", "yandex.ru"], source: "yandex", medium: "organic" },
  { domains: ["baidu.com"], source: "baidu", medium: "organic" },

  // Social media
  { domains: ["facebook.com", "fb.com", "fb.me", "m.facebook.com"], source: "facebook", medium: "social" },
  { domains: ["instagram.com", "l.instagram.com"], source: "instagram", medium: "social" },
  { domains: ["twitter.com", "t.co", "x.com"], source: "twitter", medium: "social" },
  { domains: ["linkedin.com", "lnkd.in"], source: "linkedin", medium: "social" },
  { domains: ["youtube.com", "youtu.be"], source: "youtube", medium: "social" },
  { domains: ["tiktok.com"], source: "tiktok", medium: "social" },
  { domains: ["reddit.com"], source: "reddit", medium: "social" },
  { domains: ["threads.net"], source: "threads", medium: "social" },

  // Communities
  { domains: ["skool.com"], source: "skool", medium: "community" },
  { domains: ["discord.com", "discord.gg"], source: "discord", medium: "community" },
  { domains: ["slack.com"], source: "slack", medium: "community" },

  // Email providers (when referrer leaks)
  { domains: ["mail.google.com"], source: "gmail", medium: "email" },
  { domains: ["outlook.live.com", "outlook.office.com"], source: "outlook", medium: "email" },
];

/**
 * Detect referrer source and medium from a referrer URL string.
 * Returns null if no referrer or if it's a direct visit.
 */
export function detectReferrer(referrer: string | null): ReferrerInfo | null {
  if (!referrer) return null;

  let url: URL;
  try {
    url = new URL(referrer);
  } catch {
    return null;
  }

  const hostname = url.hostname.toLowerCase();

  // Check against known patterns
  for (const pattern of REFERRER_PATTERNS) {
    for (const domain of pattern.domains) {
      if (hostname === domain || hostname.endsWith(`.${domain}`)) {
        return {
          source: pattern.source,
          medium: pattern.medium,
          domain: hostname,
        };
      }
    }
  }

  // Unknown referrer — classify as "referral"
  return {
    source: hostname,
    medium: "referral",
    domain: hostname,
  };
}
