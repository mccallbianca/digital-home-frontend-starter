-- ============================================================
-- 2026-05-22 — Affirmation Template Library (ECQO HERR)
--
-- Per WS1 + WS2 + WS3 + WS4 + WS6 fidelity.
--
-- IMPORTANT: timestamp moved from spec's 20260520 → 20260522 because
-- 20260520 already collides with 20260520_ecqo_sound_tracks.sql shipped
-- earlier today. Supabase tracks migrations by date prefix and we hit
-- that exact collision class earlier in PR4C; this avoids the repeat.
--
-- 7 existential domains (mortality + meaning + connection + freedom
-- + identity + guilt + spiritual). Mortality + identity gated to
-- specific tiers in the generator, not in this DDL — keeping the table
-- enum complete so future spec changes don't require schema changes.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.affirmation_template_library (
  id                            uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Coverage axes
  activity_mode                 text NOT NULL CHECK (activity_mode IN (
                                  'workout','driving','sleep','morning',
                                  'deepwork','lovefamily','abundance','healing'
                                )),
  existential_domain            text NOT NULL CHECK (existential_domain IN (
                                  'mortality','meaning','connection','freedom',
                                  'identity','guilt','spiritual'
                                )),
  risk_tier                     text NOT NULL CHECK (risk_tier IN (
                                  'low_concern','moderate_unease','elevated_disruption'
                                )),
  week_of_month                 int  NOT NULL CHECK (week_of_month BETWEEN 1 AND 4),
  frequency_tier                text NOT NULL CHECK (frequency_tier IN ('low','median','high')),
  cultural_routing              text NOT NULL DEFAULT 'default' CHECK (cultural_routing IN (
                                  'default','black','latino','indigenous','lgbtq',
                                  'neurodivergent','collectivist','athlete'
                                )),

  -- Audio context
  solfeggio_hz                  int[] NOT NULL,
  emotional_tone                text NOT NULL,

  -- ARAI 4-part structure (WS4)
  arai_acknowledge              text NOT NULL,
  arai_reflect                  text NOT NULL,
  arai_anchor                   text NOT NULL,
  arai_invite                   text NOT NULL,
  full_template_text            text NOT NULL,

  -- Runtime rendering
  placeholder_slots             text[] NOT NULL,
  fallback_slot_values          jsonb  NOT NULL,
  word_count                    int    NOT NULL,
  duration_estimate_seconds     int    NOT NULL,

  -- WS1-WS4 compliance audit
  ws1_domain_alignment_verified boolean NOT NULL DEFAULT false,
  ws2_compliance_verified       boolean NOT NULL DEFAULT false,
  ws3_safety_screened           boolean NOT NULL DEFAULT false,
  ws4_arai_structure_verified   boolean NOT NULL DEFAULT false,

  -- Voice rendering pipeline
  bianca_audio_url              text,
  status                        text NOT NULL DEFAULT 'pending_voice' CHECK (status IN (
                                  'pending_voice','voice_rendered','active','archived','flagged_review'
                                )),

  created_at                    timestamptz NOT NULL DEFAULT now(),
  updated_at                    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_template_lookup
  ON public.affirmation_template_library
  (activity_mode, existential_domain, risk_tier, week_of_month, cultural_routing);

CREATE INDEX IF NOT EXISTS idx_template_status
  ON public.affirmation_template_library (status);

-- RLS: clinician/admin manages; service role inserts during generation.
ALTER TABLE public.affirmation_template_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin read templates" ON public.affirmation_template_library;
CREATE POLICY "Admin read templates"
  ON public.affirmation_template_library FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin manage templates" ON public.affirmation_template_library;
CREATE POLICY "Admin manage templates"
  ON public.affirmation_template_library FOR ALL
  USING (auth.role() = 'authenticated');
