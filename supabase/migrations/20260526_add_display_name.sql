-- ============================================================
-- 2026-05-26 — profiles.display_name + unique handle (FIX-1 A8)
--
-- Adds a username-style handle distinct from preferred_name:
--   - profiles.preferred_name : what we ADDRESS the user as (e.g. "Boss")
--   - profiles.display_name   : their unique public handle (e.g. "biancalmft")
--
-- Constraints:
--   - case-insensitive uniqueness (one row may have NULL)
--   - 3-30 chars, [a-zA-Z0-9_] only (reserved-style format)
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name text;

-- Backfill from the best available signal. `full_name` does not exist
-- on this project; use preferred_name → first_name → email-localpart.
UPDATE public.profiles
   SET display_name = LOWER(
         REGEXP_REPLACE(
           COALESCE(preferred_name, first_name, SPLIT_PART(email, '@', 1)),
           '[^a-zA-Z0-9_]', '_', 'g'
         )
       )
 WHERE display_name IS NULL
   AND COALESCE(preferred_name, first_name, email) IS NOT NULL;

-- Truncate any backfilled value that exceeds 30 chars to satisfy the
-- format CHECK we're about to add.
UPDATE public.profiles
   SET display_name = SUBSTRING(display_name FROM 1 FOR 30)
 WHERE LENGTH(display_name) > 30;

-- Case-insensitive uniqueness; NULLs allowed.
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_display_name_unique
  ON public.profiles (LOWER(display_name))
  WHERE display_name IS NOT NULL;

-- Format gate. Matches the API validation in /api/profile/display-name.
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_display_name_format;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_display_name_format
  CHECK (display_name IS NULL OR display_name ~ '^[a-zA-Z0-9_]{3,30}$');
