/**
 * ECQO Security Layer — Rate Limiting (PART 3)
 *
 * In-memory sliding window rate limiter.
 * Compatible with Cloudflare Workers (no external deps).
 *
 * Limits per spec:
 * - Login: 5 attempts / 15 min
 * - Forgot password: 3 / hr
 * - General API: 100 / min
 * - Admin API: 30 / min
 * - Community posts: 10 / hr
 * - DMs: 50 / hr
 */

interface RateLimitEntry {
  timestamps: number[];
}

// In-memory store — resets on worker restart, which is acceptable
// for Cloudflare Workers (ephemeral instances).
const store = new Map<string, RateLimitEntry>();

// Clean stale entries periodically
let lastClean = Date.now();
const CLEAN_INTERVAL = 60_000; // 1 min

function cleanStore() {
  const now = Date.now();
  if (now - lastClean < CLEAN_INTERVAL) return;
  lastClean = now;
  const cutoff = now - 3600_000; // 1hr max window
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter(t => t > cutoff);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  login:           { maxRequests: 5,   windowMs: 15 * 60 * 1000 },
  'forgot-password': { maxRequests: 3, windowMs: 60 * 60 * 1000 },
  general:         { maxRequests: 100, windowMs: 60 * 1000 },
  admin:           { maxRequests: 30,  windowMs: 60 * 1000 },
  'community-post': { maxRequests: 10, windowMs: 60 * 60 * 1000 },
  'community-dm':  { maxRequests: 50,  windowMs: 60 * 60 * 1000 },
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs?: number;
  message?: string;
}

/**
 * Check rate limit for a given key and config.
 * Key should be like "login:192.168.1.1" or "community-post:user-uuid"
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  cleanStore();

  const now = Date.now();
  const windowStart = now - config.windowMs;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter(t => t > windowStart);

  if (entry.timestamps.length >= config.maxRequests) {
    const oldest = entry.timestamps[0];
    const retryAfterMs = oldest + config.windowMs - now;

    return {
      allowed: false,
      remaining: 0,
      retryAfterMs,
      message: 'You\'re moving a little fast. Take a breath and try again in a moment.',
    };
  }

  entry.timestamps.push(now);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.timestamps.length,
  };
}

/**
 * Get a rate limit key from IP or user ID.
 */
export function getRateLimitKey(
  category: string,
  identifier: string,
): string {
  return `${category}:${identifier}`;
}
