/**
 * POST /api/journey/[id]/react
 *
 * Body: { reaction: 'heart' | 'strength' | 'support' }
 * Toggle behavior: if (member, post, reaction) row exists -> delete it,
 * else insert. UNIQUE(post_id, member_id, reaction) lets the same member
 * stack multiple distinct reactions on the same post but not duplicate
 * the same reaction.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

const PAID_PLANS = ['collective', 'personalized', 'elite'];
const VALID = ['heart', 'strength', 'support'];

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

  const body = (await req.json().catch(() => ({}))) as { reaction?: string };
  const reaction = String(body.reaction ?? '');
  if (!VALID.includes(reaction)) {
    return NextResponse.json({ error: 'Invalid reaction' }, { status: 400 });
  }

  const { data: existing } = await db
    .from('journey_reactions')
    .select('id')
    .eq('post_id', id)
    .eq('member_id', user.id)
    .eq('reaction', reaction)
    .maybeSingle();

  if (existing) {
    const { error } = await db.from('journey_reactions').delete().eq('id', existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, toggled: 'off' });
  }

  const { error } = await db.from('journey_reactions').insert({
    post_id: id,
    member_id: user.id,
    reaction,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, toggled: 'on' });
}
