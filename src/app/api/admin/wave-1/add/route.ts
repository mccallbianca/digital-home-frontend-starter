/**
 * POST /api/admin/wave-1/add
 *
 * Add a single tester to the beta_testers invite list.
 *
 * Body: { email, full_name?, signup_source? }
 * Auth: admin allowlist.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

const ADMIN_EMAILS = ['bianca@h3rr.com', 'bdmccall@gmail.com', 'mccall.bianca@gmail.com'];

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const fullName = typeof body.full_name === 'string' ? body.full_name.trim() : null;
  const source = typeof body.signup_source === 'string' ? body.signup_source.trim() : 'manual';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'valid email required' }, { status: 400 });
  }

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  const { data, error } = await db
    .from('beta_testers')
    .insert({
      email,
      full_name: fullName || null,
      signup_source: source,
      invited_at: new Date().toISOString(),
      status: 'invited',
    })
    .select('id, email, status')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'email already in the list' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, tester: data });
}
