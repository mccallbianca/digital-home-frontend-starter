/**
 * GET /llms.txt — Machine-readable site summary for LLMs
 * See: https://llmstxt.org/
 */

import { createAdminClient } from "@/lib/supabase/server";
import { generateLlmsTxt } from "@/lib/schema/llms-txt";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  const supabase = createAdminClient();

  const [
    { data: entities },
    { data: content },
    { data: offers },
  ] = await Promise.all([
    supabase.from("entities").select("*").order("name"),
    supabase.from("content_objects").select("*").eq("status", "published").order("published_at", { ascending: false }),
    supabase.from("offers").select("*").eq("status", "active").order("position_in_ladder"),
  ]);

  const txt = generateLlmsTxt(
    entities || [],
    content || [],
    offers || []
  );

  return new Response(txt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
