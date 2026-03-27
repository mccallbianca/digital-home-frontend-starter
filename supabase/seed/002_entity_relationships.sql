-- Seed: Entity Relationships
-- Connects entities in the knowledge graph.
-- These power the dynamic JSON-LD generation.
-- Update the slugs below to match the entities you created in 001_entities.sql.

-- [YOUR NAME] → founded → [YOUR BRAND]
insert into entity_relationships (subject_id, predicate, object_id)
select s.id, 'founder_of', o.id
from entities s, entities o
where s.slug = 'your-name' and o.slug = 'your-brand';

-- [YOUR BRAND] → provides → [YOUR SERVICE]
insert into entity_relationships (subject_id, predicate, object_id)
select s.id, 'provides', o.id
from entities s, entities o
where s.slug = 'your-brand' and o.slug = 'your-service';

-- Add more relationships as you add entities:
--
-- Client relationships:
-- insert into entity_relationships (subject_id, predicate, object_id)
-- select s.id, 'client_of', o.id
-- from entities s, entities o
-- where s.slug = 'example-client' and o.slug = 'your-brand';
