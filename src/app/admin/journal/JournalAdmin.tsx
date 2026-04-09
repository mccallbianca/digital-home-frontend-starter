'use client';

import { useState } from 'react';

interface Article {
  id: string;
  title: string;
  status: string;
  body: string | null;
  slug: string | null;
  published_at: string | null;
  created_at: string;
}

export default function JournalAdmin({ articles }: { articles: Article[] }) {
  const [items, setItems] = useState(articles);
  const [processing, setProcessing] = useState<string | null>(null);

  async function updateStatus(id: string, status: string) {
    setProcessing(id);
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status,
          ...(status === 'published' ? { published_at: new Date().toISOString() } : {}),
        }),
      });
      if (res.ok) {
        setItems(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      }
    } finally {
      setProcessing(null);
    }
  }

  const pending = items.filter(a => a.status !== 'published' && a.status !== 'archived');
  const published = items.filter(a => a.status === 'published');

  return (
    <div>
      {pending.length > 0 && (
        <section className="mb-10">
          <p className="herr-label text-[var(--herr-muted)] mb-4">Pending Review ({pending.length})</p>
          <div className="space-y-px">
            {pending.map(a => (
              <div key={a.id} className="bg-[var(--herr-surface)] px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--herr-white)] text-sm truncate">{a.title}</p>
                  <p className="text-[0.75rem] text-[var(--herr-faint)]">{a.status} &middot; {new Date(a.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => updateStatus(a.id, 'published')}
                    disabled={processing === a.id}
                    className="btn-herr-primary text-[0.72rem] px-3 py-1 disabled:opacity-50"
                  >
                    Publish
                  </button>
                  <button
                    onClick={() => updateStatus(a.id, 'archived')}
                    disabled={processing === a.id}
                    className="text-[0.72rem] text-[var(--herr-muted)] hover:text-[var(--herr-pink)] px-3 py-1"
                  >
                    Archive
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <p className="herr-label text-[var(--herr-muted)] mb-4">Published ({published.length})</p>
        <div className="space-y-px">
          {published.map(a => (
            <div key={a.id} className="bg-[var(--herr-surface)] px-6 py-4 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[var(--herr-white)] text-sm truncate">{a.title}</p>
                <p className="text-[0.75rem] text-[var(--herr-faint)]">
                  Published {a.published_at ? new Date(a.published_at).toLocaleDateString() : ''}
                </p>
              </div>
              <span className="herr-label text-[var(--herr-cobalt)] text-[0.7rem]">Live</span>
            </div>
          ))}
          {published.length === 0 && (
            <p className="text-[var(--herr-faint)] text-sm py-6">No published articles yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
