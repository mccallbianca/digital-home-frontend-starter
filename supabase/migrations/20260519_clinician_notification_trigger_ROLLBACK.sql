-- ============================================================
-- ROLLBACK — Disable clinician notification on crisis_flags INSERT
--
-- Run this if the trigger is causing problems (mis-fires, blocks
-- inserts, etc.). It removes the trigger + function but leaves the
-- crisis_flags table intact so existing flag rows are preserved.
--
-- After running, inserts into crisis_flags revert to the pre-PR5
-- behavior: row persists, but no notification fires.
--
-- To re-enable later, re-run 20260519_clinician_notification_trigger.sql.
-- ============================================================

DROP TRIGGER IF EXISTS on_crisis_flag_insert ON public.crisis_flags;
DROP FUNCTION IF EXISTS public.trigger_clinician_notification();
