/**
 * JsonLd Component
 * Renders JSON-LD structured data in a script tag.
 * Used in page layouts to inject schema markup.
 *
 * Usage:
 *   <JsonLd data={entityToJsonLd(entity)} />
 *   <JsonLd data={[articleJsonLd(content), breadcrumbJsonLd(crumbs)]} />
 */

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
