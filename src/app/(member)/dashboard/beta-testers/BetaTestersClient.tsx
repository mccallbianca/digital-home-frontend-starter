'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';

export type Report = {
  id: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  url: string | null;
  screenshot_url: string | null;
  status: string;
  admin_response: string | null;
  created_at: string;
};

const CATEGORIES = [
  { id: 'bug', label: 'Bug' },
  { id: 'ui_issue', label: 'UI Issue' },
  { id: 'feature_request', label: 'Feature Request' },
  { id: 'content_suggestion', label: 'Content Suggestion' },
  { id: 'other', label: 'Other' },
];

const SEVERITIES = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
  { id: 'critical', label: 'Critical' },
];

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  open:          { bg: 'rgba(120,120,120,0.15)', fg: '#555' },
  investigating: { bg: 'rgba(234,179,8,0.20)',   fg: '#92400E' },
  resolved:      { bg: 'rgba(34,197,94,0.18)',   fg: '#15803D' },
  wontfix:       { bg: 'rgba(239,68,68,0.15)',   fg: '#B91C1C' },
  duplicate:     { bg: 'rgba(120,120,120,0.15)', fg: '#555' },
};

const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;

export default function BetaTestersClient({
  userId,
  reports,
}: {
  userId: string;
  reports: Report[];
}) {
  const router = useRouter();
  const [category, setCategory] = useState('bug');
  const [severity, setSeverity] = useState('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && document.referrer) {
      try {
        const ref = new URL(document.referrer);
        if (ref.origin === window.location.origin) setUrl(ref.toString());
      } catch {
        // ignore
      }
    }
  }, []);

  async function uploadScreenshot(file: File): Promise<string | null> {
    if (file.size > MAX_SCREENSHOT_BYTES) {
      throw new Error('Screenshot must be 5MB or smaller.');
    }
    const supabase = createClient();
    const ext = file.name.split('.').pop() || 'png';
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('beta-screenshots')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (upErr) throw upErr;
    const { data: signed, error: signErr } = await supabase.storage
      .from('beta-screenshots')
      .createSignedUrl(path, 60 * 60 * 24 * 7); // 7-day signed URL for admin review
    if (signErr) throw signErr;
    return signed?.signedUrl ?? null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      let screenshotUrl: string | null = null;
      if (screenshot) {
        screenshotUrl = await uploadScreenshot(screenshot);
      }

      const res = await fetch('/api/beta-testers/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          severity,
          title,
          description,
          url: url || null,
          screenshot_url: screenshotUrl,
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error || 'Submission failed.');
      } else {
        setSuccessMsg('Report submitted. Thank you.');
        setTitle('');
        setDescription('');
        setScreenshot(null);
        setSeverity('medium');
        setCategory('bug');
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  }

  function fmtDate(s: string) {
    return new Date(s).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  }

  return (
    <main className="px-6 py-10 max-w-[840px] mx-auto">
      <p className="herr-label mb-2" style={{ color: 'var(--herr-magenta)' }}>Beta Testers</p>
      <h1 className="font-display text-3xl font-light mb-2" style={{ color: 'var(--herr-ink)' }}>
        Beta Testers Lab
      </h1>
      <p className="text-sm mb-10" style={{ color: 'rgba(26,15,26,0.7)' }}>
        Thank you for helping shape HERR before launch. Submit bugs, UI feedback, content suggestions, or feature requests below.
      </p>

      <section className="mb-12 p-6 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid var(--herr-line)' }}>
        <h2 className="font-display text-xl font-light mb-5">Submit a Report</h2>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-md text-sm" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.4)', color: '#B91C1C' }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 px-4 py-3 rounded-md text-sm" style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.4)', color: '#15803D' }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Category">
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={selectStyle}>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Severity">
              <select value={severity} onChange={(e) => setSeverity(e.target.value)} style={selectStyle}>
                {SEVERITIES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Title">
            <input
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short summary"
              style={inputStyle}
            />
          </Field>

          <Field label="Description">
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What happened? What did you expect?"
              rows={5}
              style={{ ...inputStyle, height: 'auto', minHeight: 120, padding: '12px 14px', resize: 'vertical' }}
            />
          </Field>

          <Field label="URL (optional)">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://h3rr.com/dashboard/…"
              style={inputStyle}
            />
          </Field>

          <Field label="Screenshot (optional, max 5MB)">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
              style={{ fontSize: 13 }}
            />
          </Field>

          <button
            type="submit"
            disabled={submitting}
            className="self-start px-5 py-2.5 rounded-md text-sm font-medium"
            style={{
              background: 'var(--herr-magenta)',
              color: '#FFFFFF',
              opacity: submitting ? 0.6 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Submitting\u2026' : 'Submit Report'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-display text-xl font-light mb-5">My Submitted Reports</h2>
        {reports.length === 0 ? (
          <p className="text-sm" style={{ color: 'rgba(26,15,26,0.5)' }}>No reports yet.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {reports.map((r) => {
              const c = STATUS_COLORS[r.status] ?? STATUS_COLORS.open;
              return (
                <li key={r.id} className="p-5 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid var(--herr-line)' }}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-medium text-base">{r.title}</h3>
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ background: c.bg, color: c.fg, fontWeight: 600, textTransform: 'capitalize' }}
                    >
                      {r.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs mb-3" style={{ color: 'rgba(26,15,26,0.5)' }}>
                    {r.category.replace('_', ' ')} &middot; severity {r.severity} &middot; {fmtDate(r.created_at)}
                  </p>
                  <p className="text-sm mb-2" style={{ color: 'rgba(26,15,26,0.85)', whiteSpace: 'pre-wrap' }}>
                    {r.description}
                  </p>
                  {r.admin_response && (
                    <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--herr-line)' }}>
                      <p className="herr-label mb-1" style={{ color: 'var(--herr-magenta)' }}>Response from Bianca</p>
                      <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{r.admin_response}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 42,
  background: '#FFFFFF',
  border: '1px solid var(--herr-line)',
  borderRadius: 8,
  padding: '0 14px',
  color: 'var(--herr-ink)',
  fontSize: 14,
  outline: 'none',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="herr-label" style={{ color: 'rgba(26,15,26,0.55)' }}>{label}</span>
      {children}
    </label>
  );
}
