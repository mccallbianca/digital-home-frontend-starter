/**
 * DSS 2026 Live Poll — admin email allowlist.
 *
 * SERVER-ONLY. The 'server-only' sentinel below ensures this module
 * cannot be imported from a client component.
 *
 * KEEP THIS LIST SYNCHRONIZED with the dss_poll_is_admin() function
 * inside supabase/migrations/20260502_dss_poll_schema.sql. When you
 * add an operator email here, ship a follow-up SQL migration that
 * mirrors the change in the same commit.
 *
 * The /api/dss-poll/admin and /api/dss-poll/export routes call
 * isDssPollAdmin() against the email returned from a Supabase Auth
 * session. The SQL function provides defense-in-depth for direct
 * database access through an authenticated session.
 */

import "server-only";

export const DSS_POLL_ADMIN_EMAILS: readonly string[] = [
  "mccall.bianca@gmail.com",
  // Add tech operator email here before May 20, 2026 and ship the
  // matching SQL migration to update dss_poll_is_admin().
];

const ALLOWLIST_LOWER = new Set(
  DSS_POLL_ADMIN_EMAILS.map((e) => e.toLowerCase())
);

export function isDssPollAdmin(
  email: string | null | undefined
): boolean {
  if (!email) return false;
  return ALLOWLIST_LOWER.has(email.toLowerCase());
}
