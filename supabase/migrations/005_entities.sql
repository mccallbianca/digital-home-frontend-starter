-- Migration 005: Entities + Entity Relationships
-- The knowledge graph. Every entity (person, org, service, concept)
-- lives here. JSON-LD is generated dynamically from this data.
-- SEO Agent maintains and updates the graph.

create type entity_type as enum (
  'organization', 'person', 'service', 'product',
  'article', 'case_study', 'concept', 'event',
  'place', 'thing'
);

create table entities (
  id uuid primary key default uuid_generate_v4(),

  -- Identity
  slug text unique not null,        -- url-friendly identifier
  name text not null,
  entity_type entity_type not null,

  -- Schema.org mapping
  schema_type text not null,        -- Organization, Person, Service, Article, Thing, etc.
  schema_id text,                   -- @id value, e.g. "https://www.yourdomain.com/#org"

  -- Core data
  description text,
  url text,                         -- canonical URL for this entity
  image_url text,
  image_width integer,
  image_height integer,

  -- Linked identifiers (sameAs for knowledge graph)
  same_as text[] default '{}',      -- external URLs: LinkedIn, Crunchbase, Wikidata, etc.

  -- Flexible structured data (varies by entity type)
  -- This is the catch-all for type-specific fields like jobTitle, areaServed, etc.
  properties jsonb default '{}',

  -- Topics this entity knows about (for knowsAbout schema)
  knows_about jsonb default '[]',   -- [{"@type":"Thing","name":"Marketing","sameAs":"https://wikidata.org/..."}]

  -- Pages this entity should appear on (for JsonLd component)
  appears_on_pages text[] default '{}',  -- ["/", "/about", "/services"]

  -- Management
  managed_by text default 'human',  -- human, seo_agent
  last_audited_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_entities_slug on entities(slug);
create index idx_entities_type on entities(entity_type);
create index idx_entities_schema_id on entities(schema_id);
create index idx_entities_pages on entities using gin(appears_on_pages);

create trigger entities_updated_at
  before update on entities
  for each row execute function update_updated_at();

-- Entity Relationships
-- Connects entities to each other with typed relationships.
-- e.g. [Your Name] --[founder_of]--> [Your Brand]
--      [Client] --[client_of]--> [Your Brand]

create table entity_relationships (
  id uuid primary key default uuid_generate_v4(),

  -- The relationship
  subject_id uuid not null references entities(id) on delete cascade,
  predicate text not null,          -- founder_of, client_of, provides, knows_about, part_of, etc.
  object_id uuid not null references entities(id) on delete cascade,

  -- Optional metadata
  properties jsonb default '{}',    -- any extra data about this relationship
  weight numeric(3,2) default 1.0,  -- relationship strength (for ranking)

  created_at timestamptz default now(),

  -- Prevent duplicate relationships
  unique(subject_id, predicate, object_id)
);

create index idx_rel_subject on entity_relationships(subject_id);
create index idx_rel_object on entity_relationships(object_id);
create index idx_rel_predicate on entity_relationships(predicate);
