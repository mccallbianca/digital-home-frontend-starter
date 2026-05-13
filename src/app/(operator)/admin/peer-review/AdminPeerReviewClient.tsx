'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';

export type AdminPaper = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  uploaded_at: string;
};

const MAX_PDF_BYTES = 25 * 1024 * 1024;

export default function AdminPeerReviewClient({ papers }: { papers: AdminPaper[] }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [publish, setPublish] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError('Choose a PDF file.');
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setError('PDF too large (max 25MB).');
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const path = `${crypto.randomUUID()}-${file.name.replace(/\s+/g, '_')}`;
      const { error: upErr } = await supabase.storage
        .from('peer-review-papers')
        .upload(path, file, { contentType: 'application/pdf', upsert: false });
      if (upErr) throw upErr;

      const res = await fetch('/api/admin/peer-review/papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          pdf_url: path,
          status: publish ? 'published' : 'draft',
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Save failed');
      }
      setTitle('');
      setDescription('');
      setFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function setStatus(p: AdminPaper, status: 'published' | 'archived' | 'draft') {
    setBusy(p.id);
    try {
      const res = await fetch(`/api/admin/peer-review/papers/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="px-6 py-10 max-w-[920px]">
      <p className="herr-label mb-2" style={{ color: 'var(--herr-magenta)' }}>Peer-Review</p>
      <h1 className="font-display text-3xl font-light mb-2" style={{ color: 'var(--herr-ink)' }}>
        Peer-Review Papers
      </h1>

      <section className="mb-12 p-6 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid var(--herr-line)' }}>
        <h2 className="font-display text-xl mb-4">Upload Paper</h2>
        {error && (
          <div className="mb-4 px-4 py-3 rounded-md text-sm" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.4)', color: '#B91C1C' }}>
            {error}
          </div>
        )}
        <form onSubmit={upload} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="herr-label">Title</span>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid var(--herr-line)', background: '#FFFFFF' }}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="herr-label">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--herr-line)', background: '#FFFFFF', resize: 'vertical' }}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="herr-label">PDF (max 25MB)</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={publish}
              onChange={(e) => setPublish(e.target.checked)}
            />
            Publish immediately (uncheck to save as draft)
          </label>
          <button
            type="submit"
            disabled={uploading}
            className="self-start px-5 py-2.5 rounded-md text-sm"
            style={{
              background: 'var(--herr-magenta)',
              color: '#FFFFFF',
              opacity: uploading ? 0.6 : 1,
              border: 'none',
              cursor: uploading ? 'not-allowed' : 'pointer',
            }}
          >
            {uploading ? 'Uploading\u2026' : 'Upload Paper'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-display text-xl mb-4">All Papers</h2>
        {papers.length === 0 ? (
          <p className="text-sm" style={{ color: 'rgba(26,15,26,0.5)' }}>No papers uploaded yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {papers.map((p) => (
              <li key={p.id} className="p-4 rounded-lg flex items-center justify-between gap-4" style={{ background: '#FFFFFF', border: '1px solid var(--herr-line)' }}>
                <div className="flex-1">
                  <p className="font-medium text-sm">{p.title}</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(26,15,26,0.55)' }}>
                    {p.status} &middot; {new Date(p.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {p.status !== 'published' && (
                    <button
                      onClick={() => setStatus(p, 'published')}
                      disabled={busy === p.id}
                      className="px-3 py-1.5 text-xs rounded-md"
                      style={{ background: 'transparent', border: '1px solid var(--herr-line)', cursor: 'pointer' }}
                    >
                      Publish
                    </button>
                  )}
                  {p.status !== 'archived' && (
                    <button
                      onClick={() => setStatus(p, 'archived')}
                      disabled={busy === p.id}
                      className="px-3 py-1.5 text-xs rounded-md"
                      style={{ background: 'transparent', border: '1px solid var(--herr-line)', cursor: 'pointer' }}
                    >
                      Archive
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
