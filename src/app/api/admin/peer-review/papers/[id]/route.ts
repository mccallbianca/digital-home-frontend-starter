/**
 * PATCH /api/admin/peer-review/papers/[id]
 *
 * Body: { status?, title?, description? }
 * Auth: admin email only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

const ADMIN_EMAILS = ['bianca@h3rr.com', 'bdmccall@gmail.com', 'mccall.bianca@gmail.com'];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const update: Record<string, unknown> = {};
  if (typeof body.status === 'string') {
    if (!['published', 'draft', 'archived'].includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    update.status = body.status;
  }
  if (typeof body.title === 'string') update.title = body.title;
  if (typeof body.description === 'string') update.description = body.description;

  if (Object.keys(update).length === 0) return NextResponse.json({ error: 'No fields' }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('peer_review_papers').update(update).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
