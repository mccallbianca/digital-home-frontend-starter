import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard | HERR',
  description: 'Your HERR member dashboard.',
};

// ── Helpers ──────────────────────────────────────────────────────────
function ptDateString(d: Date): string {
  // YYYY-MM-DD in America/Los_Angeles
  return d.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
}

function computeDayStreak(timestamps: string[]): number {
  if (!timestamps || timestamps.length === 0) return 0;
  const dateSet = new Set(timestamps.map((ts) => ptDateString(new Date(ts))));
  let streak = 0;
  const cursor = new Date();
  let cursorStr = ptDateString(cursor);
  while (dateSet.has(cursorStr)) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
    cursorStr = ptDateString(cursor);
  }
  return streak;
}

const MODE_LABELS: Record<string, string> = {
  workout: 'Workout',
  driving: 'Driving',
  sleep: 'Sleep',
  morning: 'Morning',
  'deep-work': 'Deep Work',
  'love-family': 'Love + Family',
  abundance: 'Abundance',
  healing: 'Healing',
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single();

  const { data: voiceConsent } = await supabase
    .from('voice_consents')
    .select('file_path')
    .eq('user_id', user!.id)
    .single();

  const displayName = profile?.preferred_name || profile?.first_name || 'Member';
  const plan = profile?.plan;
  const isElite = plan === 'elite';
  const hasVoice = plan === 'personalized' || plan === 'elite';
  const voiceReady = !!voiceConsent?.file_path;

  const isFirstLoad = params.welcome === '1';

  const ADMIN_EMAILS = ['bianca@h3rr.com', 'bdmccall@gmail.com', 'mccall.bianca@gmail.com'];
  const userEmail = profile?.email ?? user!.email ?? '';
  const isAdmin = ADMIN_EMAILS.includes(userEmail);
  const isProducer = isAdmin;

  // ── Phase 1 v2 EPIC B8: real metrics (no more hardcoded 12/47/Morning) ──

  // Day streak: fetch last 90 days of non-deleted affirmation dates, compute consecutive PT days ending today.
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: streakRows } = await (supabase as any)
    .from('affirmation_scripts')
    .select('generated_at')
    .eq('member_id', user!.id)
    .is('deleted_at', null)
    .gte('generated_at', ninetyDaysAgo.toISOString())
    .order('generated_at', { ascending: false });

  const dayStreak = computeDayStreak(
    (streakRows ?? []).map((r: { generated_at: string }) => r.generated_at),
  );

  // Total sessions attended (session_registrations table may not exist yet; treat 404 as 0).
  let totalSessions = 0;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count, error: sessErr } = await (supabase as any)
      .from('session_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('member_id', user!.id)
      .eq('attended', true);
    if (!sessErr && typeof count === 'number') totalSessions = count;
  } catch {
    totalSessions = 0;
  }

  // Current mode resolution (Block 4 bug 2):
  //   1. Most recently updated *active* mode from member_activity_modes
  //   2. Fallback to most recently updated mode regardless of active flag
  //      (handles members whose modes were toggled off accidentally)
  //   3. Caller decides on a final display fallback if both return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let { data: currentModeRow } = await (supabase as any)
    .from('member_activity_modes')
    .select('mode, updated_at')
    .eq('member_id', user!.id)
    .eq('active', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!currentModeRow) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: anyModeRow } = await (supabase as any)
      .from('member_activity_modes')
      .select('mode, updated_at')
      .eq('member_id', user!.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    currentModeRow = anyModeRow;
  }

  const currentModeId = currentModeRow?.mode ?? null;
  const currentModeLabel = currentModeId ? MODE_LABELS[currentModeId] ?? currentModeId : null;

  // Today's affirmation: latest non-deleted row generated today (PT).
  const todayPT = ptDateString(new Date());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: latestAffirmationRows } = await (supabase as any)
    .from('affirmation_scripts')
    .select('id, script, activity_mode, generated_at')
    .eq('member_id', user!.id)
    .is('deleted_at', null)
    .order('generated_at', { ascending: false })
    .limit(5);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const todaysAffirmation = (latestAffirmationRows ?? []).find((r: any) => {
    return r.generated_at && ptDateString(new Date(r.generated_at)) === todayPT;
  }) ?? null;

  const cards = [
    {
      href: '/dashboard/affirmations',
      label: 'Inbox & Affirmations',
      description: 'Your daily personalized affirmations, delivered in your own cloned voice. Download, listen, and reprogram your inner narrative.',
      tier: 'All tiers',
      tierColor: 'text-[var(--herr-ink-soft)]',
      status: voiceReady ? 'New affirmation available' : 'Generating your personalized library...',
      statusColor: voiceReady ? 'text-[var(--herr-magenta)]' : 'text-[var(--herr-ink-soft)]',
      accessible: true,
      sectionId: 'inbox',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z" />
        </svg>
      ),
    },
    {
      href: '/dashboard/assessment',
      label: 'My Progress',
      description: 'Track your existential wellness over time. Retake the ECQO screener weekly or monthly to recalibrate your affirmation content.',
      tier: hasVoice ? 'Personalized + Elite' : 'All tiers',
      tierColor: hasVoice ? 'text-[var(--herr-magenta)]' : 'text-[var(--herr-ink-soft)]',
      status: null,
      statusColor: '',
      accessible: true,
      sectionId: 'progress',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
    },
    {
      href: isElite ? '/dashboard/sessions' : '/dashboard/billing',
      label: 'Live Events',
      description: 'Monthly live group sessions with Bianca D. McCall, M.A., LMFT. Real-time guidance, Q&A, and community healing.',
      tier: isElite ? 'Elite' : 'Elite Only: Upgrade',
      tierColor: 'text-[var(--herr-magenta)]',
      status: null,
      statusColor: '',
      accessible: true,
      locked: !isElite,
      sectionId: 'events',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      ),
    },
    {
      href: '/dashboard/community',
      label: 'Community',
      description: 'HERR Nation: share wins, ask questions, and grow alongside people committed to reprogramming their inner voice.',
      tier: 'All tiers',
      tierColor: 'text-[var(--herr-ink-soft)]',
      status: null,
      statusColor: '',
      accessible: true,
      sectionId: 'community',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
    },
    {
      href: '/dashboard/billing',
      label: 'My Profile',
      description: 'Manage your subscription, update preferences, voice settings, and billing. Access your complete HERR account.',
      tier: 'All tiers',
      tierColor: 'text-[var(--herr-ink-soft)]',
      status: null,
      statusColor: '',
      accessible: true,
      sectionId: 'profile',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
    },
  ];

  return (
    <DashboardClient
      userId={user!.id}
      displayName={displayName}
      plan={plan ?? null}
      cards={cards}
      isFirstLoad={isFirstLoad}
      isAdmin={isAdmin}
      isProducer={isProducer}
      dayStreak={dayStreak}
      totalSessions={totalSessions}
      currentModeId={currentModeId}
      currentModeLabel={currentModeLabel}
      todaysAffirmationScript={todaysAffirmation?.script ?? null}
      todaysAffirmationMode={todaysAffirmation?.activity_mode ?? null}
    />
  );
}
