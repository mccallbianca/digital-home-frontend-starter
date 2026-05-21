-- ============================================================
-- 2026-05-31 — affirmation_template_library: content_review_required
--
-- Adds a new status value + a notes column so we can quarantine
-- rendered templates whose TEXT is wrong (even if the audio rendered
-- cleanly). Content quality is independent of voice quality.
--
-- Trigger: on 2026-05-20 Bianca listened back to Pipeline A's 336
-- rendered templates and flagged them as clinically too abstract.
-- Audio is fine; the words are not in her voice. We mark them so
-- the daily-delivery cron never picks them up.
-- ============================================================

ALTER TABLE public.affirmation_template_library
  DROP CONSTRAINT IF EXISTS affirmation_template_library_status_check;

ALTER TABLE public.affirmation_template_library
  ADD CONSTRAINT affirmation_template_library_status_check
  CHECK (status IN (
    'pending_voice',
    'voice_rendered',
    'active',
    'archived',
    'flagged_review',
    'content_review_required'  -- NEW: text quality flag, audio may still be valid
  ));

ALTER TABLE public.affirmation_template_library
  ADD COLUMN IF NOT EXISTS notes text;

CREATE INDEX IF NOT EXISTS idx_template_content_review
  ON public.affirmation_template_library (status)
  WHERE status = 'content_review_required';
