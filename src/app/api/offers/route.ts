/**
 * GET /api/offers — List offers
 * POST /api/offers — Create offer (auth required)
 *
 * Query params:
 *   ?status=active|paused|archived
 *   ?segment=target-segment
 */

import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { authenticateRequest, unauthorizedResponse } from "@/lib/api/auth";
import { jsonResponse, errorResponse } from "@/lib/api/response";
import type { Enums } from "@/types/database";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  const isAuthenticated = auth.authenticated;
  const { searchParams } = request.nextUrl;
  const supabase = createAdminClient();

  let query = supabase
    .from("offers")
    .select("*")
    .order("position_in_ladder", { ascending: true });

  const status = searchParams.get("status");
  if (status && isAuthenticated) {
    query = query.eq("status", status as Enums<"offer_status">);
  } else {
    query = query.eq("status", "active");
  }

  const segment = searchParams.get("segment");
  if (segment) query = query.contains("target_segments", [segment]);

  const { data, error } = await query;

  if (error) return errorResponse(error.message, 500);

  return jsonResponse(data || []);
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);

  const body = await request.json();

  if (!body.slug || !body.name) {
    return errorResponse("slug and name are required");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("offers")
    .insert(body)
    .select()
    .single();

  if (error) return errorResponse(error.message, 500);

  return jsonResponse(data, 201);
}
