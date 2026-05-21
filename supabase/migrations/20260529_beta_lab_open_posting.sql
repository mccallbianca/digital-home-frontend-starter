-- ============================================================
-- 2026-05-26 — Beta-Testers Lab open posting (FIX-2 A4)
--
-- Original community_spaces seed set Beta-Testers Lab to
-- admin_only_posting=true. That's wrong for the tester engagement
-- model: testers MUST be able to post bug reports + research
-- responses there. Flip it open. Elite Lounge keeps its min_tier
-- gate (Elite-only); we don't touch tier gating here, just the
-- admin-only flag on this one space.
-- ============================================================

UPDATE public.community_spaces
   SET admin_only_posting = false
 WHERE slug = 'beta-lab'
    OR name = 'Beta-Testers Lab';
