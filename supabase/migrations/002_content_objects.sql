-- Migration 002: Content Objects + SEO Meta
-- Every piece of content is a structured object, NOT an HTML blob.
-- Semantic tags, associated offers, and target segments enable
-- personalization and agent-driven content management.

create type content_status as enum ('draft', 'published', 'archived');
create type content_type as enum ('article', 'case_study', 'video', 'guide', 'landing_page', 'snippet');
create type content_creator as enum ('human', 'content_agent', 'seo_agent');

create table seo_meta (
  id uuid primary key default uuid_generate_v4(),

  -- Core meta
  title text,                       -- <title> tag / og:title
  description text,                 -- meta description / og:description
  canonical_url text,
  og_image_url text,

  -- Structured data hints (used by JsonLd generator)
  schema_type text default 'Article',  -- Article, HowTo, FAQ, CaseStudy, etc.
  breadcrumb_path jsonb,               -- [{"name":"Home","url":"/"},{"name":"Blog","url":"/blog"}]

  -- SEO tracking
  target_keyword text,
  secondary_keywords text[] default '{}',
  keyword_cluster text,             -- which cluster from seo/keyword-clusters.md

  -- Performance (updated by SEO Agent)
  current_rank integer,
  impressions_30d integer default 0,
  clicks_30d integer default 0,
  ctr_30d numeric(5,2),

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger seo_meta_updated_at
  before update on seo_meta
  for each row execute function update_updated_at();

create table content_objects (
  id uuid primary key default uuid_generate_v4(),

  -- Identity
  slug text unique not null,
  title text not null,
  subtitle text,
  content_type content_type not null default 'article',

  -- Body (structured markdown — rendered by ArticleBody component)
  body text,
  excerpt text,                     -- short preview for cards, meta descriptions

  -- Classification
  semantic_tags text[] default '{}',         -- topic tags: ["ai-automation", "premium-positioning"]
  associated_offers uuid[] default '{}',     -- FK references to offers table
  target_segments text[] default '{}',       -- which visitor segments see this: ["first-visit", "organic"]

  -- SEO
  seo_meta_id uuid references seo_meta(id),

  -- Media
  featured_image_url text,
  featured_video_url text,

  -- Performance (updated by analytics cron)
  view_count integer default 0,
  unique_visitors integer default 0,
  avg_time_on_page integer default 0,       -- seconds
  conversion_count integer default 0,
  engagement_score numeric(5,2) default 0,  -- calculated metric

  -- Authorship
  status content_status default 'draft',
  created_by content_creator default 'human',
  author_name text default 'Luke Carter',
  published_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Slug lookup (every page load for blog/content pages)
create index idx_content_slug on content_objects(slug);

-- Status filter (published content queries)
create index idx_content_status on content_objects(status);

-- Type filter
create index idx_content_type on content_objects(content_type);

-- Semantic tag search (GIN index for array contains queries)
create index idx_content_tags on content_objects using gin(semantic_tags);

-- Segment targeting
create index idx_content_segments on content_objects using gin(target_segments);

create trigger content_objects_updated_at
  before update on content_objects
  for each row execute function update_updated_at();
