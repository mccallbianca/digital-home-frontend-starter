-- Migration 007: Email System
-- Sequences, sends, and events. Managed via API by agents.
-- Resend handles delivery, we track everything here.

create type sequence_status as enum ('active', 'paused', 'archived');
create type send_status as enum ('pending', 'sent', 'failed', 'bounced');
create type email_event_type as enum ('delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed');

create table email_sequences (
  id uuid primary key default uuid_generate_v4(),

  -- Identity
  name text not null,               -- "Welcome Series", "Exit Intent Follow-up"
  description text,

  -- Trigger
  trigger_type text not null,       -- form_submission, exit_intent, tag_added, agent_initiated, time_based
  trigger_config jsonb default '{}', -- e.g. {"form": "email-capture", "delay_minutes": 0}

  -- Steps (ordered array of email steps)
  -- Each step: {"step": 1, "subject": "...", "template_id": "...", "delay_hours": 0}
  steps jsonb not null default '[]',

  -- Targeting
  target_segments text[] default '{}',

  -- Status
  status sequence_status default 'active',

  -- Performance
  total_enrolled integer default 0,
  total_completed integer default 0,
  avg_open_rate numeric(5,2) default 0,
  avg_click_rate numeric(5,2) default 0,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger email_sequences_updated_at
  before update on email_sequences
  for each row execute function update_updated_at();

create table email_sends (
  id uuid primary key default uuid_generate_v4(),

  -- Who
  lead_id uuid not null references leads(id),
  email_address text not null,

  -- What
  sequence_id uuid references email_sequences(id),
  step_number integer,              -- which step in the sequence
  subject text not null,
  template_id text,                 -- Resend template reference

  -- Delivery
  resend_id text,                   -- Resend's message ID
  status send_status default 'pending',
  sent_at timestamptz,
  error_message text,

  created_at timestamptz default now()
);

create index idx_sends_lead on email_sends(lead_id);
create index idx_sends_sequence on email_sends(sequence_id);
create index idx_sends_status on email_sends(status);

create table email_events (
  id uuid primary key default uuid_generate_v4(),

  -- References
  send_id uuid not null references email_sends(id),
  lead_id uuid not null references leads(id),

  -- Event
  event_type email_event_type not null,
  event_data jsonb default '{}',    -- click URL, bounce reason, etc.

  created_at timestamptz default now()
);

create index idx_email_events_send on email_events(send_id);
create index idx_email_events_lead on email_events(lead_id);
create index idx_email_events_type on email_events(event_type);
