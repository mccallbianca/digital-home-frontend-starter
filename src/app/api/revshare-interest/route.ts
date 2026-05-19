/**
 * POST /api/revshare-interest
 * Captures Elite RevShare Interest List signups from the /checkout Elite
 * card modal. Sends a notification email to hello@h3rr.com via Resend.
 * Public endpoint (no auth) — lead capture before purchase.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/resend';

interface RevSharePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  state?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(request: NextRequest) {
  let body: RevSharePayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const firstName = (body.first_name || '').trim();
  const lastName = (body.last_name || '').trim();
  const email = (body.email || '').trim();
  const state = (body.state || '').trim();

  if (!firstName || !lastName || !email || !state) {
    return NextResponse.json(
      { error: 'All fields are required.' },
      { status: 400 }
    );
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: 'Please enter a valid email address.' },
      { status: 400 }
    );
  }

  const subject = `New Elite RevShare Interest: ${firstName} ${lastName}`;
  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;color:#1A0F1A;line-height:1.6;">
      <h2 style="color:#C42D8E;margin:0 0 16px;">New Elite RevShare Interest List Signup</h2>
      <p>Submitted via the /checkout Elite card popup.</p>
      <table style="border-collapse:collapse;margin-top:12px;">
        <tr><td style="padding:6px 12px;color:#888;">First name</td><td style="padding:6px 12px;font-weight:600;">${esc(firstName)}</td></tr>
        <tr><td style="padding:6px 12px;color:#888;">Last name</td><td style="padding:6px 12px;font-weight:600;">${esc(lastName)}</td></tr>
        <tr><td style="padding:6px 12px;color:#888;">Email</td><td style="padding:6px 12px;font-weight:600;"><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
        <tr><td style="padding:6px 12px;color:#888;">Resident state</td><td style="padding:6px 12px;font-weight:600;">${esc(state)}</td></tr>
      </table>
      <p style="margin-top:24px;color:#888;font-size:13px;">HERR &middot; ECQO Holdings</p>
    </div>
  `;

  const text = [
    'New Elite RevShare Interest List Signup',
    `First name: ${firstName}`,
    `Last name: ${lastName}`,
    `Email: ${email}`,
    `Resident state: ${state}`,
  ].join('\n');

  const result = await sendEmail({
    to: 'hello@h3rr.com',
    subject,
    html,
    text,
    replyTo: email,
    tags: [{ name: 'source', value: 'elite_revshare_interest' }],
  });

  if ('error' in result) {
    console.error('[revshare-interest] Resend failure:', result.error);
    return NextResponse.json(
      { error: 'Something went wrong. Please email hello@h3rr.com directly.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, id: result.id });
}
