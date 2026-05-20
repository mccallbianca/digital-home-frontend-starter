-- ============================================================
-- 2026-05-23 — User Affirmation Rendering Infrastructure (B5.2)
-- Paired with 20260522_affirmation_template_library.sql.
--
-- NOTE on timestamp: spec asked for 20260521, but that prefix already
-- collides with 20260521_ecqo_sound_tracks_seed.sql from PR6. Moving
-- to 20260523 (after B5.1's 20260522). The user_personalized_affirmations
-- FK references affirmation_template_library(id), so ordering matters.
--
-- Adds:
--   1. public.user_identity_anchors
--        Wide-column per-user slot store. One row per user. Holds the
--        actual values that get substituted into template placeholder
--        slots ({self_word_1}, {core_value_1}, etc.) at render time.
--        Includes voice_clone_id + voice_clone_plus_subscriber so
--        Pipeline B knows whether to use Bianca's master voice or the
--        user's cloned voice.
--
--   2. public.user_personalized_affirmations
--        One row per (user, template, month). Holds the rendered
--        script text + the audio URL. voice_source distinguishes
--        bianca master renders from user-cloned renders.
--
--   3. Storage bucket `affirmations-bianca` (PUBLIC read).
--        Holds master Bianca-voice renders. Served to all
--        non-VCP members (Collective/Personalized/Elite).
--        User-personalized renders live in the existing PRIVATE
--        voice-samples bucket (HIPAA-compliant signed URLs).
-- ============================================================


-- ──────────────────────────────────────────────────────────────
-- 1) user_identity_anchors — wide-column slot store
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_identity_anchors (
  id                                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identity slots (filled from onboarding Phase 3 capture).
  -- See src/lib/ecqo/system-prompts.ts PHASE_3 prompts for the
  -- conversational capture sequence.
  self_word_1                       text,
  self_word_2                       text,
  self_word_3                       text,
  core_value_1                      text,
  core_value_2                      text,
  defining_achievement_description  text,
  defining_achievement_language     text,
  aspirational_phrase               text,
  relational_identity               text,

  -- Routing
  cultural_routing                  text CHECK (cultural_routing IN (
                                      'default','black','latino','indigenous','lgbtq',
                                      'neurodivergent','collectivist','athlete'
                                    )),

  -- Voice Clone Plus state
  voice_clone_id                    text,
  voice_clone_plus_subscriber       boolean NOT NULL DEFAULT false,

  captured_at                       timestamptz NOT NULL DEFAULT now(),
  updated_at                        timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_identity_anchors_user
  ON public.user_identity_anchors (user_id);

CREATE INDEX IF NOT EXISTS idx_user_identity_anchors_vcp
  ON public.user_identity_anchors (voice_clone_plus_subscriber)
  WHERE voice_clone_plus_subscriber = true;

ALTER TABLE public.user_identity_anchors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own anchors" ON public.user_identity_anchors;
CREATE POLICY "Users read own anchors"
  ON public.user_identity_anchors FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own anchors" ON public.user_identity_anchors;
CREATE POLICY "Users manage own anchors"
  ON public.user_identity_anchors FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ──────────────────────────────────────────────────────────────
-- 2) user_personalized_affirmations — rendered scripts + audio URLs
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_personalized_affirmations (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id            uuid NOT NULL REFERENCES public.affirmation_template_library(id) ON DELETE CASCADE,

  rendered_script_text   text NOT NULL,
  substituted_slots      jsonb NOT NULL DEFAULT '{}'::jsonb,

  user_audio_url         text,
  audio_storage_path     text,
  voice_source           text NOT NULL DEFAULT 'bianca' CHECK (voice_source IN ('bianca','user_clone')),
  voice_id               text,

  status                 text NOT NULL DEFAULT 'pending_render' CHECK (status IN (
                           'pending_render','rendered','active','expired','failed'
                         )),

  -- Monthly batching: a VCP user gets N personalized scripts per month.
  -- Idempotency = unique (user, template, month).
  generated_for_month    date NOT NULL,

  duration_seconds       int,
  rendered_at            timestamptz,
  error_message          text,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id, template_id, generated_for_month)
);

CREATE INDEX IF NOT EXISTS idx_upa_user_month_status
  ON public.user_personalized_affirmations (user_id, generated_for_month, status);

CREATE INDEX IF NOT EXISTS idx_upa_template
  ON public.user_personalized_affirmations (template_id);

ALTER TABLE public.user_personalized_affirmations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own personalized" ON public.user_personalized_affirmations;
CREATE POLICY "Users read own personalized"
  ON public.user_personalized_affirmations FOR SELECT
  USING (auth.uid() = user_id);

-- All writes happen via service-role during render; no user-level write policy.


-- ──────────────────────────────────────────────────────────────
-- 3) Storage bucket: affirmations-bianca (PUBLIC, master voice)
-- ──────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'affirmations-bianca',
  'affirmations-bianca',
  true,
  10485760,                 -- 10 MB / object
  ARRAY['audio/mpeg']
)
ON CONFLICT (id) DO UPDATE
  SET public             = EXCLUDED.public,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read affirmations-bianca" ON storage.objects;
CREATE POLICY "Public read affirmations-bianca"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'affirmations-bianca');

-- Service role inserts during Pipeline A. No user-level write policy needed.
