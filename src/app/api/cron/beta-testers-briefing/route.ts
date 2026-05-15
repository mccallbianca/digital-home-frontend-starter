/**
 * GET /api/cron/beta-testers-briefing
 *
 * Bearer CRON_SECRET required.
 *
 * Pulls recent beta_tester_reports, sends them to Claude for
 * analysis, persists the result to daily_briefings, and emails
 * Bianca the summary.
 *
 * Time-of-day is inferred from UTC hour:
 *   12-17 UTC  -> 'morning'  (8 AM ET window)
 *   00-05 UTC  -> 'evening'  (8 PM ET window)
 *
 * Idempotent on (briefing_date, briefing_time) — re-running the
 * same window overwrites the prior briefing.
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createAdminClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/resend';

type BriefingTime = 'morning' | 'evening';

const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
const MAX_REPORTS = 80;
const LOOKBACK_MS = 14 * 60 * 60 * 1000; // 14h window covers either half-day gap

function inferBriefingTime(now: Date): BriefingTime | null {
  const hour = now.getUTCHours();
  if (hour >= 12 && hour < 18) return 'morning';
  if (hour < 6) return 'evening';
  return null;
}

type Report = {
  id: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  url: string | null;
  status: string;
  created_at: string;
};

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  if (!auth.startsWith('Bearer ') || auth.slice(7) !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const briefingTime = inferBriefingTime(now);
  if (!briefingTime) {
    return NextResponse.json({ error: 'Outside scheduled window' }, { status: 400 });
  }

  const admin = createAdminClient();
  const since = new Date(now.getTime() - LOOKBACK_MS).toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: reportRows, error: reportErr } = await (admin as any)
    .from('beta_tester_reports')
    .select('id, category, severity, title, description, url, status, created_at')
    .gte('created_at', since)
    .order('severity', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(MAX_REPORTS);
  if (reportErr) {
    return NextResponse.json({ error: reportErr.message }, { status: 500 });
  }
  const reports = (reportRows ?? []) as Report[];

  const counts = reports.reduce(
    (acc, r) => {
      acc[r.category] = (acc[r.category] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const briefingDate = now.toISOString().slice(0, 10);
  const briefingText = await generateBriefing({ reports, briefingDate, briefingTime, counts });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: inserted, error: insertErr } = await (admin as any)
    .from('daily_briefings')
    .upsert(
      {
        briefing_date: briefingDate,
        briefing_time: briefingTime,
        briefing_text: briefingText,
        source_counts: counts,
      },
      { onConflict: 'briefing_date,briefing_time' },
    )
    .select('id')
    .single();
  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // Email Bianca with HERR-branded template (Block 5 Part 2 Task 4).
  try {
    await sendEmail({
      to: 'mccall.bianca@gmail.com',
      subject: `[HERR Beta Briefing] ${briefingDate} ${briefingTime}`,
      html: brandedBriefingHtml({ briefingText, briefingDate, briefingTime, reportCount: reports.length }),
    });
  } catch (err) {
    console.error('[beta-testers-briefing] email error:', err);
  }

  return NextResponse.json({ success: true, briefing_id: inserted.id, report_count: reports.length });
}

async function generateBriefing({
  reports,
  briefingDate,
  briefingTime,
  counts,
}: {
  reports: Report[];
  briefingDate: string;
  briefingTime: BriefingTime;
  counts: Record<string, number>;
}): Promise<string> {
  if (reports.length === 0) {
    return `# HERR Beta-Testers Briefing — ${briefingDate} ${briefingTime}\n\nNo new beta reports in the past 14 hours.`;
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return fallbackBriefing(reports, briefingDate, briefingTime, counts);
  }

  const client = new Anthropic({ apiKey: anthropicKey });
  const reportList = reports
    .map(
      (r) =>
        `- [${r.severity}/${r.category}] ${r.title} (id:${r.id.slice(-6)}, status:${r.status})\n  ${r.description.slice(0, 400)}`,
    )
    .join('\n');

  const userPrompt = `Date: ${briefingDate} (${briefingTime})

Reports (${reports.length} total in past 14h):
${reportList}

Generate the briefing in this exact markdown format:

# HERR Beta-Testers Briefing — ${briefingDate} ${briefingTime}

## Critical (immediate action)
- [report title]: [root cause hypothesis] (severity: critical, ID: [last 6 chars])

## High Priority
- [report title]: [analysis]

## Themes Observed
- [theme 1]
- [theme 2]

## Suggested Actions
1. [action]
2. [action]

## Volume
- Bugs: ${counts.bug ?? 0} | UI Issues: ${counts.ui_issue ?? 0} | Feature Requests: ${counts.feature_request ?? 0} | Content: ${counts.content_suggestion ?? 0} | Other: ${counts.other ?? 0}

Bianca, your top 3 priorities for next session: [plain text list]

Omit sections that have no items, but keep Volume and the priorities line.`;

  try {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2000,
      system: `You are reviewing beta tester reports for HERR, a behavioral health AI platform built by Bianca D. McCall, M.A., LMFT, federal AI safety advisor (HHS/SAMHSA). Generate a concise actionable briefing.`,
      messages: [{ role: 'user', content: userPrompt }],
    });
    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => (b.type === 'text' ? b.text : ''))
      .join('')
      .trim();
    return text || fallbackBriefing(reports, briefingDate, briefingTime, counts);
  } catch (err) {
    console.error('[beta-testers-briefing] claude error:', err);
    return fallbackBriefing(reports, briefingDate, briefingTime, counts);
  }
}

function fallbackBriefing(
  reports: Report[],
  briefingDate: string,
  briefingTime: BriefingTime,
  counts: Record<string, number>,
): string {
  const critical = reports.filter((r) => r.severity === 'critical');
  const high = reports.filter((r) => r.severity === 'high');
  const lines: string[] = [`# HERR Beta-Testers Briefing — ${briefingDate} ${briefingTime}`, ''];
  if (critical.length) {
    lines.push('## Critical (immediate action)');
    critical.forEach((r) => lines.push(`- ${r.title} (ID: ${r.id.slice(-6)})`));
    lines.push('');
  }
  if (high.length) {
    lines.push('## High Priority');
    high.forEach((r) => lines.push(`- ${r.title}`));
    lines.push('');
  }
  lines.push('## Volume');
  lines.push(
    `- Bugs: ${counts.bug ?? 0} | UI Issues: ${counts.ui_issue ?? 0} | Feature Requests: ${counts.feature_request ?? 0} | Content: ${counts.content_suggestion ?? 0} | Other: ${counts.other ?? 0}`,
  );
  return lines.join('\n');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function brandedBriefingHtml(params: {
  briefingText: string;
  briefingDate: string;
  briefingTime: BriefingTime;
  reportCount: number;
}): string {
  const e = escapeHtml;
  const label = params.briefingTime === 'morning' ? 'Morning' : 'Evening';
  return `
<div style="background:#0A0A0F;padding:32px 20px;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#16161F;border:1px solid rgba(244,241,235,0.12);border-radius:16px;padding:32px;color:#F4F1EB;">
    <p style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#C42D8E;font-weight:700;margin:0 0 8px;">
      HERR Beta Briefing &middot; ${e(label)}
    </p>
    <p style="font-family:Georgia,serif;font-size:24px;font-weight:500;color:#F4F1EB;margin:0 0 6px;line-height:1.3;">
      ${e(params.briefingDate)}
    </p>
    <p style="font-size:12px;color:rgba(244,241,235,0.5);margin:0 0 24px;">
      ${params.reportCount} report${params.reportCount === 1 ? '' : 's'} in the past 14 hours.
    </p>
    <pre style="white-space:pre-wrap;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;line-height:1.7;color:rgba(244,241,235,0.85);margin:0 0 24px;background:rgba(244,241,235,0.04);padding:16px 18px;border-radius:12px;border:1px solid rgba(244,241,235,0.08);">${e(params.briefingText)}</pre>
    <div style="padding-top:18px;border-top:1px solid rgba(244,241,235,0.12);">
      <a href="https://h3rr.com/admin/briefings" style="display:inline-block;background:#C42D8E;color:#FFFFFF;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;padding:10px 18px;border-radius:10px;">
        Open Briefings
      </a>
    </div>
    <p style="font-size:11px;color:rgba(244,241,235,0.35);margin:22px 0 0;line-height:1.6;">
      HERR Human Existential Regulator and Reprogramming<br/>
      &copy; ECQO Holdings
    </p>
  </div>
</div>`.trim();
}
