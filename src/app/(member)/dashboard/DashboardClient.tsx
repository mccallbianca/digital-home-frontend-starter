'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NavigatingHERR from './NavigatingHERR';

interface DashboardCard {
  href: string;
  label: string;
  description: string;
  tier: string;
  tierColor: string;
  status: string | null;
  statusColor: string;
  accessible: boolean;
  locked?: boolean;
  sectionId: string;
  icon: React.ReactNode;
}

interface DashboardClientProps {
  userId: string;
  displayName: string;
  plan: string | null;
  cards: DashboardCard[];
  isFirstLoad: boolean;
  isAdmin?: boolean;
  isProducer?: boolean;
  // Phase 1 v2 EPIC B8: real metrics
  dayStreak: number;
  totalSessions: number;
  currentModeId: string | null;
  currentModeLabel: string | null;
  todaysAffirmationScript: string | null;
  todaysAffirmationMode: string | null;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardClient({
  userId,
  displayName,
  plan,
  cards,
  isFirstLoad,
  dayStreak,
  totalSessions,
  currentModeId,
  currentModeLabel,
  todaysAffirmationScript,
  todaysAffirmationMode,
}: DashboardClientProps) {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const tutorialDone = localStorage.getItem(`herr_tutorial_complete_${userId}`);
    if (isFirstLoad && !tutorialDone) {
      const timer = setTimeout(() => setShowTutorial(true), 800);
      return () => clearTimeout(timer);
    }
  }, [userId, isFirstLoad]);

  const tierLabel = plan === 'elite'
    ? 'HERR Elite'
    : plan === 'personalized'
      ? 'HERR Personalized'
      : plan === 'collective'
        ? 'HERR Collective'
        : 'HERR Free';

  const todaysModeBadge = todaysAffirmationMode
    ? todaysAffirmationMode.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : (currentModeLabel ?? 'Morning');

  const affirmationPreview = todaysAffirmationScript
    ? (todaysAffirmationScript.length > 220
        ? todaysAffirmationScript.slice(0, 220).replace(/\n+/g, ' ') + '...'
        : todaysAffirmationScript.replace(/\n+/g, ' '))
    : 'Your daily affirmation is on the way. Open the Inbox to generate or replay.';

  return (
    <>
      {showTutorial && (
        <NavigatingHERR userId={userId} onComplete={() => setShowTutorial(false)} />
      )}

      <div className="dash-layout">
        <main style={{ background: 'var(--herr-cream)', padding: 'clamp(24px, 4vw, 32px)', minHeight: '100vh' }}>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(24px, 3vw, 32px)',
              fontWeight: 600,
              color: 'var(--herr-ink)',
              marginBottom: 8,
            }}
          >
            {getGreeting()}, {displayName}.
          </h1>
          {plan && (
            <p
              style={{
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                color: 'var(--herr-magenta)',
                fontWeight: 600,
                marginBottom: 32,
              }}
            >
              {tierLabel}
            </p>
          )}

          {/* Today's Affirmation Card */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--herr-line)',
              borderRadius: 16,
              padding: 32,
              marginBottom: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p
                style={{
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                  color: 'var(--herr-magenta)',
                  fontWeight: 600,
                }}
              >
                TODAY&apos;S AFFIRMATION
              </p>
              <span
                style={{
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  background: 'var(--herr-magenta-soft)',
                  border: '1px solid var(--herr-magenta)',
                  color: 'var(--herr-magenta-deep)',
                  padding: '3px 10px',
                  borderRadius: 12,
                  fontWeight: 600,
                }}
              >
                {todaysModeBadge}
              </span>
            </div>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 18,
                fontStyle: 'italic',
                color: 'var(--herr-ink)',
                margin: '16px 0',
                lineHeight: 1.5,
              }}
            >
              &ldquo;{affirmationPreview}&rdquo;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Link
                href="/dashboard/affirmations"
                className="play-btn"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'var(--herr-magenta)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 200ms ease, transform 200ms ease',
                  flexShrink: 0,
                  animation: 'playPulse 2s ease-in-out infinite',
                }}
              >
                <svg width="20" height="24" viewBox="0 0 12 14" fill="none">
                  <path d="M1 1L11 7L1 13V1Z" fill="var(--herr-cream)" />
                </svg>
              </Link>
              <Link
                href="/dashboard/affirmations"
                style={{
                  fontSize: 13,
                  color: 'var(--herr-ink-soft)',
                  textDecoration: 'underline',
                }}
              >
                Open Inbox →
              </Link>
            </div>
          </div>

          {/* Stats Row — real metrics */}
          <div className="stats-row" style={{ marginBottom: 32 }}>
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--herr-line)',
                borderRadius: 16,
                padding: 24,
                flex: 1,
              }}
            >
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 32,
                  fontWeight: 600,
                  color: 'var(--herr-ink)',
                  marginBottom: 4,
                }}
              >
                {dayStreak}
              </p>
              <p style={{ fontSize: 13, color: 'var(--herr-ink-soft)' }}>Day Streak</p>
            </div>
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--herr-line)',
                borderRadius: 16,
                padding: 24,
                flex: 1,
              }}
            >
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 32,
                  fontWeight: 600,
                  color: 'var(--herr-ink)',
                  marginBottom: 4,
                }}
              >
                {totalSessions}
              </p>
              <p style={{ fontSize: 13, color: 'var(--herr-ink-soft)' }}>Total Sessions</p>
            </div>
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--herr-line)',
                borderRadius: 16,
                padding: 24,
                flex: 1,
              }}
            >
              {currentModeLabel ? (
                <>
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: 24,
                      fontWeight: 600,
                      color: 'var(--herr-ink)',
                      marginBottom: 4,
                    }}
                  >
                    {currentModeLabel}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--herr-ink-soft)' }}>Current Mode</p>
                </>
              ) : (
                <>
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: 20,
                      fontWeight: 500,
                      color: 'var(--herr-ink-soft)',
                      fontStyle: 'italic',
                      marginBottom: 4,
                    }}
                  >
                    Not set
                  </p>
                  <Link
                    href="/dashboard/modes"
                    style={{
                      fontSize: 13,
                      color: 'var(--herr-magenta)',
                      textDecoration: 'underline',
                      fontWeight: 600,
                    }}
                  >
                    Pick activities →
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div className="cards-grid">
            {cards.map((card) => (
              <Link
                key={card.sectionId}
                href={card.href}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--herr-line)',
                  borderRadius: 16,
                  padding: 24,
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  transition: 'box-shadow 200ms ease, transform 200ms ease',
                }}
                className="dash-card"
              >
                <div style={{ color: 'var(--herr-magenta)', marginBottom: 4 }}>
                  {card.icon}
                </div>
                <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--herr-ink)' }}>{card.label}</p>
                <p style={{ fontSize: '0.95rem', color: 'var(--herr-ink-soft)', lineHeight: 1.5 }}>
                  {card.description}
                </p>
                {card.status && (
                  <p style={{ fontSize: 12, color: 'var(--herr-magenta)', marginTop: 'auto', fontWeight: 600 }}>{card.status}</p>
                )}
                {card.locked && (
                  <p style={{ fontSize: 12, color: 'var(--herr-magenta)', marginTop: 'auto', fontWeight: 600 }}>
                    Upgrade to HERR Elite →
                  </p>
                )}
              </Link>
            ))}
          </div>

          <button
            onClick={() => {
              localStorage.removeItem(`herr_tutorial_complete_${userId}`);
              setShowTutorial(true);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--herr-ink-soft)',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              cursor: 'pointer',
              marginTop: 32,
              fontWeight: 600,
            }}
          >
            Replay &ldquo;Navigating HERR&rdquo; Tutorial
          </button>

          <p style={{ fontSize: 12, color: 'var(--herr-ink-soft)', marginTop: 24, lineHeight: 1.6 }}>
            HERR is a wellness tool and is not a substitute for professional mental health treatment.
            Always consult a licensed clinician for clinical concerns. &copy; ECQO Holdings.
          </p>
        </main>
      </div>
      <style>{`
        .dash-layout {
          min-height: 100vh;
        }
        .stats-row {
          display: flex;
          gap: 16px;
        }
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .dash-card {
          transition: transform 200ms ease, box-shadow 200ms ease;
        }
        .dash-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(26, 15, 26, 0.08) !important;
        }
        @keyframes playPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(196, 45, 142, 0.4); }
          50%      { box-shadow: 0 0 20px 8px rgba(196, 45, 142, 0.15); }
        }
        @media (max-width: 768px) {
          .stats-row {
            flex-direction: column;
          }
          .cards-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
