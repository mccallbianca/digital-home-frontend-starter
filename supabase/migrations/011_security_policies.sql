alter table visitors enable row level security;
alter table seo_meta enable row level security;
alter table content_objects enable row level security;
alter table offers enable row level security;
alter table leads enable row level security;
alter table analytics_events enable row level security;
alter table entities enable row level security;
alter table entity_relationships enable row level security;
alter table personalization_rules enable row level security;
alter table email_sequences enable row level security;
alter table email_sends enable row level security;
alter table email_events enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table media enable row level security;
alter table agent_logs enable row level security;
alter table content_calendar enable row level security;

drop policy if exists "Public read published content" on content_objects;
create policy "Public read published content"
  on content_objects
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "Public read active offers" on offers;
create policy "Public read active offers"
  on offers
  for select
  to anon, authenticated
  using (status = 'active');
