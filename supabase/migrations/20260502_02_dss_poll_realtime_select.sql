-- =====================================================================
-- DSS 2026 Live Poll — Realtime SELECT policy for anon
-- Follow-up to 20260502_dss_poll_schema.sql, May 2, 2026
--
-- Why this exists:
--   Supabase Realtime postgres_changes events filter through Row Level
--   Security. Subscribers receive change events only for rows they
--   would be allowed to SELECT. The base migration deliberately
--   denied anon SELECT on dss_poll_responses to keep raw votes from
--   being read directly by the public via PostgREST. That privacy
--   stance was sound but it also silently dropped every INSERT
--   broadcast to the live /dss-poll/results dashboard, which
--   subscribes through the anon key. Without an anon SELECT policy,
--   the response counter never updates in real time.
--
-- Privacy stance preserved:
--   This table holds only Likert values (q1_value..q5_value), the
--   session_id, an opaque uuid, and a server-generated timestamp.
--   No PII, no IP, no user agent, no user_id reference, no joinable
--   data. Granting anon SELECT exposes no identifying information.
--
-- Tradeoff acknowledged:
--   A motivated viewer who tails Realtime across many inserts could
--   in principle infer the rubric weights from observed score
--   movements over time. For a single-event microsite at the DSS
--   2026 keynote, the operational benefit of a live counter that
--   updates within ~200 ms of a submit outweighs that theoretical
--   rubric-leak risk. The aggregating /api/dss-poll/score endpoint
--   continues to gate the tier reveal on the reveal_triggered flag
--   plus an auto-reveal threshold, so tier metadata is still hidden
--   from the client until the speaker chooses to reveal.
-- =====================================================================

DROP POLICY IF EXISTS "dss_poll_responses_anon_realtime_read"
  ON dss_poll_responses;

CREATE POLICY "dss_poll_responses_anon_realtime_read"
  ON dss_poll_responses
  FOR SELECT
  TO anon, authenticated
  USING (true);
