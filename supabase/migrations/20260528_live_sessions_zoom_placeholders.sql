-- ============================================================
-- 2026-05-26 — live_sessions Zoom placeholders + host_notes (FIX-1 A11)
--
-- The 5 seeded monthly sessions (June-October 2026) shipped without
-- Zoom URLs. Rather than leaving NULL fields the dashboard has to
-- check for, we mark them with a clear PLACEHOLDER token so:
--   1. The dashboard UI can render "Zoom link coming soon" copy.
--   2. The admin UI at /admin/live-sessions shows them as
--      needs-attention.
--   3. Filtering for `NOT LIKE 'PLACEHOLDER%'` finds real Zoom URLs.
--
-- Bianca uses Zoom (her email + this project's existing live-sessions
-- spec all point at Zoom). She must replace the placeholders before
-- each session via /admin/live-sessions.
-- ============================================================

ALTER TABLE public.live_sessions
  ADD COLUMN IF NOT EXISTS host_notes text;

UPDATE public.live_sessions
   SET zoom_join_url   = 'https://zoom.us/j/PLACEHOLDER_REPLACE_WITH_REAL_URL',
       zoom_meeting_id = 'PLACEHOLDER_TO_REPLACE',
       host_notes      = 'Bianca must replace with real Zoom URL before this session'
 WHERE zoom_join_url IS NULL
    OR zoom_meeting_id IS NULL;
