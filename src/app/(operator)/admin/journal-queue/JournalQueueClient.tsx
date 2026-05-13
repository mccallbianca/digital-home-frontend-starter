'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export type Draft = {
  id: string;
  title: string;
  subtitle: string | null;
  body: string | null;
  slug: string;
  ai_generated_at: string | null;
};

export default function JournalQueueClient({ drafts }: { drafts: Draft[] }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function publish(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/journal-queue/${id}/publish`, { method: 'POST' });
      if (res.ok) router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function discard(id: string) {
    if (!confirm('Delete this draft? This cannot be undone.')) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/journal-queue/${id}`, { method: 'DELETE' });
      if (res.ok) router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  function fmt(s: string | null) {
    if (!s) return '—';
    return new Date(s).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  }

  return (
    <main className="px-6 py-10 max-w-[960px]">
      <p className="herr-label mb-2" style={{ color: 'var(--herr-magenta)' }}>Journal Queue</p>
      <h1 className="font-display text-3xl font-light mb-2" style={{ color: 'var(--herr-ink)' }}>
        AI Article Drafts
      </h1>
      <p className="text-sm mb-8" style={{ color: 'rgba(26,15,26,0.7)' }}>
        {drafts.length} draft{drafts.length === 1 ? '' : 's'} awaiting review.
      </p>

      {drafts.length === 0 ? (
        <p className="text-sm" style={{ color: 'rgba(26,15,26,0.5)' }}>No pending drafts.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {drafts.map((d) => {
            const isOpen = expanded === d.id;
            return (
              <li key={d.id} className="rounded-lg" style={{ background: '#FFFFFF', border: '1px solid var(--herr-line)' }}>
                <div className="px-5 py-4 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h2 className="font-display text-xl mb-1">{d.title}</h2>
                    {d.subtitle && <p className="text-sm mb-2" style={{ color: 'rgba(26,15,26,0.7)' }}>{d.subtitle}</p>}
                    <p className="text-xs" style={{ color: 'rgba(26,15,26,0.5)' }}>
                      Generated {fmt(d.ai_generated_at)} &middot; slug <code>{d.slug}</code>
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Link
                      href={`/admin/journal-queue/${d.id}`}
                      className="px-3 py-1.5 text-xs rounded-md text-center"
                      style={{ background: 'transparent', border: '1px solid var(--herr-line)', textDecoration: 'none', color: 'var(--herr-ink)' }}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => publish(d.id)}
                      disabled={busyId === d.id}
                      className="px-3 py-1.5 text-xs rounded-md"
                      style={{
                        background: 'var(--herr-magenta)',
                        color: '#FFFFFF',
                        border: 'none',
                        opacity: busyId === d.id ? 0.6 : 1,
                        cursor: 'pointer',
                      }}
                    >
                      Publish
                    </button>
                    <button
                      onClick={() => discard(d.id)}
                      disabled={busyId === d.id}
                      className="px-3 py-1.5 text-xs rounded-md"
                      style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.4)', color: '#B91C1C', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setExpanded(isOpen ? null : d.id)}
                  className="w-full text-left px-5 py-2 text-xs"
                  style={{ background: 'rgba(26,15,26,0.03)', border: 'none', borderTop: '1px solid var(--herr-line)', cursor: 'pointer', color: 'rgba(26,15,26,0.6)' }}
                >
                  {isOpen ? 'Hide preview' : 'Show preview'}
                </button>
                {isOpen && d.body && (
                  <article
                    className="px-5 py-4 text-sm"
                    style={{ borderTop: '1px solid var(--herr-line)', maxHeight: 400, overflowY: 'auto' }}
                    dangerouslySetInnerHTML={{ __html: d.body }}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
