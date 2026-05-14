/**
 * POST /api/admin/peer-review/papers
 *
 * Body: { title, description?, pdf_url, status: 'published'|'draft' }
 * Auth: admin email only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ADMIN_EMAILS = ['bianca@h3rr.com', 'bdmccall@gmail.com', 'mccall.bianca@gmail.com'];

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const title = String(body.title ?? '').trim();
  const description = body.description ? String(body.description) : null;
  const pdf_url = String(body.pdf_url ?? '').trim();
  const status = String(body.status ?? 'draft');
  if (!title || !pdf_url) return NextResponse.json({ error: 'Title and PDF required' }, { status: 400 });
  if (!['published', 'draft', 'archived'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('peer_review_papers')
    .insert({ title, description, pdf_url, status, uploaded_by: user.id })
    .select('id')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, paper_id: data.id });
}
