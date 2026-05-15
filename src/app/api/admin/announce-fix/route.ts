/**
 * POST /api/admin/announce-fix
 *
 * Admin-only. Drops a HERR Nation "Bug fixed" announcement into:
 *   1. content_objects with type='announcement',
 *      herr_nation_section='beta_testers', herr_nation_only=true,
 *      ai_generated=false, status='published'
 *   2. community_threads in space='beta-lab' so Founding Testers
 *      actually see it in the Beta Testers Lab chat on their
 *      /dashboard/community page.
 *
 * Block 5 Part 2 Task 5.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

const ADMIN_EMAILS = ['bianca@h3rr.com', 'bdmccall@gmail.com', 'mccall.bianca@gmail.com'];
const MAX_TITLE = 100;
const MAX_BODY = 500;
const FOUNDER_CRED = 'Bianca D. McCall, M.A., LMFT';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const bugTitle = String(body.bug_title ?? '').trim().slice(0, MAX_TITLE);
  const whatChanged = String(body.what_changed ?? '').trim().slice(0, MAX_BODY);
  const deployVersion = String(body.deploy_version ?? '').trim().slice(0, 100);
  const retest = String(body.retest_instructions ?? '').trim().slice(0, MAX_BODY);

  if (!bugTitle) {
    return NextResponse.json({ error: 'Bug title is required' }, { status: 400 });
  }

  const title = `Bug fixed: ${bugTitle}`;
  const composedBody =
    `${whatChanged}` +
    (deployVersion ? `\n\nDeploy version: ${deployVersion}` : '') +
    (retest ? `\n\nRe-test: ${retest}` : '') +
    `\n\n${FOUNDER_CRED}`;

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  // ── 1) content_objects insert (spec compliance) ──────────────────
  const slug = `${slugify(bugTitle)}-${Date.now().toString(36)}`;
  const baseRow: Record<string, unknown> = {
    slug,
    title,
    body: composedBody,
    excerpt: whatChanged.slice(0, 200),
    status: 'published',
    author_name: FOUNDER_CRED,
    published_at: new Date().toISOString(),
    herr_nation_section: 'beta_testers',
    herr_nation_only: true,
    ai_generated: false,
    author_id: user.id,
  };

  const withType = { ...baseRow, content_type: 'announcement' as const };
  let contentInsert = await db.from('content_objects').insert(withType).select('id').single();

  // If the content_type enum doesn't yet allow 'announcement', fall
  // back to 'snippet' so the announcement still lands.
  if (
    contentInsert.error &&
    /invalid input value for enum content_type/i.test(contentInsert.error.message)
  ) {
    contentInsert = await db
      .from('content_objects')
      .insert({ ...baseRow, content_type: 'snippet' as const })
      .select('id')
      .single();
  }

  // If columns like herr_nation_section / herr_nation_only / ai_generated /
  // author_id are missing, retry without them so the announcement still
  // posts to the journal while the migration rolls out.
  if (
    contentInsert.error &&
    /column .*(herr_nation_section|herr_nation_only|ai_generated|author_id).* does not exist/i.test(
      contentInsert.error.message,
    )
  ) {
    contentInsert = await db
      .from('content_objects')
      .insert({
        slug,
        title,
        body: composedBody,
        excerpt: whatChanged.slice(0, 200),
        status: 'published',
        author_name: FOUNDER_CRED,
        published_at: new Date().toISOString(),
      })
      .select('id')
      .single();
  }

  if (contentInsert.error) {
    console.error('[admin/announce-fix] content_objects insert failed:', contentInsert.error);
    return NextResponse.json(
      { error: contentInsert.error.message ?? 'content_objects insert failed' },
      { status: 500 },
    );
  }

  // ── 2) community_threads insert (chat visibility) ────────────────
  // Best-effort: if the space doesn't exist yet, we still return success
  // since content_objects is the canonical store.
  let threadId: string | null = null;
  try {
    const { data: threadRow, error: threadErr } = await db
      .from('community_threads')
      .insert({
        space: 'beta-lab',
        title,
        body: composedBody,
        author_id: user.id,
        pinned: true,
      })
      .select('id')
      .single();
    if (!threadErr && threadRow) threadId = threadRow.id;
  } catch (err) {
    console.error('[admin/announce-fix] community_threads insert (non-fatal):', err);
  }

  return NextResponse.json({
    success: true,
    content_id: contentInsert.data?.id ?? null,
    thread_id: threadId,
  });
}
