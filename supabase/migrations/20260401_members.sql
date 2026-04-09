-- ── HERR Members Table ──────────────────────────────────────────────────────
-- Created by the Stripe webhook when checkout.session.completed fires.
-- One row per Stripe customer. Tier and status update on subscription events.
-- Run this in your Supabase SQL editor:
--   https://supabase.com/dashboard/project/uyhfdtrvlhdhrhniysvw/sql

create table if not exists public.members (
  id                      uuid          primary key default gen_random_uuid(),
  stripe_customer_id      text          not null unique,
  stripe_subscription_id  text,
  email                   text          not null,
  name                    text,
  tier                    text          not null check (tier in ('collective','personalized','elite')),
  status                  text          not null default 'active'
                                        check (status in ('active','past_due','cancelled','trialing')),
  source                  text          default 'website',
  subscribed_at           timestamptz   default now(),
  period_end              timestamptz,
  voice_clone_consent     boolean       default false,
  voice_clone_consent_at  timestamptz,
  onboarded               boolean       default false,
  created_at              timestamptz   default now(),
  updated_at              timestamptz   default now()
);

-- ── Row-level security ───────────────────────────────────────────────────────
alter table public.members enable row level security;

-- Service role (backend/webhook) has full access — no RLS restriction needed
-- for service_role key. The policies below govern anon/auth roles.

-- Members can read their own record (when auth is set up)
create policy "Members can read own record"
  on public.members for select
  using (auth.uid()::text = email); -- update when using Supabase Auth user IDs

-- Only service role can insert/update (webhooks use service role key)
-- No insert/update policies for anon or auth — handled server-side only.

-- ── Updated-at trigger ───────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger members_updated_at
  before update on public.members
  for each row execute function public.set_updated_at();

-- ── Indexes ──────────────────────────────────────────────────────────────────
create index if not exists members_email_idx   on public.members (email);
create index if not exists members_tier_idx    on public.members (tier);
create index if not exists members_status_idx  on public.members (status);
