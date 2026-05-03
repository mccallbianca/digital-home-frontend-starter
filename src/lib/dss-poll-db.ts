/**
 * DSS 2026 Live Poll — server-only Supabase client helpers.
 *
 * The repository's generated Database type (src/types/database.ts) does
 * not list dss_poll_responses or dss_poll_session_state, by design: the
 * poll is a single-event microsite, and we have not regenerated the
 * full database type. Rather than refactor that 1,400-line file for
 * one event, the poll routes use these intentionally loosely-typed
 * clients. Row shapes are declared in dss-poll-rubric.ts
 * (DssPollResponseRow) and enforced at runtime by the migration's
 * CHECK constraints, so the type relaxation is bounded to query
 * site only.
 *
 * Production note (Cloudflare Workers via OpenNext):
 *   The service-role client is built with createClient from
 *   @supabase/supabase-js directly, mirroring the proven pattern
 *   used by /api/auth/login in this repo. The wrapping
 *   createServerClient from @supabase/ssr that other routes use does
 *   not consistently round-trip through the OpenNext Worker runtime
 *   for service-role calls in this project; the plain client does.
 *   The SSR (cookie-based) client still uses createServerClient
 *   because admin auth.getUser() does work via that path.
 *
 * SERVER-ONLY. The 'server-only' sentinel ensures these helpers never
 * load in a client component.
 */

import "server-only";

import { createClient as createPlainSupabaseClient } from "@supabase/supabase-js";
import { createClient as createSupabaseSsrClient } from "@/lib/supabase/server";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, "public", any>;

/**
 * Service-role client. Bypasses RLS. Used by
 * /api/dss-poll/{submit,score,admin,export,export-emails,send-results,unsubscribe}.
 *
 * Built with the plain @supabase/supabase-js createClient (not the
 * SSR variant) to match the production-proven pattern in
 * /api/auth/login. autoRefreshToken/persistSession are turned off to
 * avoid background work in a Worker request lifecycle.
 */
export function getDssPollAdmin(): AnyClient {
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createPlainSupabaseClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }) as unknown as AnyClient;
}

/** Server-component / route-handler SSR client (uses caller's auth cookies). */
export async function getDssPollSsr(): Promise<AnyClient> {
  const c = await createSupabaseSsrClient();
  return c as unknown as AnyClient;
}
