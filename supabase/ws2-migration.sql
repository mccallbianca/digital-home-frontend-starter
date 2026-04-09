-- ============================================================
-- ECQO WS2 Clinical Onboarding — Supabase Migration
-- ============================================================
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Paste the ENTIRE contents, then click "Run"
--
-- This creates 5 new tables. Your existing tables are NOT touched.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. conversational_responses
-- Stores every AI question + user free-text response
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversational_responses (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phase         text NOT NULL CHECK (phase IN (
                  'PHASE_1_BASELINE',
                  'PHASE_2_ACTIVITY_MODES',
                  'PHASE_3_IDENTITY_ANCHORS'
                )),
  question_index int NOT NULL,               -- 0-based within the phase
  ai_message     text NOT NULL,              -- what the AI asked
  user_message   text NOT NULL,              -- what the user typed
  domain         text,                        -- e.g. 'meaning', 'isolation', etc.
  extracted_score float,                      -- NLP-derived score (1-5 or 1-10)
  metadata       jsonb DEFAULT '{}'::jsonb,   -- flexible: risk signals, style, etc.
  created_at     timestamptz DEFAULT now()
);

-- Index for fast lookup by user + phase
CREATE INDEX IF NOT EXISTS idx_conv_resp_user_phase
  ON conversational_responses(user_id, phase, question_index);

-- RLS: users can only see/write their own data
ALTER TABLE conversational_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own conversational_responses"
  ON conversational_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversational_responses"
  ON conversational_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversational_responses"
  ON conversational_responses FOR UPDATE
  USING (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- 2. risk_assessments
-- Stores the ECQO Risk Index, domain scores, and tier
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS risk_assessments (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ecqo_risk_index float NOT NULL,             -- 0.0 - 5.0
  risk_tier       text NOT NULL CHECK (risk_tier IN (
                    'LOW_CONCERN',
                    'MODERATE_UNEASE',
                    'ELEVATED_DISRUPTION'
                  )),
  domain_scores   jsonb NOT NULL,             -- { meaning, isolation, death, freedom, identity, perturbation }
  ecq_mean        float,
  pesas_mean      float,
  maps_inverse_mean float,
  reassess_at     timestamptz,                -- when to re-assess based on tier
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- One active assessment per user (latest wins)
CREATE INDEX IF NOT EXISTS idx_risk_assess_user
  ON risk_assessments(user_id, created_at DESC);

ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own risk_assessments"
  ON risk_assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own risk_assessments"
  ON risk_assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own risk_assessments"
  ON risk_assessments FOR UPDATE
  USING (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- 3. identity_anchors
-- Stores Phase 3 data: values, achievements, aspirations, self-language
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS identity_anchors (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  core_values           text[] DEFAULT '{}',    -- up to 5 values
  defining_achievement  jsonb,                   -- { description, emotional_signature, identity_language }
  significant_relationship jsonb,                -- { relationship_type, quality_of_being_known, relational_language }
  aspirational_identity jsonb,                   -- { description, gap_assessment, pathway_clarity }
  self_language_words   text[] DEFAULT '{}',     -- 1-3 words
  cultural_context      jsonb,                   -- { self_identified_background, language_preference, cultural_values }
  athletic_background   jsonb,                   -- { sport, level, transition_status, identity_fusion_score }
  spiritual_framework   jsonb,                   -- { tradition, active_practice, crisis_status }
  improvement_lever     text,                    -- from Q6 "what would move it up"
  communication_style   text CHECK (communication_style IN (
                          'DIRECT', 'REFLECTIVE', 'POETIC', 'PRACTICAL'
                        )),
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

ALTER TABLE identity_anchors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own identity_anchors"
  ON identity_anchors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own identity_anchors"
  ON identity_anchors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own identity_anchors"
  ON identity_anchors FOR UPDATE
  USING (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- 4. safety_flags
-- Immutable audit log — Phase 4 safety triggers
-- HIPAA 164.312 + EU AI Act Art. 12 compliant
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS safety_flags (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger_type          text NOT NULL CHECK (trigger_type IN (
                          'SUICIDAL_IDEATION',
                          'HOMICIDAL_IDEATION',
                          'ABUSE_DISCLOSURE',
                          'ELEVATED_DISRUPTION',
                          'SEVERE_PERTURBATION',
                          'DISSOCIATIVE_FEATURES',
                          'SUBSTANCE_INDICATORS',
                          'TRAUMA_FLOODING'
                        )),
  source_phase          text NOT NULL,           -- which phase triggered it
  source_question       int,                     -- question index within phase
  ai_response_delivered text,                    -- what the AI said in response
  user_message_trigger  text,                    -- the user message that triggered it
  moderator_notified_at timestamptz,             -- when moderator was emailed
  moderator_email       text,                    -- which moderator was notified
  resolution            text,                    -- outcome description
  resolved_at           timestamptz,
  metadata              jsonb DEFAULT '{}'::jsonb,
  created_at            timestamptz DEFAULT now()
);

-- Immutability: no UPDATE or DELETE policies (insert-only for audit trail)
CREATE INDEX IF NOT EXISTS idx_safety_flags_user
  ON safety_flags(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_safety_flags_unresolved
  ON safety_flags(resolved_at) WHERE resolved_at IS NULL;

ALTER TABLE safety_flags ENABLE ROW LEVEL SECURITY;

-- Users can read their own flags (for UI display of safety pauses)
CREATE POLICY "Users can read own safety_flags"
  ON safety_flags FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role (server-side) should insert safety flags
-- We still allow user insert for the API route running with user's token
CREATE POLICY "Users can insert own safety_flags"
  ON safety_flags FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- 5. script_handoff
-- Phase 5: complete data object for Claude script generation
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS script_handoff (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  handoff_data    jsonb NOT NULL,              -- full ScriptHandoffData object
  risk_tier       text NOT NULL,               -- denormalized for quick queries
  primary_mode    text NOT NULL,               -- denormalized for quick queries
  moderator_cleared boolean DEFAULT false,     -- for Elevated Disruption: must be cleared
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE script_handoff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own script_handoff"
  ON script_handoff FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own script_handoff"
  ON script_handoff FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own script_handoff"
  ON script_handoff FOR UPDATE
  USING (auth.uid() = user_id);


-- ============================================================
-- DONE! All 5 tables created with RLS enabled.
-- ============================================================
-- Tables created:
--   1. conversational_responses  (AI chat history per phase)
--   2. risk_assessments          (ECQO Risk Index + domain scores)
--   3. identity_anchors          (Phase 3: values, achievements, etc.)
--   4. safety_flags              (Phase 4: immutable audit log)
--   5. script_handoff            (Phase 5: data for script generation)
-- ============================================================
