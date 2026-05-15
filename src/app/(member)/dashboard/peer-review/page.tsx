export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type Paper = {
  id: string;
  title: string;
  description: string | null;
  uploaded_at: string;
  comment_count: number;
  avg_rating: number | null;
};

const PAID_PLANS = ['collective', 'personalized', 'elite'];

export default async function PeerReviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: profile } = await db
    .from('profiles')
    .select('plan, is_tester')
    .eq('id', user.id)
    .maybeSingle();
  const plan = profile?.plan ?? 'free';
  const isTester = profile?.is_tester === true;
  if (!isTester && !PAID_PLANS.includes(plan)) {
    redirect('/checkout?from=/dashboard/peer-review');
  }

  let papers: Paper[] = [];
  try {
    const { data: paperRows } = await db
      .from('peer_review_papers')
      .select('id, title, description, uploaded_at')
      .eq('status', 'published')
      .order('uploaded_at', { ascending: false });

    const rows = (paperRows ?? []) as Array<{ id: string; title: string; description: string | null; uploaded_at: string }>;
    const enriched: Paper[] = await Promise.all(
      rows.map(async (p) => {
        const [{ count: commentCount }, { data: surveys }] = await Promise.all([
          db.from('peer_review_comments').select('*', { count: 'exact', head: true }).eq('paper_id', p.id),
          db.from('peer_review_surveys').select('rating').eq('paper_id', p.id),
        ]);
        const ratings = ((surveys ?? []) as Array<{ rating: number | null }>)
          .map((s) => s.rating)
          .filter((r): r is number => typeof r === 'number');
        const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
        return {
          ...p,
          comment_count: commentCount ?? 0,
          avg_rating: avgRating,
        };
      }),
    );
    papers = enriched;
  } catch {
    // pre-migration: tables missing
  }

  return (
    <main className="px-6 py-10 max-w-[920px] mx-auto">
      <p className="herr-label mb-2" style={{ color: 'var(--herr-magenta)' }}>Peer Review</p>
      <h1 className="font-display text-3xl font-light mb-2" style={{ color: 'var(--herr-ink)' }}>
        Peer-Review Circle
      </h1>
      <p className="text-sm mb-8" style={{ color: 'rgba(26,15,26,0.7)' }}>
        Clinical papers shared by Bianca and the HERR community. Read, rate, and discuss.
      </p>

      {papers.length === 0 ? (
        <p className="text-sm" style={{ color: 'rgba(26,15,26,0.5)' }}>
          No papers published yet. Check back soon.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {papers.map((p) => (
            <li key={p.id} className="rounded-lg" style={{ background: '#FFFFFF', border: '1px solid var(--herr-line)' }}>
              <Link
                href={`/dashboard/peer-review/${p.id}`}
                style={{ display: 'block', padding: '20px 24px', textDecoration: 'none', color: 'inherit' }}
              >
                <h2 className="font-display text-xl mb-1">{p.title}</h2>
                {p.description && (
                  <p className="text-sm mb-3" style={{ color: 'rgba(26,15,26,0.7)' }}>{p.description}</p>
                )}
                <p className="text-xs" style={{ color: 'rgba(26,15,26,0.5)' }}>
                  {new Date(p.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  &nbsp;&middot; {p.comment_count} comment{p.comment_count === 1 ? '' : 's'}
                  {p.avg_rating !== null && <> &middot; avg rating {p.avg_rating.toFixed(1)}/5</>}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
