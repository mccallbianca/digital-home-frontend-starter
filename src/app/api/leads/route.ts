/**
 * GET /api/leads — List leads (auth required)
 * POST /api/leads — Capture a new lead (email opt-in)
 *
 * This is the PII boundary — before this endpoint is called,
 * the visitor is fully anonymous. After, we have their email.
 */

import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { authenticateRequest, unauthorizedResponse } from "@/lib/api/auth";
import { jsonResponse, errorResponse, parsePagination, paginatedResponse } from "@/lib/api/response";
import { VISITOR_COOKIE_NAME } from "@/lib/personalization/visitor";
import type { Enums } from "@/types/database";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);

  const { searchParams } = request.nextUrl;
  const { page, limit, offset } = parsePagination(searchParams);

  const supabase = createAdminClient();
  let query = supabase
    .from("leads")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  const status = searchParams.get("status");
  if (status) query = query.eq("status", status as Enums<"lead_status">);

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) return errorResponse(error.message, 500);

  return paginatedResponse(data || [], count || 0, page, limit);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.email) {
    return errorResponse("email is required");
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return errorResponse("Invalid email format");
  }

  const visitorId = request.cookies.get(VISITOR_COOKIE_NAME)?.value || null;

  const supabase = createAdminClient();

  // Check if lead already exists
  const { data: existing } = await supabase
    .from("leads")
    .select("id")
    .eq("email", body.email.toLowerCase())
    .single();

  if (existing) {
    // Update existing lead
    const { data, error } = await supabase
      .from("leads")
      .update({
        first_name: body.first_name || undefined,
        last_name: body.last_name || undefined,
        visitor_id: visitorId || undefined,
        capture_page: body.capture_page || undefined,
        tags: body.tags || undefined,
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) return errorResponse(error.message, 500);
    return jsonResponse(data);
  }

  // Create new lead
  const { data, error } = await supabase
    .from("leads")
    .insert({
      email: body.email.toLowerCase(),
      first_name: body.first_name || null,
      last_name: body.last_name || null,
      visitor_id: visitorId,
      source: body.source || null,
      capture_page: body.capture_page || null,
      status: "new",
      score: 0,
      tags: body.tags || [],
      interested_offers: body.interested_offers || [],
    })
    .select()
    .single();

  if (error) return errorResponse(error.message, 500);

  // Link visitor to lead
  if (visitorId) {
    await supabase
      .from("visitors")
      .update({ lead_id: data.id })
      .eq("anonymous_id", visitorId);
  }

  return jsonResponse(data, 201);
}
