'use client';

/**
 * TesterBugReportButton — emergency "Stuck?" report surface.
 *
 * Floats bottom-right on every authenticated page when the signed-in
 * profile has is_tester=true. Tap opens a two-field form: "What were
 * you trying to do?" and "What happened instead?", plus an optional
 * screenshot upload to the beta-screenshots Supabase storage bucket.
 *
 * On submit POSTs /api/beta/emergency-report which writes a row to
 * beta_tester_reports with report_type='emergency', captures the
 * current url and user-agent, and notifies Bianca by email.
 *
 * Block 5 Part 2 Task 3.
 */

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';

const HERR_INK = '#0A0A0F';
const HERR_MAGENTA = '#C42D8E';
const HERR_CREAM = '#F4F1EB';
const HERR_LINE = 'rgba(244,241,235,0.18)';

const MAX_INTENT = 500;
const MAX_OUTCOME = 1000;
const MAX_SCREENSHOT_BYTES = 10 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function TesterBugReportButton() {
  const [eligible, setEligible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || cancelled) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('is_tester')
          .eq('id', user.id)
          .maybeSingle();
        if (!cancelled && profile?.is_tester === true) setEligible(true);
      } catch {
        // unauthenticated or table missing — silently hide the button
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!eligible) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Report a problem"
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          right: 24,
          bottom: `max(24px, env(safe-area-inset-bottom))`,
          zIndex: 9999,
          minHeight: 44,
          minWidth: 44,
          padding: '10px 18px',
          borderRadius: 999,
          background: HERR_MAGENTA,
          color: '#FFFFFF',
          border: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: '0.04em',
          boxShadow: '0 10px 30px rgba(196,45,142,0.35)',
          cursor: 'pointer',
        }}
      >
        <BugIcon />
        Stuck?
      </button>
      {open && <ReportModal onClose={() => setOpen(false)} />}
    </>
  );
}

function BugIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 2l1.88 1.88" />
      <path d="M14.12 3.88L16 2" />
      <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z" />
      <path d="M12 20v-9" />
      <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
      <path d="M6 13H2" />
      <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
      <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
      <path d="M22 13h-4" />
      <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
    </svg>
  );
}

function ReportModal({ onClose }: { onClose: () => void }) {
  const [intent, setIntent] = useState('');
  const [outcome, setOutcome] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  async function uploadScreenshot(supabase: ReturnType<typeof createClient>, userId: string): Promise<string | null> {
    if (!file) return null;
    if (!IMAGE_TYPES.includes(file.type)) {
      throw new Error('Screenshots can be jpg, png, or webp.');
    }
    if (file.size > MAX_SCREENSHOT_BYTES) {
      throw new Error('Screenshots can be up to 10MB.');
    }
    const ext = file.name.split('.').pop() || 'png';
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('beta-screenshots')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (upErr) throw new Error(upErr.message);
    return path;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!intent.trim() || !outcome.trim()) {
      setError('Please fill both fields so Bianca can reproduce what you saw.');
      return;
    }
    setSubmitting(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Sign-in expired. Please sign in again.');

      let screenshotPath: string | null = null;
      if (file) screenshotPath = await uploadScreenshot(supabase, user.id);

      const res = await fetch('/api/beta/emergency-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intended_action: intent.trim().slice(0, MAX_INTENT),
          actual_outcome: outcome.trim().slice(0, MAX_OUTCOME),
          screenshot_url: screenshotPath,
          url_at_time: typeof window !== 'undefined' ? window.location.href : null,
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Could not log this report. Please try again.');
      }
      setConfirmation('Bug logged. Thank you. Bianca reviews these twice daily.');
      setTimeout(onClose, 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not log this report.');
    } finally {
      setSubmitting(false);
    }
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Report a problem"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(10,10,15,0.66)',
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: isMobile ? 0 : 24,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: HERR_INK,
          color: HERR_CREAM,
          width: isMobile ? '100%' : 'min(520px, 100%)',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderBottomLeftRadius: isMobile ? 0 : 20,
          borderBottomRightRadius: isMobile ? 0 : 20,
          border: `1px solid ${HERR_LINE}`,
          padding: 24,
          paddingBottom: `max(24px, env(safe-area-inset-bottom))`,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <header>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 24,
              fontWeight: 500,
              margin: 0,
            }}
          >
            What got you stuck?
          </p>
          <p style={{ fontSize: 13, color: 'rgba(244,241,235,0.6)', margin: '4px 0 0', lineHeight: 1.5 }}>
            A quick two-field note helps Bianca reproduce what you saw.
          </p>
        </header>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(244,241,235,0.55)' }}>
            What were you trying to do?
          </span>
          <textarea
            value={intent}
            onChange={(e) => setIntent(e.target.value.slice(0, MAX_INTENT))}
            placeholder="I tapped Upgrade Plan to..."
            rows={3}
            required
            style={{
              background: 'rgba(244,241,235,0.04)',
              border: `1px solid ${HERR_LINE}`,
              borderRadius: 12,
              padding: '10px 12px',
              color: HERR_CREAM,
              fontFamily: 'inherit',
              fontSize: 15,
              lineHeight: 1.5,
              resize: 'vertical',
              outline: 'none',
            }}
          />
          <span style={{ fontSize: 11, color: 'rgba(244,241,235,0.4)', textAlign: 'right' }}>
            {intent.length}/{MAX_INTENT}
          </span>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(244,241,235,0.55)' }}>
            What happened instead?
          </span>
          <textarea
            value={outcome}
            onChange={(e) => setOutcome(e.target.value.slice(0, MAX_OUTCOME))}
            placeholder="The button did nothing, then..."
            rows={4}
            required
            style={{
              background: 'rgba(244,241,235,0.04)',
              border: `1px solid ${HERR_LINE}`,
              borderRadius: 12,
              padding: '10px 12px',
              color: HERR_CREAM,
              fontFamily: 'inherit',
              fontSize: 15,
              lineHeight: 1.5,
              resize: 'vertical',
              outline: 'none',
            }}
          />
          <span style={{ fontSize: 11, color: 'rgba(244,241,235,0.4)', textAlign: 'right' }}>
            {outcome.length}/{MAX_OUTCOME}
          </span>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(244,241,235,0.55)' }}>
            Screenshot (optional)
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            style={{ color: 'rgba(244,241,235,0.7)', fontSize: 13 }}
          />
          <span style={{ fontSize: 11, color: 'rgba(244,241,235,0.4)' }}>
            jpg, png, or webp up to 10MB.
          </span>
        </label>

        {error && (
          <p
            role="alert"
            style={{
              fontSize: 13,
              color: '#FBA8C9',
              background: 'rgba(196,45,142,0.12)',
              border: '1px solid rgba(196,45,142,0.4)',
              borderRadius: 10,
              padding: '8px 12px',
              margin: 0,
            }}
          >
            {error}
          </p>
        )}

        {confirmation && (
          <p
            role="status"
            style={{
              fontSize: 13,
              color: HERR_CREAM,
              background: 'rgba(196,45,142,0.18)',
              border: `1px solid ${HERR_MAGENTA}`,
              borderRadius: 10,
              padding: '10px 12px',
              margin: 0,
            }}
          >
            {confirmation}
          </p>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexDirection: isMobile ? 'column-reverse' : 'row' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{
              background: 'transparent',
              border: `1px solid ${HERR_LINE}`,
              borderRadius: 10,
              padding: '12px 18px',
              fontSize: 14,
              color: HERR_CREAM,
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontWeight: 500,
              minHeight: 44,
            }}
          >
            Cancel
          </button>
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
              minHeight: 44,
            }}
          >
            {submitting ? 'Logging…' : 'Send Report'}
          </button>
        </div>
      </form>
    </div>
  );
}
