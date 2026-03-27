/**
 * API Authentication
 * Supports two auth modes:
 * 1. API Key (for agents) — via x-api-key header
 * 2. Session (for admin dashboard) — via Supabase session cookie
 */

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type AuthResult =
  | { authenticated: true; mode: "api-key"; agent: string }
  | { authenticated: true; mode: "session"; userId: string }
  | { authenticated: false; error: string };

/**
 * Authenticate an API request.
 * Checks API key first, then session.
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  // 1. Check API key
  const apiKey = request.headers.get("x-api-key");
  if (apiKey) {
    return validateApiKey(apiKey);
  }

  // 2. Check session
  return validateSession();
}

/**
 * Validate an API key against env vars.
 * Each agent can have its own key for audit trail purposes.
 */
function validateApiKey(key: string): AuthResult {
  // Master agent key — works for all agents
  if (key === process.env.API_SECRET_KEY) {
    return { authenticated: true, mode: "api-key", agent: "master" };
  }

  // Per-agent keys (optional)
  const agentKeys: Record<string, string | undefined> = {
    content_agent: process.env.CONTENT_AGENT_API_KEY,
    seo_agent: process.env.SEO_AGENT_API_KEY,
    openclawd: process.env.OPENCLAWD_API_KEY,
    analytics_agent: process.env.ANALYTICS_AGENT_API_KEY,
    email_agent: process.env.EMAIL_AGENT_API_KEY,
  };

  for (const [agent, agentKey] of Object.entries(agentKeys)) {
    if (agentKey && key === agentKey) {
      return { authenticated: true, mode: "api-key", agent };
    }
  }

  return { authenticated: false, error: "Invalid API key" };
}

/**
 * Validate a Supabase session from cookies.
 */
async function validateSession(): Promise<AuthResult> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return { authenticated: false, error: "Not authenticated" };
    }

    return { authenticated: true, mode: "session", userId: user.id };
  } catch {
    return { authenticated: false, error: "Session validation failed" };
  }
}

/**
 * Helper to create a 401 response.
 */
export function unauthorizedResponse(error: string = "Unauthorized") {
  return Response.json({ error }, { status: 401 });
}

/**
 * Helper to require authentication on a route.
 * Returns the auth result or sends a 401.
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  const auth = await authenticateRequest(request);
  return auth;
}
