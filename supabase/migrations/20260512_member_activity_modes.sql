-- 20260512_member_activity_modes.sql
-- Phase 1 v2 EPIC B2: dedicated table for member activity mode preferences.
-- Replaces user_preferences.activity_modes (array column) with proper relational
-- rows so we can soft-toggle modes, audit timestamps, and enforce tier limits at
-- read time.

CREATE TABLE IF NOT EXISTS public.member_activity_modes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mode        text NOT NULL CHECK (mode IN (
                'workout','driving','sleep','morning',
                'deep-work','love-family','abundance','healing'
              )),
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (member_id, mode)
);

CREATE INDEX IF NOT EXISTS member_activity_modes_member_id_idx
  ON public.member_activity_modes (member_id)
  WHERE active = true;

ALTER TABLE public.member_activity_modes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members manage own modes"
  ON public.member_activity_modes
  FOR ALL
  USING (auth.uid() = member_id)
  WITH CHECK (auth.uid() = member_id);
