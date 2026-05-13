/**
 * GET /api/auth/validate-invite?code=<code>
 *
 * Public endpoint (no auth required) — lets the signup page
 * confirm an invite code is real and unused before showing the
 * tester signup banner.
 *
 * Returns: { valid: boolean, reason?: 'unknown' | 'used' }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.json({ valid: false, reason: 'unknown' });
  }

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row } = await (admin as any)
    .from('tester_invite_codes')
    .select('code, used_at')
    .eq('code', code.toUpperCase())
    .maybeSingle();

  if (!row) return NextResponse.json({ valid: false, reason: 'unknown' });
  if (row.used_at) return NextResponse.json({ valid: false, reason: 'used' });
  return NextResponse.json({ valid: true });
}
