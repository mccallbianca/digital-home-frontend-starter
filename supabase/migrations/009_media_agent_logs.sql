-- Migration 009: Media + Agent Logs
-- Media: references to files in Cloudflare R2.
-- Agent Logs: every agent action is recorded for audit and debugging.

create table media (
  id uuid primary key default uuid_generate_v4(),

  -- File info
  filename text not null,
  mime_type text not null,
  file_size integer,                -- bytes
  width integer,                    -- for images
  height integer,                   -- for images
  duration integer,                 -- for video/audio, in seconds

  -- Storage
  r2_key text unique not null,      -- Cloudflare R2 object key
  url text not null,                -- public URL

  -- Metadata
  alt_text text,                    -- accessibility
  caption text,
  tags text[] default '{}',

  -- Usage tracking
  used_in_content uuid[] default '{}',  -- content_objects that reference this

  -- Authorship
  uploaded_by text default 'human', -- human, content_agent

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_media_r2_key on media(r2_key);
create index idx_media_mime on media(mime_type);
create index idx_media_tags on media using gin(tags);

create trigger media_updated_at
  before update on media
  for each row execute function update_updated_at();

-- Agent Logs
-- Every agent action is logged: who did what, when, and what happened.
-- This is the audit trail for all AI-driven changes.

create type agent_name as enum ('content_agent', 'seo_agent', 'openclawd', 'analytics_agent', 'email_agent');
create type agent_action_status as enum ('started', 'completed', 'failed');

create table agent_logs (
  id uuid primary key default uuid_generate_v4(),

  -- Who
  agent agent_name not null,

  -- What
  action text not null,             -- "create_article", "update_entity", "send_email", "audit_seo"
  description text,                 -- human-readable summary of what happened
  status agent_action_status default 'started',

  -- Context
  target_table text,                -- which table was affected
  target_id uuid,                   -- which row was affected
  input_data jsonb default '{}',    -- what the agent was given
  output_data jsonb default '{}',   -- what the agent produced
  error_message text,               -- if failed

  -- Performance
  duration_ms integer,              -- how long the action took
  tokens_used integer,              -- LLM tokens consumed (for cost tracking)

  created_at timestamptz default now()
);

create index idx_agent_logs_agent on agent_logs(agent);
create index idx_agent_logs_action on agent_logs(action);
create index idx_agent_logs_status on agent_logs(status);
create index idx_agent_logs_created on agent_logs(created_at desc);
create index idx_agent_logs_target on agent_logs(target_table, target_id);
