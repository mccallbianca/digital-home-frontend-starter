import type { Metadata } from 'next';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * Admin crisis-flag review stub. The /admin/* admin-allowlist auth
 * gate is inherited from src/app/(operator)/layout.tsx — unauth or
 * non-admin users hit a redirect there.
 *
 * Minimum function for tonight's tester wave 1 launch. Full review
 * workflow + audit trail + dashboard index of unreviewed flags is
 * scheduled for PR6.
 *
 * Email link points: https://h3rr.com/admin/crisis-flags/{flag_id}
 */

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Crisis Flag Review | HERR Admin',
};

const DOMAIN_LABEL: Record<string, string> = {
  meaning: 'Meaning',
  purpose: 'Purpose',
  identity: 'Identity',
  freedom: 'Freedom',
  isolation: 'Isolation',
  mortality: 'Mortality',
};

interface CrisisFlagRow {
  id: string;
  user_id: string | null;
  question_index: number | null;
  domain: string;
  score: number;
  severity: string;
  source: string | null;
  created_at: string;
  reviewed: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

export default async function CrisisFlagReviewPage({
  params,
}: {
  params: Promise<{ flag_id: string }>;
}) {
  const { flag_id } = await params;
  const supabase = (await createClient()) as AnyClient;

  // The (operator) layout has already gated this route for admin emails,
  // but we still pull the current user for the Mark-as-Reviewed action.
  const { data: { user } } = await supabase.auth.getUser();

  const { data: flagRow, error: flagErr } = await supabase
    .from('crisis_flags')
    .select('id, user_id, question_index, domain, score, severity, source, created_at, reviewed, reviewed_by, reviewed_at')
    .eq('id', flag_id)
    .maybeSingle();

  const flag = flagRow as CrisisFlagRow | null;

  if (flagErr || !flag) {
    return (
      <div className="crisis-review">
        <p className="crisis-review__back">
          <Link href="/admin">&larr; Admin home</Link>
        </p>
        <h1 className="crisis-review__title">Crisis flag not found.</h1>
        <p className="crisis-review__muted">
          Either the flag id is wrong, the row was deleted, or it was never inserted.
          Searched id: <code>{flag_id}</code>
        </p>
      </div>
    );
  }

  // Best-effort lookup of the flagged user's email + reviewer email
  let flaggedUserEmail: string | null = null;
  if (flag.user_id) {
    const { data: u } = await supabase.auth.admin.getUserById(flag.user_id);
    flaggedUserEmail = u?.user?.email ?? null;
  }
  let reviewerEmail: string | null = null;
  if (flag.reviewed_by) {
    const { data: r } = await supabase.auth.admin.getUserById(flag.reviewed_by);
    reviewerEmail = r?.user?.email ?? null;
  }

  // Server action — Mark as Reviewed
  async function markReviewed() {
    'use server';
    const adminSupabase = (await createClient()) as AnyClient;
    const { data: { user: u2 } } = await adminSupabase.auth.getUser();
    if (!u2) return;
    await adminSupabase
      .from('crisis_flags')
      .update({
        reviewed: true,
        reviewed_by: u2.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', flag_id);
    // TODO: PR6 — write to audit_log table once it exists
    revalidatePath(`/admin/crisis-flags/${flag_id}`);
  }

  const severityClass = flag.severity?.toLowerCase() === 'yellow'
    ? 'crisis-review__sev crisis-review__sev--yellow'
    : 'crisis-review__sev crisis-review__sev--red';

  const createdAtFormatted = new Date(flag.created_at).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return (
    <div className="crisis-review">
      <p className="crisis-review__back">
        <Link href="/admin">&larr; Admin home</Link>
      </p>

      <p className="crisis-review__eyebrow">CLINICAL REVIEW</p>
      <h1 className="crisis-review__title">Crisis Flag Review</h1>

      <div className="crisis-review__card">
        <div className="crisis-review__row">
          <span className="crisis-review__label">Severity</span>
          <span className={severityClass}>{(flag.severity ?? 'unknown').toUpperCase()}</span>
        </div>
        <div className="crisis-review__row">
          <span className="crisis-review__label">Domain</span>
          <span className="crisis-review__value">{DOMAIN_LABEL[flag.domain] ?? flag.domain}</span>
        </div>
        <div className="crisis-review__row">
          <span className="crisis-review__label">Score</span>
          <span className="crisis-review__value">{flag.score} / 5</span>
        </div>
        <div className="crisis-review__row">
          <span className="crisis-review__label">Flagged at</span>
          <span className="crisis-review__value">{createdAtFormatted}</span>
        </div>
        <div className="crisis-review__row">
          <span className="crisis-review__label">User</span>
          <span className="crisis-review__value">
            {flag.user_id
              ? <>
                  {flag.user_id}
                  {flaggedUserEmail && (
                    <> &middot; <a href={`mailto:${flaggedUserEmail}`}>{flaggedUserEmail}</a></>
                  )}
                </>
              : <em className="crisis-review__muted">anonymous-then-synced (no user id at insert)</em>
            }
          </span>
        </div>
        <div className="crisis-review__row">
          <span className="crisis-review__label">Source</span>
          <span className="crisis-review__value">{flag.source ?? 'authenticated_screener'}</span>
        </div>
        <div className="crisis-review__row crisis-review__row--status">
          <span className="crisis-review__label">Status</span>
          {flag.reviewed ? (
            <span className="crisis-review__value crisis-review__status--done">
              Reviewed{reviewerEmail && <> by {reviewerEmail}</>}
              {flag.reviewed_at && <> at {new Date(flag.reviewed_at).toLocaleString()}</>}
            </span>
          ) : (
            <span className="crisis-review__value crisis-review__status--pending">
              Pending Review
            </span>
          )}
        </div>

        {!flag.reviewed && user && (
          <form action={markReviewed} className="crisis-review__action">
            <button type="submit" className="crisis-review__cta">
              Mark as Reviewed
            </button>
          </form>
        )}
      </div>

      <p className="crisis-review__footnote">
        {/* TODO: PR6 — Full clinical review workflow + audit trail + 988 outreach checklist + escalation notes */}
        Stub review surface. Full clinical review workflow (audit trail, outreach checklist, escalation notes) ships in PR6.
        If this flag requires direct outreach, call or text the user at the contact on file
        and consider <strong>988</strong> as a resource for the user.
      </p>
    </div>
  );
}
