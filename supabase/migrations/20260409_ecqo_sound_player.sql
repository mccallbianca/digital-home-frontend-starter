-- ============================================================
-- ECQO Sound Player — Add genre_preference + Storage bucket
-- Run in Supabase SQL Editor
-- SAFE: Uses IF NOT EXISTS / DO $$ checks
-- ============================================================

-- Add genre_preference to user_preferences if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='user_preferences' AND column_name='genre_preference'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN genre_preference TEXT DEFAULT 'Hip Hop';
  END IF;
END $$;

-- Ensure voice-samples storage bucket exists (for affirmation audio)
-- NOTE: Run this via Supabase dashboard or API — SQL cannot create storage buckets.
-- Bucket name: voice-samples
-- Public: true
-- File size limit: 50MB
-- Allowed MIME types: audio/mpeg, audio/wav, audio/ogg
