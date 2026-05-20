-- ============================================================
-- 2026-05-24 — User Daily Deliveries (B5.3)
--
-- Daily 3-layer audio delivery per active member:
--   layer 1: ECQO Sound music track (genre × mode)
--   layer 2: Solfeggio frequency sine (Hz determined by week-of-month
--            frequency tier)
--   layer 3: ARAI affirmation (Bianca master OR user-cloned voice),
--            mixed subliminal at -20 to -30 dB
--
-- NOTE on timestamp: spec asked for 20260521, but that prefix already
-- collides with 20260521_ecqo_sound_tracks_seed.sql (PR6). The B5.1
-- + B5.2 migrations also bumped forward (20260522, 20260523) for the
-- same reason. Using 20260524 to keep the sequence monotonic.
--
-- Sources of truth this migration depends on (must exist already):
--   - public.affirmation_template_library (B5.1, 20260522)
--   - public.ecqo_sound_tracks            (PR6, 20260520)
--   - public.user_personalized_affirmations (B5.2, 20260523)
--   - public.profiles                     (20260403)
-- ============================================================


-- ──────────────────────────────────────────────────────────────
-- 1) user_daily_deliveries — one row per (user, date, mode)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_daily_deliveries (
  id                            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delivery_date                 date NOT NULL,
  activity_mode                 text NOT NULL,

  -- Selection inputs (kept for debugging + analytics)
  template_id                   uuid NOT NULL REFERENCES public.affirmation_template_library(id),
  music_track_id                uuid REFERENCES public.ecqo_sound_tracks(id),
  solfeggio_hz                  int[] NOT NULL,
  week_of_month                 int  NOT NULL CHECK (week_of_month BETWEEN 1 AND 4),
  frequency_tier                text NOT NULL CHECK (frequency_tier IN ('low','median','high')),
  existential_domain_targeted   text NOT NULL,
  risk_tier                     text NOT NULL CHECK (risk_tier IN ('low_concern','moderate_unease','elevated_disruption')),
  cultural_routing              text NOT NULL DEFAULT 'default',

  -- Source URLs the mixer reads from
  user_audio_url                text NOT NULL,
  voice_source                  text NOT NULL CHECK (voice_source IN ('bianca','user_clone')),
  music_url                     text NOT NULL,

  -- Final mix
  final_mix_url                 text,
  final_mix_storage_path        text,
  target_length_seconds         int  NOT NULL,

  status                        text NOT NULL DEFAULT 'queued' CHECK (status IN (
                                  'queued','mixing','ready','delivered','failed'
                                )),
  delivered_at                  timestamptz,
  user_listened_at              timestamptz,
  user_listen_duration_seconds  int,
  error_message                 text,

  created_at                    timestamptz NOT NULL DEFAULT now(),
  updated_at                    timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id, delivery_date, activity_mode)
);

CREATE INDEX IF NOT EXISTS idx_daily_deliveries_user_date_status
  ON public.user_daily_deliveries (user_id, delivery_date, status);

CREATE INDEX IF NOT EXISTS idx_daily_deliveries_status_queued
  ON public.user_daily_deliveries (status, created_at)
  WHERE status IN ('queued','mixing','failed');

ALTER TABLE public.user_daily_deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own deliveries" ON public.user_daily_deliveries;
CREATE POLICY "Users read own deliveries"
  ON public.user_daily_deliveries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own deliveries listen-state" ON public.user_daily_deliveries;
CREATE POLICY "Users update own deliveries listen-state"
  ON public.user_daily_deliveries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role inserts (cron) — no user insert policy.


-- ──────────────────────────────────────────────────────────────
-- 2) Storage bucket: affirmations-daily-mixes (PRIVATE)
--    Per-user mixes carry their identity-anchor affirmation (PHI),
--    so this stays private + signed-URL only, matching the
--    voice-samples bucket pattern from B5.2.
-- ──────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'affirmations-daily-mixes',
  'affirmations-daily-mixes',
  false,
  52428800,                 -- 50 MB / object (30-min @ 192kbps stereo ≈ 43 MB).
                            -- Supabase project plan caps per-file at 50 MB; we
                            -- ship 192 kbps so this fits comfortably. Music is
                            -- ambient + Solfeggio sine + subliminal voice — no
                            -- audible benefit from 320 kbps for this material.
  ARRAY['audio/mpeg']
)
ON CONFLICT (id) DO UPDATE
  SET public             = EXCLUDED.public,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Users read own daily-mix objects" ON storage.objects;
CREATE POLICY "Users read own daily-mix objects"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'affirmations-daily-mixes'
    AND (auth.uid()::text = (storage.foldername(name))[1])
  );

-- Service-role writes (cron + mixer) bypass RLS, so no insert policy needed.
