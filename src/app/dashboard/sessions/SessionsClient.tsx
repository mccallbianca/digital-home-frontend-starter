'use client';

import { useState } from 'react';

interface Session {
  id: string;
  title: string;
  description: string;
  scheduled_at: string;
  capacity: number;
  registered: number;
}

interface PastSession {
  id: string;
  title: string;
  scheduled_at: string;
}

interface SessionsClientProps {
  userId: string;
  userEmail: string;
  sessions: Session[];
  userRegistrations: string[];
  pastSessions: PastSession[];
}

export default function SessionsClient({ userId, userEmail, sessions, userRegistrations, pastSessions }: SessionsClientProps) {
  const [registeredIds, setRegisteredIds] = useState<string[]>(userRegistrations);
  const [registering, setRegistering] = useState<string | null>(null);

  const handleRegister = async (sessionId: string) => {
    setRegistering(sessionId);
    try {
      await fetch('/api/sessions/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, sessionId, email: userEmail }),
      });
      setRegisteredIds(prev => [...prev, sessionId]);
    } catch {
      // silent
    }
    setRegistering(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', padding: '80px 24px 60px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '2px', color: '#C42D8E', marginBottom: 8, textAlign: 'center' }}>
          LIVE SESSIONS
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 600, color: '#FFFFFF', textAlign: 'center', marginBottom: 4 }}>
          Live with Bianca
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 40 }}>
          Monthly group sessions. 25 seats. Clinical depth.
        </p>

        {/* Upcoming */}
        {sessions.length > 0 ? sessions.map((session) => {
          const isRegistered = registeredIds.includes(session.id);
          const isFull = session.registered >= (session.capacity || 25);
          const capacity = session.capacity || 25;
          const remaining = capacity - session.registered;
          const date = new Date(session.scheduled_at);
          const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
          const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });

          return (
            <div
              key={session.id}
              style={{
                background: '#16161F', borderRadius: 16, padding: 32,
                border: '1px solid rgba(255,255,255,0.08)', marginBottom: 16,
              }}
            >
              <p style={{ fontSize: 16, color: '#FFFFFF', marginBottom: 4 }}>
                {dateStr} &middot; {timeStr}
              </p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, color: '#FFFFFF', marginBottom: 8 }}>
                {session.title}
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 16 }}>
                {session.description}
              </p>

              {/* Seats */}
              <p style={{ fontSize: 14, color: '#E8388A', marginBottom: 8 }}>
                {remaining > 0 ? `${remaining} of ${capacity} seats remaining` : 'Session full'}
              </p>
              <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginBottom: 16, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#C42D8E', borderRadius: 2, width: `${(session.registered / capacity) * 100}%` }} />
              </div>

              {isRegistered ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  <span style={{ fontSize: 14, color: '#22C55E', fontWeight: 600 }}>Registered</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginLeft: 8 }}>Calendar invite sent to {userEmail}</span>
                </div>
              ) : isFull ? (
                <button
                  disabled
                  style={{
                    height: 48, padding: '0 32px', background: 'rgba(196,45,142,0.3)',
                    color: 'rgba(255,255,255,0.5)', borderRadius: 12, border: 'none',
                    fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px',
                  }}
                >
                  Session Full — Join Waitlist
                </button>
              ) : (
                <button
                  onClick={() => handleRegister(session.id)}
                  disabled={registering === session.id}
                  style={{
                    height: 48, padding: '0 32px', background: '#C42D8E', color: '#FFFFFF',
                    borderRadius: 12, border: 'none', fontSize: 14, fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer',
                    opacity: registering === session.id ? 0.6 : 1,
                  }}
                >
                  {registering === session.id ? 'Registering...' : 'Register'}
                </button>
              )}
            </div>
          );
        }) : (
          <div style={{ background: '#16161F', borderRadius: 16, padding: 32, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)' }}>No upcoming sessions scheduled yet. Check back soon.</p>
          </div>
        )}

        {/* Past sessions */}
        {pastSessions.length > 0 && (
          <div style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 32 }}>
            <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
              PAST SESSIONS
            </p>
            {pastSessions.map((s) => (
              <div key={s.id} style={{ background: '#16161F', borderRadius: 12, padding: '16px 24px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 14, color: '#FFFFFF' }}>{s.title}</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                    {new Date(s.scheduled_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Recordings coming soon</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
