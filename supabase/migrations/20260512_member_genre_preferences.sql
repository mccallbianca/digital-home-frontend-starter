-- 20260512_member_genre_preferences.sql
-- Phase 1 v2 EPIC B3: dedicated table for member ECQO Sound genre preferences.
-- Mirrors the member_activity_modes pattern: relational rows with active bool
-- so genres can be soft-toggled and rotated without losing history.

CREATE TABLE IF NOT EXISTS public.member_genre_preferences (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  genre       text NOT NULL CHECK (genre IN (
                'hip-hop','rnb','ambient','classical',
                'lo-fi','jazz','gospel','latin'
              )),
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (member_id, genre)
);

CREATE INDEX IF NOT EXISTS member_genre_preferences_member_id_idx
  ON public.member_genre_preferences (member_id)
  WHERE active = true;

ALTER TABLE public.member_genre_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members manage own genres"
  ON public.member_genre_preferences
  FOR ALL
  USING (auth.uid() = member_id)
  WITH CHECK (auth.uid() = member_id);
