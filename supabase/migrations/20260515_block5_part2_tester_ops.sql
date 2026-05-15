-- 20260515_block5_part2_tester_ops.sql
-- Phase 1 v2 Block 5 Part 2 — Tester ops tooling
--
-- 1. beta_tester_reports.report_type / url_at_time / user_agent (Task 3)
--    The new "Stuck?" emergency report path writes report_type='emergency'
--    alongside lab reports, plus captures the URL and user-agent at the
--    moment the tester hit the block.
--
-- 2. beta-screenshots storage bucket (Task 3)
--    Tester screenshots upload here directly from the browser via the
--    authenticated Supabase client. RLS policies match the existing
--    journey-media bucket pattern (authenticated insert, owner read).
--
-- 3. content_objects schema for "Bug fixed" announcements (Task 5)
--    Adds 'announcement' to content_type enum and ensures the
--    herr_nation_section / herr_nation_only / ai_generated / author_id
--    columns used by /api/admin/announce-fix exist.
--
-- Idempotent. Safe to re-run.

-- ════════════════════════════════════════════════════════════
-- 1. beta_tester_reports — emergency report columns
-- ════════════════════════════════════════════════════════════

ALTER TABLE IF EXISTS public.beta_tester_reports
  ADD COLUMN IF NOT EXISTS report_type text DEFAULT 'lab';

ALTER TABLE IF EXISTS public.beta_tester_reports
  DROP CONSTRAINT IF EXISTS beta_tester_reports_report_type_check;

ALTER TABLE IF EXISTS public.beta_tester_reports
  ADD CONSTRAINT beta_tester_reports_report_type_check
  CHECK (report_type IN ('lab','emergency'));

ALTER TABLE IF EXISTS public.beta_tester_reports
  ADD COLUMN IF NOT EXISTS url_at_time text;

ALTER TABLE IF EXISTS public.beta_tester_reports
  ADD COLUMN IF NOT EXISTS user_agent text;

CREATE INDEX IF NOT EXISTS idx_beta_tester_reports_report_type
  ON public.beta_tester_reports (report_type, created_at DESC);

-- RLS: testers can INSERT their own report rows.
-- The /api/beta/emergency-report route runs server-side under the
-- caller's session, so auth.uid() = member_id at insert time.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'beta_tester_reports'
  ) THEN
    EXECUTE 'ALTER TABLE public.beta_tester_reports ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Testers insert own reports" ON public.beta_tester_reports';
    EXECUTE $sql$
      CREATE POLICY "Testers insert own reports" ON public.beta_tester_reports
        FOR INSERT WITH CHECK (auth.uid() = member_id)
    $sql$;
    EXECUTE 'DROP POLICY IF EXISTS "Testers read own reports" ON public.beta_tester_reports';
    EXECUTE $sql$
      CREATE POLICY "Testers read own reports" ON public.beta_tester_reports
        FOR SELECT USING (auth.uid() = member_id)
    $sql$;
  END IF;
END$$;

-- ════════════════════════════════════════════════════════════
-- 2. beta-screenshots storage bucket
-- ════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public)
  VALUES ('beta-screenshots', 'beta-screenshots', false)
  ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Tester uploads own screenshots" ON storage.objects;
CREATE POLICY "Tester uploads own screenshots" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'beta-screenshots'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Tester reads own screenshots" ON storage.objects;
CREATE POLICY "Tester reads own screenshots" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'beta-screenshots'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ════════════════════════════════════════════════════════════
-- 3. content_objects — announcement support
-- ════════════════════════════════════════════════════════════

-- Add the 'announcement' value to the content_type enum if it isn't there.
-- ALTER TYPE ... ADD VALUE IF NOT EXISTS is Postgres 12+; Supabase is on 15.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'content_type'
  ) THEN
    BEGIN
      ALTER TYPE content_type ADD VALUE IF NOT EXISTS 'announcement';
    EXCEPTION WHEN duplicate_object THEN
      -- already exists
      NULL;
    END;
  END IF;
END$$;

ALTER TABLE IF EXISTS public.content_objects
  ADD COLUMN IF NOT EXISTS herr_nation_section text;

ALTER TABLE IF EXISTS public.content_objects
  ADD COLUMN IF NOT EXISTS herr_nation_only boolean DEFAULT false;

ALTER TABLE IF EXISTS public.content_objects
  ADD COLUMN IF NOT EXISTS ai_generated boolean DEFAULT false;

ALTER TABLE IF EXISTS public.content_objects
  ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_content_objects_herr_nation_section
  ON public.content_objects (herr_nation_section, published_at DESC);
