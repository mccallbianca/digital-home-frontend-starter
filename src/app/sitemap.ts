/**
 * Dynamic Sitemap
 * Generates sitemap.xml from published content and static pages.
 */

import { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/server";

// Force dynamic — Supabase needs env vars not available at build time
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient();

  // Fetch published content
  const { data: content } = await supabase
    .from("content_objects")
    .select("slug, updated_at, content_type")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/journal`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/services`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Dynamic content pages
  const contentPages: MetadataRoute.Sitemap = (content || []).map((item) => ({
    url: `${SITE_URL}/journal/${item.slug}`,
    lastModified: new Date(item.updated_at),
    changeFrequency: "weekly" as const,
    priority: item.content_type === "case_study" ? 0.8 : 0.7,
  }));

  return [...staticPages, ...contentPages];
}
