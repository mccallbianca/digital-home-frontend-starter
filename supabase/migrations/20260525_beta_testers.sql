-- ============================================================
-- 2026-05-25 — beta_testers invite + welcome tracking (B5.4)
--
-- Distinct from:
--   - profiles.is_tester              → tester who has SIGNED UP
--   - beta_tester_reports             → bug reports from active testers
--
-- beta_testers is the *pre-signup* invite list. Bianca adds emails
-- via /admin/wave-1, the wave 1 batch hits Resend, and the table
-- tracks who got the welcome / who converted.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.beta_testers (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email                   text NOT NULL UNIQUE,
  full_name               text,
  signup_source           text,        -- e.g. 'manual','interest_form','partner'
  invited_at              timestamptz,
  welcome_email_sent_at   timestamptz,
  signed_up_at            timestamptz,
  status                  text NOT NULL DEFAULT 'invited' CHECK (status IN (
                            'invited','welcomed','signed_up','active','churned'
                          )),
  notes                   text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_beta_testers_status
  ON public.beta_testers (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_beta_testers_welcome_null
  ON public.beta_testers (id)
  WHERE welcome_email_sent_at IS NULL;

ALTER TABLE public.beta_testers ENABLE ROW LEVEL SECURITY;

-- Admin reads + writes only — service role bypasses RLS so the API
-- routes work; we deliberately don't grant authenticated SELECT.
DROP POLICY IF EXISTS "Admin read beta_testers" ON public.beta_testers;
CREATE POLICY "Admin read beta_testers"
  ON public.beta_testers FOR SELECT
  USING (
    auth.jwt() ->> 'email' IN (
      'bianca@h3rr.com', 'bdmccall@gmail.com', 'mccall.bianca@gmail.com'
    )
  );

-- Updated-at trigger reuses the project's set_updated_at() function
-- created in 20260401_members.sql.
DROP TRIGGER IF EXISTS beta_testers_updated_at ON public.beta_testers;
CREATE TRIGGER beta_testers_updated_at
  BEFORE UPDATE ON public.beta_testers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
