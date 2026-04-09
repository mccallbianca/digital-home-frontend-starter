/**
 * POST /api/zoom/register
 *
 * Registers a user for a Zoom meeting using the Zoom Meeting Registration API.
 * Uses Server-to-Server OAuth for authentication.
 *
 * Body: { sessionId: string, email: string, firstName: string }
 * Returns: { joinUrl: string }
 */

import { NextRequest, NextResponse } from 'next/server';

async function getZoomAccessToken(): Promise<string> {
  const accountId = process.env.ZOOM_ACCOUNT_ID ?? '';
  const clientId = process.env.ZOOM_CLIENT_ID ?? '';
  const clientSecret = process.env.ZOOM_CLIENT_SECRET ?? '';

  if (!accountId || !clientId || !clientSecret) {
    throw new Error('Zoom credentials not configured');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Zoom OAuth failed: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const { email, firstName } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Get Zoom access token
    const accessToken = await getZoomAccessToken();

    // List upcoming meetings to find the next scheduled one
    const meetingsRes = await fetch('https://api.zoom.us/v2/users/me/meetings?type=upcoming&page_size=5', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!meetingsRes.ok) {
      const err = await meetingsRes.text();
      console.error('[zoom/register] List meetings error:', err);
      return NextResponse.json({ error: 'Could not fetch meetings' }, { status: 500 });
    }

    const meetingsData = await meetingsRes.json();
    const meeting = meetingsData.meetings?.[0];

    if (!meeting) {
      return NextResponse.json({ error: 'No upcoming sessions scheduled' }, { status: 404 });
    }

    // Register the user for the meeting
    const registerRes = await fetch(
      `https://api.zoom.us/v2/meetings/${meeting.id}/registrants`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          first_name: firstName || 'HERR Member',
        }),
      }
    );

    if (!registerRes.ok) {
      const err = await registerRes.text();
      console.error('[zoom/register] Registration error:', err);
      // If registration is not enabled, return the meeting join URL directly
      return NextResponse.json({
        joinUrl: meeting.join_url,
        meetingId: meeting.id,
      });
    }

    const regData = await registerRes.json();

    return NextResponse.json({
      joinUrl: regData.join_url || meeting.join_url,
      registrantId: regData.registrant_id,
      meetingId: meeting.id,
    });
  } catch (err) {
    console.error('[zoom/register] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Registration failed' },
      { status: 500 }
    );
  }
}
