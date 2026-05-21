'use client';

/**
 * Enterprise contact form. Single component used at the bottom of both
 * /enterprise and /enterprise/sports. POSTs to /api/enterprise/inquiry.
 *
 * Accepts a `source` prop so we can tell sports-deck leads apart from
 * generic enterprise leads in the DB.
 */

import { useState } from 'react';

const ORG_TYPES: { value: string; label: string }[] = [
  { value: 'healthcare',         label: 'Healthcare' },
  { value: 'behavioral_health',  label: 'Behavioral Health' },
  { value: 'sports',             label: 'Sports' },
  { value: 'education',          label: 'Education' },
  { value: 'government',         label: 'Government' },
  { value: 'other',              label: 'Other' },
];

const INK   = '#0A0A0F';
const CREAM = '#F4F1EB';
const MAGENTA = '#C42D8E';
const MUTED = 'rgba(244,241,235,0.55)';

export default function EnterpriseInquiryForm({
  source = 'enterprise_page',
  accentColor = MAGENTA,
}: {
  source?: string;
  accentColor?: string;
}) {
  const [form, setForm] = useState({
    name: '', email: '', organization: '', org_type: '', message: '',
  });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/enterprise/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? `Submission failed (${res.status}).`);
      } else {
        setDone(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div
        style={{
          background: 'rgba(196,45,142,0.10)',
          border: `1px solid ${accentColor}`,
          borderRadius: 16,
          padding: 32,
          color: CREAM,
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: accentColor, fontWeight: 700, margin: '0 0 10px' }}>
          Received
        </p>
        <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 500, margin: '0 0 12px', color: CREAM }}>
          Thank you. Bianca will respond within 48 hours.
        </h3>
        <p style={{ fontSize: 14, color: MUTED, margin: 0, lineHeight: 1.6 }}>
          Your inquiry is in her inbox now. If urgent, call <strong style={{ color: CREAM }}>888-982-9423</strong>.
        </p>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    background: 'rgba(244,241,235,0.05)',
    border: '1px solid rgba(244,241,235,0.18)',
    borderRadius: 10,
    color: CREAM,
    fontSize: 15,
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 150ms',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: MUTED,
    fontWeight: 600,
    marginBottom: 6,
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'rgba(244,241,235,0.03)',
        border: '1px solid rgba(244,241,235,0.12)',
        borderRadius: 18,
        padding: '28px 24px',
        display: 'grid',
        gap: 16,
      }}
    >
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <label>
          <span style={labelStyle}>Name *</span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={inputStyle}
            placeholder="Your name"
            autoComplete="name"
          />
        </label>
        <label>
          <span style={labelStyle}>Email *</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={inputStyle}
            placeholder="you@org.com"
            autoComplete="email"
          />
        </label>
      </div>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <label>
          <span style={labelStyle}>Organization *</span>
          <input
            required
            value={form.organization}
            onChange={(e) => setForm({ ...form, organization: e.target.value })}
            style={inputStyle}
            placeholder="Company / institution"
            autoComplete="organization"
          />
        </label>
        <label>
          <span style={labelStyle}>Org type *</span>
          <select
            required
            value={form.org_type}
            onChange={(e) => setForm({ ...form, org_type: e.target.value })}
            style={{ ...inputStyle, appearance: 'none' }}
          >
            <option value="" disabled style={{ color: INK }}>Choose…</option>
            {ORG_TYPES.map((o) => (
              <option key={o.value} value={o.value} style={{ color: INK }}>{o.label}</option>
            ))}
          </select>
        </label>
      </div>

      <label>
        <span style={labelStyle}>Tell us about your need *</span>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          style={{ ...inputStyle, resize: 'vertical', minHeight: 120, fontFamily: 'inherit' }}
          placeholder="What problem are you trying to solve? Who are your users? Timeline?"
        />
      </label>

      {error && (
        <p role="alert" style={{ fontSize: 13, color: '#FF8A8A', margin: 0 }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <p style={{ fontSize: 12, color: MUTED, margin: 0, flex: 1, minWidth: 200 }}>
          We respond within 48 hours. Your info stays with Bianca and the ECQO team.
        </p>
        <button
          type="submit"
          disabled={busy}
          style={{
            padding: '14px 28px',
            background: accentColor,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: busy ? 'wait' : 'pointer',
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? 'Sending…' : 'Send inquiry'}
        </button>
      </div>
    </form>
  );
}
