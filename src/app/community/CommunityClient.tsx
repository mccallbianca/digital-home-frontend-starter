'use client';

import { useState } from 'react';

const CRISIS_KEYWORDS = ['suicide', 'kill myself', 'want to die', 'self-harm', 'end it', 'no reason to live'];

interface Channel {
  id: string;
  name: string;
  group: string;
  requiredTier: string;
  description: string;
}

const CHANNELS: Channel[] = [
  { id: 'general', name: 'general', group: 'STANDARD', requiredTier: 'free', description: 'Open discussion for all HERR members.' },
  { id: 'introductions', name: 'introductions', group: 'STANDARD', requiredTier: 'free', description: 'Introduce yourself to the community.' },
  { id: 'daily-check-in', name: 'daily-check-in', group: 'STANDARD', requiredTier: 'free', description: 'Share how you\u2019re showing up today.' },
  { id: 'bianca-affirmations', name: 'bianca-affirmations', group: 'COLLECTIVE', requiredTier: 'collective', description: 'Discussion around Bianca\u2019s daily affirmations.' },
  { id: 'mindset-shifts', name: 'mindset-shifts', group: 'COLLECTIVE', requiredTier: 'collective', description: 'Share your breakthroughs and mindset wins.' },
  { id: 'voice-journey', name: 'voice-journey', group: 'PERSONALIZED', requiredTier: 'personalized', description: 'Share your experience with voice-cloned affirmations.' },
  { id: 'reprogramming-wins', name: 'reprogramming-wins', group: 'PERSONALIZED', requiredTier: 'personalized', description: 'Celebrate your reprogramming milestones.' },
  { id: 'live-session-chat', name: 'live-session-chat', group: 'ELITE', requiredTier: 'elite', description: 'Pre and post live session discussion.' },
  { id: 'clinical-deep-dive', name: 'clinical-deep-dive', group: 'ELITE', requiredTier: 'elite', description: 'Deep clinical conversations with Bianca.' },
  { id: 'beta-testing', name: 'beta-testing', group: 'ELITE', requiredTier: 'elite', description: 'Test new HERR features before anyone else.' },
];

const TIER_ORDER: Record<string, number> = { free: 0, collective: 1, personalized: 2, elite: 3 };

interface CommunityClientProps {
  userId: string;
  displayName: string;
  plan: string;
}

export default function CommunityClient({ displayName, plan }: CommunityClientProps) {
  const [activeChannel, setActiveChannel] = useState('general');
  const [message, setMessage] = useState('');
  const [showCrisis, setShowCrisis] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userTier = TIER_ORDER[plan] ?? 0;
  const channel = CHANNELS.find(c => c.id === activeChannel)!;

  const canAccess = (ch: Channel) => userTier >= (TIER_ORDER[ch.requiredTier] ?? 0);

  const handleSend = () => {
    if (!message.trim()) return;
    const lower = message.toLowerCase();
    if (CRISIS_KEYWORDS.some(k => lower.includes(k))) {
      setShowCrisis(true);
      return;
    }
    // In production: POST to API
    setMessage('');
  };

  const groups = ['STANDARD', 'COLLECTIVE', 'PERSONALIZED', 'ELITE'];

  const renderSidebar = () => (
    <div style={{ padding: 16 }}>
      <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.4)', marginBottom: 16, padding: '0 8px' }}>
        CHANNELS
      </p>
      {groups.map(group => {
        const groupChannels = CHANNELS.filter(c => c.group === group);
        return (
          <div key={group} style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.3)', padding: '0 8px', marginBottom: 4 }}>
              {group}
            </p>
            {groupChannels.map(ch => {
              const locked = !canAccess(ch);
              const isActive = ch.id === activeChannel;
              return (
                <button
                  key={ch.id}
                  onClick={() => { if (!locked) { setActiveChannel(ch.id); setSidebarOpen(false); } }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                    padding: '8px 16px', border: 'none', borderRadius: 6,
                    background: isActive ? '#16161F' : 'transparent',
                    borderLeft: isActive ? '2px solid #C42D8E' : '2px solid transparent',
                    color: locked ? 'rgba(255,255,255,0.2)' : isActive ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                    fontSize: 14, cursor: locked ? 'default' : 'pointer', textAlign: 'left',
                  }}
                >
                  <span>#</span>
                  <span>{ch.name}</span>
                  {locked && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 'auto' }}>
                      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        );
      })}
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', padding: '16px 8px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        Community discussions are peer support, not clinical services.
      </p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F' }}>
      {/* Crisis modal */}
      {showCrisis && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#16161F', borderRadius: 16, padding: 32, border: '2px solid #C42D8E', maxWidth: 480, width: '100%', textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, color: '#FFFFFF', marginBottom: 8 }}>We&apos;re Here for You</h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', marginBottom: 16 }}>It sounds like you may be going through something difficult. You&apos;re not alone.</p>
            <p style={{ fontSize: 15, color: '#E8388A', fontWeight: 600, marginBottom: 4 }}>Call or text 988: Suicide &amp; Crisis Lifeline</p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>Text HOME to 741741: Crisis Text Line</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => { setShowCrisis(false); setMessage(''); }} style={{ height: 48, padding: '0 24px', background: 'transparent', color: '#FFFFFF', borderRadius: 12, border: '1px solid rgba(255,255,255,0.3)', fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' }}>
                Post Anyway
              </button>
              <a href="tel:988" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 48, padding: '0 24px', background: '#C42D8E', color: '#FFFFFF', borderRadius: 12, fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', textDecoration: 'none' }}>
                Get Help Now
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="community-layout">
        {/* Sidebar */}
        <aside className="community-sidebar" data-open={sidebarOpen}>
          {renderSidebar()}
        </aside>

        {/* Main feed */}
        <main style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* Channel header */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="community-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', display: 'none' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
            </button>
            <div>
              <p style={{ fontSize: 16, color: '#FFFFFF', fontWeight: 600 }}>#{channel.name}</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{channel.description}</p>
            </div>
          </div>

          {/* Messages area */}
          <div style={{ flex: 1, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
              Be the first to post in #{channel.name}
            </p>
          </div>

          {/* Message input */}
          <div style={{ padding: '12px 24px 24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                placeholder="Share with the community..."
                style={{
                  flex: 1, height: 48, background: '#16161F', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 12, padding: '0 16px', color: '#FFFFFF', fontSize: 15,
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                style={{
                  width: 48, height: 48, borderRadius: 12, background: message.trim() ? '#C42D8E' : 'rgba(196,45,142,0.3)',
                  border: 'none', cursor: message.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFF"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
              </button>
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 8, textAlign: 'center' }}>
              Logged in as {displayName}
            </p>
          </div>
        </main>
      </div>

      <style>{`
        .community-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          min-height: 100vh;
        }
        .community-sidebar {
          background: #111118;
          border-right: 1px solid rgba(255,255,255,0.08);
          overflow-y: auto;
          height: 100vh;
          position: sticky;
          top: 0;
        }
        .community-menu-btn { display: none !important; }
        @media (max-width: 768px) {
          .community-layout { grid-template-columns: 1fr; }
          .community-sidebar {
            position: fixed; left: 0; top: 0; bottom: 0; width: 260px;
            z-index: 60; transform: translateX(-100%); transition: transform 300ms ease;
          }
          .community-sidebar[data-open="true"] { transform: translateX(0); }
          .community-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
