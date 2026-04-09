/**
 * POST /api/sessions/register
 *
 * Register for a live session. Writes to live_session_registrations,
 * checks seat count, sends confirmation email via Resend.
 *
 * Body: { sessionId, firstName, lastName, email, tier }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email/resend';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, firstName, lastName, email, tier } = await req.json();

    if (!sessionId || !email) {
      return NextResponse.json({ error: 'sessionId and email required' }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get session details
    const { data: session } = await supabase
      .from('live_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check seat count
    const { count } = await supabase
      .from('live_session_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId);

    if ((count || 0) >= (session.capacity || 25)) {
      return NextResponse.json({ error: 'Session is full' }, { status: 409 });
    }

    // Check duplicate
    const { data: existing } = await supabase
      .from('live_session_registrations')
      .select('id')
      .eq('session_id', sessionId)
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Already registered', registrationId: existing.id });
    }

    // Insert registration
    const { data: reg, error: regErr } = await supabase
      .from('live_session_registrations')
      .insert({
        session_id: sessionId,
        first_name: firstName,
        last_name: lastName,
        email,
        tier: tier || 'collective',
        confirmation_sent: false,
        zoom_link_sent: false,
      })
      .select('id')
      .single();

    if (regErr) {
      return NextResponse.json({ error: regErr.message }, { status: 500 });
    }

    // Send confirmation email
    const sessionDate = new Date(session.scheduled_at).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
    const sessionTime = new Date(session.scheduled_at).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York',
    });

    const emailResult = await sendEmail({
      to: email,
      subject: `You're registered: ${session.title}`,
      html: `
        <div style="background:#0A0A0F;color:#F4F1EB;padding:40px;font-family:system-ui,sans-serif;">
          <h1 style="font-size:28px;font-weight:300;margin-bottom:8px;">You're In.</h1>
          <p style="color:rgba(244,241,235,0.5);margin-bottom:32px;">Registration confirmed for ${session.title}</p>
          <div style="border:1px solid rgba(244,241,235,0.1);padding:24px;margin-bottom:24px;">
            <p style="color:#C42D8E;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;">Session Details</p>
            <p style="margin:4px 0;"><strong>Date:</strong> ${sessionDate}</p>
            <p style="margin:4px 0;"><strong>Time:</strong> ${sessionTime} ET</p>
            <p style="margin:4px 0;"><strong>Duration:</strong> 90 minutes</p>
            <p style="margin:4px 0;"><strong>Host:</strong> Bianca D. McCall, LMFT</p>
          </div>
          <p style="font-size:13px;color:rgba(244,241,235,0.4);">Your Zoom join link will be sent 24 hours before the session.</p>
          <p style="margin-top:24px;font-size:11px;color:rgba(244,241,235,0.3);">HERR &mdash; Human Existential Response and Reprogramming &copy; ECQO Holdings</p>
        </div>
      `,
    });

    if ('id' in emailResult) {
      await supabase
        .from('live_session_registrations')
        .update({ confirmation_sent: true })
        .eq('id', reg.id);
    }

    return NextResponse.json({
      ok: true,
      registrationId: reg.id,
      seatsRemaining: (session.capacity || 25) - (count || 0) - 1,
    });

  } catch (err) {
    console.error('[sessions/register] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Registration failed' },
      { status: 500 }
    );
  }
}
