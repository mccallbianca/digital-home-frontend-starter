/**
 * POST /api/analytics — Log an analytics event
 * GET /api/analytics — Query events (auth required)
 *
 * POST body:
 * {
 *   event_type: string (required),
 *   event_data?: object,
 *   page_url?: string,
 *   page_slug?: string,
 *   content_id?: string,
 *   offer_id?: string
 * }
 *
 * The anonymous_id and visitor_segment are read from cookies/headers
 * set by the middleware.
 */

import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { authenticateRequest, unauthorizedResponse } from "@/lib/api/auth";
import { jsonResponse, errorResponse, parsePagination, paginatedResponse } from "@/lib/api/response";
import { VISITOR_COOKIE_NAME } from "@/lib/personalization/visitor";

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.event_type) {
    return errorResponse("event_type is required");
  }

  // Get visitor identity from middleware-set cookie
  const anonymousId = request.cookies.get(VISITOR_COOKIE_NAME)?.value || "unknown";
  const visitorSegment = request.cookies.get("bb_segment")?.value || null;

  const supabase = createAdminClient();
  const { error } = await supabase.from("analytics_events").insert({
    anonymous_id: anonymousId,
    event_type: body.event_type,
    event_data: body.event_data || {},
    page_url: body.page_url || null,
    page_slug: body.page_slug || null,
    referrer: request.headers.get("referer") || null,
    content_id: body.content_id || null,
    offer_id: body.offer_id || null,
    visitor_segment: visitorSegment,
  });

  if (error) return errorResponse(error.message, 500);

  return jsonResponse({ ok: true }, 201);
}

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);

  const { searchParams } = request.nextUrl;
  const { page, limit, offset } = parsePagination(searchParams);

  const supabase = createAdminClient();
  let query = supabase
    .from("analytics_events")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  const eventType = searchParams.get("event_type");
  if (eventType) query = query.eq("event_type", eventType);

  const since = searchParams.get("since");
  if (since) query = query.gte("created_at", since);

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) return errorResponse(error.message, 500);

  return paginatedResponse(data || [], count || 0, page, limit);
}
