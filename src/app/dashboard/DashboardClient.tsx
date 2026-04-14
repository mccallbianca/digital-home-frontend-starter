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
  isAdmin = false,
  isProducer = false,
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

  const navItems = [
    { label: 'Home', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'My Affirmations', href: '/dashboard/affirmations', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z' },
    { label: 'Screener', href: '/dashboard/assessment', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { label: 'Journal', href: '/journal', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { label: 'Community', href: '/community', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { label: 'Settings', href: '/dashboard/billing', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ];

  return (
    <>
      {showTutorial && (
        <NavigatingHERR userId={userId} onComplete={() => setShowTutorial(false)} />
      )}

      <div className="dash-layout">
        {/* ── Sidebar (desktop) ─────────────────────────────────── */}
        <aside className="dash-sidebar">
          <div style={{ padding: 24 }}>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 20,
                color: '#FFFFFF',
                marginBottom: 32,
              }}
            >
              HERR™
            </p>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="dash-nav-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 24px',
                    borderRadius: 8,
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.6)',
                    textDecoration: 'none',
                    transition: 'background 200ms ease',
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* ── Portal Links (role-gated) ─────────────────────── */}
            {/* TODO: Replace with role-based visibility once roles are implemented in Supabase */}
            {(isAdmin || isProducer) && (
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <p
                  style={{
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    color: 'rgba(255,255,255,0.3)',
                    padding: '0 24px',
                    marginBottom: 8,
                  }}
                >
                  Portals
                </p>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="dash-nav-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 24px',
                      borderRadius: 8,
                      fontSize: 14,
                      color: '#E8388A',
                      textDecoration: 'none',
                      transition: 'background 200ms ease',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    Admin Portal
                  </Link>
                )}
                {isProducer && (
                  <Link
                    href="/admin/producers"
                    className="dash-nav-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 24px',
                      borderRadius: 8,
                      fontSize: 14,
                      color: '#8B5CF6',
                      textDecoration: 'none',
                      transition: 'background 200ms ease',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-2.236-1.93l.365-2.514a2.25 2.25 0 011.84-1.921l2.983-.466zM3 15.364V8.25a2.25 2.25 0 011.632-2.163l1.32-.377a1.803 1.803 0 012.236 1.93l-.365 2.514a2.25 2.25 0 01-1.84 1.921L3 12.516v2.848z" />
                    </svg>
                    {/* TODO: Create dedicated /producer portal with track upload, earnings, and delivery status */}
                    Producer Queue
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* ── Role Indicator (bottom of sidebar) ─────────────── */}
          {(isAdmin || isProducer) && (
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                marginTop: 'auto',
              }}
            >
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>
                Current view
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: '#10B981',
                    background: 'rgba(16, 185, 129, 0.1)',
                    padding: '3px 10px',
                    borderRadius: 100,
                  }}
                >
                  Member
                </span>
                {isAdmin && (
                  <span
                    style={{
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      color: '#E8388A',
                      background: 'rgba(232, 56, 138, 0.1)',
                      padding: '3px 10px',
                      borderRadius: 100,
                    }}
                  >
                    Admin
                  </span>
                )}
                {isProducer && (
                  <span
                    style={{
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      color: '#8B5CF6',
                      background: 'rgba(139, 92, 246, 0.1)',
                      padding: '3px 10px',
                      borderRadius: 100,
                    }}
                  >
                    Producer
                  </span>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* ── Main Content ──────────────────────────────────────── */}
        <main style={{ background: '#FAF8F5', padding: 'clamp(24px, 4vw, 32px)', minHeight: '100vh' }}>
          {/* Greeting */}
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(24px, 3vw, 32px)',
              fontWeight: 600,
              color: '#1A1A2E',
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
                    color: '#1A1A2E',
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
                <p style={{ fontSize: 16, fontWeight: 600, color: '#1A1A2E' }}>{card.label}</p>
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

      {/* ── Mobile Bottom Bar ───────────────────────────────────── */}
      <nav className="dash-mobile-bar">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.label}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              textDecoration: 'none',
              color: 'rgba(255,255,255,0.4)',
              fontSize: 10,
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={item.icon} />
            </svg>
            {item.label.split(' ')[0]}
          </Link>
        ))}
      </nav>

      <style>{`
        .dash-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          min-height: 100vh;
        }
        .dash-sidebar {
          background: #111118;
          border-right: 1px solid rgba(255,255,255,0.08);
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        .dash-nav-item:hover {
          background: rgba(255,255,255,0.05);
        }
        .dash-mobile-bar {
          display: none;
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
          .dash-layout {
            grid-template-columns: 1fr;
          }
          .dash-sidebar {
            display: none;
          }
          .dash-mobile-bar {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 64px;
            background: #111118;
            border-top: 1px solid rgba(255,255,255,0.08);
            justify-content: space-around;
            align-items: center;
            z-index: 50;
            padding-bottom: env(safe-area-inset-bottom);
          }
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
