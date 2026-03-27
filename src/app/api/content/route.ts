/**
 * GET /api/content — List/filter content objects
 * POST /api/content — Create a new content object (auth required)
 *
 * Query params:
 *   ?type=article|case_study|video|guide|landing_page|snippet
 *   ?status=draft|published|archived
 *   ?tag=semantic-tag
 *   ?segment=target-segment
 *   ?page=1&limit=20
 */

import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { authenticateRequest, unauthorizedResponse } from "@/lib/api/auth";
import { jsonResponse, errorResponse, paginatedResponse, parsePagination } from "@/lib/api/response";
import type { Enums } from "@/types/database";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const { page, limit, offset } = parsePagination(searchParams);

  const supabase = createAdminClient();
  let query = supabase
    .from("content_objects")
    .select("*, seo_meta(*)", { count: "exact" });

  // Filters
  const type = searchParams.get("type");
  if (type) query = query.eq("content_type", type as Enums<"content_type">);

  const status = searchParams.get("status");
  if (status) query = query.eq("status", status as Enums<"content_status">);
  else query = query.eq("status", "published"); // Default to published

  const tag = searchParams.get("tag");
  if (tag) query = query.contains("semantic_tags", [tag]);

  const segment = searchParams.get("segment");
  if (segment) query = query.contains("target_segments", [segment]);

  // Pagination + ordering
  query = query
    .order("published_at", { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) return errorResponse(error.message, 500);

  return paginatedResponse(data || [], count || 0, page, limit);
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);

  const body = await request.json();

  // Validate required fields
  if (!body.slug || !body.title) {
    return errorResponse("slug and title are required");
  }

  const supabase = createAdminClient();

  // If nested seo object is provided, create seo_meta first
  let seoMetaId: string | null = body.seo_meta_id || null;

  if (body.seo && !seoMetaId) {
    const { data: seoData, error: seoError } = await supabase
      .from("seo_meta")
      .insert({
        title: body.seo.title || body.title,
        description: body.seo.description || body.excerpt || null,
        canonical_url: body.seo.canonical_url || null,
        og_image_url: body.seo.og_image_url || body.featured_image_url || null,
        schema_type: body.seo.schema_type || "Article",
        target_keyword: body.seo.target_keyword || null,
        secondary_keywords: body.seo.secondary_keywords || [],
        keyword_cluster: body.seo.keyword_cluster || null,
      })
      .select("id")
      .single();

    if (seoError) return errorResponse(`SEO meta creation failed: ${seoError.message}`, 500);
    seoMetaId = seoData.id;
  }

  const { data, error } = await supabase
    .from("content_objects")
    .insert({
      slug: body.slug,
      title: body.title,
      subtitle: body.subtitle || null,
      content_type: body.content_type || "article",
      body: body.body || null,
      excerpt: body.excerpt || null,
      semantic_tags: body.semantic_tags || [],
      associated_offers: body.associated_offers || [],
      target_segments: body.target_segments || [],
      featured_image_url: body.featured_image_url || null,
      featured_video_url: body.featured_video_url || null,
      seo_meta_id: seoMetaId,
      status: body.status || "draft",
      created_by: (auth.mode === "api-key" ? (body.created_by || "content_agent") : "human") as Enums<"content_creator">,
      author_name: body.author_name || "[Your Name]",
      published_at: body.status === "published" ? new Date().toISOString() : null,
    })
    .select("*, seo_meta(*)")
    .single();

  if (error) return errorResponse(error.message, 500);

  return jsonResponse(data, 201);
}
