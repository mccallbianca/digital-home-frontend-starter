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

  return (
    <>
      {showTutorial && (
        <NavigatingHERR userId={userId} onComplete={() => setShowTutorial(false)} />
      )}

      <div className="dash-layout">
        {/* ── Main Content ──────────────────────────────────────── */}
        <main style={{ background: 'var(--herr-cream)', padding: 'clamp(24px, 4vw, 32px)', minHeight: '100vh' }}>
          {/* Greeting */}
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
                letterSpacing: '2px',
                color: plan === 'elite' ? '#2563EB' : plan === 'personalized' ? '#C42D8E' : '#666666',
                marginBottom: 32,
              }}
            >
              {tierLabel}
            </p>
          )}

          {/* Today's Affirmation Card (dark accent) */}
          <div
            style={{
              background: '#0A0A0F',
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
                  letterSpacing: '2px',
                  color: '#C42D8E',
                }}
              >
                TODAY&apos;S AFFIRMATION
              </p>
              <span
                style={{
                  fontSize: 11,
                  textTransform: 'uppercase',
                  background: '#16161F',
                  border: '1px solid #C42D8E',
                  color: '#C42D8E',
                  padding: '2px 10px',
                  borderRadius: 12,
                }}
              >
                MORNING
              </span>
            </div>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 18,
                fontStyle: 'italic',
                color: 'rgba(255,255,255,0.8)',
                margin: '16px 0',
                lineHeight: 1.5,
              }}
            >
              &ldquo;I am becoming the version of myself I was always meant to be.&rdquo;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Link
                href="/dashboard/affirmations"
                className="play-btn"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: '#C42D8E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 200ms ease, transform 200ms ease',
                  flexShrink: 0,
                  animation: 'playPulse 2s ease-in-out infinite',
                }}
              >
                <svg width="20" height="24" viewBox="0 0 12 14" fill="none">
                  <path d="M1 1L11 7L1 13V1Z" fill="#FFFFFF" />
                </svg>
              </Link>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>3:24</span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="stats-row" style={{ marginBottom: 32 }}>
            {[
              { value: '12', label: 'Day Streak' },
              { value: '47', label: 'Total Sessions' },
              { value: 'Morning', label: 'Current Mode' },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  padding: 24,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
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
                  {stat.value}
                </p>
                <p style={{ fontSize: 13, color: '#666666' }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Feature Cards Grid */}
          <div className="cards-grid">
            {cards.map((card) => (
              <Link
                key={card.sectionId}
                href={card.href}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  padding: 24,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  transition: 'box-shadow 200ms ease, transform 200ms ease',
                }}
                className="dash-card"
              >
                <div style={{ color: '#C42D8E', marginBottom: 4 }}>
                  {card.icon}
                </div>
                <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--herr-ink)' }}>{card.label}</p>
                <p style={{ fontSize: '1rem', color: '#666666', lineHeight: 1.5 }}>
                  {card.description}
                </p>
                {card.status && (
                  <p style={{ fontSize: 12, color: '#C42D8E', marginTop: 'auto' }}>{card.status}</p>
                )}
                {card.locked && (
                  <p style={{ fontSize: 12, color: '#2563EB', marginTop: 'auto' }}>
                    Upgrade to HERR Elite &rarr;
                  </p>
                )}
              </Link>
            ))}
          </div>

          {/* Re-access tutorial */}
          <button
            onClick={() => {
              localStorage.removeItem(`herr_tutorial_complete_${userId}`);
              setShowTutorial(true);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#999999',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              cursor: 'pointer',
              marginTop: 32,
            }}
          >
            Replay &ldquo;Navigating HERR&rdquo; Tutorial
          </button>

          {/* Disclaimer */}
          <p style={{ fontSize: 12, color: '#999999', marginTop: 24, lineHeight: 1.6 }}>
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
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
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
