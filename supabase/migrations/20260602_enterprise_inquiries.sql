-- ============================================================
-- 2026-06-02 — enterprise_inquiries (B2B/B2G lead capture)
--
-- Receives form submissions from /enterprise and /enterprise/sports.
-- Resend mirrors each row to mccall.bianca@gmail.com for live triage.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.enterprise_inquiries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  email         text NOT NULL,
  organization  text NOT NULL,
  org_type      text NOT NULL CHECK (org_type IN (
                  'healthcare','behavioral_health','sports','education','government','other'
                )),
  message       text NOT NULL,
  source        text NOT NULL DEFAULT 'enterprise_page',
  status        text NOT NULL DEFAULT 'new' CHECK (status IN (
                  'new','contacted','qualified','closed'
                )),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_enterprise_inquiries_status
  ON public.enterprise_inquiries (status, created_at DESC);

ALTER TABLE public.enterprise_inquiries ENABLE ROW LEVEL SECURITY;

-- No public policies — only service-role writes (via /api/enterprise/inquiry)
-- and admin reads via the operator dashboard (future). Anonymous form
-- submissions hit the API route, which holds the service-role key.
