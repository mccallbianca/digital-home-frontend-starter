/**
 * GET /api/content-calendar — List/filter calendar entries
 * POST /api/content-calendar — Create calendar entries (auth required)
 *
 * Query params:
 *   ?status=planned|approved|writing|draft|published|archived
 *   ?priority=high|medium|low
 *   ?keyword_cluster=...
 *   ?run_id=...
 *   ?page=1&limit=20
 */

import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { authenticateRequest, unauthorizedResponse } from "@/lib/api/auth";
import {
  jsonResponse,
  errorResponse,
  paginatedResponse,
  parsePagination,
} from "@/lib/api/response";
import type { Enums } from "@/types/database";

export async function GET(request: NextRequest) {
  // Auth required — calendar topics are strategic
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);

  const { searchParams } = request.nextUrl;
  const { page, limit, offset } = parsePagination(searchParams);

  const supabase = createAdminClient();
  let query = supabase
    .from("content_calendar")
    .select("*", { count: "exact" });

  // Filters
  const status = searchParams.get("status");
  if (status)
    query = query.eq("status", status as Enums<"calendar_status">);

  const priority = searchParams.get("priority");
  if (priority)
    query = query.eq("priority", priority as Enums<"calendar_priority">);

  const cluster = searchParams.get("keyword_cluster");
  if (cluster) query = query.eq("keyword_cluster", cluster);

  const runId = searchParams.get("run_id");
  if (runId) query = query.eq("run_id", runId);

  const pillar = searchParams.get("pillar_topic");
  if (pillar) query = query.eq("pillar_topic", pillar);

  // Ordering: high priority first, then by scheduled date
  query = query
    .order("priority", { ascending: true }) // high < medium < low alphabetically
    .order("scheduled_publish_date", { ascending: true, nullsFirst: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) return errorResponse(error.message, 500);

  return paginatedResponse(data || [], count || 0, page, limit);
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);

  const body = await request.json();

  const supabase = createAdminClient();

  // Support batch insert: { entries: [...] } or single object
  const entries = Array.isArray(body.entries) ? body.entries : [body];

  if (entries.length === 0) {
    return errorResponse("At least one entry is required");
  }

  // Validate each entry has a title
  for (const entry of entries) {
    if (!entry.title) {
      return errorResponse("Each entry must have a title");
    }
  }

  const rows = entries.map(
    (entry: Record<string, unknown>) => ({
      title: entry.title as string,
      search_query: (entry.search_query as string) || null,
      target_keyword: (entry.target_keyword as string) || null,
      keyword_cluster: (entry.keyword_cluster as string) || null,
      intent_type:
        (entry.intent_type as Enums<"intent_type">) || "informational",
      priority:
        (entry.priority as Enums<"calendar_priority">) || "medium",
      status: (entry.status as Enums<"calendar_status">) || "planned",
      pillar_topic: (entry.pillar_topic as string) || null,
      topic_cluster: (entry.topic_cluster as string) || null,
      scheduled_publish_date:
        (entry.scheduled_publish_date as string) || null,
      run_id: (entry.run_id as string) || null,
      created_by: (entry.created_by as string) || (auth.mode === "api-key" ? "content_agent" : "human"),
      notes: (entry.notes as string) || null,
    })
  );

  const { data, error } = await supabase
    .from("content_calendar")
    .insert(rows)
    .select();

  if (error) {
    // Handle unique constraint violation
    if (error.code === "23505") {
      return errorResponse(
        "Duplicate entry: a calendar item with that search_query + target_keyword already exists",
        409
      );
    }
    return errorResponse(error.message, 500);
  }

  return jsonResponse(data, 201);
}
