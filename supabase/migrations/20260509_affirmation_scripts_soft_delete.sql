-- 20260509_affirmation_scripts_soft_delete.sql
-- Phase 1: soft-delete pattern for affirmation_scripts.
-- Adds deleted_at column and soft-deletes the 3 May 7 demo seed rows
-- (whose activity_mode values used a non-production "card-type" taxonomy).

ALTER TABLE public.affirmation_scripts
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS affirmation_scripts_deleted_at_idx
  ON public.affirmation_scripts (deleted_at)
  WHERE deleted_at IS NULL;

UPDATE public.affirmation_scripts
   SET deleted_at = NOW()
 WHERE member_id = 'bb65cadf-baa7-4846-b8ca-d9ab7d6399eb'
   AND activity_mode IN ('voice-only', 'frequency', 'ecqo-sound-healing')
   AND deleted_at IS NULL;
