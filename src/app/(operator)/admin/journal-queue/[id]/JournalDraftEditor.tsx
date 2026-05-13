'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export type Draft = {
  id: string;
  title: string;
  subtitle: string | null;
  body: string | null;
  slug: string;
  status: string;
  ai_generated_at: string | null;
};

export default function JournalDraftEditor({ draft }: { draft: Draft }) {
  const router = useRouter();
  const [title, setTitle] = useState(draft.title);
  const [subtitle, setSubtitle] = useState(draft.subtitle ?? '');
  const [slug, setSlug] = useState(draft.slug);
  const [body, setBody] = useState(draft.body ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/journal-queue/${draft.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, subtitle, slug, body }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        setError(b.error || 'Save failed');
      } else {
        router.push('/admin/journal-queue');
      }
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    setSaving(true);
    try {
      const patch = await fetch(`/api/admin/journal-queue/${draft.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, subtitle, slug, body }),
      });
      if (!patch.ok) {
        setError('Save before publish failed');
        setSaving(false);
        return;
      }
      const res = await fetch(`/api/admin/journal-queue/${draft.id}/publish`, { method: 'POST' });
      if (res.ok) router.push('/admin/journal-queue');
      else {
        const b = await res.json().catch(() => ({}));
        setError(b.error || 'Publish failed');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="px-6 py-10 max-w-[960px]">
      <p className="herr-label mb-2" style={{ color: 'var(--herr-magenta)' }}>Edit Draft</p>
      <h1 className="font-display text-2xl font-light mb-6" style={{ color: 'var(--herr-ink)' }}>
        {draft.title}
      </h1>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-md text-sm" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.4)', color: '#B91C1C' }}>
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="herr-label">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ height: 42, padding: '0 14px', borderRadius: 8, border: '1px solid var(--herr-line)', background: '#FFFFFF' }}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="herr-label">Subtitle</span>
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            style={{ height: 42, padding: '0 14px', borderRadius: 8, border: '1px solid var(--herr-line)', background: '#FFFFFF' }}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="herr-label">Slug</span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            style={{ height: 42, padding: '0 14px', borderRadius: 8, border: '1px solid var(--herr-line)', background: '#FFFFFF', fontFamily: 'monospace' }}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="herr-label">Body (HTML)</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={20}
            style={{ padding: '12px 14px', borderRadius: 8, border: '1px solid var(--herr-line)', background: '#FFFFFF', fontFamily: 'monospace', fontSize: 13, resize: 'vertical' }}
          />
        </label>

        <div className="flex gap-3 mt-2">
          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-2.5 text-sm rounded-md"
            style={{ background: 'transparent', border: '1px solid var(--herr-line)', cursor: 'pointer' }}
          >
            {saving ? 'Saving\u2026' : 'Save draft'}
          </button>
          <button
            onClick={publish}
            disabled={saving}
            className="px-5 py-2.5 text-sm rounded-md"
            style={{
              background: 'var(--herr-magenta)',
              color: '#FFFFFF',
              border: 'none',
              opacity: saving ? 0.6 : 1,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            Approve & Publish
          </button>
        </div>
      </div>
    </main>
  );
}
