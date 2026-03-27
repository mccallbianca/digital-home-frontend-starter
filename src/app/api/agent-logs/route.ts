/**
 * GET /api/agent-logs — Query agent activity (auth required)
 * POST /api/agent-logs — Log an agent action (auth required)
 */

import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { authenticateRequest, unauthorizedResponse } from "@/lib/api/auth";
import { jsonResponse, errorResponse, parsePagination, paginatedResponse } from "@/lib/api/response";
import type { Enums, InsertTables } from "@/types/database";

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);

  const { searchParams } = request.nextUrl;
  const { page, limit, offset } = parsePagination(searchParams);

  const supabase = createAdminClient();
  let query = supabase
    .from("agent_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  const agent = searchParams.get("agent");
  if (agent) query = query.eq("agent", agent as Enums<"agent_name">);

  const status = searchParams.get("status");
  if (status) query = query.eq("status", status as Enums<"agent_action_status">);

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) return errorResponse(error.message, 500);

  return paginatedResponse(data || [], count || 0, page, limit);
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);

  const body = await request.json();

  if (!body.agent || !body.action) {
    return errorResponse("agent and action are required");
  }

  const supabase = createAdminClient();

  const insert: InsertTables<"agent_logs"> = {
    agent: body.agent,
    action: body.action,
    description: body.description || null,
    status: body.status || "started",
    target_table: body.target_table || null,
    target_id: body.target_id || null,
    input_data: body.input_data || {},
    output_data: body.output_data || {},
    error_message: body.error_message || null,
    duration_ms: body.duration_ms || null,
    tokens_used: body.tokens_used || null,
  };

  const { data, error } = await supabase
    .from("agent_logs")
    .insert(insert)
    .select()
    .single();

  if (error) return errorResponse(error.message, 500);

  return jsonResponse(data, 201);
}
