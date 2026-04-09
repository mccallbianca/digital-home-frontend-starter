'use client';

import { useState } from 'react';

interface Testimonial {
  id: string;
  member_id: string | null;
  session_id: string | null;
  content: string;
  status: string;
  created_at: string;
}

export default function TestimonialsAdmin({ testimonials }: { testimonials: Testimonial[] }) {
  const [items, setItems] = useState(testimonials);
  const [processing, setProcessing] = useState<string | null>(null);

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    setProcessing(id);
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setItems(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      }
    } finally {
      setProcessing(null);
    }
  }

  const pending = items.filter(t => t.status === 'pending');
  const approved = items.filter(t => t.status === 'approved');
  const rejected = items.filter(t => t.status === 'rejected');

  return (
    <div>
      {pending.length > 0 && (
        <section className="mb-10">
          <p className="herr-label text-[var(--herr-pink)] mb-4">Pending ({pending.length})</p>
          <div className="space-y-3">
            {pending.map(t => (
              <div key={t.id} className="bg-[var(--herr-surface)] border border-[var(--herr-border)] p-6">
                <p className="text-[var(--herr-white)] text-sm leading-relaxed mb-3 italic">
                  &ldquo;{t.content}&rdquo;
                </p>
                <p className="text-[0.75rem] text-[var(--herr-faint)] mb-4">
                  Submitted {new Date(t.created_at).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(t.id, 'approved')}
                    disabled={processing === t.id}
                    className="btn-herr-primary text-[0.72rem] px-3 py-1 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(t.id, 'rejected')}
                    disabled={processing === t.id}
                    className="text-[0.72rem] text-[var(--herr-muted)] hover:text-[var(--herr-pink)] px-3 py-1"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {approved.length > 0 && (
        <section className="mb-10">
          <p className="herr-label text-[var(--herr-cobalt)] mb-4">Approved ({approved.length})</p>
          <div className="space-y-px">
            {approved.map(t => (
              <div key={t.id} className="bg-[var(--herr-surface)] px-6 py-4">
                <p className="text-[var(--herr-muted)] text-sm italic truncate">&ldquo;{t.content}&rdquo;</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {pending.length === 0 && approved.length === 0 && (
        <p className="text-[var(--herr-faint)] text-sm">No testimonials yet.</p>
      )}
    </div>
  );
}
