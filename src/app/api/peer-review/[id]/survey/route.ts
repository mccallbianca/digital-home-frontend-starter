/**
 * POST /api/peer-review/[id]/survey
 *
 * Upserts the caller's survey row for a paper. Body fields are
 * all optional (rating, clinical_relevance, methodological_rigor,
 * free_response).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

function clampInt(v: unknown): number | null {
  if (typeof v !== 'number' || !Number.isFinite(v)) return null;
  const n = Math.round(v);
  if (n < 1 || n > 5) return null;
  return n;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const payload = {
    paper_id: id,
    member_id: user.id,
    rating: clampInt(body.rating),
    clinical_relevance: clampInt(body.clinical_relevance),
    methodological_rigor: clampInt(body.methodological_rigor),
    free_response: typeof body.free_response === 'string' ? body.free_response : null,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('peer_review_surveys')
    .upsert(payload, { onConflict: 'paper_id,member_id' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
