/**
 * POST /api/beta/emergency-report
 *
 * Body: { intended_action, actual_outcome, screenshot_url?, url_at_time?, user_agent? }
 * Auth: authenticated tester (profiles.is_tester = true).
 *
 * Writes an emergency report to beta_tester_reports with
 * report_type='emergency'. Maps the spec fields onto the existing
 * lab-report column set so the same admin queue surfaces both:
 *   - intended_action  -> stored verbatim in description (preamble)
 *   - actual_outcome   -> stored verbatim in description (preamble)
 *   - title            -> first ~120 chars of intended_action
 *   - category         -> 'bug'
 *   - severity         -> 'high'   (Stuck button is always a tester block)
 *   - url_at_time      -> new column, plus mirrored to `url` for the
 *                          existing admin queue UI
 *   - user_agent       -> new column
 *   - report_type      -> 'emergency'
 *
 * Block 5 Part 2 Task 3.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/resend';

const MAX_INTENT = 500;
const MAX_OUTCOME = 1000;

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
  const intended = String(body.intended_action ?? '').trim().slice(0, MAX_INTENT);
  const actual = String(body.actual_outcome ?? '').trim().slice(0, MAX_OUTCOME);
  const screenshot_url = body.screenshot_url ? String(body.screenshot_url) : null;
  const url_at_time = body.url_at_time ? String(body.url_at_time).slice(0, 2000) : null;
  const user_agent = body.user_agent ? String(body.user_agent).slice(0, 1000) : null;

  if (!intended || !actual) {
    return NextResponse.json({ error: 'Both fields are required' }, { status: 400 });
  }

  const title = intended.length > 120 ? intended.slice(0, 117) + '…' : intended;
  const description = `Intended:\n${intended}\n\nWhat happened:\n${actual}`;

  // Insert with all new columns. If columns are not yet migrated, retry
  // with the legacy column set so the report still lands.
  const fullRow = {
    member_id: user.id,
    category: 'bug',
    severity: 'high',
    title,
    description,
    url: url_at_time,
    screenshot_url,
    report_type: 'emergency',
    url_at_time,
    user_agent,
  };

  let insert = await db
    .from('beta_tester_reports')
    .insert(fullRow)
    .select('id')
    .single();

  if (
    insert.error &&
    /column .*(report_type|url_at_time|user_agent).* does not exist/i.test(insert.error.message)
  ) {
    const legacyRow = {
      member_id: user.id,
      category: 'bug',
      severity: 'high',
      title,
      description: `${description}\n\nURL: ${url_at_time ?? ''}\nUA: ${user_agent ?? ''}`,
      url: url_at_time,
      screenshot_url,
    };
    insert = await db.from('beta_tester_reports').insert(legacyRow).select('id').single();
  }

  if (insert.error || !insert.data) {
    console.error('[beta/emergency-report] insert error:', insert.error);
    return NextResponse.json({ error: insert.error?.message ?? 'Insert failed' }, { status: 500 });
  }

  const testerName = profile.preferred_name || profile.first_name || user.email || user.id.slice(0, 8);

  // Fire-and-forget email to Bianca with HERR-branded styling.
  try {
    await sendEmail({
      to: 'mccall.bianca@gmail.com',
      subject: `[HERR Beta — Stuck] ${title}`,
      html: emergencyEmailHtml({
        testerName,
        testerEmail: user.email ?? '',
        intended,
        actual,
        url: url_at_time,
        userAgent: user_agent,
        screenshotUrl: screenshot_url,
        reportId: insert.data.id,
      }),
    });
  } catch (err) {
    console.error('[beta/emergency-report] email error:', err);
  }

  return NextResponse.json({ success: true, report_id: insert.data.id });
}

function emergencyEmailHtml(params: {
  testerName: string;
  testerEmail: string;
  intended: string;
  actual: string;
  url: string | null;
  userAgent: string | null;
  screenshotUrl: string | null;
  reportId: string;
}): string {
  const e = escapeHtml;
  return `
<div style="background:#0A0A0F;padding:32px 20px;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#16161F;border:1px solid #C42D8E;border-radius:16px;padding:28px;color:#F4F1EB;">
    <p style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#C42D8E;font-weight:700;margin:0 0 8px;">
      HERR Beta &middot; Tester is Stuck
    </p>
    <p style="font-family:Georgia,serif;font-size:22px;font-weight:500;color:#F4F1EB;margin:0 0 16px;line-height:1.3;">
      ${e(params.testerName)} hit a block.
    </p>
    <p style="font-size:13px;color:rgba(244,241,235,0.6);margin:0 0 18px;">
      ${e(params.testerEmail)}
    </p>
    <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(244,241,235,0.5);margin:0 0 6px;">
      Intended
    </p>
    <p style="font-size:14px;line-height:1.6;color:#F4F1EB;margin:0 0 16px;white-space:pre-wrap;">${e(params.intended)}</p>
    <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(244,241,235,0.5);margin:0 0 6px;">
      What happened
    </p>
    <p style="font-size:14px;line-height:1.6;color:#F4F1EB;margin:0 0 18px;white-space:pre-wrap;">${e(params.actual)}</p>
    ${params.url ? `<p style="font-size:12px;color:rgba(244,241,235,0.55);margin:0 0 6px;">URL: <a style="color:#C42D8E;text-decoration:none;" href="${e(params.url)}">${e(params.url)}</a></p>` : ''}
    ${params.userAgent ? `<p style="font-size:11px;color:rgba(244,241,235,0.4);margin:0 0 6px;font-family:ui-monospace,monospace;">UA: ${e(params.userAgent)}</p>` : ''}
    ${params.screenshotUrl ? `<p style="font-size:12px;color:rgba(244,241,235,0.55);margin:12px 0 0;">Screenshot path: <code style="background:rgba(244,241,235,0.06);padding:2px 6px;border-radius:4px;">${e(params.screenshotUrl)}</code></p>` : ''}
    <div style="margin-top:24px;padding-top:18px;border-top:1px solid rgba(244,241,235,0.12);">
      <a href="https://h3rr.com/admin/beta-testers" style="display:inline-block;background:#C42D8E;color:#FFFFFF;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;padding:10px 18px;border-radius:10px;">
        Open Admin Queue
      </a>
    </div>
    <p style="font-size:11px;color:rgba(244,241,235,0.35);margin:18px 0 0;">
      Report ID: ${e(params.reportId)}
    </p>
  </div>
</div>`.trim();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
