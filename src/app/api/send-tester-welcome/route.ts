/**
 * POST /api/send-tester-welcome
 *
 * Sends the Tester Wave 1 welcome email via Resend. Distinct from
 * /api/send-welcome (post-Stripe checkout) — this is the onboarding
 * touch for invited testers, including the duty-of-care 988 chain
 * required for clinical-AI distribution.
 *
 * Body: { email: string, name?: string }
 * Auth: optional — recommended to call with API_SECRET_KEY header in
 *       production. The route is intentionally permissive for the
 *       initial tester wave so the operator dashboard can fire it.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://h3rr.com';
const FROM_ADDRESS =
  process.env.RESEND_FROM_ADDRESS || 'HERR by ECQO Holdings <hello@h3rr.com>';
const REPLY_TO = process.env.RESEND_REPLY_TO || 'mccall.bianca@gmail.com';

export async function POST(req: NextRequest) {
  try {
    const { email, name } = (await req.json()) as { email?: string; name?: string };

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json(
        { error: 'RESEND_API_KEY not configured' },
        { status: 500 },
      );
    }

    const resend = new Resend(resendKey);
    const displayName = (name || 'there').trim();
    const screenerUrl = `${SITE_URL}/screener`;

    const subject = 'Welcome to HERR — Your Self-Screen Awaits';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0A0A0F;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#F4F1EB;">
  <div style="max-width:600px;margin:0 auto;padding:48px 24px;">

    <p style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#E8388A;font-weight:700;margin:0 0 28px;">
      POWERED BY ECQO
    </p>

    <h1 style="font-size:32px;font-weight:800;color:#F4F1EB;line-height:1.1;letter-spacing:-0.02em;margin:0 0 18px;">
      Welcome to HERR, ${escapeHtml(displayName)}.
    </h1>

    <p style="font-size:16px;color:rgba(244,241,235,0.85);line-height:1.7;margin:0 0 24px;">
      You have been invited to the Tester Wave 1 of HERR — Human Existential
      Regulator and Reprogramming. This note is personal. Read it before you
      click anything else.
    </p>

    <h2 style="font-size:18px;font-weight:700;color:#F4F1EB;margin:32px 0 10px;">
      What HERR is
    </h2>
    <p style="font-size:15px;color:rgba(244,241,235,0.78);line-height:1.7;margin:0 0 20px;">
      HERR is a clinical AI infrastructure for personal regulation. Layered
      music, daily affirmations, and a conversational companion designed by a
      licensed clinician with 30 years in the behavioral sciences. The point is
      not motivation. The point is helping your nervous system feel safe enough
      to come back online.
    </p>

    <h2 style="font-size:18px;font-weight:700;color:#F4F1EB;margin:32px 0 10px;">
      How to begin
    </h2>
    <p style="font-size:15px;color:rgba(244,241,235,0.78);line-height:1.7;margin:0 0 20px;">
      Start with the Self-Screen — five minutes, clinically validated, and the
      only way HERR learns who you are. Your results unlock the rest of the
      experience.
    </p>

    <p style="margin:0 0 28px;">
      <a href="${escapeHtml(screenerUrl)}" style="display:inline-block;background:#C42D8E;color:#FFFFFF;font-weight:700;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;padding:14px 32px;text-decoration:none;border-radius:4px;">
        Complete Your Self-Screen →
      </a>
    </p>

    <h2 style="font-size:18px;font-weight:700;color:#F4F1EB;margin:32px 0 10px;">
      Eight activity modes
    </h2>
    <p style="font-size:15px;color:rgba(244,241,235,0.78);line-height:1.7;margin:0 0 20px;">
      Workout · Driving · Sleep · Morning · Deep Work · Love &amp; Family ·
      Abundance · Healing. Pick the ones that match your day. HERR meets you
      where you are.
    </p>

    <!-- ── CRITICAL SAFETY SECTION ─────────────────────────────────── -->
    <div style="margin:36px 0;padding:24px;background:#F4F1EB;color:#1A0F1A;border-radius:4px;border-left:4px solid #C42D8E;">
      <p style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#C42D8E;font-weight:800;margin:0 0 12px;">
        SAFETY FIRST
      </p>
      <p style="font-size:15px;font-weight:600;color:#1A0F1A;line-height:1.55;margin:0 0 14px;">
        Your safety is our highest priority. HERR is a clinical AI platform, not
        a crisis response service.
      </p>
      <p style="font-size:14px;color:rgba(26,15,26,0.82);line-height:1.6;margin:0 0 10px;">
        If you are experiencing a mental health crisis or thoughts of self-harm:
      </p>
      <ul style="font-size:14px;color:rgba(26,15,26,0.82);line-height:1.7;margin:0 0 12px;padding-left:20px;">
        <li>
          Call or text <strong style="color:#C42D8E;">988</strong> — the
          Suicide and Crisis Lifeline (US). Available 24/7, free, confidential.
        </li>
        <li>
          Or text <strong style="color:#C42D8E;">HOME</strong> to
          <strong style="color:#C42D8E;">741741</strong> — Crisis Text Line.
        </li>
        <li>
          If you are in immediate danger, call
          <strong style="color:#C42D8E;">911</strong>.
        </li>
      </ul>
      <p style="font-size:13px;color:rgba(26,15,26,0.7);line-height:1.55;margin:0;">
        These resources are available in addition to — never instead of — your
        existing care team.
      </p>
    </div>

    <h2 style="font-size:18px;font-weight:700;color:#F4F1EB;margin:32px 0 10px;">
      How to reach me
    </h2>
    <p style="font-size:15px;color:rgba(244,241,235,0.78);line-height:1.7;margin:0 0 24px;">
      Tester feedback goes straight to my inbox during Wave 1.
      <a href="mailto:mccall.bianca@gmail.com" style="color:#E8388A;text-decoration:underline;">mccall.bianca@gmail.com</a>.
      Anything that feels off, anything that surprises you, anything that helped
      — I want to know.
    </p>

    <p style="font-size:15px;color:rgba(244,241,235,0.85);line-height:1.7;margin:24px 0 4px;">
      Thank you for being here.
    </p>
    <p style="font-size:15px;color:rgba(244,241,235,0.85);line-height:1.4;margin:0;">
      <strong>Bianca D. McCall, M.A., LMFT</strong><br>
      <span style="color:rgba(244,241,235,0.55);font-size:13px;">Founder, HERR · ECQO Holdings</span>
    </p>

    <hr style="border:none;border-top:1px solid rgba(244,241,235,0.08);margin:36px 0 20px;">

    <p style="font-size:11px;color:rgba(244,241,235,0.4);line-height:1.6;margin:0;">
      HERR is a wellness platform. It is not a substitute for licensed clinical
      care. © ECQO Holdings.
    </p>
  </div>
</body>
</html>`;

    const text = [
      `Welcome to HERR, ${displayName}.`,
      '',
      'You have been invited to Tester Wave 1 of HERR — Human Existential Regulator and Reprogramming.',
      '',
      'What HERR is:',
      'A clinical AI infrastructure for personal regulation. Layered music, daily affirmations, and a conversational companion designed by a licensed clinician with 30 years in behavioral sciences.',
      '',
      'How to begin:',
      `Start with the Self-Screen — 5 minutes, clinically validated. ${screenerUrl}`,
      '',
      'Eight activity modes:',
      'Workout · Driving · Sleep · Morning · Deep Work · Love & Family · Abundance · Healing.',
      '',
      '── SAFETY FIRST ──',
      'Your safety is our highest priority. HERR is a clinical AI platform, not a crisis response service.',
      '',
      'If you are experiencing a mental health crisis or thoughts of self-harm:',
      '· Call or text 988 — the Suicide and Crisis Lifeline (US). Available 24/7, free, confidential.',
      '· Or text HOME to 741741 — Crisis Text Line.',
      '· If you are in immediate danger, call 911.',
      '',
      'These resources are available in addition to — never instead of — your existing care team.',
      '',
      'How to reach me:',
      'Tester feedback goes straight to my inbox during Wave 1. mccall.bianca@gmail.com',
      '',
      'Thank you for being here.',
      '',
      'Bianca D. McCall, M.A., LMFT',
      'Founder, HERR · ECQO Holdings',
      '',
      '── ',
      'HERR is a wellness platform. It is not a substitute for licensed clinical care. © ECQO Holdings.',
    ].join('\n');

    const { error: sendError, data } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      replyTo: REPLY_TO,
      subject,
      html,
      text,
      tags: [{ name: 'campaign', value: 'tester_wave_1_welcome' }],
    });

    if (sendError) {
      console.error('[send-tester-welcome] Resend error:', sendError);
      return NextResponse.json(
        { sent: false, error: sendError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ sent: true, id: data?.id });
  } catch (err) {
    console.error('[send-tester-welcome] error:', err);
    return NextResponse.json(
      { error: 'Failed to send tester welcome' },
      { status: 500 },
    );
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
