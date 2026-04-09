-- ============================================================
-- ECQO Security Layer — Database Migration
-- Run in Supabase SQL Editor
-- SAFE: Uses IF NOT EXISTS / DO $$ checks
-- ============================================================

-- ════════════════════════════════════════════════════════════
-- PART 6 — AI Audit Logs (EU AI Act / America's AI Action Plan)
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS agent_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_version TEXT NOT NULL,
  prompt_hash TEXT NOT NULL,
  output_hash TEXT NOT NULL,
  mode TEXT NOT NULL,
  risk_tier TEXT,
  safety_flag BOOLEAN DEFAULT false,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_logs_member
  ON agent_logs(member_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_logs_safety
  ON agent_logs(safety_flag, created_at DESC);

ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service manages agent logs" ON agent_logs;
CREATE POLICY "Service manages agent logs" ON agent_logs
  FOR ALL WITH CHECK (true);

-- ════════════════════════════════════════════════════════════
-- Security Events Log
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID,
  email TEXT,
  ip_address TEXT,
  detail TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_events_type
  ON security_events(event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_events_user
  ON security_events(user_id, created_at DESC);

ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service manages security events" ON security_events;
CREATE POLICY "Service manages security events" ON security_events
  FOR ALL WITH CHECK (true);

-- ════════════════════════════════════════════════════════════
-- Login Attempts (for lockout tracking)
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address TEXT,
  success BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email
  ON login_attempts(email, created_at DESC);

ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service manages login attempts" ON login_attempts;
CREATE POLICY "Service manages login attempts" ON login_attempts
  FOR ALL WITH CHECK (true);

-- ════════════════════════════════════════════════════════════
-- Done — Security tables created, RLS enabled.
-- ════════════════════════════════════════════════════════════
