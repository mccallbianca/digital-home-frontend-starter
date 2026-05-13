/**
 * POST /api/journey/[id]/comment
 *
 * Body: { comment_text }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

const PAID_PLANS = ['collective', 'personalized', 'elite'];

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: profile } = await db.from('profiles').select('plan').eq('id', user.id).maybeSingle();
  if (!PAID_PLANS.includes(profile?.plan ?? 'free')) {
    return NextResponse.json({ error: 'Paid plan required' }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as { comment_text?: string };
  const text = (body.comment_text ?? '').trim();
  if (!text) return NextResponse.json({ error: 'Empty comment' }, { status: 400 });

  const { error } = await db.from('journey_comments').insert({
    post_id: id,
    member_id: user.id,
    comment_text: text,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
