/**
 * POST /api/admin/live-sessions/[id]/set-zoom
 *
 * Body: { zoom_join_url, zoom_meeting_id?, zoom_start_url?, host_notes? }
 *
 * Replaces the placeholder Zoom URL on a seeded live_session row.
 * Validates that zoom_join_url is a real zoom.us link (not the
 * PLACEHOLDER string).
 *
 * Auth: admin allowlist only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

const ADMIN_EMAILS = ['bianca@h3rr.com', 'bdmccall@gmail.com', 'mccall.bianca@gmail.com'];

function isValidZoomUrl(url: string): boolean {
  if (!url) return false;
  if (url.includes('PLACEHOLDER')) return false;
  try {
    const u = new URL(url);
    // Accept zoom.us subdomains (us02web, us05web, etc.)
    return u.protocol === 'https:' && /(^|\.)zoom\.us$/i.test(u.hostname);
  } catch {
    return false;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: 'invalid session id' }, { status: 400 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const joinUrl   = typeof body.zoom_join_url   === 'string' ? body.zoom_join_url.trim()   : '';
  const meetingId = typeof body.zoom_meeting_id === 'string' ? body.zoom_meeting_id.trim() : '';
  const startUrl  = typeof body.zoom_start_url  === 'string' ? body.zoom_start_url.trim()  : '';
  const notes     = typeof body.host_notes      === 'string' ? body.host_notes.trim()      : '';

  if (!isValidZoomUrl(joinUrl)) {
    return NextResponse.json(
      { error: 'zoom_join_url must be a real https://*.zoom.us/j/... link' },
      { status: 400 },
    );
  }
  if (startUrl && !isValidZoomUrl(startUrl)) {
    return NextResponse.json(
      { error: 'zoom_start_url must be a real https://*.zoom.us link' },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  const update: Record<string, unknown> = {
    zoom_join_url: joinUrl,
  };
  if (meetingId) update.zoom_meeting_id = meetingId;
  if (startUrl) update.zoom_start_url = startUrl;
  update.host_notes = notes || null;

  const { data, error } = await db
    .from('live_sessions')
    .update(update)
    .eq('id', id)
    .select('id, title, zoom_join_url, zoom_meeting_id, host_notes')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'session not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, session: data });
}
