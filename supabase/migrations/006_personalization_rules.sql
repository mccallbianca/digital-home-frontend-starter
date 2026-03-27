-- Migration 006: Personalization Rules
-- JSON rules evaluated per visitor on each page load.
-- The middleware reads these to determine which variant to serve.

create type rule_status as enum ('active', 'paused', 'archived');

create table personalization_rules (
  id uuid primary key default uuid_generate_v4(),

  -- Identity
  name text not null,
  description text,

  -- Rule definition (evaluated by the personalization engine)
  -- Condition: JSON object describing when this rule applies
  -- e.g. {"source": "organic", "first_visit": true, "referrer_domain": "google.com"}
  condition jsonb not null,

  -- Action: JSON object describing what to do when the rule matches
  -- e.g. {"hero_variant": "seo-focused", "cta_text": "See how we rank", "featured_offers": ["seo-audit"]}
  action jsonb not null,

  -- Targeting
  page_patterns text[] default '{}',  -- which pages this rule applies to: ["/", "/services/*"]

  -- Priority (higher number = evaluated first, first match wins)
  priority integer default 0,

  -- Status
  status rule_status default 'active',

  -- Performance tracking
  impressions integer default 0,
  conversions integer default 0,
  conversion_rate numeric(5,2) default 0,

  -- Management
  created_by text default 'human',  -- human, cron_agent
  last_evaluated_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_rules_status on personalization_rules(status);
create index idx_rules_priority on personalization_rules(priority desc);
create index idx_rules_pages on personalization_rules using gin(page_patterns);

create trigger personalization_rules_updated_at
  before update on personalization_rules
  for each row execute function update_updated_at();
