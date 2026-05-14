# ECQO Safe Source Code — Product Reusability

This codebase is structured to enable rapid rebranding for future ECQO verticals:

- **ECQO-EA** (End of Life Application)
- **ECQO-SS** (Standalone Screener for integration partners)
- **ECQO-FIN** (Financial Literacy & Wellness)

## Current state: env-var-level rebranding (as of 2026-05-13)

Product brand strings configurable via `.env.local` + `wrangler.jsonc` `vars`:

- `NEXT_PUBLIC_PRODUCT_NAME` — short name shown in nav, hero, email footer
- `NEXT_PUBLIC_PRODUCT_LONG_NAME` — full title shown in `<title>` and metadata
- `NEXT_PUBLIC_PRODUCT_TAGLINE` — reserved for future tagline copy swaps
- `NEXT_PUBLIC_PRODUCT_FOUNDER_CREDENTIAL` — author/host display string

Color tokens remain canonical in the CSS theme (`src/app/globals.css`), not env-driven, because color swaps for ECQO verticals are typically per-vertical CSS not runtime.

### Touch points wired to env vars (Phase 1 v2 BLOCK 2 PART 2)

| Surface | File |
|---|---|
| `<title>` + `<meta name="author">` | `src/app/layout.tsx` |
| MemberNav brand label | `src/components/layout/MemberNav.tsx` |
| Marketing homepage hero h1 | `src/app/(marketing)/page.tsx` |
| Live Sessions confirmation email | `src/app/api/sessions/register/route.ts` |

HERR-specific surfaces (HERR Nation, HERR Journey, Peer-Review Circle, Beta-Testers Lab, the `--herr-*` CSS tokens) intentionally stay hardcoded — those are vertical-specific surface, not core platform.

## Planned next state: Core/Surface folder refactor (target: Saturday May 16, 2026)

Restructure `src/` to:

- `src/core/` — ECQO Safe Source Core
  - auth (`lib/supabase/`, `app/api/auth/`)
  - clinical AI (onboarding chat, screener engine)
  - voice pipeline (ElevenLabs + signed URL safety)
  - agentic scraper (beta-testers briefing, article generator)
  - signed URL safety pattern (24h expiry, no public bucket exposure)
- `src/herr/` — HERR-specific surface
  - HERR Nation (`app/(member)/dashboard/community/`)
  - HERR Journey (`app/(member)/dashboard/journey/`)
  - Peer-Review Circle (`app/(member)/dashboard/peer-review/`)
  - Beta-Testers Lab (`app/(member)/dashboard/beta-testers/`)
- `src/marketing/` — public-facing landing, journal, signup

After this refactor, ECQO-EA build starts with:

```bash
cp -r src/core/ ../ecqo-ea/src/core/
```

And only `src/herr/` -> `src/eol/` needs rebuild per vertical.
