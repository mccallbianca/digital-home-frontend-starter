# Migrations Archive — historical SQL applied via Dashboard

These SQL files were originally placed in `supabase/migrations/` but **share
timestamp prefixes** with sibling migrations (e.g. `20260409_…` paired with
another `20260409_…`). Supabase's `schema_migrations` table uses the timestamp
as a primary key, so only one of each timestamp can be tracked there.

Each of these files was already applied to production via the Supabase
**Dashboard → SQL Editor** before the CLI was first linked (2026-05-19). When
the CLI was linked, `supabase migration repair --status applied <ts>` could
mark one row of each duplicate timestamp as applied, but not the second.
Leaving these in `supabase/migrations/` caused `supabase db push` to refuse
to run with "Found local migration files to be inserted before the last
migration on remote database."

**They are kept here as historical reference only.** Do NOT re-apply.

If you ever need to recreate the production schema from scratch (e.g. for a
new staging project), apply these files via Dashboard SQL Editor in
filename-sort order alongside the rest of `supabase/migrations/`.

| File | What it does (historical) |
|---|---|
| `20260409_seed_journal.sql` | Seeds initial journal/article rows. Sibling: `20260409_ecqo_sound_player.sql` (kept in `migrations/`). |
| `20260502_03_dss_poll_email_opt_in.sql` | DSS poll: email opt-in column. Sibling timestamps `20260502_*` (one kept in `migrations/`). |
| `20260502_dss_poll_schema.sql` | DSS poll: base schema. Same timestamp cluster. |
| `20260512_member_genre_preferences.sql` | Member preferences: genres. Sibling: `20260512_member_activity_modes.sql` (kept in `migrations/`). |
