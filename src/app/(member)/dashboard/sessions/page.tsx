import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import SessionRegisterButton from './SessionRegisterButton';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Live w/ Founder | HERR',
  description: 'Monthly live group sessions with Bianca D. McCall, M.A., LMFT.',
};

type Plan = 'free' | 'collective' | 'personalized' | 'elite';

function formatPTDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Los_Angeles',
  });
}

function formatPTTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Los_Angeles',
    timeZoneName: 'short',
  });
}

export default async function SessionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/dashboard/sessions');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('plan, is_tester')
    .eq('id', user.id)
    .single();

  const plan = (profile?.plan ?? 'free') as Plan;
  const isTester = profile?.is_tester === true;

  if (plan === 'free' && !isTester) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--herr-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--herr-magenta)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px', display: 'block' }}>
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 26, color: 'var(--herr-ink)', marginBottom: 8 }}>
            Live w/ Founder
          </h1>
          <p style={{ fontSize: 15, color: 'var(--herr-ink-soft)', lineHeight: 1.6, marginBottom: 24 }}>
            Monthly live group sessions are available to all paid members. Upgrade to join.
          </p>
          <Link href="/checkout" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 48, padding: '0 32px', background: 'var(--herr-magenta)', color: 'var(--herr-cream)', borderRadius: 12, fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none' }}>
            Upgrade
          </Link>
        </div>
      </main>
    );
  }

  // Phase 1v2 EPIC B5: read live_sessions (anyone-reads RLS) + member's session_registrations.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: sessions } = await db
    .from('live_sessions')
    .select('id, scheduled_at, duration_min, title, description, max_seats, zoom_join_url')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(12);

  const upcoming = (sessions ?? []) as Array<{
    id: string;
    scheduled_at: string;
    duration_min: number;
    title: string;
    description: string | null;
    max_seats: number;
    zoom_join_url: string | null;
  }>;

  let myRegisteredIds: string[] = [];
  if (upcoming.length > 0) {
    const { data: regs } = await db
      .from('session_registrations')
      .select('session_id')
      .eq('member_id', user.id)
      .in('session_id', upcoming.map((s) => s.id));
    myRegisteredIds = ((regs ?? []) as Array<{ session_id: string }>).map((r) => r.session_id);
  }

  // Empty state with looped homepage hero video.
  if (upcoming.length === 0) {
    return (
      <main style={{ position: 'relative', minHeight: 'calc(100vh - 64px)', overflow: 'hidden' }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/images/hero-poster.jpg"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
          }}
        >
          <source src="/videos/hero-loop.mp4" type="video/mp4" />
        </video>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(10,10,15,0.65)',
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            minHeight: 'calc(100vh - 64px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 24px',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: 560 }}>
            <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--herr-magenta-soft)', fontWeight: 600, marginBottom: 12 }}>
              LIVE W/ FOUNDER
            </p>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(28px, 4vw, 44px)',
                fontWeight: 500,
                color: 'var(--herr-cream)',
                marginBottom: 12,
                lineHeight: 1.2,
              }}
            >
              No upcoming sessions scheduled yet.
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(244,241,235,0.75)', lineHeight: 1.6 }}>
              Check back soon. Monthly group sessions with Bianca D. McCall, M.A., LMFT.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--herr-cream)', padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Link
          href="/dashboard"
          style={{
            fontSize: 12,
            color: 'var(--herr-ink-soft)',
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: 24,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          ← Dashboard
        </Link>

        <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--herr-magenta)', fontWeight: 600, marginBottom: 8 }}>
          LIVE W/ FOUNDER
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 34, fontWeight: 500, color: 'var(--herr-ink)', marginBottom: 8 }}>
          Upcoming Sessions
        </h1>
        <p style={{ fontSize: 16, color: 'var(--herr-ink-soft)', marginBottom: 32, maxWidth: 540 }}>
          Monthly live group sessions with Bianca D. McCall, M.A., LMFT. 25 seats per session.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {upcoming.map((s) => {
            const dateStr = formatPTDate(s.scheduled_at);
            const timeStr = formatPTTime(s.scheduled_at);
            const isRegistered = myRegisteredIds.includes(s.id);

            return (
              <div
                key={s.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--herr-line)',
                  borderRadius: 16,
                  padding: 28,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 240 }}>
                    <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--herr-magenta)', fontWeight: 600, marginBottom: 6 }}>
                      {dateStr}
                    </p>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 500, color: 'var(--herr-ink)', margin: 0 }}>
                      {s.title}
                    </h2>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, fontSize: 13 }}>
                    <span style={{ color: 'var(--herr-ink)', fontWeight: 600 }}>{timeStr}</span>
                    <span style={{ color: 'var(--herr-ink-soft)' }}>{s.duration_min} minutes</span>
                    <span style={{ color: 'var(--herr-ink-soft)' }}>{s.max_seats} seats</span>
                  </div>
                </div>
                {s.description && (
                  <p style={{ fontSize: 14, color: 'var(--herr-ink-soft)', lineHeight: 1.6, margin: 0 }}>
                    {s.description}
                  </p>
                )}
                {(!s.zoom_join_url || s.zoom_join_url.includes('PLACEHOLDER')) && (
                  <div style={{ background: 'var(--herr-magenta-soft, #fce7f3)', border: '1px solid var(--herr-magenta, #C42D8E)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--herr-magenta-deep, #6b1849)' }}>
                    Zoom link coming soon — you&apos;ll receive an email 24 hours before this session.
                  </div>
                )}
                <div>
                  <SessionRegisterButton sessionId={s.id} alreadyRegistered={isRegistered} />
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ fontSize: 12, color: 'var(--herr-ink-soft)', lineHeight: 1.6, marginTop: 32 }}>
          Zoom join link is sent to your email 24 hours before each session. Sessions are recorded
          for HERR Nation members; recordings post within 48 hours.
        </p>
      </div>
    </main>
  );
}
