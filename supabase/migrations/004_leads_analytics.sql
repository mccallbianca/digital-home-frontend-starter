-- Migration 004: Leads + Analytics Events
-- Leads are created on email capture (visitor opts in).
-- Analytics events track every meaningful interaction.

create type lead_status as enum ('new', 'engaged', 'qualified', 'converted', 'lost');

create table leads (
  id uuid primary key default uuid_generate_v4(),

  -- Contact (PII — only captured on opt-in)
  email text unique not null,
  first_name text,
  last_name text,

  -- Source
  visitor_id uuid references visitors(id),
  source text,                      -- which form/trigger captured them
  capture_page text,                -- URL where they opted in

  -- Qualification
  status lead_status default 'new',
  score integer default 0,          -- lead score (updated by rules/agents)
  tags text[] default '{}',

  -- Offer interest
  interested_offers uuid[] default '{}',  -- FK to offers

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_leads_email on leads(email);
create index idx_leads_status on leads(status);
create index idx_leads_visitor on leads(visitor_id);

create trigger leads_updated_at
  before update on leads
  for each row execute function update_updated_at();

-- Now add the FK from visitors to leads
alter table visitors
  add constraint fk_visitors_lead
  foreign key (lead_id) references leads(id);

-- Analytics Events
-- High-volume table. Every page view, click, conversion, etc.
-- Designed for fast inserts and time-range queries.

create table analytics_events (
  id uuid primary key default uuid_generate_v4(),

  -- Who
  visitor_id uuid references visitors(id),
  anonymous_id text not null,       -- denormalized for fast writes without join

  -- What
  event_type text not null,         -- page_view, cta_click, offer_view, email_capture, chat_start, etc.
  event_data jsonb default '{}',    -- flexible payload per event type

  -- Where
  page_url text,
  page_slug text,
  referrer text,

  -- Context
  content_id uuid,                  -- FK to content_objects if relevant
  offer_id uuid,                    -- FK to offers if relevant
  visitor_segment text,             -- denormalized for fast analytics

  -- When
  created_at timestamptz default now()
);

-- Time-range queries (most common analytics pattern)
create index idx_events_created on analytics_events(created_at desc);

-- Event type filtering
create index idx_events_type on analytics_events(event_type);

-- Visitor journey
create index idx_events_visitor on analytics_events(visitor_id);

-- Anonymous ID for pre-profile events
create index idx_events_anonymous on analytics_events(anonymous_id);

-- Page performance
create index idx_events_page on analytics_events(page_slug, event_type);
