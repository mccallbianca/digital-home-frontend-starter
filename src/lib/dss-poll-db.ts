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
 * SERVER-ONLY. The 'server-only' sentinel ensures these helpers never
 * load in a client component.
 */

import "server-only";

import {
  createAdminClient as createSupabaseAdminClient,
  createClient as createSupabaseSsrClient,
} from "@/lib/supabase/server";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, "public", any>;

/** Service-role client. Bypasses RLS. Used by /api/dss-poll/{submit,score,admin,export}. */
export function getDssPollAdmin(): AnyClient {
  return createSupabaseAdminClient() as unknown as AnyClient;
}

/** Server-component / route-handler SSR client (uses caller's auth cookies). */
export async function getDssPollSsr(): Promise<AnyClient> {
  const c = await createSupabaseSsrClient();
  return c as unknown as AnyClient;
}
