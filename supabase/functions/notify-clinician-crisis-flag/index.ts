// supabase/functions/notify-clinician-crisis-flag/index.ts
//
// Fires on every INSERT into the crisis_flags table (via the
// trigger_clinician_notification Postgres trigger). Sends a Resend
// email to the configured clinician inbox so on-call staff are notified
// of every flagged response.
//
// Env required (set via `supabase secrets set ...`):
//   - RESEND_API_KEY            — Resend API key
//   - CLINICIAN_NOTIFY_INBOX    — primary inbox (optional; defaults to hello@h3rr.com)
//   - SUPABASE_SERVICE_ROLE_KEY — for the auth.admin.getUserById lookup
//   - SUPABASE_URL              — Supabase project URL (auto-provided in Edge Functions)
//
// Deployed with --no-verify-jwt because the Postgres trigger calls us
// with the service-role Authorization bearer, not a user JWT.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface CrisisFlagPayload {
  flag_id?: string;
  user_id?: string | null;
  domain?: string;
  score?: number;
  severity?: string;
  created_at?: string;
  source?: string;
}

interface SupabaseUser {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendResendEmail(params: {
  apiKey: string;
  to: string;
  from: string;
  subject: string;
  html: string;
  text: string;
}) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: params.from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend ${res.status}: ${body.slice(0, 400)}`);
  }
  return (await res.json()) as { id: string };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any;

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let payload: CrisisFlagPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    console.error('[notify-clinician-crisis-flag] RESEND_API_KEY not configured');
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const toInbox = Deno.env.get('CLINICIAN_NOTIFY_INBOX') || 'hello@h3rr.com';
  const fromAddress = Deno.env.get('RESEND_FROM_EMAIL') || 'noreply@h3rr.com';

  // Best-effort user lookup (only if user_id is provided + we have service role + URL)
  let userEmail: string | null = null;
  let userLabel = 'anonymous-then-synced';
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (payload.user_id && supabaseUrl && serviceRoleKey) {
    try {
      const admin = createClient(supabaseUrl, serviceRoleKey);
      const { data, error } = await admin.auth.admin.getUserById(payload.user_id);
      if (!error && data?.user) {
        const u = data.user as SupabaseUser;
        userEmail = u.email ?? null;
        userLabel = userEmail
          ? `${payload.user_id} (${userEmail})`
          : payload.user_id;
      } else if (payload.user_id) {
        userLabel = payload.user_id;
      }
    } catch (e) {
      console.warn('[notify-clinician-crisis-flag] user lookup failed:', e);
      userLabel = payload.user_id;
    }
  }

  const severity = (payload.severity || 'red').toUpperCase();
  const domain = payload.domain || 'unknown';
  const score = typeof payload.score === 'number' ? payload.score : '—';
  const createdAt = payload.created_at || new Date().toISOString();
  const flagId = payload.flag_id || '(unknown-id)';
  const reviewUrl = `https://h3rr.com/admin/crisis-flags/${flagId}`;

  const subject = `[HERR Crisis Flag] ${severity} severity — ${domain} domain — ${createdAt}`;

  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;color:#1A0F1A;line-height:1.6;max-width:560px;">
      <h2 style="color:#C42D8E;margin:0 0 12px;">HERR Crisis Flag</h2>
      <p style="margin:0 0 16px;color:rgba(26,15,26,0.7);">A screener response triggered a crisis flag and requires clinician review.</p>
      <table style="border-collapse:collapse;margin-top:8px;">
        <tr><td style="padding:6px 12px;color:#888;">Severity</td><td style="padding:6px 12px;font-weight:700;color:#C42D8E;">${esc(severity)}</td></tr>
        <tr><td style="padding:6px 12px;color:#888;">Domain</td><td style="padding:6px 12px;font-weight:600;">${esc(domain)}</td></tr>
        <tr><td style="padding:6px 12px;color:#888;">Score</td><td style="padding:6px 12px;font-weight:600;">${esc(String(score))}</td></tr>
        <tr><td style="padding:6px 12px;color:#888;">User</td><td style="padding:6px 12px;font-weight:600;">${esc(userLabel)}</td></tr>
        <tr><td style="padding:6px 12px;color:#888;">Flagged at</td><td style="padding:6px 12px;font-weight:600;">${esc(createdAt)}</td></tr>
        <tr><td style="padding:6px 12px;color:#888;">Source</td><td style="padding:6px 12px;">${esc(payload.source || 'authenticated_screener')}</td></tr>
      </table>
      <p style="margin:24px 0 8px;">
        <a href="${esc(reviewUrl)}" style="display:inline-block;background:#C42D8E;color:#FFFFFF;padding:12px 22px;text-decoration:none;border-radius:4px;font-weight:700;letter-spacing:0.04em;">Review in Admin Panel</a>
      </p>
      <p style="margin:24px 0 0;color:rgba(26,15,26,0.5);font-size:13px;">
        If you assess imminent risk, consider direct outreach. Crisis line for the user: call or text <strong>988</strong>.
      </p>
      <p style="margin:24px 0 0;color:rgba(26,15,26,0.4);font-size:12px;">HERR · ECQO Holdings</p>
    </div>
  `;

  const text = [
    `HERR Crisis Flag — ${severity} severity`,
    `Domain: ${domain}`,
    `Score: ${score}`,
    `User: ${userLabel}`,
    `Flagged at: ${createdAt}`,
    `Source: ${payload.source || 'authenticated_screener'}`,
    `Review: ${reviewUrl}`,
    `Crisis line for the user: call or text 988.`,
  ].join('\n');

  try {
    const result = await sendResendEmail({
      apiKey,
      to: toInbox,
      from: fromAddress,
      subject,
      html,
      text,
    });
    console.log('[notify-clinician-crisis-flag] sent', result.id, 'flag', flagId);
    return new Response(
      JSON.stringify({ success: true, message_id: result.id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    console.error('[notify-clinician-crisis-flag] send failed:', e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'send failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
