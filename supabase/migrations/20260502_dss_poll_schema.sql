-- =====================================================================
-- DSS 2026 Live Poll Schema — May 2, 2026
-- Tables:    dss_poll_responses, dss_poll_session_state
-- Helpers:   dss_poll_is_admin(), dss_poll_touch_updated_at()
-- Purpose:   Anonymous live audience poll for the DSS Annual Conference
--            2026 keynote on May 27, 2026. Captures Likert votes for
--            five questions; the seven existential domain scores and
--            the severity tier are derived server-side only.
-- Privacy:   No PII, no IP, no user agent. Anonymous by design.
-- =====================================================================

-- 1. Responses table ---------------------------------------------------

CREATE TABLE IF NOT EXISTS dss_poll_responses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  TEXT NOT NULL DEFAULT 'dss_2026_main',
  q1_value    SMALLINT NOT NULL CHECK (q1_value BETWEEN 0 AND 4),
  q2_value    SMALLINT NOT NULL CHECK (q2_value BETWEEN 0 AND 4),
  q3_value    SMALLINT NOT NULL CHECK (q3_value BETWEEN 0 AND 4),
  q4_value    SMALLINT NOT NULL CHECK (q4_value BETWEEN 0 AND 4),
  q5_value    SMALLINT NOT NULL CHECK (q5_value BETWEEN 0 AND 4),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dss_poll_responses_session_created
  ON dss_poll_responses (session_id, created_at DESC);

ALTER TABLE dss_poll_responses ENABLE ROW LEVEL SECURITY;

-- Anonymous (and authenticated) clients may submit a vote.
-- Reads are denied at the row-level: only the service_role used by
-- /api/dss-poll/score is allowed to aggregate, and the public
-- /results dashboard only ever reads aggregated scores from that API,
-- never the raw rows.
DROP POLICY IF EXISTS "dss_poll_responses_anon_insert" ON dss_poll_responses;
CREATE POLICY "dss_poll_responses_anon_insert"
  ON dss_poll_responses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Explicit no-read policy is unnecessary: with RLS enabled and no
-- SELECT policy granted to anon/authenticated, the database denies
-- direct reads from those roles by default. The service_role key
-- bypasses RLS, which is what server-side scoring uses.

-- 2. Session state table -----------------------------------------------

CREATE TABLE IF NOT EXISTS dss_poll_session_state (
  session_id        TEXT PRIMARY KEY,
  voting_open       BOOLEAN NOT NULL DEFAULT TRUE,
  reveal_triggered  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO dss_poll_session_state (session_id)
VALUES ('dss_2026_main')
ON CONFLICT (session_id) DO NOTHING;

ALTER TABLE dss_poll_session_state ENABLE ROW LEVEL SECURITY;

-- Public can read session state so the /results dashboard can listen
-- for voting_open and reveal_triggered changes via Supabase Realtime.
DROP POLICY IF EXISTS "dss_poll_session_state_public_read" ON dss_poll_session_state;
CREATE POLICY "dss_poll_session_state_public_read"
  ON dss_poll_session_state
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 3. Admin gate function -----------------------------------------------
-- Single SQL source of truth for the admin email allowlist used by
-- the session_state UPDATE policy. KEEP THIS LIST SYNCHRONIZED with
-- src/lib/dss-poll-admin.ts. To add the operator email before May 20,
-- ship a follow-up migration that replaces this function body.

CREATE OR REPLACE FUNCTION dss_poll_is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT (auth.jwt() ->> 'email') IN (
    'mccall.bianca@gmail.com'
  );
$$;

DROP POLICY IF EXISTS "dss_poll_session_state_admin_update" ON dss_poll_session_state;
CREATE POLICY "dss_poll_session_state_admin_update"
  ON dss_poll_session_state
  FOR UPDATE
  TO authenticated
  USING (dss_poll_is_admin())
  WITH CHECK (dss_poll_is_admin());

-- 4. updated_at maintenance --------------------------------------------

CREATE OR REPLACE FUNCTION dss_poll_touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_dss_poll_session_state_touch ON dss_poll_session_state;
CREATE TRIGGER trg_dss_poll_session_state_touch
  BEFORE UPDATE ON dss_poll_session_state
  FOR EACH ROW
  EXECUTE FUNCTION dss_poll_touch_updated_at();

-- 5. Realtime publication ----------------------------------------------
-- Insert events on dss_poll_responses drive the live results dashboard
-- (response counter and incremental aggregation triggers).
-- Update events on dss_poll_session_state drive reveal/close toggles.
-- REPLICA IDENTITY FULL on session_state so UPDATE payloads include
-- the previous row, which Realtime needs for change detection.

ALTER TABLE dss_poll_session_state REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname    = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename  = 'dss_poll_responses'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE dss_poll_responses;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname    = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename  = 'dss_poll_session_state'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE dss_poll_session_state;
  END IF;
END $$;

-- =====================================================================
-- End of migration
-- =====================================================================
