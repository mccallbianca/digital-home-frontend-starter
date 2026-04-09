import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import SessionCards from './SessionCards';

export const metadata: Metadata = {
  title: 'Live Sessions — HERR',
  description: 'Monthly live group sessions with Bianca D. McCall, LMFT.',
};

export default async function SessionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, email, first_name')
    .eq('id', user!.id)
    .single();

  const isElite = profile?.plan === 'elite';
  const userTier = profile?.plan || 'collective';

  // Fetch upcoming sessions from database
  const { data: sessions } = await db
    .from('live_sessions')
    .select('id, title, description, scheduled_at, duration_minutes, capacity, zoom_join_url, status')
    .eq('status', 'upcoming')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(3);

  // Get registration counts
  const sessionsWithCounts = [];
  for (const session of (sessions || [])) {
    const { count } = await db
      .from('live_session_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', session.id);

    sessionsWithCounts.push({
      ...session,
      registration_count: count || 0,
    });
  }

  return (
    <main className="min-h-screen">
      <section className="px-6 pt-32 pb-16 border-b border-[var(--herr-border)]">
        <div className="max-w-[900px] mx-auto">
          <Link href="/dashboard" className="herr-label text-[var(--herr-muted)] hover:text-[var(--herr-white)] transition-colors mb-8 inline-block">
            &larr; Dashboard
          </Link>
          <p className="herr-label text-[var(--herr-cobalt)] mb-4">Elite Only</p>
          <h1 className="font-display text-4xl md:text-6xl font-light text-[var(--herr-white)] leading-[0.9] mb-6">
            Live Sessions<br />
            <span className="text-[var(--herr-pink)]">with Bianca.</span>
          </h1>
          <p className="text-[var(--herr-muted)] max-w-xl leading-relaxed">
            Monthly live group sessions with Bianca D. McCall, LMFT.
            Direct access to the clinical framework behind HERR.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-[900px] mx-auto">
          {isElite ? (
            <SessionCards
              sessions={sessionsWithCounts}
              userEmail={profile?.email ?? user!.email ?? ''}
              userName={profile?.first_name ?? ''}
              userTier={userTier}
            />
          ) : (
            <div className="text-center">
              <div className="border border-[var(--herr-border)] border-l-2 border-l-[var(--herr-cobalt)] p-8 mb-8 text-left">
                <p className="herr-label text-[var(--herr-cobalt)] mb-3">Elite Access Required</p>
                <p className="text-[var(--herr-muted)] leading-relaxed">
                  Live sessions with Bianca D. McCall, LMFT are available exclusively to HERR Elite members.
                  Upgrade to access monthly live group sessions and the full clinical protocol.
                </p>
              </div>
              <Link href="/dashboard/billing" className="btn-herr-primary">
                Upgrade to HERR Elite &mdash; $29/mo
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
