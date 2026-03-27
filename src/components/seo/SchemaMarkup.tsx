/**
 * SchemaMarkup Component
 * Server component that fetches entities from DB and renders JSON-LD.
 * Use on every page — pulls relevant entities based on the page context.
 *
 * Usage:
 *   <SchemaMarkup pageSlug="/" entitySlugs={["your-brand", "your-name"]} />
 *   <SchemaMarkup pageSlug="/blog/my-article" contentSlug="my-article" />
 */

import { createAdminClient } from "@/lib/supabase/server";
import { entityToJsonLd, websiteJsonLd, breadcrumbJsonLd } from "@/lib/schema/json-ld";
import { JsonLd } from "./JsonLd";

interface SchemaMarkupProps {
  /** The current page path */
  pageSlug: string;
  /** Entity slugs to include in the page's JSON-LD */
  entitySlugs?: string[];
  /** For article pages — the content slug */
  contentSlug?: string;
  /** Breadcrumb items */
  breadcrumbs?: { name: string; url: string }[];
  /** Include the WebSite schema (homepage only) */
  includeWebsite?: boolean;
}

export async function SchemaMarkup({
  pageSlug,
  entitySlugs = [],
  contentSlug,
  breadcrumbs,
  includeWebsite = false,
}: SchemaMarkupProps) {
  const supabase = createAdminClient();
  const schemas: Record<string, unknown>[] = [];

  // 1. WebSite schema (homepage)
  if (includeWebsite) {
    schemas.push(websiteJsonLd());
  }

  // 2. Entity schemas
  if (entitySlugs.length > 0) {
    const { data: entities } = await supabase
      .from("entities")
      .select("*")
      .in("slug", entitySlugs);

    if (entities) {
      for (const entity of entities) {
        schemas.push(entityToJsonLd(entity));
      }
    }
  }

  // 3. Entities that list this page in appears_on_pages
  const { data: pageEntities } = await supabase
    .from("entities")
    .select("*")
    .contains("appears_on_pages", [pageSlug]);

  if (pageEntities) {
    const alreadyIncluded = new Set(entitySlugs);
    for (const entity of pageEntities) {
      if (!alreadyIncluded.has(entity.slug)) {
        schemas.push(entityToJsonLd(entity));
      }
    }
  }

  // 4. Breadcrumbs
  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push(breadcrumbJsonLd(breadcrumbs));
  }

  if (schemas.length === 0) return null;

  return (
    <>
      {schemas.map((schema, i) => (
        <JsonLd key={i} data={schema} />
      ))}
    </>
  );
}
