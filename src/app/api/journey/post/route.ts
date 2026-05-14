/**
 * POST /api/journey/post
 *
 * Body: { caption, media_url (storage path), media_type }
 * Auth: paid plan required (RLS enforces too).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PAID_PLANS = ['collective', 'personalized', 'elite'];

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: profile } = await db.from('profiles').select('plan').eq('id', user.id).maybeSingle();
  if (!PAID_PLANS.includes(profile?.plan ?? 'free')) {
    return NextResponse.json({ error: 'Paid plan required' }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const caption = body.caption ? String(body.caption) : null;
  const media_url = String(body.media_url ?? '').trim();
  const media_type = String(body.media_type ?? '');
  if (!media_url) return NextResponse.json({ error: 'Missing media_url' }, { status: 400 });
  if (media_type !== 'image' && media_type !== 'video') {
    return NextResponse.json({ error: 'Invalid media_type' }, { status: 400 });
  }

  const { data, error } = await db
    .from('journey_posts')
    .insert({ member_id: user.id, caption, media_url, media_type })
    .select('id')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, post_id: data.id });
}
