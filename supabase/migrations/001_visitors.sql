-- Migration 001: Visitors
-- Anonymous visitor tracking. No PII until email capture.
-- A visitor is created on first page load via middleware cookie.

create extension if not exists "uuid-ossp";

create table visitors (
  id uuid primary key default uuid_generate_v4(),

  -- Anonymous identifier (stored in cookie)
  anonymous_id text unique not null,

  -- Attribution (captured on first visit, updated if new UTMs arrive)
  first_source text,                -- organic, paid, social, direct, referral, ai_referral
  first_medium text,                -- cpc, email, social, etc.
  first_campaign text,
  first_referrer text,              -- full referrer URL
  first_referrer_domain text,       -- extracted domain
  is_ai_traffic boolean default false,  -- true if referred by ChatGPT, Perplexity, Claude, Gemini
  ai_referrer_source text,          -- which AI (chatgpt, perplexity, claude, gemini)

  -- Latest visit attribution (overwrites on each visit with UTMs)
  latest_source text,
  latest_medium text,
  latest_campaign text,
  latest_referrer text,

  -- Profile (built up over time by personalization engine)
  segment text,                     -- assigned visitor segment
  visit_count integer default 1,
  first_seen_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  pages_viewed text[] default '{}',
  content_affinities text[] default '{}',   -- semantic tags they engage with most

  -- Device info
  device_type text,                 -- mobile, desktop, tablet
  browser text,
  os text,
  country text,
  city text,

  -- Lead conversion (populated when they opt in)
  lead_id uuid,                     -- FK to leads table, set on email capture

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for cookie lookups (every request hits this)
create index idx_visitors_anonymous_id on visitors(anonymous_id);

-- Index for segmentation queries
create index idx_visitors_segment on visitors(segment);

-- Index for AI traffic analysis
create index idx_visitors_ai_traffic on visitors(is_ai_traffic) where is_ai_traffic = true;

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger visitors_updated_at
  before update on visitors
  for each row execute function update_updated_at();
