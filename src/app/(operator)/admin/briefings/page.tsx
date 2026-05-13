export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

type Briefing = {
  id: string;
  briefing_date: string;
  briefing_time: string;
  briefing_text: string;
  source_counts: Record<string, number> | null;
  created_at: string;
};

export default async function BriefingsPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  let briefings: Briefing[] = [];
  try {
    const { data: rows } = await db
      .from('daily_briefings')
      .select('id, briefing_date, briefing_time, briefing_text, source_counts, created_at')
      .order('briefing_date', { ascending: false })
      .order('briefing_time', { ascending: false })
      .limit(60);
    briefings = (rows ?? []) as Briefing[];
  } catch {
    // pre-migration
  }

  return (
    <main className="px-6 py-10 max-w-[860px]">
      <p className="herr-label mb-2" style={{ color: 'var(--herr-magenta)' }}>Briefings</p>
      <h1 className="font-display text-3xl font-light mb-2" style={{ color: 'var(--herr-ink)' }}>
        Beta Testers Briefings
      </h1>
      <p className="text-sm mb-8" style={{ color: 'rgba(26,15,26,0.7)' }}>
        Twice-daily Claude analysis of incoming beta reports.
      </p>

      {briefings.length === 0 ? (
        <p className="text-sm" style={{ color: 'rgba(26,15,26,0.5)' }}>No briefings yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {briefings.map((b) => (
            <li key={b.id} className="rounded-lg" style={{ background: '#FFFFFF', border: '1px solid var(--herr-line)' }}>
              <Link
                href={`/admin/briefings/${b.id}`}
                style={{ display: 'block', padding: '20px 24px', textDecoration: 'none', color: 'inherit' }}
              >
                <p className="font-medium text-sm">
                  {b.briefing_date} &middot; <span style={{ textTransform: 'capitalize' }}>{b.briefing_time}</span>
                </p>
                <p className="text-xs mt-1" style={{ color: 'rgba(26,15,26,0.55)' }}>
                  Generated {new Date(b.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
