/**
 * ECQO Security Layer — Security Headers (PART 5)
 *
 * Applies security headers to responses:
 * - X-Frame-Options: DENY
 * - X-Content-Type-Options: nosniff
 * - Strict-Transport-Security (HSTS)
 * - Content-Security-Policy
 * - Referrer-Policy
 * - Permissions-Policy
 */

export const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.hcaptcha.com https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://*.supabase.co https://uyhfdtrvlhdhrhniysvw.supabase.co",
    "connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.resend.com https://api.hcaptcha.com https://api.elevenlabs.io",
    "frame-src https://js.hcaptcha.com https://challenges.cloudflare.com https://js.stripe.com",
    "media-src 'self' blob: https://*.supabase.co",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; '),
};

/**
 * Apply security headers to a NextResponse.
 */
export function applySecurityHeaders(response: Response): Response {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}
