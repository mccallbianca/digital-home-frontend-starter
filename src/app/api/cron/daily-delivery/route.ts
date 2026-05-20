/**
 * POST /api/cron/daily-delivery
 *
 * B5.3 — Daily delivery enqueuer. Walks active members, calls
 * buildDailyDeliveryForUser for each, and writes user_daily_deliveries
 * rows with status='queued'. The actual ffmpeg mixing happens out of
 * band via scripts/process-daily-mixes.mjs (Workers can't run ffmpeg).
 *
 * Auth: Bearer CRON_SECRET (matches /api/cron/daily-affirmations and
 *       /api/cron/monthly-reset).
 *
 * Trigger: external cron (GitHub Actions) at 08:00 UTC = 04:00 ET.
 * NOTE: we intentionally do NOT add a Cloudflare cron trigger to
 *       wrangler.jsonc. OpenNext's worker entry only exposes `fetch`,
 *       not `scheduled`, so adding a triggers block would configure a
 *       cron that never fires. The existing daily-affirmations route
 *       uses the same external-scheduler pattern.
 *
 * Body:
 *   { smoke_test?: boolean, user_id?: string, activity_mode?: string }
 *
 *   - smoke_test + user_id  → enqueue exactly one delivery and return
 *                             the recipe (used by the deploy checklist).
 *   - bare POST             → enqueue for all active members.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { buildDailyDeliveryForUser } from '@/lib/affirmations/build-daily-delivery';

const CRON_SECRET = process.env.CRON_SECRET || '';

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient(url, key);
}

function isAuthed(req: NextRequest): boolean {
  if (!CRON_SECRET) return true; // dev fallback — secret not set
  const auth = req.headers.get('authorization');
  if (auth === `Bearer ${CRON_SECRET}`) return true;
  // Also accept X-Cron-Secret per the deploy-checklist curl example.
  if (req.headers.get('x-cron-secret') === CRON_SECRET) return true;
  return false;
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const smokeTest = body.smoke_test === true;
  const overrideUserId = typeof body.user_id === 'string' ? body.user_id : null;
  const overrideMode = typeof body.activity_mode === 'string' ? body.activity_mode : undefined;

  // ── Smoke test: one user, one delivery, return recipe ────────────
  if (smokeTest) {
    if (!overrideUserId) {
      return NextResponse.json(
        { error: 'smoke_test requires user_id' },
        { status: 400 },
      );
    }
    try {
      const recipe = await buildDailyDeliveryForUser(overrideUserId, new Date(), overrideMode);
      return NextResponse.json({
        success: true,
        mode: 'smoke_test',
        recipe,
        note: 'Row enqueued with status=queued. Run `node scripts/process-daily-mixes.mjs --delivery-id=' +
              recipe.delivery_id + '` locally to produce the final mix.',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }
  }

  // ── Production: enqueue for every active member ──────────────────
  const supabase = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: members, error: mErr } = await db
    .from('members')
    .select('email, tier, status')
    .eq('status', 'active');
  if (mErr) {
    return NextResponse.json({ error: `members fetch: ${mErr.message}` }, { status: 500 });
  }

  let enqueued = 0;
  let failed = 0;
  const errors: { email: string; error: string }[] = [];

  for (const member of (members ?? []) as Array<{ email: string; tier: string }>) {
    // members.email → profiles.id (auth.users id)
    const { data: profile } = await db
      .from('profiles')
      .select('id')
      .eq('email', member.email)
      .maybeSingle();
    if (!profile?.id) {
      failed += 1;
      errors.push({ email: member.email, error: 'no profile row' });
      continue;
    }
    try {
      await buildDailyDeliveryForUser(profile.id as string);
      enqueued += 1;
    } catch (err) {
      failed += 1;
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ email: member.email, error: msg });
    }
  }

  return NextResponse.json({
    success: failed === 0,
    enqueued_count: enqueued,
    failed_count: failed,
    total_members: members?.length ?? 0,
    errors: errors.slice(0, 20),
    note: 'Rows enqueued with status=queued. Run `node scripts/process-daily-mixes.mjs` to produce final mixes.',
  });
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = getSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const today = new Date().toISOString().slice(0, 10);
  const { count: queued } = await db
    .from('user_daily_deliveries')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'queued');
  const { count: mixing } = await db
    .from('user_daily_deliveries')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'mixing');
  const { count: readyToday } = await db
    .from('user_daily_deliveries')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'ready')
    .eq('delivery_date', today);
  const { count: deliveredToday } = await db
    .from('user_daily_deliveries')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'delivered')
    .eq('delivery_date', today);
  return NextResponse.json({
    today,
    queued: queued ?? 0,
    mixing: mixing ?? 0,
    ready_today: readyToday ?? 0,
    delivered_today: deliveredToday ?? 0,
  });
}
