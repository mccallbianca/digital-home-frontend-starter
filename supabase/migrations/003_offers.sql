-- Migration 003: Offers
-- The value ladder. Each offer maps to a visitor segment and
-- can be dynamically matched by the personalization engine.

create type offer_status as enum ('active', 'paused', 'archived');

create table offers (
  id uuid primary key default uuid_generate_v4(),

  -- Identity
  slug text unique not null,
  name text not null,
  tagline text,                     -- short hook for the offer
  description text,                 -- full description (markdown)

  -- Pricing
  price_display text,               -- "$7/month", "Price on application"
  price_cents integer,              -- actual price in cents (null for POA)
  currency text default 'USD',
  billing_cycle text,               -- "monthly", "one-time", "custom"

  -- Targeting
  who_its_for text,                 -- ICP description for this offer
  target_segments text[] default '{}',  -- visitor segments to show this to
  position_in_ladder integer,       -- 1=entry, 5=top tier

  -- Content
  benefits text[] default '{}',     -- list of what they get
  cta_text text,                    -- "Join for $7/month", "Apply for VIP"
  cta_url text,                     -- where the CTA links to
  featured_image_url text,

  -- Status
  status offer_status default 'active',

  -- Performance (updated by analytics cron)
  view_count integer default 0,
  click_count integer default 0,
  conversion_count integer default 0,
  conversion_rate numeric(5,2) default 0,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_offers_slug on offers(slug);
create index idx_offers_status on offers(status);
create index idx_offers_segments on offers using gin(target_segments);
create index idx_offers_ladder on offers(position_in_ladder);

create trigger offers_updated_at
  before update on offers
  for each row execute function update_updated_at();
