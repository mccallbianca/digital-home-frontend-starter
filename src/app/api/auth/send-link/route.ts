/**
 * POST /api/auth/send-link
 *
 * Generates a Supabase magic link server-side and emails it via Resend.
 * This bypasses Supabase's own email system entirely, giving us full
 * control over the redirect URL and email template.
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/security/rate-limit';
import { TRAUMA_MESSAGES } from '@/lib/security/trauma-messages';

const SUPABASE_URL = 'https://uyhfdtrvlhdhrhniysvw.supabase.co';
const SITE_URL = 'https://www.h3rr.com';

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 3 requests per hour
    const ip = req.headers.get('cf-connecting-ip')
      || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || 'unknown';
    const rlKey = getRateLimitKey('forgot-password', ip);
    const rlResult = checkRateLimit(rlKey, RATE_LIMITS['forgot-password']);
    if (!rlResult.allowed) {
      return NextResponse.json(
        { error: TRAUMA_MESSAGES.rateLimited },
        { status: 429 }
      );
    }

    const { email, next = '/dashboard' } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const resendKey  = process.env.RESEND_API_KEY ?? '';

    // ── 1. Generate magic link via Supabase Admin API ─────────────
    const linkRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'magiclink',
        email,
        options: { redirect_to: `${SITE_URL}/auth/callback?next=${encodeURIComponent(next)}` },
      }),
    });

    const linkData = await linkRes.json();
    if (!linkData.action_link) {
      console.error('[send-link] No action_link:', linkData);
      return NextResponse.json({ error: 'Could not generate login link' }, { status: 500 });
    }

    // ── 2. Rewrite the action_link redirect_to to include /next ───
    // Supabase strips query params from redirect_to — so we embed
    // the destination in the token URL itself as a hash param
    const actionUrl = new URL(linkData.action_link);
    actionUrl.searchParams.set('redirect_to', `${SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`);
    const finalLink = actionUrl.toString();

    // ── 3. Send email via Resend ──────────────────────────────────
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'HERR by ECQO Holdings <hello@h3rr.com>',
        to: [email],
        subject: 'Your HERR™ dashboard is ready.',
        html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="background:#0a0a0f;margin:0;padding:0;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;">
    <tr><td align="center" style="padding:60px 20px;">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0a0a0f;border:1px solid #1e1e2e;">
        <tr><td style="padding:40px 48px 0;">
          <p style="font-family:Georgia,serif;font-size:22px;letter-spacing:0.2em;color:#ffffff;margin:0;">HERR™</p>
        </td></tr>
        <tr><td style="padding:24px 48px 0;"><div style="height:1px;background:#1e1e2e;"></div></td></tr>
        <tr><td style="padding:40px 48px;">
          <p style="font-size:13px;letter-spacing:0.15em;text-transform:uppercase;color:#6b6b8a;margin:0 0 20px;">Your Reprogramming Begins</p>
          <h1 style="font-family:Georgia,serif;font-size:36px;font-weight:300;color:#ffffff;line-height:1.1;margin:0 0 24px;">You are on<br>the other side.</h1>
          <p style="font-size:15px;line-height:1.7;color:#8888aa;margin:0 0 32px;">Click below to access your HERR member dashboard.</p>
          <table cellpadding="0" cellspacing="0"><tr><td style="background:#d946ef;">
            <a href="${finalLink}" style="display:block;padding:16px 40px;font-family:Georgia,serif;font-size:13px;letter-spacing:0.15em;text-transform:uppercase;color:#ffffff;text-decoration:none;">Enter My Dashboard</a>
          </td></tr></table>
          <p style="font-size:12px;color:#4a4a6a;margin:32px 0 0;line-height:1.6;">This link expires in 60 minutes. If you did not request this, ignore this email.</p>
        </td></tr>
        <tr><td style="padding:0 48px 40px;border-top:1px solid #1e1e2e;">
          <p style="font-size:11px;color:#4a4a6a;margin:24px 0 0;line-height:1.6;">HERR™ is a wellness tool and is not a substitute for professional mental health treatment. © ECQO Holdings™.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      }),
    });

    if (!emailRes.ok) {
      const err = await emailRes.json();
      console.error('[send-link] Resend error:', err);
      // Still return ok — link was generated, just email failed
      return NextResponse.json({ error: 'Email send failed. Check Resend config.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error('[send-link] Error:', err);
    return NextResponse.json({ error: 'Failed to send login link' }, { status: 500 });
  }
}
