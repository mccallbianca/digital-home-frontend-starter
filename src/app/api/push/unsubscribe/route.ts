/**
 * DELETE /api/push/unsubscribe
 *
 * Body: { endpoint: string }
 * Auth: authenticated user.
 *
 * Removes the push subscription row matching (user_id, endpoint).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { endpoint?: string };
  const endpoint = body.endpoint;
  if (!endpoint) return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('endpoint', endpoint);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
