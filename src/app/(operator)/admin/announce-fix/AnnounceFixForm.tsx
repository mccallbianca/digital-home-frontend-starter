'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const HERR_MAGENTA = '#C42D8E';
const HERR_LINE = 'var(--herr-line)';

interface AnnounceFixFormProps {
  defaultDeployVersion: string;
}

export default function AnnounceFixForm({ defaultDeployVersion }: AnnounceFixFormProps) {
  const router = useRouter();
  const [bugTitle, setBugTitle] = useState('');
  const [whatChanged, setWhatChanged] = useState('');
  const [deployVersion, setDeployVersion] = useState(defaultDeployVersion);
  const [retest, setRetest] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!bugTitle.trim()) {
      setError('Bug title is required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/announce-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bug_title: bugTitle.trim().slice(0, 100),
          what_changed: whatChanged.trim().slice(0, 500),
          deploy_version: deployVersion.trim().slice(0, 100),
          retest_instructions: retest.trim().slice(0, 500),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Could not post the announcement.');
      }
      router.push('/dashboard/community#community-feed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post the announcement.');
    } finally {
      setSubmitting(false);
    }
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'var(--herr-ink-soft)',
    fontWeight: 600,
  };

  const inputStyle: React.CSSProperties = {
    background: '#FFFFFF',
    border: `1px solid ${HERR_LINE}`,
    borderRadius: 10,
    padding: '12px 14px',
    fontSize: 15,
    fontFamily: 'inherit',
    color: 'var(--herr-ink)',
    outline: 'none',
    width: '100%',
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: 100,
    lineHeight: 1.5,
    resize: 'vertical',
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={labelStyle}>Bug title</span>
        <input
          type="text"
          value={bugTitle}
          onChange={(e) => setBugTitle(e.target.value.slice(0, 100))}
          maxLength={100}
          required
          placeholder="Stripe upgrade fails on iPhone Chrome"
          style={inputStyle}
        />
        <span style={{ fontSize: 11, color: 'rgba(26,15,26,0.45)', textAlign: 'right' }}>
          {bugTitle.length}/100
        </span>
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={labelStyle}>What changed</span>
        <textarea
          value={whatChanged}
          onChange={(e) => setWhatChanged(e.target.value.slice(0, 500))}
          maxLength={500}
          placeholder="Swapped to LIVE-mode Stripe price IDs so the Free to Elite upgrade now creates a real Checkout session."
          style={textareaStyle}
          rows={4}
        />
        <span style={{ fontSize: 11, color: 'rgba(26,15,26,0.45)', textAlign: 'right' }}>
          {whatChanged.length}/500
        </span>
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={labelStyle}>Deploy version</span>
        <input
          type="text"
          value={deployVersion}
          onChange={(e) => setDeployVersion(e.target.value.slice(0, 100))}
          maxLength={100}
          placeholder="da505c3e-0412-4d2a-9908-2bf688060102"
          style={inputStyle}
        />
        <span style={{ fontSize: 11, color: 'rgba(26,15,26,0.45)' }}>
          Defaults to the build NEXT_PUBLIC_DEPLOY_VERSION when set.
        </span>
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={labelStyle}>Re-test instructions</span>
        <textarea
          value={retest}
          onChange={(e) => setRetest(e.target.value.slice(0, 500))}
          maxLength={500}
          placeholder="Sign in, visit /dashboard/billing, tap Upgrade Plan, complete the Stripe Checkout."
          style={textareaStyle}
          rows={4}
        />
        <span style={{ fontSize: 11, color: 'rgba(26,15,26,0.45)', textAlign: 'right' }}>
          {retest.length}/500
        </span>
      </label>

      {error && (
        <p
          role="alert"
          style={{
            fontSize: 13,
            color: '#9B2C5E',
            background: 'rgba(196,45,142,0.08)',
            border: `1px solid ${HERR_MAGENTA}`,
            borderRadius: 10,
            padding: '10px 12px',
            margin: 0,
          }}
        >
          {error}
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="submit"
          disabled={submitting}
          style={{
            background: HERR_MAGENTA,
            border: 'none',
            borderRadius: 10,
            padding: '12px 22px',
            fontSize: 14,
            fontWeight: 600,
            color: '#FFFFFF',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {submitting ? 'Posting…' : 'Post to Beta Testers Chat'}
        </button>
      </div>
    </form>
  );
}
