/**
 * JSON-LD Generator
 * Generates structured data from the entities table.
 * Every page gets dynamic JSON-LD — never hardcoded.
 *
 * Schema.org types mapped from entity_type:
 * - organization → Organization
 * - person → Person
 * - service → Service / ProfessionalService
 * - product → Product
 * - article → Article / BlogPosting
 * - case_study → Article (with case study annotations)
 * - concept → DefinedTerm
 * - event → Event
 * - place → Place
 * - thing → Thing
 */

import type { Tables } from "@/types/database";

type Entity = Tables<"entities">;
type EntityRelationship = Tables<"entity_relationships">;

interface JsonLdObject {
  "@context": "https://schema.org";
  "@type": string;
  [key: string]: unknown;
}

/**
 * Generate JSON-LD for a single entity.
 */
export function entityToJsonLd(entity: Entity): JsonLdObject {
  const base: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": entity.schema_type,
    name: entity.name,
    description: entity.description,
    url: entity.url,
  };

  // Add schema.org @id for entity linking
  if (entity.schema_id) {
    base["@id"] = entity.schema_id;
  }

  // Add image
  if (entity.image_url) {
    base.image = entity.image_width && entity.image_height
      ? {
          "@type": "ImageObject",
          url: entity.image_url,
          width: entity.image_width,
          height: entity.image_height,
        }
      : entity.image_url;
  }

  // Add sameAs links
  if (entity.same_as?.length) {
    base.sameAs = entity.same_as;
  }

  // Merge entity-specific properties from the JSON column
  if (entity.properties && typeof entity.properties === "object") {
    Object.assign(base, entity.properties);
  }

  // Add knowsAbout for person/organization entities
  if (entity.knows_about && typeof entity.knows_about === "object") {
    const knowsAbout = entity.knows_about;
    if (Array.isArray(knowsAbout) && knowsAbout.length > 0) {
      base.knowsAbout = knowsAbout;
    }
  }

  return base;
}

/**
 * Generate JSON-LD for an organization with its relationships.
 */
export function organizationJsonLd(
  org: Entity,
  relationships: { predicate: string; object: Entity }[]
): JsonLdObject {
  const base = entityToJsonLd(org);

  // Add founder
  const founder = relationships.find(
    (r) => r.predicate === "founder_of" || r.predicate === "founded_by"
  );
  // Note: founder relationship is stored as person -> founder_of -> org
  // So we need to handle it from the incoming direction too

  // Add services offered
  const services = relationships
    .filter((r) => r.predicate === "provides")
    .map((r) => entityToJsonLd(r.object));

  if (services.length > 0) {
    base.hasOfferCatalog = {
      "@type": "OfferCatalog",
      name: `${org.name} Services`,
      itemListElement: services,
    };
  }

  return base;
}

/**
 * Generate Article JSON-LD from a content object.
 */
export function articleJsonLd(content: Tables<"content_objects">, seoMeta?: Tables<"seo_meta"> | null): JsonLdObject {
  const ld: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": content.content_type === "case_study" ? "Article" : "BlogPosting",
    headline: content.title,
    description: content.excerpt || content.subtitle,
    author: {
      "@type": "Person",
      name: content.author_name,
    },
    datePublished: content.published_at,
    dateModified: content.updated_at,
  };

  if (content.featured_image_url) {
    ld.image = content.featured_image_url;
  }

  if (seoMeta) {
    if (seoMeta.canonical_url) ld.mainEntityOfPage = seoMeta.canonical_url;
    if (seoMeta.target_keyword) {
      ld.keywords = [seoMeta.target_keyword, ...(seoMeta.secondary_keywords || [])].join(", ");
    }
  }

  // Publisher — set via NEXT_PUBLIC_SITE_NAME and NEXT_PUBLIC_SITE_URL env vars
  ld.publisher = {
    "@type": "Organization",
    name: process.env.NEXT_PUBLIC_SITE_NAME || "[YOUR BRAND]",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  };

  return ld;
}

/**
 * Generate BreadcrumbList JSON-LD.
 */
export function breadcrumbJsonLd(
  items: { name: string; url: string }[]
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate WebSite JSON-LD (for the homepage).
 */
export function websiteJsonLd(): JsonLdObject {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "[YOUR BRAND]";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    description: "[Your site description — update this in the websiteJsonLd function or move to an env var]",
    publisher: {
      "@type": "Organization",
      name: siteName,
    },
  };
}

/**
 * Serialize JSON-LD to a script tag string.
 */
export function jsonLdScript(data: JsonLdObject | JsonLdObject[]): string {
  return JSON.stringify(data);
}
