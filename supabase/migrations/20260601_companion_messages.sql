-- ============================================================
-- 2026-06-01 — companion_messages (ECQO Conversational AI Companion)
--
-- Stores every turn of the member-side Companion chat (text MVP today,
-- voice-to-voice next iteration). Distinct from `conversational_responses`
-- which captures the structured onboarding interview.
--
-- NOTE on prefix: spec asked for 20260531; that prefix is already taken
-- by the content-review status migration applied earlier tonight.
-- Bumped to 20260601 to keep Supabase's prefix-as-version key unique.
--
-- One conversation can span many turns; conversation_id is generated
-- client-side (uuid v4) so the client can resume a thread after a
-- reload without a round-trip to mint an ID.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.companion_messages (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id  uuid NOT NULL,
  role             text NOT NULL CHECK (role IN ('user','assistant','system')),
  content          text NOT NULL,
  safety_flag      boolean NOT NULL DEFAULT false,
  safety_severity  text CHECK (safety_severity IN ('green','yellow','red')),
  risk_domains     text[],
  arai_phase       text CHECK (arai_phase IN ('acknowledge','reflect','anchor','invite','full')),
  tokens_in        int,
  tokens_out       int,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_companion_messages_user
  ON public.companion_messages (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_companion_messages_conversation
  ON public.companion_messages (conversation_id, created_at);

CREATE INDEX IF NOT EXISTS idx_companion_messages_safety_red
  ON public.companion_messages (created_at DESC)
  WHERE safety_severity = 'red';

ALTER TABLE public.companion_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own companion messages" ON public.companion_messages;
CREATE POLICY "Users read own companion messages"
  ON public.companion_messages FOR SELECT
  USING (auth.uid() = user_id);

-- Writes happen via service-role from /api/companion/chat (so we can audit
-- + safety-flag rows the user wouldn't be allowed to write directly).
-- No INSERT policy for the user role.
