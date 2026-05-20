/**
 * POST /api/admin/send-tester-wave-1
 *
 * Bulk welcome-email sender for the beta_testers table.
 *
 * Body (optional):
 *   { tester_ids?: string[] }   // subset; default = all WHERE welcome_email_sent_at IS NULL
 *
 * For each tester:
 *   - call /api/send-welcome with their email + name
 *   - on success → UPDATE beta_testers SET welcome_email_sent_at=now(), status='welcomed'
 *
 * Concurrency: capped at 5 (Resend rate-friendly).
 *
 * Auth: admin allowlist only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

const ADMIN_EMAILS = ['bianca@h3rr.com', 'bdmccall@gmail.com', 'mccall.bianca@gmail.com'];
const MAX_CONCURRENT = 5;

type Tester = { id: string; email: string; full_name: string | null };

async function sendOne(siteOrigin: string, tester: Tester) {
  const res = await fetch(`${siteOrigin}/api/send-welcome`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: tester.email,
      name: tester.full_name ?? undefined,
      tier: 'beta',
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${res.status}: ${body.slice(0, 240)}`);
  }
  return await res.json().catch(() => ({}));
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const ids = Array.isArray(body.tester_ids)
    ? (body.tester_ids as unknown[]).filter((x): x is string => typeof x === 'string')
    : null;

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  let q = db.from('beta_testers').select('id, email, full_name').order('created_at', { ascending: true });
  if (ids && ids.length > 0) {
    q = q.in('id', ids);
  } else {
    q = q.is('welcome_email_sent_at', null);
  }
  const { data: testers, error: qErr } = await q;
  if (qErr) {
    return NextResponse.json({ error: `beta_testers query: ${qErr.message}` }, { status: 500 });
  }

  const targets = (testers ?? []) as Tester[];
  if (targets.length === 0) {
    return NextResponse.json({
      sent_count: 0,
      failed_count: 0,
      total_processed: 0,
      failures: [],
      message: 'no testers matched the criteria',
    });
  }

  // Resolve site origin for the internal send-welcome call. In Workers
  // we can't rely on localhost; use the public URL.
  const origin =
    req.nextUrl.origin ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://www.h3rr.com';

  let sent = 0;
  let failed = 0;
  const failures: { id: string; email: string; error: string }[] = [];

  // Process in chunks of MAX_CONCURRENT
  for (let i = 0; i < targets.length; i += MAX_CONCURRENT) {
    const chunk = targets.slice(i, i + MAX_CONCURRENT);
    const results = await Promise.allSettled(
      chunk.map(async (t) => {
        await sendOne(origin, t);
        const { error: upErr } = await db
          .from('beta_testers')
          .update({
            welcome_email_sent_at: new Date().toISOString(),
            status: 'welcomed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', t.id);
        if (upErr) throw new Error(`row update: ${upErr.message}`);
        return t;
      }),
    );

    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      const target = chunk[j];
      if (r.status === 'fulfilled') {
        sent += 1;
      } else {
        failed += 1;
        const msg = r.reason instanceof Error ? r.reason.message : String(r.reason);
        console.error(`[wave-1] ${target.email}: ${msg}`);
        failures.push({ id: target.id, email: target.email, error: msg });
      }
    }
  }

  return NextResponse.json({
    sent_count: sent,
    failed_count: failed,
    total_processed: targets.length,
    failures: failures.slice(0, 50),
  });
}
