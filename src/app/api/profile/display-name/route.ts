/**
 * POST /api/profile/display-name
 *
 * Sets the authenticated user's public handle (profiles.display_name).
 * Returns a friendly error on unique-violation rather than the raw
 * Postgres 23505 message.
 *
 * Body: { display_name: string | null }
 *
 *   - empty string / null → clears the handle
 *   - non-null            → must match ^[a-zA-Z0-9_]{3,30}$
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

const FORMAT_RE = /^[a-zA-Z0-9_]{3,30}$/;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const raw = body.display_name;
  const next = typeof raw === 'string' ? raw.trim() : raw;

  if (next !== null && next !== '' && (typeof next !== 'string' || !FORMAT_RE.test(next))) {
    return NextResponse.json(
      { error: 'Display name must be 3-30 characters: letters, numbers, or underscore.' },
      { status: 400 },
    );
  }

  const value: string | null = next === '' || next == null ? null : (next as string);

  // Case-insensitive availability check before update so we can return a
  // friendly message; the DB unique index is the canonical guard if a
  // race lands here first.
  if (value !== null) {
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = admin as any;
    const { data: collision } = await db
      .from('profiles')
      .select('id')
      .ilike('display_name', value)
      .neq('id', user.id)
      .maybeSingle();
    if (collision?.id) {
      return NextResponse.json(
        { error: 'That display name is taken. Try another.' },
        { status: 409 },
      );
    }
  }

  // display_name added in migration 20260526; not yet in generated types.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('profiles')
    .update({ display_name: value })
    .eq('id', user.id);

  if (error) {
    if (error.code === '23505' || /duplicate key/i.test(error.message)) {
      return NextResponse.json(
        { error: 'That display name is taken. Try another.' },
        { status: 409 },
      );
    }
    if (error.code === '23514' || /check constraint/i.test(error.message)) {
      return NextResponse.json(
        { error: 'Display name must be 3-30 characters: letters, numbers, or underscore.' },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, display_name: value });
}
