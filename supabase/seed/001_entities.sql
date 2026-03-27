-- Seed: Entities
-- Example entities for your knowledge graph.
-- Replace these with your own brand, founder, and service entities.
-- See content-corpus-examples/positioning/ for your brand data.

-- Organization: [YOUR BRAND]
insert into entities (slug, name, entity_type, schema_type, schema_id, description, url, image_url, image_width, image_height, same_as, knows_about, appears_on_pages, properties) values (
  'your-brand',
  '[YOUR BRAND]',
  'organization',
  'Organization',
  'https://www.yourdomain.com/#org',
  '[Your brand description — what you do and who you serve]',
  'https://www.yourdomain.com/',
  null,
  null, null,
  array[]::text[],
  '[
    {"@type":"Thing","name":"[Your Expertise Area]"},
    {"@type":"Thing","name":"[Another Expertise Area]"}
  ]'::jsonb,
  array['/', '/about', '/services', '/blog'],
  '{"areaServed": "[Your Area]", "foundingDate": "[Year]"}'::jsonb
);

-- Person: [YOUR NAME]
insert into entities (slug, name, entity_type, schema_type, schema_id, description, url, image_url, image_width, image_height, same_as, appears_on_pages, properties) values (
  'your-name',
  '[YOUR NAME]',
  'person',
  'Person',
  'https://www.yourdomain.com/#person',
  '[Your bio — who you are and what you do]',
  'https://www.yourdomain.com/about',
  null,
  null, null,
  array[
    -- Add your LinkedIn, YouTube, Twitter/X, etc.
    -- 'https://www.linkedin.com/in/your-profile/',
    -- 'https://www.youtube.com/@yourchannel'
  ]::text[],
  array['/', '/about'],
  '{"jobTitle": "[Your Title]", "worksFor": {"@id": "https://www.yourdomain.com/#org"}}'::jsonb
);

-- Service: [YOUR MAIN SERVICE]
-- Add one entity per service/offer you provide.
-- This powers the JSON-LD schema on your services page.
insert into entities (slug, name, entity_type, schema_type, schema_id, description, url, appears_on_pages, properties) values (
  'your-service',
  '[YOUR SERVICE NAME]',
  'service',
  'Service',
  'https://www.yourdomain.com/#service',
  '[Description of this service and who it is for]',
  'https://www.yourdomain.com/services',
  array['/', '/services'],
  '{"serviceType": "[Service Category]", "serviceAudience": {"@type": "Audience", "audienceType": ["[Your Target Audience]"]}}'::jsonb
);

-- Case Study Entity (optional)
-- Add entities for notable clients or projects.
-- These connect to your case studies and build your knowledge graph.
--
-- insert into entities (slug, name, entity_type, schema_type, description, url, appears_on_pages, properties) values (
--   'example-client',
--   '[CLIENT NAME]',
--   'organization',
--   'Organization',
--   '[What they do and what result you achieved for them]',
--   'https://www.yourdomain.com/case-studies/example-client',
--   array['/case-studies'],
--   '{"industry": "[Their Industry]", "location": "[Their Location]"}'::jsonb
-- );
