/**
 * POST /api/cron/monthly-reset
 *
 * First-of-month cron job:
 * 1. Snapshot current screener responses for each member
 * 2. Generate progress report comparing to prior month
 * 3. Clear current responses so member can retake fresh
 * 4. Send progress report via Resend
 * 5. Update member timestamps
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email/resend';
import { logAgentInteraction } from '@/lib/security/audit-log';
import { sendSecurityAlert } from '@/lib/security/alerts';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const CRON_SECRET = process.env.CRON_SECRET || '';

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';

const QUESTIONS = [
  'Meaning & Purpose reflection',
  'Connection to something larger',
  'Comfort with uncertainty',
  'Relationship with inner voice',
  'Isolation or disconnection',
  'Personal identity clarity',
  'Relationship with mortality',
  'Sense of aliveness',
];

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  // Get all active members
  const { data: members } = await supabase
    .from('members')
    .select('email')
    .eq('status', 'active');

  if (!members) {
    return NextResponse.json({ error: 'No members found' }, { status: 500 });
  }

  let processed = 0;
  let errors = 0;

  for (const member of members) {
    try {
      // Find profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, preferred_name, first_name, email')
        .eq('email', member.email)
        .single();

      if (!profile) continue;

      // Get current responses
      const { data: responses } = await supabase
        .from('existential_responses')
        .select('question_index, response')
        .eq('user_id', profile.id)
        .order('question_index');

      if (!responses || responses.length === 0) continue;

      const responseMap: Record<number, number> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      responses.forEach((r: any) => { responseMap[r.question_index] = r.response; });

      // 1. Snapshot current responses
      await supabase.from('screener_snapshots').insert({
        member_id: profile.id,
        responses: responseMap,
        snapshot_date: now.toISOString().split('T')[0],
        month,
        year,
      });

      // 2. Get prior month snapshot for comparison
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;

      const { data: prevSnapshot } = await supabase
        .from('screener_snapshots')
        .select('responses')
        .eq('member_id', profile.id)
        .eq('month', prevMonth)
        .eq('year', prevYear)
        .single();

      // 3. Generate progress report via Claude
      const currentScores = JSON.stringify(responseMap);
      const previousScores = prevSnapshot ? JSON.stringify(prevSnapshot.responses) : 'none';

      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          system: `You are HERR — generating a monthly progress report. Frame ALL language in identity and regulation terms. Never use clinical deficit language. Focus on growth, regulation capacity, and identity evolution. Keep it warm, affirming, and specific. The member's name is ${profile.preferred_name || profile.first_name || 'Member'}.

Questions map: ${QUESTIONS.map((q, i) => `Q${i}: ${q}`).join(', ')}
Scores are 1-5 (1=Never, 5=Always).

Return a brief (3-5 paragraph) progress report. If no previous data, frame as a baseline snapshot. If previous data exists, highlight specific areas of growth or stability.`,
          messages: [{
            role: 'user',
            content: `Current month scores: ${currentScores}\nPrevious month scores: ${previousScores}`,
          }],
        }),
      });

      let growthSummary = '';
      if (claudeRes.ok) {
        const data = await claudeRes.json();
        growthSummary = data.content?.[0]?.text || '';

        // ── AI Audit Log (EU AI Act compliance) ──
        await logAgentInteraction({
          memberId: profile.id,
          model: 'claude-sonnet-4-20250514',
          promptText: `Monthly progress report for ${year}-${String(month).padStart(2, '0')}`,
          outputText: growthSummary,
          mode: 'progress_report',
        });
      }

      // 4. Store progress report
      await supabase.from('progress_reports').insert({
        member_id: profile.id,
        period: `${year}-${String(month).padStart(2, '0')}`,
        current_scores: responseMap,
        previous_scores: prevSnapshot?.responses || {},
        growth_summary: growthSummary,
        delivered: true,
        delivered_at: now.toISOString(),
      });

      // 5. Send email
      if (growthSummary && profile.email) {
        await sendEmail({
          to: profile.email,
          subject: `Your HERR Progress Report — ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
          html: `
            <div style="background:#0A0A0F;color:#F4F1EB;padding:40px;font-family:system-ui,sans-serif;">
              <h1 style="font-size:28px;font-weight:300;margin-bottom:24px;">Your Monthly Progress Report</h1>
              <div style="white-space:pre-wrap;line-height:1.8;font-size:15px;color:rgba(244,241,235,0.7);">
                ${growthSummary}
              </div>
              <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(244,241,235,0.1);">
                <a href="https://www.h3rr.com/dashboard/assessment" style="color:#C42D8E;text-decoration:none;">View Full Report &rarr;</a>
              </div>
              <p style="margin-top:24px;font-size:11px;color:rgba(244,241,235,0.3);">HERR &mdash; Human Existential Response and Reprogramming &copy; ECQO Holdings</p>
            </div>
          `,
        });
      }

      // 6. Clear current responses for retake
      await supabase
        .from('existential_responses')
        .delete()
        .eq('user_id', profile.id);

      // 7. Update member timestamps
      await supabase
        .from('members')
        .update({
          screener_reset_at: now.toISOString(),
          last_progress_report_at: now.toISOString(),
        })
        .eq('email', member.email);

      processed++;
    } catch (err) {
      console.error('[monthly-reset] Error for member:', member.email, err);
      errors++;
    }
  }

  // Alert moderator if cron had failures
  if (errors > 0) {
    await sendSecurityAlert({
      type: 'cron_failure',
      subject: `Monthly Reset Cron — ${errors} failures`,
      detail: `Monthly reset processed ${processed} members with ${errors} errors for ${year}-${String(month).padStart(2, '0')}`,
      metadata: { processed: String(processed), errors: String(errors) },
    });
  }

  return NextResponse.json({
    ok: true,
    processed,
    errors,
    month,
    year,
  });
}
