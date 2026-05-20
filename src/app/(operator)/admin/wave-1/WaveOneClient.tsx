'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { BetaTesterRow } from './page';

const STATUS_PILL: Record<string, { bg: string; fg: string; label: string }> = {
  invited:   { bg: '#eef0f4', fg: '#4a5160', label: 'invited' },
  welcomed:  { bg: '#cfe4ff', fg: '#1a4789', label: 'welcomed' },
  signed_up: { bg: '#dff2e1', fg: '#1b6b2c', label: 'signed up' },
  active:    { bg: '#dff2e1', fg: '#1b6b2c', label: 'active' },
  churned:   { bg: '#fbdada', fg: '#8a1c1c', label: 'churned' },
};

export default function WaveOneClient({
  initialTesters,
  counts,
}: {
  initialTesters: BetaTesterRow[];
  counts: { total: number; invited: number; welcomed: number; signed_up: number; churned: number; pending_send: number };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [addOpen, setAddOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [form, setForm] = useState({ email: '', full_name: '', signup_source: 'manual' });

  const cardStyle: React.CSSProperties = {
    background: 'var(--herr-white)',
    border: '1px solid var(--herr-border,#e5e2da)',
    padding: '14px 16px',
    borderRadius: 6,
  };

  async function handleSendWave() {
    setBusy(true);
    setFlash(null);
    try {
      const res = await fetch('/api/admin/send-tester-wave-1', { method: 'POST', body: JSON.stringify({}) });
      const data = await res.json();
      if (!res.ok) {
        setFlash({ kind: 'err', text: data?.error ?? `HTTP ${res.status}` });
      } else {
        setFlash({
          kind: 'ok',
          text: `Sent ${data.sent_count} / ${data.total_processed}${data.failed_count ? ` (${data.failed_count} failed)` : ''}`,
        });
        startTransition(() => router.refresh());
      }
    } catch (err) {
      setFlash({ kind: 'err', text: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusy(false);
      setConfirmOpen(false);
    }
  }

  async function handleAddTester(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFlash(null);
    try {
      const res = await fetch('/api/admin/wave-1/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setFlash({ kind: 'err', text: data?.error ?? `HTTP ${res.status}` });
      } else {
        setFlash({ kind: 'ok', text: `Added ${form.email}` });
        setForm({ email: '', full_name: '', signup_source: 'manual' });
        setAddOpen(false);
        startTransition(() => router.refresh());
      }
    } catch (err) {
      setFlash({ kind: 'err', text: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Counts strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 24 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--herr-ink-soft,#5a5a5a)' }}>Total</div>
          <div style={{ fontSize: 24, fontWeight: 300, marginTop: 2, fontFamily: 'var(--font-display,Georgia)' }}>{counts.total}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--herr-ink-soft,#5a5a5a)' }}>Invited</div>
          <div style={{ fontSize: 24, fontWeight: 300, marginTop: 2, fontFamily: 'var(--font-display,Georgia)' }}>{counts.invited}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--herr-ink-soft,#5a5a5a)' }}>Welcomed</div>
          <div style={{ fontSize: 24, fontWeight: 300, marginTop: 2, fontFamily: 'var(--font-display,Georgia)' }}>{counts.welcomed}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--herr-ink-soft,#5a5a5a)' }}>Signed up</div>
          <div style={{ fontSize: 24, fontWeight: 300, marginTop: 2, fontFamily: 'var(--font-display,Georgia)' }}>{counts.signed_up}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--herr-ink-soft,#5a5a5a)' }}>Churned</div>
          <div style={{ fontSize: 24, fontWeight: 300, marginTop: 2, fontFamily: 'var(--font-display,Georgia)' }}>{counts.churned}</div>
        </div>
        <div style={{ ...cardStyle, background: counts.pending_send > 0 ? '#fff7e0' : cardStyle.background }}>
          <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--herr-ink-soft,#5a5a5a)' }}>Pending send</div>
          <div style={{ fontSize: 24, fontWeight: 300, marginTop: 2, fontFamily: 'var(--font-display,Georgia)' }}>{counts.pending_send}</div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <button
          onClick={() => setConfirmOpen(true)}
          disabled={counts.pending_send === 0 || busy || pending}
          style={{
            padding: '10px 18px',
            background: counts.pending_send === 0 ? 'var(--herr-ink-soft,#bdbdbd)' : 'var(--herr-ink,#1a1a1a)',
            color: 'var(--herr-cream,#faf8f3)',
            border: 'none',
            borderRadius: 3,
            fontSize: 13,
            cursor: counts.pending_send === 0 ? 'not-allowed' : 'pointer',
            letterSpacing: 0.4,
          }}
        >
          Send Wave 1 to {counts.pending_send} tester{counts.pending_send === 1 ? '' : 's'}
        </button>
        <button
          onClick={() => setAddOpen((x) => !x)}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: '1px solid var(--herr-border,#e5e2da)',
            borderRadius: 3,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          {addOpen ? '× cancel' : '+ Add tester'}
        </button>
        {flash && (
          <span style={{
            fontSize: 13,
            padding: '6px 10px',
            borderRadius: 3,
            background: flash.kind === 'ok' ? '#dff2e1' : '#fbdada',
            color: flash.kind === 'ok' ? '#1b6b2c' : '#8a1c1c',
          }}>
            {flash.text}
          </span>
        )}
      </div>

      {/* Add tester form */}
      {addOpen && (
        <form
          onSubmit={handleAddTester}
          style={{
            background: 'var(--herr-white)',
            border: '1px solid var(--herr-border,#e5e2da)',
            borderRadius: 6,
            padding: 18,
            marginBottom: 20,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 160px auto',
            gap: 10,
            alignItems: 'end',
          }}
        >
          <label style={{ display: 'block' }}>
            <span style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--herr-ink-soft,#5a5a5a)', display: 'block', marginBottom: 4 }}>Email *</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="tester@example.com"
              style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--herr-border,#e5e2da)', borderRadius: 3, fontSize: 13 }}
            />
          </label>
          <label style={{ display: 'block' }}>
            <span style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--herr-ink-soft,#5a5a5a)', display: 'block', marginBottom: 4 }}>Full name</span>
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Optional"
              style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--herr-border,#e5e2da)', borderRadius: 3, fontSize: 13 }}
            />
          </label>
          <label style={{ display: 'block' }}>
            <span style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--herr-ink-soft,#5a5a5a)', display: 'block', marginBottom: 4 }}>Source</span>
            <select
              value={form.signup_source}
              onChange={(e) => setForm({ ...form, signup_source: e.target.value })}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--herr-border,#e5e2da)', borderRadius: 3, fontSize: 13, background: 'white' }}
            >
              <option value="manual">manual</option>
              <option value="interest_form">interest form</option>
              <option value="partner">partner</option>
              <option value="referral">referral</option>
              <option value="event">event</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={busy || !form.email}
            style={{
              padding: '10px 18px',
              background: 'var(--herr-ink,#1a1a1a)',
              color: 'var(--herr-cream,#faf8f3)',
              border: 'none',
              borderRadius: 3,
              fontSize: 13,
              cursor: busy ? 'not-allowed' : 'pointer',
              letterSpacing: 0.4,
            }}
          >
            {busy ? 'Adding…' : 'Add tester'}
          </button>
        </form>
      )}

      {/* Table */}
      <div style={{ background: 'var(--herr-white)', border: '1px solid var(--herr-border,#e5e2da)', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#faf8f3', textAlign: 'left', borderBottom: '1px solid var(--herr-border,#e5e2da)' }}>
                <th style={{ padding: '10px 12px', fontWeight: 500 }}>Email</th>
                <th style={{ padding: '10px 12px', fontWeight: 500 }}>Name</th>
                <th style={{ padding: '10px 12px', fontWeight: 500 }}>Source</th>
                <th style={{ padding: '10px 12px', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '10px 12px', fontWeight: 500 }}>Welcomed</th>
                <th style={{ padding: '10px 12px', fontWeight: 500 }}>Signed up</th>
                <th style={{ padding: '10px 12px', fontWeight: 500 }}>Added</th>
              </tr>
            </thead>
            <tbody>
              {initialTesters.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--herr-ink-soft,#5a5a5a)' }}>
                    No testers yet. Add one above.
                  </td>
                </tr>
              )}
              {initialTesters.map((t) => {
                const sp = STATUS_PILL[t.status] ?? STATUS_PILL.invited;
                return (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f0ede4' }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>{t.email}</td>
                    <td style={{ padding: '10px 12px' }}>{t.full_name ?? <span style={{ color: 'var(--herr-ink-soft,#a0a0a0)' }}>—</span>}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--herr-ink-soft,#5a5a5a)' }}>{t.signup_source ?? '—'}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ background: sp.bg, color: sp.fg, padding: '3px 8px', borderRadius: 3, fontSize: 11, fontWeight: 500 }}>
                        {sp.label}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 12 }}>
                      {t.welcome_email_sent_at
                        ? new Date(t.welcome_email_sent_at).toISOString().slice(0, 10)
                        : <span style={{ color: 'var(--herr-ink-soft,#a0a0a0)' }}>—</span>}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 12 }}>
                      {t.signed_up_at
                        ? new Date(t.signed_up_at).toISOString().slice(0, 10)
                        : <span style={{ color: 'var(--herr-ink-soft,#a0a0a0)' }}>—</span>}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--herr-ink-soft,#5a5a5a)' }}>
                      {new Date(t.created_at).toISOString().slice(0, 10)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation modal */}
      {confirmOpen && (
        <div
          onClick={() => !busy && setConfirmOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--herr-white,#fff)',
              borderRadius: 8,
              padding: 28,
              width: '90%',
              maxWidth: 460,
              boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-display,Georgia)', fontWeight: 300, fontSize: 22, marginBottom: 10 }}>
              Send Wave 1 to {counts.pending_send} tester{counts.pending_send === 1 ? '' : 's'}?
            </h3>
            <p style={{ fontSize: 14, color: 'var(--herr-ink-soft,#5a5a5a)', lineHeight: 1.55, marginBottom: 20 }}>
              Each tester receives the branded welcome email with their magic link.
              Resend is rate-limited to 5 concurrent calls. This action can&apos;t be undone — they&apos;ll be marked as <em>welcomed</em>.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={busy}
                style={{ padding: '10px 18px', background: 'transparent', border: '1px solid var(--herr-border,#e5e2da)', borderRadius: 3, fontSize: 13, cursor: busy ? 'not-allowed' : 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSendWave}
                disabled={busy}
                style={{
                  padding: '10px 18px',
                  background: 'var(--herr-ink,#1a1a1a)',
                  color: 'var(--herr-cream,#faf8f3)',
                  border: 'none',
                  borderRadius: 3,
                  fontSize: 13,
                  cursor: busy ? 'not-allowed' : 'pointer',
                  letterSpacing: 0.4,
                }}
              >
                {busy ? 'Sending…' : `Yes, send to ${counts.pending_send}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
