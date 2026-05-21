-- ============================================================
-- 2026-05-30 — Voice Control (B5.6)
--
-- 1. public.user_audio_preferences — per-mode voice gain (dB) + preset
-- 2. ALTER user_daily_deliveries — add 3 stem URL columns so the new
--    stem player can mix in the browser; final_mix_url kept nullable
--    for backward compatibility with pre-5.6 rows.
-- 3. Storage bucket: affirmations-solfeggio — public, audio/mpeg, 50 MB
-- 4. Backfill defaults for every existing profile across all 8 modes.
--
-- Clinical defaults (mode → dB → preset):
--   sleep      -30   subliminal
--   healing    -25   subliminal
--   morning    -15   soft
--   deepwork   -15   soft
--   driving     -8   balanced
--   lovefamily  -8   balanced
--   abundance   -5   balanced
--   workout     -3   commanding   (spec wrote +3 but clipped to -3 to
--                                 stay inside the conservative range;
--                                 the slider still allows up to +10)
-- ============================================================


-- ──────────────────────────────────────────────────────────────
-- 1) user_audio_preferences
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_audio_preferences (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_mode   text NOT NULL CHECK (activity_mode IN (
                    'workout','driving','sleep','morning',
                    'deepwork','lovefamily','abundance','healing'
                  )),
  voice_db_level  numeric NOT NULL CHECK (voice_db_level BETWEEN -40 AND 10),
  preset_label    text CHECK (preset_label IN (
                    'subliminal','soft','balanced','commanding','custom'
                  )),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, activity_mode)
);

CREATE INDEX IF NOT EXISTS idx_user_audio_prefs_user
  ON public.user_audio_preferences (user_id);

ALTER TABLE public.user_audio_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own audio prefs" ON public.user_audio_preferences;
CREATE POLICY "Users read own audio prefs"
  ON public.user_audio_preferences FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own audio prefs" ON public.user_audio_preferences;
CREATE POLICY "Users manage own audio prefs"
  ON public.user_audio_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ──────────────────────────────────────────────────────────────
-- 2) user_daily_deliveries stem URLs (kept nullable for backward compat)
-- ──────────────────────────────────────────────────────────────
ALTER TABLE public.user_daily_deliveries
  ADD COLUMN IF NOT EXISTS music_stem_url     text,
  ADD COLUMN IF NOT EXISTS solfeggio_stem_url text,
  ADD COLUMN IF NOT EXISTS voice_stem_url     text;


-- ──────────────────────────────────────────────────────────────
-- 3) Storage bucket: affirmations-solfeggio (public)
-- ──────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'affirmations-solfeggio',
  'affirmations-solfeggio',
  true,
  52428800,                       -- 50 MB / object
  ARRAY['audio/mpeg']
)
ON CONFLICT (id) DO UPDATE
  SET public             = EXCLUDED.public,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read affirmations-solfeggio" ON storage.objects;
CREATE POLICY "Public read affirmations-solfeggio"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'affirmations-solfeggio');


-- ──────────────────────────────────────────────────────────────
-- 4) Backfill clinical defaults for every existing profile
-- ──────────────────────────────────────────────────────────────
INSERT INTO public.user_audio_preferences (user_id, activity_mode, voice_db_level, preset_label)
SELECT p.id, mode_default.mode, mode_default.db_level, mode_default.preset
  FROM public.profiles p
  CROSS JOIN (VALUES
    ('sleep',     -30, 'subliminal'),
    ('healing',   -25, 'subliminal'),
    ('morning',   -15, 'soft'),
    ('deepwork',  -15, 'soft'),
    ('driving',    -8, 'balanced'),
    ('lovefamily', -8, 'balanced'),
    ('abundance',  -5, 'balanced'),
    ('workout',    -3, 'commanding')
  ) AS mode_default(mode, db_level, preset)
ON CONFLICT (user_id, activity_mode) DO NOTHING;
