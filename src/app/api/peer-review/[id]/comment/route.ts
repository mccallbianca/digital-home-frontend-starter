/**
 * POST /api/peer-review/[id]/comment
 *
 * Body: { comment_text: string }
 * Adds a comment to a paper for the authenticated user.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { comment_text?: string };
  const text = (body.comment_text ?? '').trim();
  if (!text) return NextResponse.json({ error: 'Comment empty' }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('peer_review_comments')
    .insert({ paper_id: id, member_id: user.id, comment_text: text })
    .select('id')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, comment_id: data.id });
}
