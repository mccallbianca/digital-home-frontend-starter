-- ── HERR Member Profiles + Onboarding Tables ───────────────────────────────
-- profiles: linked to auth.users, stores onboarding data and plan
-- existential_responses: 8-question Likert responses
-- user_preferences: selected activity modes
-- voice_consents: voice clone consent + file path

-- ── profiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id                  uuid          primary key references auth.users on delete cascade,
  email               text,
  first_name          text,
  last_name           text,
  preferred_name      text,
  pronouns            text,
  timezone            text,
  plan                text          check (plan in ('personalized','elite') or plan is null),
  onboarding_complete boolean       default false,
  stripe_customer_id  text,
  created_at          timestamptz   default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ── existential_responses ───────────────────────────────────────────────────
create table if not exists public.existential_responses (
  id              uuid          primary key default gen_random_uuid(),
  user_id         uuid          not null references public.profiles(id) on delete cascade,
  question_index  int           not null,
  response        int           not null check (response between 1 and 5),
  created_at      timestamptz   default now()
);

alter table public.existential_responses enable row level security;

create policy "Users can read own responses"
  on public.existential_responses for select
  using (auth.uid() = user_id);

create policy "Users can insert own responses"
  on public.existential_responses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own responses"
  on public.existential_responses for update
  using (auth.uid() = user_id);

-- ── user_preferences ────────────────────────────────────────────────────────
create table if not exists public.user_preferences (
  id              uuid          primary key default gen_random_uuid(),
  user_id         uuid          not null references public.profiles(id) on delete cascade,
  activity_modes  text[]        default '{}',
  updated_at      timestamptz   default now()
);

alter table public.user_preferences enable row level security;

create policy "Users can read own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id);

-- ── voice_consents ──────────────────────────────────────────────────────────
create table if not exists public.voice_consents (
  id              uuid          primary key default gen_random_uuid(),
  user_id         uuid          not null references public.profiles(id) on delete cascade,
  consented_at    timestamptz,
  file_path       text
);

alter table public.voice_consents enable row level security;

create policy "Users can read own voice consent"
  on public.voice_consents for select
  using (auth.uid() = user_id);

create policy "Users can insert own voice consent"
  on public.voice_consents for insert
  with check (auth.uid() = user_id);

create policy "Users can update own voice consent"
  on public.voice_consents for update
  using (auth.uid() = user_id);

-- ── Indexes ─────────────────────────────────────────────────────────────────
create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists profiles_stripe_idx on public.profiles (stripe_customer_id);
create index if not exists existential_responses_user_idx on public.existential_responses (user_id);
create index if not exists user_preferences_user_idx on public.user_preferences (user_id);
create index if not exists voice_consents_user_idx on public.voice_consents (user_id);

-- ── Storage bucket for voice samples ────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('voice-samples', 'voice-samples', false)
on conflict (id) do nothing;

create policy "Users can upload own voice samples"
  on storage.objects for insert
  with check (
    bucket_id = 'voice-samples' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can read own voice samples"
  on storage.objects for select
  using (
    bucket_id = 'voice-samples' and
    (storage.foldername(name))[1] = auth.uid()::text
  );
