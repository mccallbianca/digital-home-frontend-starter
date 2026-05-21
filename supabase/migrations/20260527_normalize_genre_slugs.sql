-- ============================================================
-- 2026-05-26 — Normalize member_genre_preferences slugs (FIX-1 A3)
--
-- The dashboard /dashboard/genres client used to write hyphenated
-- slugs ('hip-hop','lo-fi') while ecqo_sound_tracks.genre uses the
-- joined form ('hiphop','lofi'). This broke the join — members
-- saved a preference that never matched a track.
--
-- The original migration (archived: 20260512_member_genre_preferences.sql)
-- gated genre via CHECK to the hyphenated 8-genre set and omitted
-- reggae. We:
--   1. Drop the old CHECK so the UPDATE doesn't trip it
--   2. Normalize hip-hop → hiphop, lo-fi → lofi
--   3. Add the new CHECK with the joined 9-genre set (incl. reggae)
--      matching ecqo_sound_tracks
--
-- Idempotent: WHERE clauses no-op if rows already use normalized slugs;
-- CHECK constraint is dropped IF EXISTS before recreation.
-- ============================================================

ALTER TABLE public.member_genre_preferences
  DROP CONSTRAINT IF EXISTS member_genre_preferences_genre_check;

UPDATE public.member_genre_preferences
   SET genre = 'hiphop'
 WHERE genre = 'hip-hop';

UPDATE public.member_genre_preferences
   SET genre = 'lofi'
 WHERE genre = 'lo-fi';

ALTER TABLE public.member_genre_preferences
  ADD CONSTRAINT member_genre_preferences_genre_check
  CHECK (genre IN (
    'hiphop','rnb','ambient','classical',
    'lofi','jazz','gospel','latin','reggae'
  ));
