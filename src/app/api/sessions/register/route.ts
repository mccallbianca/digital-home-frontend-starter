/**
 * POST /api/sessions/register
 *
 * Phase 1v2 EPIC B5: authenticated member registers for a live session.
 * Writes to session_registrations (UNIQUE(session_id, member_id)) and
 * sends a Resend confirmation email.
 *
 * Body:    { session_id: uuid }
 * Returns: { ok: true, registration_id }
 *
 * Auth:    Supabase session cookie required (middleware-gated under
 *          /api/sessions). user_id is taken from the session, never the
 *          request body, so members cannot register on behalf of others.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email/resend';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function formatPTDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    timeZone: 'America/Los_Angeles',
  });
}

function formatPTTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
    timeZone: 'America/Los_Angeles', timeZoneName: 'short',
  });
}

export async function POST(req: NextRequest) {
  try {
    const { session_id } = await req.json();
    if (!session_id) {
      return NextResponse.json({ error: 'session_id required' }, { status: 400 });
    }

    // Get the authenticated user.
    const ssr = await createServerSupabase();
    const { data: { user } } = await ssr.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Use service-role client for the write so RLS-policy errors surface clearly.
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Fetch the session for confirmation email.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: session } = await (admin as any)
      .from('live_sessions')
      .select('id, scheduled_at, duration_min, title, description, max_seats')
      .eq('id', session_id)
      .single();
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Capacity check.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: registeredCount } = await (admin as any)
      .from('session_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', session_id);
    if ((registeredCount ?? 0) >= (session.max_seats ?? 25)) {
      return NextResponse.json({ error: 'This session is full.' }, { status: 409 });
    }

    // UPSERT registration (composite unique session_id + member_id silently no-ops re-clicks).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: reg, error: insertErr } = await (admin as any)
      .from('session_registrations')
      .upsert(
        { session_id, member_id: user.id, registered_at: new Date().toISOString() },
        { onConflict: 'session_id,member_id' },
      )
      .select('id')
      .single();
    if (insertErr) {
      console.error('[sessions/register] insert error:', insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    // Fetch profile for greeting + email destination.
    const { data: profile } = await admin
      .from('profiles')
      .select('email, preferred_name, first_name')
      .eq('id', user.id)
      .single();
    const memberEmail = profile?.email ?? user.email ?? '';
    const memberName = profile?.preferred_name || profile?.first_name || 'HERR member';

    // Resend confirmation email.
    if (memberEmail) {
      const dateStr = formatPTDate(session.scheduled_at);
      const timeStr = formatPTTime(session.scheduled_at);
      await sendEmail({
        to: memberEmail,
        subject: `You're registered for ${session.title}`,
        html: `
          <div style="background:#F4F1EB;color:#1A0F1A;padding:40px;font-family:system-ui,-apple-system,sans-serif;">
            <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#C42D8E;font-weight:600;margin:0 0 8px;">Confirmed</p>
            <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:32px;font-weight:500;margin:0 0 12px;">You're in, ${memberName}.</h1>
            <p style="color:rgba(26,15,26,0.65);margin:0 0 28px;line-height:1.6;">Registration confirmed for ${session.title}.</p>
            <div style="background:#FFFFFF;border:1px solid rgba(26,15,26,0.12);border-radius:12px;padding:24px;margin-bottom:24px;">
              <p style="color:#C42D8E;font-size:11px;text-transform:uppercase;letter-spacing:0.18em;font-weight:600;margin:0 0 12px;">Session Details</p>
              <p style="margin:6px 0;"><strong>Date:</strong> ${dateStr}</p>
              <p style="margin:6px 0;"><strong>Time:</strong> ${timeStr}</p>
              <p style="margin:6px 0;"><strong>Duration:</strong> ${session.duration_min} minutes</p>
              <p style="margin:6px 0;"><strong>Host:</strong> ${process.env.NEXT_PUBLIC_PRODUCT_FOUNDER_CREDENTIAL || 'Bianca D. McCall, M.A., LMFT'}</p>
            </div>
            <p style="font-size:13px;color:rgba(26,15,26,0.55);line-height:1.6;">Your Zoom join link will be sent to this email 24 hours before the session. Manage notifications at <a href="https://www.h3rr.com/dashboard/settings" style="color:#C42D8E;text-decoration:underline;">your settings</a>.</p>
            <p style="margin-top:28px;font-size:11px;color:rgba(26,15,26,0.45);">${process.env.NEXT_PUBLIC_PRODUCT_NAME || 'HERR'} &mdash; ${process.env.NEXT_PUBLIC_PRODUCT_LONG_NAME || 'Human Existential Regulator and Reprogramming'}<br/>&copy; ECQO Holdings</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ ok: true, registration_id: reg.id });
  } catch (err) {
    console.error('[sessions/register] error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Registration failed' },
      { status: 500 },
    );
  }
}
