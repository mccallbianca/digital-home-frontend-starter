/**
 * PATCH /api/admin/journal-queue/[id]   — edit a draft article
 * DELETE /api/admin/journal-queue/[id]  — discard a draft article
 *
 * Both admin-only. DELETE refuses non-draft rows so we never
 * lose published content.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ADMIN_EMAILS = ['bianca@h3rr.com', 'bdmccall@gmail.com', 'mccall.bianca@gmail.com'];

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    return { ok: false as const, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { ok: true as const, supabase, user };
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guard = await assertAdmin();
  if (!guard.ok) return guard.response;

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const update: Record<string, unknown> = {};
  if (typeof body.title === 'string') update.title = body.title;
  if (typeof body.subtitle === 'string') update.subtitle = body.subtitle;
  if (typeof body.slug === 'string') update.slug = body.slug;
  if (typeof body.body === 'string') update.body = body.body;
  if (Object.keys(update).length === 0) return NextResponse.json({ error: 'No fields' }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (guard.supabase as any).from('content_objects').update(update).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guard = await assertAdmin();
  if (!guard.ok) return guard.response;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (guard.supabase as any)
    .from('content_objects')
    .delete()
    .eq('id', id)
    .eq('status', 'draft');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
