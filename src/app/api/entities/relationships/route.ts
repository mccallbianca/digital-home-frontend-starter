/**
 * GET /api/entities/relationships — Query entity relationships
 * POST /api/entities/relationships — Create relationship (auth required)
 */

import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { authenticateRequest, unauthorizedResponse } from "@/lib/api/auth";
import { jsonResponse, errorResponse } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const supabase = createAdminClient();

  let query = supabase
    .from("entity_relationships")
    .select("*, subject:entities!entity_relationships_subject_id_fkey(slug, name, entity_type), object:entities!entity_relationships_object_id_fkey(slug, name, entity_type)")
    .order("weight", { ascending: false });

  const subjectId = searchParams.get("subject_id");
  if (subjectId) query = query.eq("subject_id", subjectId);

  const predicate = searchParams.get("predicate");
  if (predicate) query = query.eq("predicate", predicate);

  const { data, error } = await query;

  if (error) return errorResponse(error.message, 500);

  return jsonResponse(data || []);
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);

  const body = await request.json();

  if (!body.subject_id || !body.predicate || !body.object_id) {
    return errorResponse("subject_id, predicate, and object_id are required");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("entity_relationships")
    .insert(body)
    .select()
    .single();

  if (error) return errorResponse(error.message, 500);

  return jsonResponse(data, 201);
}
