-- ============================================================
-- 20260519 — Clinician notification on crisis_flags INSERT
--
-- Layers (read top-to-bottom):
--   1. Enable pg_net extension so trigger can POST to Edge Function
--   2. Create crisis_flags table if it does not exist (defensive — the
--      existing ScreenerClient inserts here with a "table may not exist
--      yet" comment, so we cover both states without breaking either)
--   3. Trigger function calls the notify-clinician-crisis-flag Edge
--      Function with the new row payload
--   4. AFTER INSERT trigger fires the function for every new row
--
-- Requires before applying:
--   - public.app_settings table with rows for:
--       key='supabase_url',      value=https://<project-ref>.supabase.co
--       key='service_role_key',  value=<service-role-key>  (JWT or sb_secret_* format both work)
--     ALTER DATABASE / current_setting('app.settings.*') is blocked on
--     Supabase Cloud, so config moves into a regular table the trigger
--     can SELECT from (bypassing RLS via SECURITY DEFINER).
--   - pg_net extension enabled (verified)
--   - Edge Function secrets (set via Dashboard → Edge Functions → Secrets):
--       RESEND_API_KEY            = same key as Cloudflare Worker env
--       CLINICIAN_NOTIFY_INBOX    = clinician@h3rr.com
--       RESEND_FROM_EMAIL         = noreply@h3rr.com
-- ============================================================

-- 1. pg_net extension (required for net.http_post). Default schema is
--    `net` on Supabase; do not relocate or the trigger function below
--    will not resolve net.http_post.
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. crisis_flags table — defensive create. If it already exists with
--    the same schema, this is a no-op. If it exists with a DIFFERENT
--    schema, this statement is also a no-op (no column drift) and the
--    operator must reconcile manually before the trigger will work.
CREATE TABLE IF NOT EXISTS public.crisis_flags (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  question_index  integer,
  domain          text NOT NULL,
  score           integer NOT NULL,
  severity        text NOT NULL DEFAULT 'red',
  source          text DEFAULT 'authenticated_screener',
  created_at      timestamptz NOT NULL DEFAULT now(),
  reviewed        boolean NOT NULL DEFAULT false,
  reviewed_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at     timestamptz
);

CREATE INDEX IF NOT EXISTS crisis_flags_user_idx ON public.crisis_flags(user_id);
CREATE INDEX IF NOT EXISTS crisis_flags_unreviewed_idx ON public.crisis_flags(reviewed, created_at) WHERE reviewed = false;

-- 3. Notification trigger function. SECURITY DEFINER so it runs as the
--    function owner (must own the row) regardless of the inserter's
--    role. Wrapped in EXCEPTION so a notification failure NEVER blocks
--    the INSERT — the flag must persist even if Resend is down.
CREATE OR REPLACE FUNCTION public.trigger_clinician_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net
AS $$
DECLARE
  v_url   text;
  v_key   text;
  v_body  jsonb;
BEGIN
  BEGIN
    -- Read config from public.app_settings (Supabase Cloud blocks
    -- ALTER DATABASE so we cannot use current_setting('app.settings.*')).
    -- SECURITY DEFINER on this function lets it SELECT through any RLS.
    SELECT value INTO v_url FROM public.app_settings WHERE key = 'supabase_url'      LIMIT 1;
    SELECT value INTO v_key FROM public.app_settings WHERE key = 'service_role_key' LIMIT 1;

    IF v_url IS NULL OR v_key IS NULL OR length(trim(v_url)) = 0 OR length(trim(v_key)) = 0 THEN
      RAISE WARNING 'trigger_clinician_notification: app_settings missing supabase_url or service_role_key — skipping notification (flag % still recorded)', NEW.id;
      RETURN NEW;
    END IF;

    v_body := jsonb_build_object(
      'flag_id',    NEW.id,
      'user_id',    NEW.user_id,
      'domain',     NEW.domain,
      'score',      NEW.score,
      'severity',   NEW.severity,
      'created_at', NEW.created_at,
      'source',     NEW.source
    );

    PERFORM net.http_post(
      url     := v_url || '/functions/v1/notify-clinician-crisis-flag',
      headers := jsonb_build_object(
                   'Content-Type',  'application/json',
                   'Authorization', 'Bearer ' || v_key
                 ),
      body    := v_body
    );

  EXCEPTION WHEN OTHERS THEN
    -- Notification path failed (network, mis-config, etc.). Log and
    -- return NEW so the INSERT still succeeds — clinical-safety rule:
    -- never lose the flag even if the notifier breaks.
    RAISE WARNING 'trigger_clinician_notification swallowed exception: % (flag % persisted)', SQLERRM, NEW.id;
  END;

  RETURN NEW;
END;
$$;

-- 4. AFTER INSERT trigger (idempotent: drop-and-recreate)
DROP TRIGGER IF EXISTS on_crisis_flag_insert ON public.crisis_flags;
CREATE TRIGGER on_crisis_flag_insert
  AFTER INSERT ON public.crisis_flags
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_clinician_notification();
