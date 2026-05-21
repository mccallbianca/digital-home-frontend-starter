/**
 * RecentReflectionsCard
 *
 * Server component. Renders the 3 most recent rows from journey_posts
 * for a member, with relative-time labels and a link out to the
 * Journey page.
 *
 * Background facts wired into this component:
 *   - journey_posts text lives in `caption` (NOT `body`)
 *   - `mood_tag` doesn't exist on this table; `category` is the
 *     closest proxy (one of 'mindset'|'mental-health'|'money'|null)
 *     and we render it as a small pill when present.
 *   - Empty state CTA → /dashboard/journey (no /dashboard/herr-journey
 *     route exists on this project; the journey route group is
 *     /dashboard/journey).
 */

import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/server';

type ReflectionRow = {
  id: string;
  caption: string | null;
  created_at: string;
  category: string | null;
  media_type: string | null;
};

const CATEGORY_PILL: Record<string, { bg: string; fg: string; label: string }> = {
  mindset:        { bg: '#efeaff', fg: '#3b2e8a', label: 'mindset' },
  'mental-health':{ bg: '#dff2e1', fg: '#1b6b2c', label: 'mental health' },
  money:          { bg: '#fff1cc', fg: '#7a5800', label: 'money' },
};

function relativeDate(iso: string): string {
  const then = new Date(iso);
  const now = new Date();
  const dayMs = 86400000;
  const todayPT = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  const thenPT  = new Date(then.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  const startOfToday = new Date(todayPT.getFullYear(), todayPT.getMonth(), todayPT.getDate()).getTime();
  const startOfThen  = new Date(thenPT.getFullYear(),  thenPT.getMonth(),  thenPT.getDate()).getTime();
  const diffDays = Math.floor((startOfToday - startOfThen) / dayMs);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7)   return `${diffDays} days ago`;
  if (diffDays < 14)  return 'Last week';
  if (diffDays < 30)  return `${Math.floor(diffDays / 7)} weeks ago`;
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles' });
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n).trimEnd() + '…';
}

export default async function RecentReflectionsCard({ userId }: { userId: string }) {
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  const { data: reflections } = await db
    .from('journey_posts')
    .select('id, caption, created_at, category, media_type')
    .eq('member_id', userId)
    .order('created_at', { ascending: false })
    .limit(3);

  const rows = (reflections ?? []) as ReflectionRow[];

  // ── Empty state ───────────────────────────────────────────────
  if (rows.length === 0) {
    return (
      <section
        style={{
          background: 'var(--herr-ink, #1A1A2E)',
          color: 'var(--herr-cream, #F4F1EB)',
          borderRadius: 16,
          padding: 28,
          marginBottom: 24,
        }}
      >
        <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--herr-magenta-soft, #FF5BAA)', fontWeight: 600, marginBottom: 8 }}>
          HERR JOURNEY
        </p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 500, marginBottom: 8 }}>
          Your reflection space is waiting.
        </h2>
        <p style={{ fontSize: 14, lineHeight: 1.55, color: 'rgba(244,241,235,0.78)', marginBottom: 18, maxWidth: 480 }}>
          A daily reflection is the quietest form of progress — short, honest, yours. Start your first one and we&apos;ll surface it here.
        </p>
        <Link
          href="/dashboard/journey"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: 40,
            padding: '0 18px',
            background: 'var(--herr-magenta, #C42D8E)',
            color: '#FFFFFF',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            textDecoration: 'none',
          }}
        >
          Start your first reflection
        </Link>
      </section>
    );
  }

  // ── Populated state ───────────────────────────────────────────
  return (
    <section
      style={{
        background: 'var(--herr-ink, #1A1A2E)',
        color: 'var(--herr-cream, #F4F1EB)',
        borderRadius: 16,
        padding: 28,
        marginBottom: 24,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
        <div>
          <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--herr-magenta-soft, #FF5BAA)', fontWeight: 600, marginBottom: 6 }}>
            HERR JOURNEY
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 500, margin: 0 }}>
            Your recent reflections
          </h2>
        </div>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 14 }}>
        {rows.map((r) => {
          const text = (r.caption ?? '').trim();
          const pill = r.category ? CATEGORY_PILL[r.category] : null;
          return (
            <li
              key={r.id}
              style={{
                borderTop: '1px solid rgba(244,241,235,0.12)',
                paddingTop: 12,
              }}
            >
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6, fontSize: 12, color: 'rgba(244,241,235,0.62)' }}>
                <span>{relativeDate(r.created_at)}</span>
                {pill && (
                  <span style={{ background: pill.bg, color: pill.fg, padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 500, letterSpacing: 0.3 }}>
                    {pill.label}
                  </span>
                )}
                {r.media_type && r.media_type !== 'text' && (
                  <span style={{ fontSize: 11, color: 'rgba(244,241,235,0.55)' }}>· {r.media_type}</span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: 'rgba(244,241,235,0.92)' }}>
                {text ? truncate(text, 120) : <em style={{ color: 'rgba(244,241,235,0.55)' }}>No text — media-only post.</em>}
              </p>
            </li>
          );
        })}
      </ul>

      <Link
        href="/dashboard/journey"
        style={{
          display: 'inline-block',
          marginTop: 20,
          fontSize: 13,
          color: 'var(--herr-magenta-soft, #FF5BAA)',
          textDecoration: 'underline',
          fontWeight: 600,
          letterSpacing: 0.3,
        }}
      >
        View all in HERR Journey →
      </Link>
    </section>
  );
}
