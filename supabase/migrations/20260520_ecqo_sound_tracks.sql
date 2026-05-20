-- ============================================================
-- 2026-05-20 — ECQO Sound music library
--
--   1. Storage bucket: ecqo-sound-tracks (public read, audio/mpeg)
--   2. Public read policy on storage.objects for that bucket
--   3. Metadata table: public.ecqo_sound_tracks
--   4. RLS: public SELECT for status='active' rows
--
-- Metadata population happens in a separate SQL block run after the
-- file upload finishes (so the public_url values are valid).
-- ============================================================

-- 1. Bucket. Inserting directly into storage.buckets is the same as
--    creating via Dashboard or Storage API. ON CONFLICT keeps the
--    migration idempotent if the bucket already exists.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ecqo-sound-tracks',
  'ecqo-sound-tracks',
  true,
  52428800,                                  -- 50 MB cap per object
  ARRAY['audio/mpeg']
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Public read policy on storage.objects for this bucket.
--    Drop-and-recreate so the migration is idempotent.
DROP POLICY IF EXISTS "Public read ecqo-sound-tracks" ON storage.objects;
CREATE POLICY "Public read ecqo-sound-tracks"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ecqo-sound-tracks');

-- 3. Metadata table
CREATE TABLE IF NOT EXISTS public.ecqo_sound_tracks (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  genre             text NOT NULL,
  mode              text NOT NULL,
  version           text NOT NULL,
  frequency_hz      text,
  brainwave_state   text,
  emotional_tone    text,
  bpm_range         text,
  duration_seconds  integer,
  storage_path      text NOT NULL,
  public_url        text NOT NULL,
  status            text NOT NULL DEFAULT 'active',
  tier_access       text NOT NULL DEFAULT 'personalized_elite'
                    CHECK (tier_access IN ('collective', 'personalized_elite')),
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (genre, mode, version, frequency_hz)
);

CREATE INDEX IF NOT EXISTS ecqo_sound_tracks_genre_mode_idx ON public.ecqo_sound_tracks(genre, mode);
CREATE INDEX IF NOT EXISTS ecqo_sound_tracks_tier_status_idx ON public.ecqo_sound_tracks(tier_access, status);

ALTER TABLE public.ecqo_sound_tracks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active tracks" ON public.ecqo_sound_tracks;
CREATE POLICY "Public read active tracks"
  ON public.ecqo_sound_tracks FOR SELECT
  USING (status = 'active');

-- 4. Service role can manage rows (matches the producer-pipeline pattern
--    used by track_catalog). Frontend reads through the public SELECT
--    policy above; tier-gating happens in the application layer.
DROP POLICY IF EXISTS "Authenticated manage tracks" ON public.ecqo_sound_tracks;
CREATE POLICY "Authenticated manage tracks"
  ON public.ecqo_sound_tracks FOR ALL
  USING (auth.role() = 'authenticated');
