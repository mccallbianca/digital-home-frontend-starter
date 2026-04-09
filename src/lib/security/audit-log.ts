/**
 * ECQO Security Layer — AI Auditability (PART 6)
 *
 * Logs all Claude API calls to agent_logs table for:
 * - EU AI Act compliance
 * - America's AI Action Plan alignment
 * - Human-in-the-loop enforcement
 * - Transparency and traceability
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getDb() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

/**
 * Hash a string using Web Crypto API (SHA-256).
 * Works in both Node.js and Cloudflare Workers.
 */
async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export interface AgentLogEntry {
  memberId: string;
  model: string;
  promptText: string;
  outputText: string;
  mode: string; // 'onboarding' | 'affirmation' | 'progress_report'
  riskTier?: string;
  safetyFlag?: boolean;
  durationMs?: number;
}

/**
 * Log an AI agent interaction to the agent_logs table.
 * Stores prompt/output hashes (not raw content) for auditability
 * while preserving privacy.
 */
export async function logAgentInteraction(entry: AgentLogEntry): Promise<void> {
  try {
    const db = getDb();
    const [promptHash, outputHash] = await Promise.all([
      sha256(entry.promptText),
      sha256(entry.outputText),
    ]);

    await db.from('agent_logs').insert({
      member_id: entry.memberId,
      model_version: entry.model,
      prompt_hash: promptHash,
      output_hash: outputHash,
      mode: entry.mode,
      risk_tier: entry.riskTier || null,
      safety_flag: entry.safetyFlag || false,
      duration_ms: entry.durationMs || null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[audit-log] Failed to log agent interaction:', err);
  }
}

/**
 * Log a security event (login attempt, lockout, admin action, etc.)
 */
export async function logSecurityEvent(event: {
  eventType: string;
  userId?: string;
  email?: string;
  ip?: string;
  detail?: string;
  metadata?: Record<string, string>;
}): Promise<void> {
  try {
    const db = getDb();
    await db.from('security_events').insert({
      event_type: event.eventType,
      user_id: event.userId || null,
      email: event.email || null,
      ip_address: event.ip || null,
      detail: event.detail || null,
      metadata: event.metadata || null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[audit-log] Failed to log security event:', err);
  }
}
