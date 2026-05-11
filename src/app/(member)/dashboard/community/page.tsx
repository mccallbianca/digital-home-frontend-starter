import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import ScrollFadeIn from '@/components/home/ScrollFadeIn';
import CrisisResource from '@/components/ui/CrisisResource';
import HERRNation from './HERRNation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'HERR Nation | Community',
  description: 'The HERR community is a space for connection, reflection, and shared growth. Every voice matters.',
};

const WEEKLY_THEMES = [
  { concern: 'Purpose', prompt: 'What gives your performance meaning?' },
  { concern: 'Identity', prompt: 'Who are you becoming outside of your roles?' },
  { concern: 'Freedom', prompt: 'What would you do if fear had no voice?' },
  { concern: 'Connection', prompt: 'When did you last feel truly seen by someone?' },
  { concern: 'Meaning', prompt: 'What moment this week made you feel alive?' },
  { concern: 'Mortality', prompt: 'If this were your last year, what would you change?' },
  { concern: 'Resilience', prompt: 'What is one thing your inner voice got wrong about you?' },
];

function getWeeklyTheme() {
  const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return WEEKLY_THEMES[weekNum % WEEKLY_THEMES.length];
}

export default async function CommunityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('preferred_name, first_name, plan, community_acknowledged')
    .eq('id', user!.id)
    .single();

  // Get member count for activity indicator
  const { count: memberCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const displayName = profile?.preferred_name || profile?.first_name || 'HERR Member';
  const userTier = profile?.plan || 'collective';
  const acknowledged = !!profile?.community_acknowledged;
  const pioneers = memberCount || 12;
  const theme = getWeeklyTheme();

  return (
    <main style={{ minHeight: '100vh' }}>

      {/* ── Welcome Hero (warm) ────────────────────────────────── */}
      <section
        style={{
          background: '#FAF8F5',
          padding: 'clamp(80px, 10vw, 120px) 24px clamp(48px, 6vw, 64px)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle waveform pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 30 Q25 10 50 30 T100 30 T150 30 T200 30' fill='none' stroke='%23E8388A' stroke-width='0.5' opacity='0.08'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 60px',
            opacity: 0.5,
            pointerEvents: 'none',
          }}
        />
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <ScrollFadeIn>
            <Link
              href="/dashboard"
              style={{
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: '#C42D8E',
                textDecoration: 'none',
                display: 'inline-block',
                marginBottom: 24,
              }}
            >
              &larr; Dashboard
            </Link>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(28px, 5vw, 44px)',
                fontWeight: 700,
                color: '#1A1A2E',
                marginBottom: 16,
                lineHeight: 1.2,
              }}
            >
              You Are Not Alone in This Journey
            </h1>
            <p
              style={{
                fontSize: '1.125rem',
                color: '#1A1A2E',
                lineHeight: 1.7,
                maxWidth: 600,
                margin: '0 auto',
              }}
            >
              The HERR community is a space for connection, reflection, and shared growth.
              Every voice here matters, including yours.
            </p>
          </ScrollFadeIn>

          {/* Activity Indicator */}
          <ScrollFadeIn delay={200}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                background: '#FFFFFF',
                borderRadius: 100,
                padding: '10px 24px',
                marginTop: 32,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#10B981',
                  display: 'inline-block',
                  animation: 'communityPulse 2s ease-in-out infinite',
                }}
              />
              <span style={{ fontSize: 14, color: '#1A1A2E', fontWeight: 500 }}>
                {pioneers} pioneer{pioneers !== 1 ? 's' : ''} building this community
              </span>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ── Engagement Prompts (dark) ──────────────────────────── */}
      <section style={{ background: '#0A0A0F', padding: '64px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <ScrollFadeIn>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 20,
              }}
            >
              {/* Daily Reflection */}
              <div
                style={{
                  background: '#16161F',
                  borderRadius: 16,
                  padding: 28,
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'rgba(232, 56, 138, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                    }}
                  >
                    &#x1F4AD;
                  </span>
                  <p
                    style={{
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                      color: '#E8388A',
                    }}
                  >
                    Daily Reflection
                  </p>
                </div>
                <p style={{ fontSize: '1rem', color: '#FAF8F5', lineHeight: 1.6, marginBottom: 16 }}>
                  What did your inner voice tell you today? Share a moment of awareness.
                </p>
                <Link
                  href="#community-feed"
                  style={{
                    fontSize: 13,
                    color: '#E8388A',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Share Your Reflection &rarr;
                </Link>
              </div>

              {/* This Week's Theme */}
              <div
                style={{
                  background: '#16161F',
                  borderRadius: 16,
                  padding: 28,
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'rgba(139, 92, 246, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                    }}
                  >
                    &#x2728;
                  </span>
                  <p
                    style={{
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                      color: '#8B5CF6',
                    }}
                  >
                    This Week&apos;s Theme
                  </p>
                </div>
                <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
                  We&apos;re exploring: <span style={{ color: '#FAF8F5', fontWeight: 600 }}>{theme.concern}</span>
                </p>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '1.25rem',
                    fontStyle: 'italic',
                    color: '#FAF8F5',
                    lineHeight: 1.5,
                  }}
                >
                  &ldquo;{theme.prompt}&rdquo;
                </p>
              </div>

              {/* Community Milestone */}
              <div
                style={{
                  background: '#16161F',
                  borderRadius: 16,
                  padding: 28,
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                    }}
                  >
                    &#x1F331;
                  </span>
                  <p
                    style={{
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                      color: '#10B981',
                    }}
                  >
                    Community Milestone
                  </p>
                </div>
                <p style={{ fontSize: '1rem', color: '#FAF8F5', lineHeight: 1.6 }}>
                  Welcome to the first generation of HERR pioneers.
                  You are building this community from the ground up.
                </p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 12 }}>
                  This community is growing. Every voice that joins makes it stronger.
                </p>
              </div>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ── Featured Affirmation (warm) ────────────────────────── */}
      <section style={{ background: '#FAF8F5', padding: '48px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <ScrollFadeIn>
            <p
              style={{
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: '#C42D8E',
                marginBottom: 12,
              }}
            >
              Featured Affirmation
            </p>
            {/* Waveform visual accent */}
            <div
              style={{
                height: 32,
                margin: '0 auto 16px',
                maxWidth: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
              }}
            >
              {[12, 20, 28, 16, 24, 32, 20, 28, 14, 22, 30, 18, 26, 12].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: 3,
                    height: h,
                    borderRadius: 2,
                    background: `rgba(232, 56, 138, ${0.2 + (h / 32) * 0.4})`,
                  }}
                />
              ))}
            </div>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(22px, 3.5vw, 30px)',
                fontWeight: 600,
                fontStyle: 'italic',
                color: '#1A1A2E',
                lineHeight: 1.4,
                marginBottom: 8,
              }}
            >
              &ldquo;I AM becoming the version of myself I was always meant to be.&rdquo;
            </p>
            <p style={{ fontSize: 13, color: '#666666' }}>
              Spoken in your own voice. Delivered every morning.
            </p>
          </ScrollFadeIn>
        </div>
      </section>

      {/* ── CTA Banner (dark) ──────────────────────────────────── */}
      <section style={{ background: '#0A0A0F', padding: '32px 24px', textAlign: 'center' }}>
        <ScrollFadeIn>
          <p
            style={{
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.6)',
              marginBottom: 16,
            }}
          >
            Ready to connect?
          </p>
          <a
            href="#community-feed"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 48,
              padding: '0 32px',
              background: '#E8388A',
              color: '#FFFFFF',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              textDecoration: 'none',
            }}
          >
            Share Your First Reflection
          </a>
        </ScrollFadeIn>
      </section>

      {/* ── Community Feed ──────────────────────────────────────── */}
      <section
        id="community-feed"
        style={{ background: '#F4F1EB', padding: '24px 24px 48px' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <HERRNation
            userId={user!.id}
            displayName={displayName}
            userTier={userTier}
            acknowledged={acknowledged}
          />
        </div>
      </section>

      {/* ── Responsive + animation styles ──────────────────────── */}
      <style>{`
        @keyframes communityPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <CrisisResource variant="dark" />
    </main>
  );
}
