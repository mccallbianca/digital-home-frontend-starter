/**
 * GET /api/visitors — List visitors (auth required)
 * POST /api/visitors — Create/update visitor profile
 *
 * POST is called by the analytics pipeline to sync visitor data.
 * Most visitor creation happens implicitly via middleware cookies,
 * but this endpoint allows agents to enrich profiles.
 */

import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { authenticateRequest, unauthorizedResponse } from "@/lib/api/auth";
import { jsonResponse, errorResponse, parsePagination, paginatedResponse } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);

  const { searchParams } = request.nextUrl;
  const { page, limit, offset } = parsePagination(searchParams);

  const supabase = createAdminClient();
  let query = supabase
    .from("visitors")
    .select("*", { count: "exact" })
    .order("last_seen_at", { ascending: false });

  const segment = searchParams.get("segment");
  if (segment) query = query.eq("segment", segment);

  const isAI = searchParams.get("is_ai");
  if (isAI === "true") query = query.eq("is_ai_traffic", true);

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) return errorResponse(error.message, 500);

  return paginatedResponse(data || [], count || 0, page, limit);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.anonymous_id) {
    return errorResponse("anonymous_id is required");
  }

  const supabase = createAdminClient();

  // Upsert — create if new, update if exists
  const { data, error } = await supabase
    .from("visitors")
    .upsert(
      {
        anonymous_id: body.anonymous_id,
        first_source: body.first_source || null,
        first_medium: body.first_medium || null,
        first_campaign: body.first_campaign || null,
        first_referrer: body.first_referrer || null,
        first_referrer_domain: body.first_referrer_domain || null,
        is_ai_traffic: body.is_ai_traffic || false,
        ai_referrer_source: body.ai_referrer_source || null,
        latest_source: body.latest_source || null,
        latest_medium: body.latest_medium || null,
        latest_campaign: body.latest_campaign || null,
        latest_referrer: body.latest_referrer || null,
        segment: body.segment || null,
        device_type: body.device_type || null,
        browser: body.browser || null,
        os: body.os || null,
        country: body.country || null,
        city: body.city || null,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "anonymous_id" }
    )
    .select()
    .single();

  if (error) return errorResponse(error.message, 500);

  return jsonResponse(data, 201);
}
