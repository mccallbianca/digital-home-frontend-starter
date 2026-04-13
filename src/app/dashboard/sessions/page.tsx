import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import SessionsClient from './SessionsClient';

export const metadata: Metadata = {
  title: 'Live Sessions — HERR',
  description: 'Monthly live group sessions with Bianca D. McCall, LMFT.',
};

export default async function SessionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/dashboard/sessions');

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, email, first_name')
    .eq('id', user.id)
    .single();

  const isElite = profile?.plan === 'elite';

  if (!isElite) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px', display: 'block' }}>
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, color: '#FFFFFF', marginBottom: 8 }}>
            Live Sessions are Elite-Only
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 24 }}>
            Upgrade to HERR Elite for monthly live group sessions with Bianca D. McCall, LMFT — limited to 25 seats per session.
          </p>
          <Link href="/checkout?tier=elite" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 48, padding: '0 32px', background: '#C42D8E', color: '#FFFFFF', borderRadius: 12, fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', textDecoration: 'none' }}>
            Upgrade to Elite — $29/mo
          </Link>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 12 }}>Cancel anytime. No contracts.</p>
        </div>
      </div>
    );
  }

  // Fetch upcoming sessions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: sessions } = await db
    .from('live_sessions')
    .select('id, title, description, scheduled_at, capacity, status')
    .eq('status', 'upcoming')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(5);

  const sessionsWithCounts = [];
  for (const session of (sessions || [])) {
    const { count } = await db
      .from('live_session_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', session.id);
    sessionsWithCounts.push({ ...session, registered: count || 0 });
  }

  // Check user registrations
  const sessionIds = sessionsWithCounts.map((s: { id: string }) => s.id);
  let userRegistrations: string[] = [];
  if (sessionIds.length > 0) {
    const { data: regs } = await db
      .from('live_session_registrations')
      .select('session_id')
      .eq('user_id', user.id)
      .in('session_id', sessionIds);
    userRegistrations = (regs || []).map((r: { session_id: string }) => r.session_id);
  }

  // Past sessions
  const { data: pastSessions } = await db
    .from('live_sessions')
    .select('id, title, scheduled_at')
    .eq('status', 'completed')
    .order('scheduled_at', { ascending: false })
    .limit(5);

  return (
    <SessionsClient
      userId={user.id}
      userEmail={profile?.email ?? user.email ?? ''}
      sessions={sessionsWithCounts}
      userRegistrations={userRegistrations}
      pastSessions={pastSessions ?? []}
    />
  );
}
