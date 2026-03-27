/**
 * GET /api/entities — Query the knowledge graph
 * POST /api/entities — Create entity (auth required)
 *
 * Query params:
 *   ?type=organization|person|service|product|article|case_study|concept|event|place|thing
 *   ?slug=entity-slug
 *   ?with_relationships=true
 */

import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { authenticateRequest, unauthorizedResponse } from "@/lib/api/auth";
import { jsonResponse, errorResponse } from "@/lib/api/response";
import type { Enums } from "@/types/database";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const supabase = createAdminClient();

  const slug = searchParams.get("slug");

  // Single entity by slug (with relationships)
  if (slug) {
    const { data: entity, error } = await supabase
      .from("entities")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !entity) return jsonResponse({ error: "Entity not found" }, 404);

    // Fetch relationships if requested
    const withRels = searchParams.get("with_relationships") === "true";
    if (withRels) {
      const [{ data: outgoing }, { data: incoming }] = await Promise.all([
        supabase
          .from("entity_relationships")
          .select("*, object:entities!entity_relationships_object_id_fkey(*)")
          .eq("subject_id", entity.id),
        supabase
          .from("entity_relationships")
          .select("*, subject:entities!entity_relationships_subject_id_fkey(*)")
          .eq("object_id", entity.id),
      ]);

      return jsonResponse({
        ...entity,
        relationships: {
          outgoing: outgoing || [],
          incoming: incoming || [],
        },
      });
    }

    return jsonResponse(entity);
  }

  // List entities
  let query = supabase
    .from("entities")
    .select("*")
    .order("name", { ascending: true });

  const type = searchParams.get("type");
  if (type) query = query.eq("entity_type", type as Enums<"entity_type">);

  const { data, error } = await query;

  if (error) return errorResponse(error.message, 500);

  return jsonResponse(data || []);
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);

  const body = await request.json();

  if (!body.slug || !body.name || !body.entity_type || !body.schema_type) {
    return errorResponse("slug, name, entity_type, and schema_type are required");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("entities")
    .insert(body)
    .select()
    .single();

  if (error) return errorResponse(error.message, 500);

  return jsonResponse(data, 201);
}
