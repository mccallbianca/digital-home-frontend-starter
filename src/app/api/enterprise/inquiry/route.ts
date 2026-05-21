/**
 * POST /api/enterprise/inquiry
 *
 * Public (unauthenticated) endpoint behind the /enterprise + /enterprise/sports
 * contact forms. Validates → inserts into enterprise_inquiries → forwards
 * the lead to mccall.bianca@gmail.com via Resend so triage starts in her
 * inbox immediately.
 *
 * Body: { name, email, organization, org_type, message, source? }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/resend';

const VALID_ORG_TYPES = [
  'healthcare', 'behavioral_health', 'sports',
  'education', 'government', 'other',
] as const;
type OrgType = (typeof VALID_ORG_TYPES)[number];

const TRIAGE_TO = 'mccall.bianca@gmail.com';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  const name         = typeof body.name === 'string'         ? body.name.trim()         : '';
  const email        = typeof body.email === 'string'        ? body.email.trim()        : '';
  const organization = typeof body.organization === 'string' ? body.organization.trim() : '';
  const orgTypeRaw   = typeof body.org_type === 'string'     ? body.org_type.trim()     : '';
  const message      = typeof body.message === 'string'      ? body.message.trim()      : '';
  const source       = typeof body.source === 'string'       ? body.source.trim()       : 'enterprise_page';

  if (!name || !email || !organization || !message) {
    return NextResponse.json({ error: 'name, email, organization, and message are all required.' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }
  if (!(VALID_ORG_TYPES as readonly string[]).includes(orgTypeRaw)) {
    return NextResponse.json({ error: 'Pick a valid organization type.' }, { status: 400 });
  }
  if (name.length > 200 || organization.length > 200 || message.length > 4000) {
    return NextResponse.json({ error: 'Message is too long.' }, { status: 400 });
  }

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('enterprise_inquiries')
    .insert({
      name,
      email,
      organization,
      org_type: orgTypeRaw as OrgType,
      message,
      source,
    })
    .select('id, created_at')
    .single();
  if (error) {
    console.error('[enterprise/inquiry] insert error:', error);
    return NextResponse.json({ error: 'Could not save your inquiry. Try again in a moment.' }, { status: 500 });
  }

  // Fire-and-forget: forward to Bianca via Resend. Don't block the response.
  try {
    const html = `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1a1a1a;line-height:1.6">
        <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#C42D8E;font-weight:600;margin:0 0 12px">New enterprise inquiry · ${escapeHtml(source)}</p>
        <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:24px;margin:0 0 18px">${escapeHtml(name)}</h1>
        <p style="margin:0 0 4px"><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p style="margin:0 0 4px"><strong>Organization:</strong> ${escapeHtml(organization)}</p>
        <p style="margin:0 0 16px"><strong>Type:</strong> ${escapeHtml(orgTypeRaw)}</p>
        <hr style="border:none;border-top:1px solid #e5e2da;margin:18px 0"/>
        <p style="margin:0 0 6px;font-weight:600">Message</p>
        <p style="white-space:pre-wrap;margin:0">${escapeHtml(message)}</p>
        <p style="margin-top:24px;font-size:12px;color:#6b6b6b">Row ID: ${data?.id ?? '—'} · ${data?.created_at ?? ''}</p>
      </div>
    `.trim();
    await sendEmail({
      to: TRIAGE_TO,
      subject: `New ${orgTypeRaw} inquiry: ${organization}`,
      html,
    });
  } catch (err) {
    console.error('[enterprise/inquiry] Resend forward failed (non-fatal):', err);
  }

  return NextResponse.json({ success: true, inquiry_id: data?.id ?? null });
}
