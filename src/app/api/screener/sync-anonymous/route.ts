/**
 * POST /api/screener/sync-anonymous
 *
 * Syncs an anonymous screener completion (buffered to localStorage by
 * the publicMode ScreenerClient) into the now-authenticated user's
 * Supabase profile. Called on first authenticated dashboard mount
 * after a Stripe checkout completes.
 *
 * Body: { responses: Record<string, number>, crisis_flag?: PendingCrisisFlag | null }
 * Auth: requires Supabase session — returns 401 otherwise.
 *
 * On success, the client is expected to clear the localStorage keys.
 * The crisis_flags insert is best-effort (table may not exist yet —
 * parity with the existing authenticated flow, which has the same
 * non-blocking behavior).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface SyncPayload {
  responses?: Record<string, number>;
  crisis_flag?: {
    domain?: string;
    score?: number;
    response_id?: number;
    created_at?: string;
    severity?: string;
  } | null;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required to sync screener responses.' },
      { status: 401 }
    );
  }

  let body: SyncPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const responses = body.responses;
  if (!responses || typeof responses !== 'object') {
    return NextResponse.json(
      { error: 'responses object is required.' },
      { status: 400 }
    );
  }

  // Build rows for existential_responses — 15 questions across 5 domains
  const rows: { user_id: string; question_index: number; response: number }[] = [];
  for (const [idxStr, valRaw] of Object.entries(responses)) {
    const idx = parseInt(idxStr, 10);
    const val = Number(valRaw);
    if (!Number.isInteger(idx) || idx < 0 || idx > 14) continue;
    if (!Number.isFinite(val) || val < 1 || val > 5) continue;
    rows.push({
      user_id: user.id,
      question_index: idx,
      response: val,
    });
  }

  if (rows.length === 0) {
    return NextResponse.json(
      { error: 'No valid responses to sync.' },
      { status: 400 }
    );
  }

  // Idempotent sync: delete old responses for this user, then insert
  const { error: deleteErr } = await supabase
    .from('existential_responses')
    .delete()
    .eq('user_id', user.id);

  if (deleteErr) {
    console.error('[screener-sync] delete failed:', deleteErr.message);
    return NextResponse.json(
      { error: 'Failed to clear prior responses.' },
      { status: 500 }
    );
  }

  const { error: insertErr } = await supabase
    .from('existential_responses')
    .insert(rows);

  if (insertErr) {
    console.error('[screener-sync] insert failed:', insertErr.message);
    return NextResponse.json(
      { error: 'Failed to save responses.' },
      { status: 500 }
    );
  }

  // Best-effort crisis flag insert. Matches the existing authenticated
  // ScreenerClient behavior — non-blocking, table may not exist yet.
  let crisisRecorded = false;
  const flag = body.crisis_flag;
  if (flag && flag.domain === 'mortality' && flag.score === 5) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: crisisErr } = await (supabase as any)
        .from('crisis_flags')
        .insert({
          user_id: user.id,
          question_index: 14, // last mortality question is the trigger
          score: 5,
          domain: 'mortality',
          severity: flag.severity || 'red',
          source: 'public_screener_sync',
        });
      if (!crisisErr) {
        crisisRecorded = true;
      } else {
        console.warn('[screener-sync] crisis_flags insert non-blocking failure:', crisisErr.message);
      }
    } catch (e) {
      console.warn('[screener-sync] crisis_flags insert threw:', e);
    }
  }

  return NextResponse.json({
    success: true,
    responses_synced: rows.length,
    crisis_recorded: crisisRecorded,
  });
}
