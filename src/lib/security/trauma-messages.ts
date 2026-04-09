/**
 * ECQO Security Layer — Trauma-Informed Security UX (PART 8)
 *
 * Warm, non-punitive error messages following SAMHSA guidelines.
 * Never uses: "Invalid", "Forbidden", "Unauthorized", "Error", "Failed"
 *
 * Color standards:
 * - HERR Light (#E8388A) — warnings/gentle friction
 * - ECQO Violet (#2D2561) — lockouts/security holds
 * - Assurance Cobalt (#1A3A8F) — success/confirmation
 * - Never harsh red
 */

export const TRAUMA_MESSAGES = {
  // ── Login ───────────────────────────────────────────────────
  loginFailed:
    'We couldn\'t find a match for those credentials. Take a moment and try again.',
  loginLocked:
    'Your account is taking a brief pause for safety. You can try again in 15 minutes. If this wasn\'t you, check your email.',
  loginLockedEmail:
    'We noticed multiple sign-in attempts on your HERR account. For your safety, we\'ve paused access for 15 minutes. If this wasn\'t you, please reset your password.',

  // ── Session ─────────────────────────────────────────────────
  sessionExpired:
    'Your session has ended. Sign in again to continue your journey.',
  sessionRequired:
    'Let\'s get you signed in first so we can continue.',

  // ── Rate Limiting ───────────────────────────────────────────
  rateLimited:
    'You\'re moving a little fast. Take a breath and try again in a moment.',
  rateLimitedPost:
    'Let\'s slow down to give your thoughts space. You can post again shortly.',
  rateLimitedDm:
    'Take a pause — you can send another message shortly.',

  // ── Input Blocked ───────────────────────────────────────────
  inputBlocked:
    'Something in your message couldn\'t be processed. Please try rephrasing.',

  // ── Access ──────────────────────────────────────────────────
  accessDenied:
    'This area isn\'t available right now. Let\'s get you back on track.',
  adminOnly:
    'This space is reserved for the HERR team.',

  // ── Password ────────────────────────────────────────────────
  passwordStrength: {
    developing: 'Developing — keep building',
    growing: 'Growing — getting stronger',
    strong: 'Strong — well protected',
  },

  // ── Reset ───────────────────────────────────────────────────
  resetSent:
    'If that email is in our system, a reset link is on its way. Check your inbox.',
  resetExpired:
    'That link has expired. No worries — request a new one.',

  // ── Community ───────────────────────────────────────────────
  postFlagged:
    'This post has been flagged for review. Our team will take a look.',
  contentWarning:
    'Thank you for sharing. If you\'re going through something difficult right now, support is available.',

  // ── General ─────────────────────────────────────────────────
  genericError:
    'Something didn\'t work as expected. Let\'s try again.',
  maintenance:
    'We\'re making things better behind the scenes. Back shortly.',
} as const;

/**
 * Trauma-informed color palette for security states.
 */
export const SECURITY_COLORS = {
  warning: '#E8388A',    // HERR Light — gentle friction
  lockout: '#2D2561',    // ECQO Violet — security holds
  success: '#1A3A8F',    // Assurance Cobalt — confirmations
  muted: '#6b6b8a',      // HERR Muted — informational
} as const;
