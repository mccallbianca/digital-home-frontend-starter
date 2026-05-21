'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { LiveSessionRow } from './page';

function isPlaceholder(url: string | null | undefined): boolean {
  if (!url) return true;
  return url.includes('PLACEHOLDER');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    timeZone: 'America/Los_Angeles',
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
    timeZone: 'America/Los_Angeles',
  });
}

export default function LiveSessionsClient({
  initialSessions,
}: {
  initialSessions: LiveSessionRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, { joinUrl: string; meetingId: string; startUrl: string; notes: string }>>(() => {
    const init: Record<string, { joinUrl: string; meetingId: string; startUrl: string; notes: string }> = {};
    for (const s of initialSessions) {
      init[s.id] = {
        joinUrl: isPlaceholder(s.zoom_join_url) ? '' : (s.zoom_join_url ?? ''),
        meetingId: isPlaceholder(s.zoom_meeting_id) ? '' : (s.zoom_meeting_id ?? ''),
        startUrl: isPlaceholder(s.zoom_start_url) ? '' : (s.zoom_start_url ?? ''),
        notes: s.host_notes && !s.host_notes.includes('PLACEHOLDER') && !s.host_notes.includes('replace with real Zoom URL') ? s.host_notes : '',
      };
    }
    return init;
  });
  const [flash, setFlash] = useState<Record<string, { kind: 'ok' | 'err'; text: string }>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  async function handleSave(id: string) {
    setBusy((b) => ({ ...b, [id]: true }));
    setFlash((f) => ({ ...f, [id]: undefined as never }));
    try {
      const body = form[id];
      const res = await fetch(`/api/admin/live-sessions/${id}/set-zoom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zoom_join_url: body.joinUrl,
          zoom_meeting_id: body.meetingId || undefined,
          zoom_start_url: body.startUrl || undefined,
          host_notes: body.notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFlash((f) => ({ ...f, [id]: { kind: 'err', text: data?.error ?? `HTTP ${res.status}` } }));
      } else {
        setFlash((f) => ({ ...f, [id]: { kind: 'ok', text: 'Saved' } }));
        setEditing(null);
        startTransition(() => router.refresh());
      }
    } catch (err) {
      setFlash((f) => ({ ...f, [id]: { kind: 'err', text: err instanceof Error ? err.message : String(err) } }));
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--herr-white)',
    border: '1px solid var(--herr-border,#e5e2da)',
    borderRadius: 6,
    padding: 18,
    marginBottom: 16,
  };
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid var(--herr-border,#e5e2da)',
    borderRadius: 3,
    fontSize: 13,
    fontFamily: 'ui-monospace, monospace',
  };

  if (initialSessions.length === 0) {
    return (
      <div style={{ ...cardStyle, color: 'var(--herr-ink-soft,#5a5a5a)', textAlign: 'center', padding: 40 }}>
        No upcoming sessions seeded.
      </div>
    );
  }

  return (
    <>
      {initialSessions.map((s) => {
        const needs = isPlaceholder(s.zoom_join_url);
        const isEditing = editing === s.id;
        const f = form[s.id];
        const fl = flash[s.id];
        return (
          <div
            key={s.id}
            style={{
              ...cardStyle,
              borderColor: needs ? '#e8a3a3' : 'var(--herr-border,#e5e2da)',
              background: needs ? '#fff7f7' : 'var(--herr-white)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 12 }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display,Georgia)', fontWeight: 400, fontSize: 22, margin: 0, marginBottom: 4 }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--herr-ink-soft,#5a5a5a)', margin: 0 }}>
                  {formatDate(s.scheduled_at)} · {formatTime(s.scheduled_at)}
                  {s.duration_minutes ? ` · ${s.duration_minutes} min` : ''}
                  {s.capacity ? ` · ${s.capacity} seats` : ''}
                </p>
              </div>
              <span style={{
                fontSize: 11,
                padding: '4px 10px',
                borderRadius: 3,
                background: needs ? '#fbdada' : '#dff2e1',
                color:      needs ? '#8a1c1c' : '#1b6b2c',
                fontWeight: 500,
                letterSpacing: 0.4,
                textTransform: 'uppercase',
              }}>
                {needs ? 'Needs Zoom URL' : 'Configured'}
              </span>
            </div>

            {!isEditing ? (
              <>
                <p style={{ fontSize: 13, fontFamily: 'ui-monospace, monospace', color: needs ? 'var(--herr-ink-soft,#a0a0a0)' : 'var(--herr-ink,#1a1a1a)', margin: 0, marginBottom: 6, wordBreak: 'break-all' }}>
                  {s.zoom_join_url ?? '—'}
                </p>
                {s.host_notes && (
                  <p style={{ fontSize: 12, color: 'var(--herr-ink-soft,#5a5a5a)', margin: 0, marginBottom: 10, fontStyle: 'italic' }}>
                    {s.host_notes}
                  </p>
                )}
                <button
                  onClick={() => setEditing(s.id)}
                  style={{
                    padding: '8px 16px',
                    background: needs ? 'var(--herr-ink,#1a1a1a)' : 'transparent',
                    color: needs ? 'var(--herr-cream,#faf8f3)' : 'inherit',
                    border: needs ? 'none' : '1px solid var(--herr-border,#e5e2da)',
                    borderRadius: 3,
                    fontSize: 13,
                    cursor: 'pointer',
                    letterSpacing: 0.4,
                  }}
                >
                  {needs ? 'Set Zoom URL' : 'Edit'}
                </button>
              </>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                <label style={{ display: 'block' }}>
                  <span style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--herr-ink-soft,#5a5a5a)', display: 'block', marginBottom: 4 }}>Zoom join URL *</span>
                  <input
                    value={f.joinUrl}
                    onChange={(e) => setForm({ ...form, [s.id]: { ...f, joinUrl: e.target.value } })}
                    placeholder="https://us02web.zoom.us/j/123456789?pwd=..."
                    style={inputStyle}
                  />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <label style={{ display: 'block' }}>
                    <span style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--herr-ink-soft,#5a5a5a)', display: 'block', marginBottom: 4 }}>Meeting ID</span>
                    <input
                      value={f.meetingId}
                      onChange={(e) => setForm({ ...form, [s.id]: { ...f, meetingId: e.target.value } })}
                      placeholder="123 456 789"
                      style={inputStyle}
                    />
                  </label>
                  <label style={{ display: 'block' }}>
                    <span style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--herr-ink-soft,#5a5a5a)', display: 'block', marginBottom: 4 }}>Host start URL</span>
                    <input
                      value={f.startUrl}
                      onChange={(e) => setForm({ ...form, [s.id]: { ...f, startUrl: e.target.value } })}
                      placeholder="https://us02web.zoom.us/s/..."
                      style={inputStyle}
                    />
                  </label>
                </div>
                <label style={{ display: 'block' }}>
                  <span style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--herr-ink-soft,#5a5a5a)', display: 'block', marginBottom: 4 }}>Host notes</span>
                  <input
                    value={f.notes}
                    onChange={(e) => setForm({ ...form, [s.id]: { ...f, notes: e.target.value } })}
                    placeholder="Optional"
                    style={{ ...inputStyle, fontFamily: 'inherit' }}
                  />
                </label>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button
                    onClick={() => handleSave(s.id)}
                    disabled={busy[s.id] || !f.joinUrl}
                    style={{
                      padding: '8px 16px',
                      background: 'var(--herr-ink,#1a1a1a)',
                      color: 'var(--herr-cream,#faf8f3)',
                      border: 'none',
                      borderRadius: 3,
                      fontSize: 13,
                      cursor: busy[s.id] || !f.joinUrl ? 'not-allowed' : 'pointer',
                      letterSpacing: 0.4,
                      opacity: !f.joinUrl ? 0.5 : 1,
                    }}
                  >
                    {busy[s.id] ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    disabled={busy[s.id]}
                    style={{
                      padding: '8px 16px',
                      background: 'transparent',
                      border: '1px solid var(--herr-border,#e5e2da)',
                      borderRadius: 3,
                      fontSize: 13,
                      cursor: busy[s.id] ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {fl && (
              <span style={{
                display: 'inline-block',
                marginTop: 10,
                padding: '4px 10px',
                borderRadius: 3,
                background: fl.kind === 'ok' ? '#dff2e1' : '#fbdada',
                color: fl.kind === 'ok' ? '#1b6b2c' : '#8a1c1c',
                fontSize: 12,
              }}>
                {fl.text}
              </span>
            )}
          </div>
        );
      })}
      {pending && <p style={{ fontSize: 12, color: 'var(--herr-ink-soft,#5a5a5a)' }}>Refreshing…</p>}
    </>
  );
}
