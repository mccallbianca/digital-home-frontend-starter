-- Seed: Entity Relationships
-- Connects entities in the knowledge graph.
-- These power the dynamic JSON-LD generation.

-- Luke Carter → founded → BraveBrand
insert into entity_relationships (subject_id, predicate, object_id)
select s.id, 'founder_of', o.id
from entities s, entities o
where s.slug = 'luke-carter' and o.slug = 'bravebrand';

-- BraveBrand → provides → Skool Community
insert into entity_relationships (subject_id, predicate, object_id)
select s.id, 'provides', o.id
from entities s, entities o
where s.slug = 'bravebrand' and o.slug = 'skool-community';

-- BraveBrand → provides → BraveBrand Strategy
insert into entity_relationships (subject_id, predicate, object_id)
select s.id, 'provides', o.id
from entities s, entities o
where s.slug = 'bravebrand' and o.slug = 'bravebrand-strategy';

-- BraveBrand → provides → BraveBrand ICON
insert into entity_relationships (subject_id, predicate, object_id)
select s.id, 'provides', o.id
from entities s, entities o
where s.slug = 'bravebrand' and o.slug = 'bravebrand-icon';

-- Bali Time Chamber → client_of → BraveBrand
insert into entity_relationships (subject_id, predicate, object_id)
select s.id, 'client_of', o.id
from entities s, entities o
where s.slug = 'bali-time-chamber' and o.slug = 'bravebrand';

-- Platform Studios → client_of → BraveBrand
insert into entity_relationships (subject_id, predicate, object_id)
select s.id, 'client_of', o.id
from entities s, entities o
where s.slug = 'platform-studios' and o.slug = 'bravebrand';

-- Virgin Active → client_of → BraveBrand
insert into entity_relationships (subject_id, predicate, object_id)
select s.id, 'client_of', o.id
from entities s, entities o
where s.slug = 'virgin-active-bangkok' and o.slug = 'bravebrand';
