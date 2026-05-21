/**
 * POST /api/admin/render-bianca-batch
 *
 * Pipeline A executor. Walks `affirmation_template_library` rows where
 *   bianca_audio_url IS NULL AND status = 'pending_voice'
 * and renders each via ElevenLabs into the public affirmations-bianca
 * bucket.
 *
 * Cloudflare Workers have a CPU time budget per request, so this route
 * is intentionally chunked. The admin passes ?limit=N (default 10, max
 * 50) and re-invokes the route until total_remaining hits 0.
 *
 * Behavior:
 *   - Auth: admin allowlist (no public exposure even with API key).
 *   - 4xx ElevenLabs failures stop the batch (likely config / auth issue).
 *   - 5xx + 429 are retried once with backoff per template; a second
 *     transient failure increments failed_count and continues.
 *   - Cost estimate is informational only: ~$0.30 per render at the
 *     ElevenLabs Creator-tier price point (≈30s clip, ~250 chars).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { renderTemplateInBiancaVoice } from '@/lib/affirmations/render-bianca-master';

const ADMIN_EMAILS = ['bianca@h3rr.com', 'bdmccall@gmail.com', 'mccall.bianca@gmail.com'];
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const PER_RENDER_USD_ESTIMATE = 0.30;

type ErrWithStatus = Error & { status?: number };

function isTransient(err: unknown): boolean {
  const e = err as ErrWithStatus;
  const s = e?.status;
  return s === 429 || (typeof s === 'number' && s >= 500 && s < 600);
}

function isAuthOr4xx(err: unknown): boolean {
  const e = err as ErrWithStatus;
  const s = e?.status;
  return typeof s === 'number' && s >= 400 && s < 500 && s !== 429;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(req: NextRequest) {
  // 1. Admin auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    return NextResponse.json({ error: 'Admin only' }, { status: 401 });
  }

  // 2. Parse limit + priority strategy
  const urlObj = new URL(req.url);
  const rawLimit = parseInt(urlObj.searchParams.get('limit') ?? '', 10);
  const limit = Number.isFinite(rawLimit) && rawLimit > 0
    ? Math.min(rawLimit, MAX_LIMIT)
    : DEFAULT_LIMIT;
  // `priority=core` narrows to the most clinically useful templates for
  // the partial-render execution path (FIX-3 A1):
  //   - risk_tier = 'low_concern' (most-common tester tier)
  //   - cultural_routing = 'default' (broadest applicability)
  //   - domain ordering: meaning → identity → connection → freedom →
  //     guilt → spiritual → mortality
  const priority = urlObj.searchParams.get('priority');
  const useCorePriority = priority === 'core';

  // 3. Pull pending templates
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  let pendingQuery = db
    .from('affirmation_template_library')
    .select('id, existential_domain')
    .is('bianca_audio_url', null)
    .eq('status', 'pending_voice');
  if (useCorePriority) {
    pendingQuery = pendingQuery
      .eq('risk_tier', 'low_concern')
      .eq('cultural_routing', 'default');
  }
  // Fetch a generous window then sort in JS so we can apply the
  // domain priority ranking that Supabase doesn't expose as a CASE.
  const fetchWindow = useCorePriority ? Math.max(limit * 4, 200) : limit;
  pendingQuery = pendingQuery
    .order('created_at', { ascending: true })
    .limit(fetchWindow);
  const { data: rawPending, error: queryErr } = await pendingQuery;

  const DOMAIN_RANK: Record<string, number> = {
    meaning: 1, identity: 2, connection: 3, freedom: 4,
    guilt: 5, spiritual: 6, mortality: 7,
  };
  type RawRow = { id: string; existential_domain: string };
  const sorted = ((rawPending ?? []) as RawRow[])
    .slice()
    .sort((a, b) => (DOMAIN_RANK[a.existential_domain] ?? 99) - (DOMAIN_RANK[b.existential_domain] ?? 99));
  const pending = useCorePriority ? sorted.slice(0, limit) : sorted.slice(0, limit);

  if (queryErr) {
    return NextResponse.json(
      { error: `query failed: ${queryErr.message}` },
      { status: 500 },
    );
  }

  // 4. Count total remaining (for caller's progress UI)
  const { count: totalRemaining } = await db
    .from('affirmation_template_library')
    .select('id', { count: 'exact', head: true })
    .is('bianca_audio_url', null)
    .eq('status', 'pending_voice');

  if (!pending || pending.length === 0) {
    return NextResponse.json({
      success: true,
      rendered_count: 0,
      failed_count: 0,
      total_processed: 0,
      total_remaining: totalRemaining ?? 0,
      estimated_spend_usd: 0,
      message: 'no pending templates',
    });
  }

  // 5. Render sequentially (ElevenLabs throttles aggressively; sequential
  //    inside a single Worker request is fine — Bianca calls this route
  //    repeatedly to walk the library).
  let rendered = 0;
  let failed = 0;
  const errors: { template_id: string; error: string }[] = [];
  let stoppedEarly = false;
  let stopReason: string | null = null;

  for (const row of pending as Array<{ id: string }>) {
    try {
      const result = await renderTemplateInBiancaVoice(row.id);
      if (!result.skipped) rendered += 1;
    } catch (err) {
      if (isAuthOr4xx(err)) {
        // Hard stop — config / auth issue, no point burning more credits.
        const msg = err instanceof Error ? err.message : String(err);
        errors.push({ template_id: row.id, error: msg });
        failed += 1;
        stoppedEarly = true;
        stopReason = `auth/4xx on ${row.id}: ${msg}`;
        break;
      }
      if (isTransient(err)) {
        // Single retry with backoff.
        await sleep(2000);
        try {
          const retry = await renderTemplateInBiancaVoice(row.id);
          if (!retry.skipped) rendered += 1;
          continue;
        } catch (retryErr) {
          const msg = retryErr instanceof Error ? retryErr.message : String(retryErr);
          errors.push({ template_id: row.id, error: `retry failed: ${msg}` });
          failed += 1;
          continue;
        }
      }
      // Unknown error — log and continue.
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ template_id: row.id, error: msg });
      failed += 1;
    }
  }

  const processed = rendered + failed;
  const remainingAfter = Math.max(0, (totalRemaining ?? 0) - rendered);

  return NextResponse.json({
    success: !stoppedEarly,
    rendered_count: rendered,
    failed_count: failed,
    total_processed: processed,
    total_remaining: remainingAfter,
    estimated_spend_usd: Number((rendered * PER_RENDER_USD_ESTIMATE).toFixed(2)),
    stopped_early: stoppedEarly,
    stop_reason: stopReason,
    errors: errors.slice(0, 20),
  });
}

export async function GET() {
  // Auth-gate the GET so an unauthenticated hit returns 401 (verification
  // step in the deploy checklist).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    return NextResponse.json({ error: 'Admin only' }, { status: 401 });
  }

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;
  const { count: pending } = await db
    .from('affirmation_template_library')
    .select('id', { count: 'exact', head: true })
    .is('bianca_audio_url', null)
    .eq('status', 'pending_voice');
  const { count: rendered } = await db
    .from('affirmation_template_library')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'voice_rendered');
  const { count: flagged } = await db
    .from('affirmation_template_library')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'flagged_review');

  return NextResponse.json({
    pending_voice: pending ?? 0,
    voice_rendered: rendered ?? 0,
    flagged_review: flagged ?? 0,
    estimated_remaining_spend_usd: Number(((pending ?? 0) * PER_RENDER_USD_ESTIMATE).toFixed(2)),
  });
}
