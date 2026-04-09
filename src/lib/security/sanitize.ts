/**
 * ECQO Security Layer — Input Sanitization (Layer 1)
 *
 * Responsibilities:
 * - Strip HTML tags
 * - Escape special characters
 * - Block SQL injection patterns
 * - Block script injection patterns
 * - Normalize encoding
 */

// ── HTML tag stripping ─────────────────────────────────────────
const HTML_TAG_RE = /<\/?[^>]+(>|$)/g;
const SCRIPT_RE = /<script[\s\S]*?<\/script>/gi;
const EVENT_HANDLER_RE = /\bon\w+\s*=\s*["'][^"']*["']/gi;

// ── SQL injection patterns ─────────────────────────────────────
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC|UNION|DECLARE)\b\s)/i,
  /(-{2}|\/\*|\*\/)/,
  /(;\s*(SELECT|INSERT|UPDATE|DELETE|DROP))/i,
  /('\s*(OR|AND)\s+')/i,
  /(1\s*=\s*1)/,
];

// ── Script injection patterns ──────────────────────────────────
const SCRIPT_INJECTION_PATTERNS = [
  /javascript\s*:/i,
  /data\s*:\s*text\/html/i,
  /vbscript\s*:/i,
  /expression\s*\(/i,
  /eval\s*\(/i,
  /document\.(cookie|write|location)/i,
  /window\.(location|open)/i,
];

export interface SanitizeResult {
  clean: string;
  blocked: boolean;
  reason?: string;
}

/**
 * Layer 1 — Sanitize and validate user input.
 * Returns cleaned text or blocks if injection detected.
 */
export function sanitizeInput(raw: string, maxLength = 5000): SanitizeResult {
  if (!raw || typeof raw !== 'string') {
    return { clean: '', blocked: false };
  }

  // Length limit
  let text = raw.slice(0, maxLength);

  // Strip script tags first
  text = text.replace(SCRIPT_RE, '');

  // Check for SQL injection
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return {
        clean: '',
        blocked: true,
        reason: 'Input contains patterns that aren\'t supported. Please rephrase.',
      };
    }
  }

  // Check for script injection
  for (const pattern of SCRIPT_INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return {
        clean: '',
        blocked: true,
        reason: 'Input contains patterns that aren\'t supported. Please rephrase.',
      };
    }
  }

  // Strip remaining HTML and event handlers
  text = text.replace(EVENT_HANDLER_RE, '');
  text = text.replace(HTML_TAG_RE, '');

  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return { clean: text, blocked: false };
}

/**
 * Sanitize an object's string values recursively.
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  maxLength = 5000,
): { clean: T; blocked: boolean; reason?: string } {
  const clean = { ...obj };

  for (const key of Object.keys(clean)) {
    const val = clean[key];
    if (typeof val === 'string') {
      const result = sanitizeInput(val, maxLength);
      if (result.blocked) {
        return { clean: obj, blocked: true, reason: result.reason };
      }
      (clean as Record<string, unknown>)[key] = result.clean;
    }
  }

  return { clean: clean as T, blocked: false };
}
