-- 20260514_screener_baseline_and_journey_category.sql
-- Phase 1 v2 Block 4 — Tester journey bug sweep
--
-- 1. screener_snapshots.is_baseline (Bug 3)
--    The conversational onboarding path writes a baseline snapshot at
--    signup so /dashboard/assessment can render results immediately
--    instead of showing the misleading "screener reset" copy.
--    Backfills mark each member's earliest snapshot as the baseline.
--
-- 2. journey_posts.category + media_url nullable (Bug 5)
--    Allow text-only reflection posts and tag each post with one of
--    the three BFRW circles (mindset / mental-health / money).
--
-- Idempotent: every statement uses IF NOT EXISTS / IF EXISTS guards.
-- Safe to re-run.

-- ════════════════════════════════════════════════════════════
-- 1. screener_snapshots.is_baseline
-- ════════════════════════════════════════════════════════════

ALTER TABLE IF EXISTS public.screener_snapshots
  ADD COLUMN IF NOT EXISTS is_baseline boolean NOT NULL DEFAULT false;

-- Backfill: for each member, mark their earliest snapshot as the baseline
-- so existing testers see their first month of data on /dashboard/assessment
-- rather than the "reset" message.
WITH earliest AS (
  SELECT DISTINCT ON (member_id)
    id
  FROM public.screener_snapshots
  ORDER BY member_id, year ASC, month ASC, snapshot_date ASC
)
UPDATE public.screener_snapshots s
SET is_baseline = true
FROM earliest e
WHERE s.id = e.id
  AND s.is_baseline = false;

CREATE INDEX IF NOT EXISTS idx_screener_snapshots_baseline
  ON public.screener_snapshots (member_id)
  WHERE is_baseline = true;

-- ════════════════════════════════════════════════════════════
-- 2. journey_posts.category + nullable media_url
-- ════════════════════════════════════════════════════════════

-- The journey_posts table is created by an earlier Block 2K migration.
-- These ALTERs are idempotent and only apply when the table exists.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'journey_posts'
  ) THEN
    -- Allow text-only reflection posts (no media required).
    EXECUTE 'ALTER TABLE public.journey_posts ALTER COLUMN media_url DROP NOT NULL';

    -- Optional category tag matching the three BFRW circles.
    EXECUTE $sql$
      ALTER TABLE public.journey_posts
        ADD COLUMN IF NOT EXISTS category text
    $sql$;

    -- Drop any existing CHECK constraint with the same name so the
    -- redefinition stays idempotent across re-runs.
    EXECUTE $sql$
      ALTER TABLE public.journey_posts
        DROP CONSTRAINT IF EXISTS journey_posts_category_check
    $sql$;

    EXECUTE $sql$
      ALTER TABLE public.journey_posts
        ADD CONSTRAINT journey_posts_category_check
        CHECK (category IS NULL OR category IN ('mindset','mental-health','money'))
    $sql$;

    -- media_type may currently be CHECKed against only ('image','video').
    -- Widen so text-only posts can record media_type='text'.
    EXECUTE $sql$
      ALTER TABLE public.journey_posts
        DROP CONSTRAINT IF EXISTS journey_posts_media_type_check
    $sql$;

    EXECUTE $sql$
      ALTER TABLE public.journey_posts
        ADD CONSTRAINT journey_posts_media_type_check
        CHECK (media_type IN ('image','video','text'))
    $sql$;
  END IF;
END$$;
