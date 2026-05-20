-- =====================================================================
-- DSS 2026 Live Poll — Email opt-in for personal results
-- Follow-up to 20260502_dss_poll_schema.sql and
-- 20260502_02_dss_poll_realtime_select.sql, May 2, 2026
--
-- Purpose:
--   The /dss-poll Thank You screen offers each voter the option to
--   receive their personal seven-domain breakdown by email. Two
--   independent consent flags travel with the email:
--     segment_results_only - the implicit consent to receive THIS
--                            transactional email only.
--     segment_engaged_list - the explicit opt-in to ongoing updates
--                            on Bianca's clinical AI work.
--
-- Privacy posture:
--   Email is the ONLY potentially identifying field on the row. The
--   consent_timestamp records when the voter authorized us to send
--   the transactional email. ip_country is optional and used only
--   for jurisdictional unsubscribe handling; it is NOT a full IP
--   address. unsubscribed_at is set by the /api/dss-poll/unsubscribe
--   route via the service_role key.
--
-- Realtime stance:
--   This table is DELIBERATELY NOT added to the supabase_realtime
--   publication. Email data must never stream to any dashboard, even
--   the admin console.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.dss_poll_email_opt_ins (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id           UUID NOT NULL REFERENCES public.dss_poll_responses(id) ON DELETE CASCADE,
  email                 TEXT NOT NULL,
  segment_results_only  BOOLEAN NOT NULL DEFAULT TRUE,
  segment_engaged_list  BOOLEAN NOT NULL DEFAULT FALSE,
  consent_timestamp     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_country            TEXT,
  unsubscribed_at       TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS dss_poll_email_opt_ins_email_idx
  ON public.dss_poll_email_opt_ins (email);

CREATE INDEX IF NOT EXISTS dss_poll_email_opt_ins_response_idx
  ON public.dss_poll_email_opt_ins (response_id);

ALTER TABLE public.dss_poll_email_opt_ins ENABLE ROW LEVEL SECURITY;

-- 1. Anon insert: voters submit the opt-in form via the public route.
--    The route validates input before writing, but we permit the
--    underlying anon role to insert here for completeness.
DROP POLICY IF EXISTS "dss_poll_email_opt_ins_anon_insert"
  ON public.dss_poll_email_opt_ins;
CREATE POLICY "dss_poll_email_opt_ins_anon_insert"
  ON public.dss_poll_email_opt_ins
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 2. Admin select: only admin emails (per dss_poll_is_admin) may read
--    the opt-ins table. Used by the Export Email Opt-ins CSV button.
DROP POLICY IF EXISTS "dss_poll_email_opt_ins_admin_select"
  ON public.dss_poll_email_opt_ins;
CREATE POLICY "dss_poll_email_opt_ins_admin_select"
  ON public.dss_poll_email_opt_ins
  FOR SELECT
  TO authenticated
  USING (dss_poll_is_admin());

-- 3. Admin update: defense in depth. The unsubscribe route uses the
--    service_role key (which bypasses RLS), but if an authenticated
--    admin email ever needs to mark unsubscribed manually they can.
DROP POLICY IF EXISTS "dss_poll_email_opt_ins_admin_update"
  ON public.dss_poll_email_opt_ins;
CREATE POLICY "dss_poll_email_opt_ins_admin_update"
  ON public.dss_poll_email_opt_ins
  FOR UPDATE
  TO authenticated
  USING (dss_poll_is_admin())
  WITH CHECK (dss_poll_is_admin());

-- 4. No DELETE policy. Service_role can hard-delete if ever required;
--    routine flow uses unsubscribed_at as a soft-delete sentinel.

-- Realtime publication: explicitly NOT added. Do not run an
-- ALTER PUBLICATION ... ADD TABLE for this table. Email data does not
-- stream to any client surface.

-- =====================================================================
-- End of migration
-- =====================================================================
