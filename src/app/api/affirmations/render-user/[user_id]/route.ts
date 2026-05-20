/**
 * POST /api/affirmations/render-user/[user_id]
 *
 * Pipeline B trigger. Renders the current month's personalized
 * affirmation set for a single user.
 *
 * Idempotent: user_personalized_affirmations has UNIQUE(user_id,
 * template_id, generated_for_month), so re-running the same month is
 * a no-op for already-rendered rows. Non-VCP users skip the
 * ElevenLabs call entirely and reuse template.bianca_audio_url.
 *
 * Auth:
 *   - The user themselves (auth.uid() === [user_id]), OR
 *   - An admin from the allowlist.
 *
 * Body:
 *   { template_ids?: string[] }   // optional explicit subset
 *
 * If template_ids is omitted, we pull the user's monthly subset
 * from user_affirmation_assignments (if present) or fall back to a
 * heuristic: all `voice_rendered` templates matching the user's
 * cultural_routing for the current calendar month. Bianca's
 * scheduler can later route through this same endpoint.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { renderUserAffirmation } from '@/lib/affirmations/render-user-personalized';

const ADMIN_EMAILS = ['bianca@h3rr.com', 'bdmccall@gmail.com', 'mccall.bianca@gmail.com'];
const MAX_TEMPLATES_PER_RUN = 32;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ user_id: string }> },
) {
  const { user_id: targetUserId } = await params;

  if (!targetUserId || !/^[0-9a-f-]{36}$/i.test(targetUserId)) {
    return NextResponse.json({ error: 'invalid user_id' }, { status: 400 });
  }

  // Auth: user themselves or admin
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  const isSelf = user.id === targetUserId;
  const isAdmin = ADMIN_EMAILS.includes(user.email ?? '');
  if (!isSelf && !isAdmin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const inputTemplates = Array.isArray(body.template_ids)
    ? (body.template_ids as unknown[]).filter((x): x is string => typeof x === 'string')
    : null;

  // Resolve template list
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  let templateIds: string[] = [];
  if (inputTemplates && inputTemplates.length > 0) {
    templateIds = inputTemplates.slice(0, MAX_TEMPLATES_PER_RUN);
  } else {
    // Fallback: monthly subset matching user's cultural routing.
    const { data: anchors } = await db
      .from('user_identity_anchors')
      .select('cultural_routing')
      .eq('user_id', targetUserId)
      .maybeSingle();
    const routing = (anchors?.cultural_routing as string | undefined) ?? 'default';

    const { data: tpls, error: tplErr } = await db
      .from('affirmation_template_library')
      .select('id')
      .eq('status', 'voice_rendered')
      .eq('cultural_routing', routing)
      .limit(MAX_TEMPLATES_PER_RUN);
    if (tplErr) {
      return NextResponse.json({ error: `template lookup: ${tplErr.message}` }, { status: 500 });
    }
    templateIds = (tpls ?? []).map((r: { id: string }) => r.id);
  }

  if (templateIds.length === 0) {
    return NextResponse.json({
      success: true,
      rendered_count: 0,
      failed_count: 0,
      message: 'no templates resolved for this user',
    });
  }

  const jobId = `render-${targetUserId.slice(0, 8)}-${Date.now().toString(36)}`;
  let rendered = 0;
  let failed = 0;
  const errors: { template_id: string; error: string }[] = [];

  for (const tid of templateIds) {
    try {
      await renderUserAffirmation(targetUserId, tid);
      rendered += 1;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ template_id: tid, error: msg });
      failed += 1;
    }
  }

  return NextResponse.json(
    {
      success: failed === 0,
      job_id: jobId,
      user_id: targetUserId,
      rendered_count: rendered,
      failed_count: failed,
      total_processed: rendered + failed,
      errors: errors.slice(0, 20),
    },
    { status: 202 },
  );
}
