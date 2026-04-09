'use client';

import { useState } from 'react';

interface Session {
  id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number;
  capacity: number;
  zoom_join_url: string | null;
  registration_count: number;
}

interface SessionCardsProps {
  sessions: Session[];
  userEmail: string;
  userName: string;
  userTier: string;
}

export default function SessionCards({ sessions, userEmail, userName, userTier }: SessionCardsProps) {
  const [registering, setRegistering] = useState<string | null>(null);
  const [registered, setRegistered] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');

  async function handleRegister(sessionId: string) {
    setRegistering(sessionId);
    setError('');

    try {
      const res = await fetch('/api/sessions/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          firstName: userName,
          lastName: '',
          email: userEmail,
          tier: userTier,
        }),
      });

      const data = await res.json();

      if (!res.ok && !data.registrationId) {
        setError(data.error ?? 'Registration failed.');
        return;
      }

      setRegistered(prev => ({ ...prev, [sessionId]: true }));
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setRegistering(null);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York',
    }) + ' ET';
  }

  if (sessions.length === 0) {
    return (
      <div className="border border-[var(--herr-border)] border-l-2 border-l-[var(--herr-cobalt)] p-8">
        <p className="herr-label text-[var(--herr-cobalt)] mb-3">No Upcoming Sessions</p>
        <p className="text-[var(--herr-muted)] leading-relaxed">
          New sessions are scheduled on the first Saturday of each month. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="herr-label text-[var(--herr-muted)] mb-6">Upcoming Sessions</p>

      <div className="space-y-6">
        {sessions.map(session => {
          const isReg = registered[session.id];
          const seatsLeft = session.capacity - session.registration_count;
          const isFull = seatsLeft <= 0;

          return (
            <div key={session.id} className="border border-[var(--herr-border)] bg-[var(--herr-surface)] p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex-1">
                  <p className="herr-label text-[var(--herr-cobalt)] mb-3">Live Session</p>
                  <h3 className="font-display text-2xl font-light text-[var(--herr-white)] mb-4">
                    {session.title}
                  </h3>
                  {session.description && (
                    <p className="text-[var(--herr-muted)] text-sm leading-relaxed mb-4">
                      {session.description}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-3 text-[0.82rem]">
                    <div>
                      <p className="text-[var(--herr-faint)]">Date</p>
                      <p className="text-[var(--herr-white)]">{formatDate(session.scheduled_at)}</p>
                    </div>
                    <div>
                      <p className="text-[var(--herr-faint)]">Time</p>
                      <p className="text-[var(--herr-white)]">{formatTime(session.scheduled_at)}</p>
                    </div>
                    <div>
                      <p className="text-[var(--herr-faint)]">Duration</p>
                      <p className="text-[var(--herr-white)]">{session.duration_minutes} minutes</p>
                    </div>
                    <div>
                      <p className="text-[var(--herr-faint)]">Seats Remaining</p>
                      <p className={`${seatsLeft <= 5 ? 'text-[var(--herr-pink)]' : 'text-[var(--herr-white)]'}`}>
                        {isFull ? 'Full' : `${seatsLeft} of ${session.capacity}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="md:text-right shrink-0">
                  {isReg ? (
                    <div className="space-y-3">
                      <p className="text-[var(--herr-cobalt)] text-sm font-medium">Registered</p>
                      {session.zoom_join_url && (
                        <a
                          href={session.zoom_join_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-herr-primary inline-flex"
                        >
                          Join Session
                        </a>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRegister(session.id)}
                      disabled={registering === session.id || isFull}
                      className="btn-herr-primary disabled:opacity-50"
                    >
                      {registering === session.id ? 'Registering...' : isFull ? 'Full' : 'Register'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="mt-4 text-[0.78rem] text-[var(--herr-pink)]">{error}</p>
      )}

      {/* Session info */}
      <div className="mt-12 grid md:grid-cols-2 gap-px bg-[var(--herr-border)]">
        {[
          { title: 'Format', body: 'Monthly live group session via Zoom. Hosted by Bianca D. McCall, LMFT.' },
          { title: 'What to Expect', body: 'Deep existential framework work. Q&A. Group processing and identity work.' },
          { title: 'HERR Certified Moderators', body: 'Access to trained HERR moderators between sessions for ongoing protocol support.' },
          { title: 'Beta Access', body: 'Elite members receive first access to all new HERR features and beta testing.' },
        ].map(item => (
          <div key={item.title} className="bg-[var(--herr-black)] p-6">
            <h3 className="font-display text-lg font-light text-[var(--herr-white)] mb-2">{item.title}</h3>
            <p className="text-[0.82rem] text-[var(--herr-muted)] leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
