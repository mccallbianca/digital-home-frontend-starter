-- ============================================
-- ECQO Sound Migration — April 8, 2026
-- Tables: producer_applications, moment_for_music,
--         blist_waitlist, track_catalog
-- ============================================

-- 1. Producer Applications Table
CREATE TABLE IF NOT EXISTS producer_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  stage_name TEXT NOT NULL,
  email TEXT NOT NULL,
  genre_specialties TEXT[] NOT NULL DEFAULT '{}',
  portfolio_url TEXT NOT NULL,
  sample_track_url TEXT,
  statement TEXT NOT NULL,
  originality_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_producer_applications_status ON producer_applications(status);
CREATE INDEX IF NOT EXISTS idx_producer_applications_created ON producer_applications(created_at DESC);

ALTER TABLE producer_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a producer application"
  ON producer_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can view applications"
  ON producer_applications FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update applications"
  ON producer_applications FOR UPDATE
  USING (auth.role() = 'authenticated');

-- 2. Moment for Music (CMS table for video content)
CREATE TABLE IF NOT EXISTS moment_for_music (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producer_name TEXT NOT NULL,
  track_name TEXT NOT NULL,
  genre TEXT NOT NULL,
  activity_mode TEXT NOT NULL,
  caption TEXT NOT NULL,
  video_url TEXT,
  thumbnail_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE moment_for_music ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published moments"
  ON moment_for_music FOR SELECT
  USING (is_published = true);

CREATE POLICY "Authenticated users can manage moments"
  ON moment_for_music FOR ALL
  USING (auth.role() = 'authenticated');

-- Seed placeholder entries
INSERT INTO moment_for_music (producer_name, track_name, genre, activity_mode, caption, is_published, display_order)
VALUES
  ('Lead Producer', 'Untitled', 'Gospel', 'Healing', 'Why I left the bass open.', true, 1),
  ('Lead Producer', 'Untitled', 'Hip Hop', 'Workout', 'Building the track that makes you feel unstoppable.', true, 2),
  ('Lead Producer', 'Untitled', 'Latin', 'Morning', 'The guitar tone that feels like a fresh start.', true, 3);

-- 3. B-LIST Waitlist
CREATE TABLE IF NOT EXISTS blist_waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE blist_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join the waitlist"
  ON blist_waitlist FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view waitlist"
  ON blist_waitlist FOR SELECT
  USING (auth.role() = 'authenticated');

-- 4. Track Catalog (Phase 2 — schema only)
CREATE TABLE IF NOT EXISTS track_catalog (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  genre TEXT NOT NULL,
  activity_mode TEXT NOT NULL,
  clinical_level INT NOT NULL DEFAULT 1 CHECK (clinical_level IN (1, 2, 3)),
  clinical_label TEXT NOT NULL DEFAULT 'Mild' CHECK (clinical_label IN ('Mild', 'Moderate', 'Therapeutic')),
  title TEXT,
  producer_id UUID REFERENCES producer_applications(id),
  audio_url TEXT,
  stem_url TEXT,
  bpm INT,
  duration_seconds INT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(genre, activity_mode, clinical_level)
);

ALTER TABLE track_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published tracks"
  ON track_catalog FOR SELECT
  USING (is_published = true);

CREATE POLICY "Authenticated users can manage tracks"
  ON track_catalog FOR ALL
  USING (auth.role() = 'authenticated');

-- 5. Storage bucket for producer samples
-- NOTE: Create via Supabase dashboard or client SDK:
-- Bucket: 'producer-samples'
-- File size limit: 52428800 (50MB)
-- Allowed MIME: audio/wav, audio/mpeg, audio/flac, audio/x-wav
-- Public: false
