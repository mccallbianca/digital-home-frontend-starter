/**
 * POST /api/admin/testers/generate-codes
 *
 * Body: { count?: number } — default 5, max 50.
 * Auth: admin email only.
 *
 * Generates new 8-char uppercase alphanumeric tester invite codes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

const ADMIN_EMAILS = ['bianca@h3rr.com', 'bdmccall@gmail.com', 'mccall.bianca@gmail.com'];

function generateCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < 8; i += 1) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { count = 5 } = (await req.json().catch(() => ({}))) as { count?: number };
  const safeCount = Math.max(1, Math.min(50, Math.floor(count)));

  const codes = Array.from({ length: safeCount }, () => ({
    code: generateCode(),
    created_by: user.id,
  }));

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('tester_invite_codes').insert(codes);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, count: safeCount });
}
