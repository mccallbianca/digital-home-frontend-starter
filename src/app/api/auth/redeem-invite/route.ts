/**
 * POST /api/auth/redeem-invite
 *
 * Body: { code: string }
 * Auth: authenticated user (session cookie).
 *
 * Validates a tester invite code, marks it used, and flips
 * the caller's profiles.is_tester to true. Idempotent for the
 * same user — repeated calls with the same code after first
 * redemption return 409 (already used) without further mutation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const { code } = (await req.json().catch(() => ({}))) as { code?: string };
  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'Missing invite code' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row, error: lookupErr } = await (admin as any)
    .from('tester_invite_codes')
    .select('code, used_at, used_by')
    .eq('code', code.toUpperCase())
    .maybeSingle();

  if (lookupErr) {
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
  if (!row) {
    return NextResponse.json({ error: 'Invite code not recognized' }, { status: 404 });
  }
  if (row.used_at && row.used_by !== user.id) {
    return NextResponse.json({ error: 'Invite code already used' }, { status: 409 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateCodeErr } = await (admin as any)
    .from('tester_invite_codes')
    .update({ used_at: new Date().toISOString(), used_by: user.id })
    .eq('code', code.toUpperCase());
  if (updateCodeErr) {
    return NextResponse.json({ error: 'Failed to mark code used' }, { status: 500 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: profileErr } = await (admin as any)
    .from('profiles')
    .update({ is_tester: true })
    .eq('id', user.id);
  if (profileErr) {
    return NextResponse.json({ error: 'Failed to set tester flag' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
