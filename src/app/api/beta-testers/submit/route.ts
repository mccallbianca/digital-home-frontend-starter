/**
 * POST /api/beta-testers/submit
 *
 * Body: { category, severity, title, description, url, screenshot_url }
 * Auth: authenticated user with profiles.is_tester = true.
 *
 * Inserts a beta_tester_reports row and fires a Resend email
 * notification to Bianca. Returns the new report id.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/resend';

const VALID_CATEGORIES = ['bug', 'ui_issue', 'feature_request', 'content_suggestion', 'other'];
const VALID_SEVERITIES = ['low', 'medium', 'high', 'critical'];

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: profile } = await db
    .from('profiles')
    .select('is_tester, first_name, preferred_name, email')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile?.is_tester) {
    return NextResponse.json({ error: 'Not a beta tester' }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const category = String(body.category ?? '');
  const severity = String(body.severity ?? '');
  const title = String(body.title ?? '').trim();
  const description = String(body.description ?? '').trim();
  const url = body.url ? String(body.url) : null;
  const screenshot_url = body.screenshot_url ? String(body.screenshot_url) : null;

  if (!VALID_CATEGORIES.includes(category)) return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  if (!VALID_SEVERITIES.includes(severity)) return NextResponse.json({ error: 'Invalid severity' }, { status: 400 });
  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });
  if (!description) return NextResponse.json({ error: 'Description required' }, { status: 400 });

  const { data: inserted, error: insertErr } = await db
    .from('beta_tester_reports')
    .insert({
      member_id: user.id,
      category,
      severity,
      title,
      description,
      url,
      screenshot_url,
    })
    .select('id')
    .single();

  if (insertErr || !inserted) {
    console.error('[beta-testers/submit] insert error:', insertErr);
    return NextResponse.json({ error: insertErr?.message ?? 'Insert failed' }, { status: 500 });
  }

  // Fire-and-forget email to Bianca
  const testerName = profile.preferred_name || profile.first_name || user.email || user.id.slice(0, 8);
  try {
    await sendEmail({
      to: 'mccall.bianca@gmail.com',
      subject: `[HERR Beta] ${severity.toUpperCase()} ${category}: ${title}`,
      html: `
        <h2>New Beta Report</h2>
        <p><strong>From:</strong> ${escapeHtml(testerName)} (${escapeHtml(user.email ?? '')})</p>
        <p><strong>Category:</strong> ${escapeHtml(category)} &middot; <strong>Severity:</strong> ${escapeHtml(severity)}</p>
        <p><strong>Title:</strong> ${escapeHtml(title)}</p>
        <p><strong>Description:</strong></p>
        <pre style="white-space: pre-wrap; font-family: inherit;">${escapeHtml(description)}</pre>
        ${url ? `<p><strong>URL:</strong> <a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>` : ''}
        ${screenshot_url ? `<p><strong>Screenshot:</strong> <a href="${escapeHtml(screenshot_url)}">View (signed URL)</a></p>` : ''}
        <hr/>
        <p><a href="https://h3rr.com/admin/beta-testers">Review at /admin/beta-testers</a></p>
      `,
    });
  } catch (err) {
    console.error('[beta-testers/submit] email error:', err);
  }

  return NextResponse.json({ success: true, report_id: inserted.id });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
