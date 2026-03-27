-- Seed: Entities
-- Populated from Luke's existing schema.org data on bravebrand.com
-- plus case study entities from the content corpus.

-- Organization: BraveBrand
insert into entities (slug, name, entity_type, schema_type, schema_id, description, url, image_url, image_width, image_height, same_as, knows_about, appears_on_pages, properties) values (
  'bravebrand',
  'BraveBrand',
  'organization',
  'Organization',
  'https://www.bravebrand.com/#org',
  'BraveBrand builds AI-powered Digital Homes for consultants and service business owners — replacing scattered social media presence with a single owned ecosystem that attracts premium clients, runs without you, and is indexed by AI search engines.',
  'https://www.bravebrand.com/',
  'https://framerusercontent.com/images/4wonpJCF8AgbUDWXujVKwlEjvyk.png',
  530, 359,
  array[
    'https://opencorporates.com/companies/us_wy/2025-001583348',
    'https://www.crunchbase.com/organization/bravebrand',
    'https://wellfound.com/company/bravebrand',
    'https://x.com/builtbravely',
    'https://www.linkedin.com/company/bravebrand.com',
    'https://www.youtube.com/@lukesbrave'
  ],
  '[
    {"@type":"Thing","name":"Marketing","sameAs":"https://www.wikidata.org/wiki/Q39809"},
    {"@type":"Thing","name":"Brand Strategy","sameAs":"https://www.wikidata.org/wiki/Q1750462"},
    {"@type":"Thing","name":"Storytelling","sameAs":"https://www.wikidata.org/wiki/Q989963"},
    {"@type":"Thing","name":"Entrepreneurship","sameAs":"https://www.wikidata.org/wiki/Q3908516"},
    {"@type":"Thing","name":"Artificial Intelligence","sameAs":"https://www.wikidata.org/wiki/Q11660"},
    {"@type":"Thing","name":"Search Engine Optimization","sameAs":"https://www.wikidata.org/wiki/Q180711"}
  ]'::jsonb,
  array['/', '/about', '/services', '/blog', '/case-studies'],
  '{"areaServed": "Worldwide", "foundingDate": "2024"}'::jsonb
);

-- Person: Luke Carter
insert into entities (slug, name, entity_type, schema_type, schema_id, description, url, image_url, image_width, image_height, same_as, appears_on_pages, properties) values (
  'luke-carter',
  'Luke Carter',
  'person',
  'Person',
  'https://www.bravebrand.com/#person-luke',
  'Founder of BraveBrand. Builds AI-powered Digital Homes for consultants and service business owners. Background in premium brand building across fitness, wellness, and tech.',
  'https://www.bravebrand.com/about',
  'https://framerusercontent.com/images/EZkx7v2vwjyvrTGr6XqpzF47bKc.jpg',
  540, 540,
  array[
    'https://orcid.org/0009-0009-2394-0736',
    'https://isni.org/isni/0000000527896748',
    'https://www.linkedin.com/in/lukesbrave/',
    'https://www.youtube.com/@lukesbrave',
    'https://x.com/builtbravely'
  ],
  array['/', '/about'],
  '{"jobTitle": "Founder", "worksFor": {"@id": "https://www.bravebrand.com/#org"}}'::jsonb
);

-- Service: Skool Community
insert into entities (slug, name, entity_type, schema_type, schema_id, description, url, appears_on_pages, properties) values (
  'skool-community',
  'BraveBrand Skool Community',
  'service',
  'Service',
  'https://www.bravebrand.com/#skool',
  'Community for coaches, consultants, and service providers implementing AI tools and building Digital Homes. Three tiers: Standard ($7/mo), Premium ($97/mo), VIP ($497/mo).',
  'https://www.skool.com/bravebrand',
  array['/', '/services'],
  '{"serviceType": "Community & Education", "serviceAudience": {"@type": "Audience", "audienceType": ["Coaches", "Consultants", "Service Providers"]}}'::jsonb
);

-- Service: BraveBrand Strategy
insert into entities (slug, name, entity_type, schema_type, schema_id, description, url, appears_on_pages, properties) values (
  'bravebrand-strategy',
  'BraveBrand Strategy',
  'service',
  'Service',
  'https://www.bravebrand.com/#strategy',
  '1:1 work with Luke Carter — brand positioning, offer architecture, premium pricing strategy, digital presence audit and growth roadmap.',
  'https://www.bravebrand.com/services',
  array['/', '/services'],
  '{"serviceType": "Brand Strategy Consulting", "serviceAudience": {"@type": "Audience", "audienceType": ["Coaches", "Consultants", "Service Providers"]}}'::jsonb
);

-- Service: BraveBrand ICON
insert into entities (slug, name, entity_type, schema_type, schema_id, description, url, appears_on_pages, properties) values (
  'bravebrand-icon',
  'BraveBrand ICON',
  'service',
  'Service',
  'https://www.bravebrand.com/#icon',
  'Full done-for-you Digital Home build — brand identity, website, AI agents, content systems, entity SEO, personalization engine, ongoing support.',
  'https://www.bravebrand.com/services',
  array['/', '/services'],
  '{"serviceType": "Done-For-You Digital Home Build", "serviceAudience": {"@type": "Audience", "audienceType": ["Established Consultants", "Agency Owners", "Service Business Owners"]}}'::jsonb
);

-- Case Study Entity: Bali Time Chamber
insert into entities (slug, name, entity_type, schema_type, description, url, appears_on_pages, properties) values (
  'bali-time-chamber',
  'Bali Time Chamber',
  'organization',
  'Organization',
  'Men''s wellness movement in Bali. BraveBrand client — went from obscurity to $100K/month with a sold-out waitlist in 6 months.',
  'https://www.bravebrand.com/case-studies/bali-time-chamber-casestudy',
  array['/case-studies', '/case-studies/bali-time-chamber'],
  '{"industry": "Men''s Wellness", "location": "Bali, Indonesia"}'::jsonb
);

-- Case Study Entity: Platform Studios
insert into entities (slug, name, entity_type, schema_type, description, url, appears_on_pages, properties) values (
  'platform-studios',
  'Platform Studios',
  'organization',
  'Organization',
  'Boutique fitness studio in Dubai. BraveBrand client — grew from $150K to multi-seven figures, won Best Boutique Studio 4 years running, secured multi-million dollar exit.',
  'https://www.bravebrand.com/case-studies/platform-studios-casestudy',
  array['/case-studies', '/case-studies/platform-studios'],
  '{"industry": "Boutique Fitness", "location": "Dubai, UAE"}'::jsonb
);

-- Case Study Entity: Virgin Active
insert into entities (slug, name, entity_type, schema_type, description, url, appears_on_pages, properties) values (
  'virgin-active-bangkok',
  'Virgin Active Bangkok',
  'organization',
  'Organization',
  'Premium fitness and wellness club. Tim Carter (Luke''s father) served as Global Brand Director, designing Bangkok''s flagship club that achieved 5,000+ members and 35% lower attrition than regional averages.',
  'https://www.bravebrand.com/case-studies/bangkok-s-premier-exercise-and-wellness-club',
  array['/case-studies', '/case-studies/virgin-active-bangkok'],
  '{"industry": "Premium Fitness & Wellness", "location": "Bangkok, Thailand"}'::jsonb
);
