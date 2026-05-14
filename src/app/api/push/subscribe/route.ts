/**
 * POST /api/push/subscribe
 *
 * Body: PushSubscription JSON ({ endpoint, keys: { p256dh, auth } })
 * Auth: authenticated user.
 *
 * Stores the subscription in push_subscriptions. Subscribe-only —
 * send logic intentionally not wired in this block.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type SubBody = {
  endpoint?: string;
  keys?: { p256dh?: string; auth?: string };
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as SubBody;
  const endpoint = body.endpoint;
  const p256dh = body.keys?.p256dh;
  const auth = body.keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: 'Invalid subscription payload' }, { status: 400 });
  }

  const userAgent = req.headers.get('user-agent') ?? null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('push_subscriptions')
    .upsert(
      {
        user_id: user.id,
        endpoint,
        p256dh,
        auth,
        user_agent: userAgent,
      },
      { onConflict: 'user_id,endpoint' },
    );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
