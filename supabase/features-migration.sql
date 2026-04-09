-- ============================================================
-- HERR Full Feature Build — Database Migration
-- Run in Supabase SQL Editor
-- SAFE: Uses IF NOT EXISTS / DO $$ checks — will not drop
-- or alter any existing columns.
-- ============================================================

-- ════════════════════════════════════════════════════════════
-- PART 0 — Extend existing tables (add columns if missing)
-- ════════════════════════════════════════════════════════════

-- content_objects: add peer_review_thread_id if missing
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='content_objects' AND column_name='peer_review_thread_id') THEN
    ALTER TABLE content_objects ADD COLUMN peer_review_thread_id UUID;
  END IF;
END $$;

-- profiles: add community_acknowledged if missing
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='community_acknowledged') THEN
    ALTER TABLE profiles ADD COLUMN community_acknowledged BOOLEAN DEFAULT false;
  END IF;
END $$;

-- members: add columns if missing
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='members' AND column_name='beta_tester') THEN
    ALTER TABLE members ADD COLUMN beta_tester BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='members' AND column_name='community_paused') THEN
    ALTER TABLE members ADD COLUMN community_paused BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='members' AND column_name='screener_reset_at') THEN
    ALTER TABLE members ADD COLUMN screener_reset_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='members' AND column_name='last_progress_report_at') THEN
    ALTER TABLE members ADD COLUMN last_progress_report_at TIMESTAMPTZ;
  END IF;
END $$;

-- ════════════════════════════════════════════════════════════
-- PART 1 — Affirmation Scripts
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS affirmation_scripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  script TEXT NOT NULL,
  activity_mode TEXT NOT NULL,
  audio_url TEXT,
  delivered BOOLEAN DEFAULT false,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affirmation_scripts_member
  ON affirmation_scripts(member_id, generated_at DESC);

ALTER TABLE affirmation_scripts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own scripts" ON affirmation_scripts;
CREATE POLICY "Users read own scripts" ON affirmation_scripts
  FOR SELECT USING (auth.uid() = member_id);
DROP POLICY IF EXISTS "Service inserts scripts" ON affirmation_scripts;
CREATE POLICY "Service inserts scripts" ON affirmation_scripts
  FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Service updates scripts" ON affirmation_scripts;
CREATE POLICY "Service updates scripts" ON affirmation_scripts
  FOR UPDATE WITH CHECK (true);

-- ════════════════════════════════════════════════════════════
-- PART 2 — Screener Snapshots + Progress Reports
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS screener_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  responses JSONB NOT NULL DEFAULT '{}',
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_screener_snapshots_member
  ON screener_snapshots(member_id, year DESC, month DESC);

ALTER TABLE screener_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own snapshots" ON screener_snapshots;
CREATE POLICY "Users read own snapshots" ON screener_snapshots
  FOR SELECT USING (auth.uid() = member_id);
DROP POLICY IF EXISTS "Service inserts snapshots" ON screener_snapshots;
CREATE POLICY "Service inserts snapshots" ON screener_snapshots
  FOR INSERT WITH CHECK (true);

CREATE TABLE IF NOT EXISTS progress_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  current_scores JSONB NOT NULL DEFAULT '{}',
  previous_scores JSONB DEFAULT '{}',
  growth_summary TEXT,
  report_html TEXT,
  delivered BOOLEAN DEFAULT false,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_progress_reports_member
  ON progress_reports(member_id, created_at DESC);

ALTER TABLE progress_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own progress" ON progress_reports;
CREATE POLICY "Users read own progress" ON progress_reports
  FOR SELECT USING (auth.uid() = member_id);
DROP POLICY IF EXISTS "Service inserts progress" ON progress_reports;
CREATE POLICY "Service inserts progress" ON progress_reports
  FOR INSERT WITH CHECK (true);

-- ════════════════════════════════════════════════════════════
-- PART 3 — Live Sessions + Registration + Surveys
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS live_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 90,
  capacity INTEGER DEFAULT 25,
  zoom_meeting_id TEXT,
  zoom_join_url TEXT,
  zoom_start_url TEXT,
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone reads sessions" ON live_sessions;
CREATE POLICY "Anyone reads sessions" ON live_sessions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service manages sessions" ON live_sessions;
CREATE POLICY "Service manages sessions" ON live_sessions FOR ALL WITH CHECK (true);

CREATE TABLE IF NOT EXISTS live_session_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,
  tier TEXT,
  confirmation_sent BOOLEAN DEFAULT false,
  zoom_link_sent BOOLEAN DEFAULT false,
  registered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_reg_session
  ON live_session_registrations(session_id, email);

ALTER TABLE live_session_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service manages registrations" ON live_session_registrations;
CREATE POLICY "Service manages registrations" ON live_session_registrations FOR ALL WITH CHECK (true);

CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
  member_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  takeaway TEXT,
  next_topic TEXT,
  nps INTEGER CHECK (nps BETWEEN 1 AND 10),
  testimonial TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service manages surveys" ON survey_responses;
CREATE POLICY "Service manages surveys" ON survey_responses FOR ALL WITH CHECK (true);

-- ════════════════════════════════════════════════════════════
-- PART 4 — HERR Nation Community
-- ════════════════════════════════════════════════════════════

-- Community spaces (seed data at bottom)
CREATE TABLE IF NOT EXISTS community_spaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'circle',
  min_tier TEXT NOT NULL DEFAULT 'collective',
  admin_only_posting BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE community_spaces ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone reads spaces" ON community_spaces;
CREATE POLICY "Anyone reads spaces" ON community_spaces FOR SELECT USING (true);

-- Threads (top-level posts in a space)
CREATE TABLE IF NOT EXISTS community_threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  space TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID,
  pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_threads_space
  ON community_threads(space, created_at DESC);

ALTER TABLE community_threads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone reads threads" ON community_threads;
CREATE POLICY "Anyone reads threads" ON community_threads FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users create threads" ON community_threads;
CREATE POLICY "Users create threads" ON community_threads FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Service manages threads" ON community_threads;
CREATE POLICY "Service manages threads" ON community_threads FOR UPDATE WITH CHECK (true);

-- Posts (replies within a thread)
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES community_threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  flagged BOOLEAN DEFAULT false,
  hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_posts_thread
  ON community_posts(thread_id, created_at ASC);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read visible posts" ON community_posts;
CREATE POLICY "Users read visible posts" ON community_posts FOR SELECT USING (NOT hidden);
DROP POLICY IF EXISTS "Users create posts" ON community_posts;
CREATE POLICY "Users create posts" ON community_posts FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Service manages posts" ON community_posts;
CREATE POLICY "Service manages posts" ON community_posts FOR UPDATE WITH CHECK (true);

-- Reactions
CREATE TABLE IF NOT EXISTS community_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL DEFAULT '👏',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, author_id, emoji)
);

ALTER TABLE community_reactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone reads reactions" ON community_reactions;
CREATE POLICY "Anyone reads reactions" ON community_reactions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users manage reactions" ON community_reactions;
CREATE POLICY "Users manage reactions" ON community_reactions FOR ALL USING (auth.uid() = author_id);

-- Direct Messages
CREATE TABLE IF NOT EXISTS community_dms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_dms_recipient
  ON community_dms(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_dms_sender
  ON community_dms(sender_id, created_at DESC);

ALTER TABLE community_dms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own dms" ON community_dms;
CREATE POLICY "Users read own dms" ON community_dms FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
DROP POLICY IF EXISTS "Users send dms" ON community_dms;
CREATE POLICY "Users send dms" ON community_dms FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users update own dms" ON community_dms;
CREATE POLICY "Users update own dms" ON community_dms FOR UPDATE
  USING (auth.uid() = recipient_id);

-- Blocks
CREATE TABLE IF NOT EXISTS community_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

ALTER TABLE community_blocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own blocks" ON community_blocks;
CREATE POLICY "Users manage own blocks" ON community_blocks FOR ALL
  USING (auth.uid() = blocker_id);

-- Silences
CREATE TABLE IF NOT EXISTS community_silences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  silencer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  silenced_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(silencer_id, silenced_id)
);

ALTER TABLE community_silences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own silences" ON community_silences;
CREATE POLICY "Users manage own silences" ON community_silences FOR ALL
  USING (auth.uid() = silencer_id);

-- ════════════════════════════════════════════════════════════
-- PART 5 — Admin / Testimonials / Beta Lab / Moderation
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id UUID REFERENCES live_sessions(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone reads approved testimonials" ON testimonials;
CREATE POLICY "Anyone reads approved testimonials" ON testimonials
  FOR SELECT USING (status = 'approved');
DROP POLICY IF EXISTS "Service manages testimonials" ON testimonials;
CREATE POLICY "Service manages testimonials" ON testimonials
  FOR ALL WITH CHECK (true);

CREATE TABLE IF NOT EXISTS beta_lab_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE beta_lab_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service manages beta subs" ON beta_lab_submissions;
CREATE POLICY "Service manages beta subs" ON beta_lab_submissions
  FOR ALL WITH CHECK (true);

CREATE TABLE IF NOT EXISTS moderation_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID,
  action TEXT NOT NULL,
  target_user_id UUID,
  target_post_id UUID,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE moderation_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service manages mod log" ON moderation_log;
CREATE POLICY "Service manages mod log" ON moderation_log
  FOR ALL WITH CHECK (true);

-- ════════════════════════════════════════════════════════════
-- Seed Community Spaces
-- ════════════════════════════════════════════════════════════

INSERT INTO community_spaces (slug, name, description, category, min_tier, admin_only_posting, sort_order) VALUES
  ('mindset',       'Mindset Circle',       'Growth mindset, cognitive reframes, and mental models.',                 'circle',  'collective', false, 1),
  ('mental-health', 'Mental Health Circle',  'Emotional regulation, therapy insights, and wellness practices.',       'circle',  'collective', false, 2),
  ('money',         'Money Circle',          'Financial wellness, abundance mindset, and career clarity.',            'circle',  'collective', false, 3),
  ('herr-journey',  'HERR Journey Circle',   'Share your HERR experience, wins, and breakthroughs.',                 'circle',  'collective', false, 4),
  ('peer-review',   'Peer-Review Circle',    'Read and respond to Journal articles published on h3rr.com.',          'special', 'collective', false, 5),
  ('beta-lab',      'Beta-Testers Lab',      'New feature releases, research opportunities, and beta testing.',      'special', 'collective', true,  6),
  ('elite-lounge',  'Elite Lounge',          'Private space for Elite members. Direct access and exclusive content.','elite',   'elite',      false, 7)
ON CONFLICT (slug) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- Done — All tables created, all RLS policies set.
-- ════════════════════════════════════════════════════════════
