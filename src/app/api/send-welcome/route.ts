/**
 * POST /api/send-welcome
 *
 * Sends a branded welcome email via Resend containing a Supabase
 * magic link (signInWithOtp) that points to /auth/callback?next=/onboarding.
 *
 * Body: { email: string, name?: string, tier?: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    const { email, name, tier } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // ── Generate Supabase magic link ──────────────────────────────────
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    );

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${SITE_URL}/auth/callback?next=/onboarding`,
      },
    });

    // Fall back to inviteUserByEmail if generateLink fails
    let magicLink = '';
    if (linkError || !linkData?.properties?.action_link) {
      // Use invite as fallback — creates user if needed
      const { error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${SITE_URL}/auth/callback?next=/onboarding`,
        data: { name: name ?? '', tier: tier ?? '' },
      });
      if (inviteErr) {
        console.error('[send-welcome] invite error:', inviteErr.message);
      }
      // Even if invite fails (user may exist), we still send the branded email
      // The invite email from Supabase will also be sent
    } else {
      magicLink = linkData.properties.action_link;
    }

    // ── Send branded email via Resend ─────────────────────────────────
    const resendKey = process.env.RESEND_API_KEY ?? '';
    if (!resendKey) {
      console.warn('[send-welcome] RESEND_API_KEY not configured');
      return NextResponse.json({ sent: false, fallback: true });
    }

    const resend = new Resend(resendKey);
    const fromAddress = process.env.RESEND_FROM_ADDRESS ?? 'HERR by ECQO Holdings <hello@h3rr.com>';

    const displayName = name || 'there';
    const tierLabel = tier === 'elite' ? 'HERR Elite' : tier === 'personalized' ? 'HERR Personalized' : 'HERR';
    const loginUrl = magicLink || `${SITE_URL}/login`;

    const { error: sendError } = await resend.emails.send({
      from: fromAddress,
      to: email,
      replyTo: process.env.RESEND_REPLY_TO ?? 'hello@h3rr.com',
      subject: `Welcome to ${tierLabel} — Your Reprogramming Begins Now`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0A0A0F;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:48px 24px;">
    <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(240,238,233,0.5);margin-bottom:32px;">HERR™ by ECQO Holdings</p>

    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:36px;font-weight:300;color:#F0EEE9;line-height:1.1;margin-bottom:16px;">
      Welcome, ${displayName}.
    </h1>

    <p style="font-size:16px;color:rgba(240,238,233,0.7);line-height:1.7;margin-bottom:32px;">
      Your ${tierLabel} membership is confirmed. Click the button below to set up your account and begin your onboarding.
    </p>

    <a href="${loginUrl}" style="display:inline-block;background:#D946EF;color:#0A0A0F;font-weight:600;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;padding:14px 32px;text-decoration:none;">
      Set Up Your Account
    </a>

    <p style="font-size:13px;color:rgba(240,238,233,0.4);margin-top:32px;line-height:1.6;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${loginUrl}" style="color:#D946EF;word-break:break-all;">${loginUrl}</a>
    </p>

    <hr style="border:none;border-top:1px solid rgba(240,238,233,0.08);margin:32px 0;">

    <p style="font-size:11px;color:rgba(240,238,233,0.25);line-height:1.6;">
      HERR™ is a wellness tool and is not a substitute for professional mental health treatment. Always consult a licensed clinician for clinical concerns. © ECQO Holdings.
    </p>
  </div>
</body>
</html>`,
    });

    if (sendError) {
      console.error('[send-welcome] Resend error:', sendError);
      return NextResponse.json({ sent: false, error: sendError.message }, { status: 500 });
    }

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error('[send-welcome] Error:', err);
    return NextResponse.json({ error: 'Failed to send welcome email' }, { status: 500 });
  }
}
