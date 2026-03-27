/**
 * GET /api/content/[slug] — Single content object by slug
 * PATCH /api/content/[slug] — Update a content object (auth required)
 * DELETE /api/content/[slug] — Archive a content object (auth required)
 */

import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { authenticateRequest, unauthorizedResponse } from "@/lib/api/auth";
import { jsonResponse, errorResponse, notFoundResponse } from "@/lib/api/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("content_objects")
    .select("*, seo_meta(*)")
    .eq("slug", slug)
    .single();

  if (error || !data) return notFoundResponse("Content");

  return jsonResponse(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);

  const { slug } = await params;
  const body = await request.json();

  const supabase = createAdminClient();

  // If publishing for the first time, set published_at
  if (body.status === "published" && !body.published_at) {
    body.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("content_objects")
    .update(body)
    .eq("slug", slug)
    .select()
    .single();

  if (error) return errorResponse(error.message, 500);
  if (!data) return notFoundResponse("Content");

  return jsonResponse(data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) return unauthorizedResponse(auth.error);

  const { slug } = await params;
  const supabase = createAdminClient();

  // Soft delete — archive, don't destroy
  const { data, error } = await supabase
    .from("content_objects")
    .update({ status: "archived" })
    .eq("slug", slug)
    .select()
    .single();

  if (error) return errorResponse(error.message, 500);
  if (!data) return notFoundResponse("Content");

  return jsonResponse({ message: "Archived", slug });
}
