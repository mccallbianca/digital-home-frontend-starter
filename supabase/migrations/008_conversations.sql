-- Migration 008: Conversations + Messages
-- On-site chat (Claude API) and WhatsApp (OpenClawd).
-- Context-aware: chat knows the visitor's page, segment, and history.

create type conversation_channel as enum ('web_chat', 'whatsapp');
create type conversation_status as enum ('active', 'closed', 'archived');
create type message_role as enum ('user', 'assistant', 'system');

create table conversations (
  id uuid primary key default uuid_generate_v4(),

  -- Who
  visitor_id uuid references visitors(id),
  lead_id uuid references leads(id),    -- set if visitor has opted in

  -- Channel
  channel conversation_channel not null default 'web_chat',
  external_id text,                      -- WhatsApp thread ID, etc.

  -- Context (captured at conversation start)
  started_on_page text,                  -- URL where chat was initiated
  visitor_segment text,                  -- segment at time of chat start
  context jsonb default '{}',            -- any extra context passed to the agent

  -- Status
  status conversation_status default 'active',
  message_count integer default 0,

  -- Timestamps
  started_at timestamptz default now(),
  last_message_at timestamptz default now(),
  closed_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_conversations_visitor on conversations(visitor_id);
create index idx_conversations_status on conversations(status);
create index idx_conversations_channel on conversations(channel);

create trigger conversations_updated_at
  before update on conversations
  for each row execute function update_updated_at();

create table messages (
  id uuid primary key default uuid_generate_v4(),

  conversation_id uuid not null references conversations(id) on delete cascade,

  -- Message
  role message_role not null,       -- user, assistant, system
  content text not null,

  -- Metadata
  token_count integer,              -- for cost tracking
  model text,                       -- which model generated this (for assistant messages)
  metadata jsonb default '{}',      -- tool calls, function results, etc.

  created_at timestamptz default now()
);

create index idx_messages_conversation on messages(conversation_id, created_at);
