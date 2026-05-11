'use client';

import { useState } from 'react';

interface Submission {
  id: string;
  member_id: string | null;
  name: string | null;
  email: string | null;
  reason: string | null;
  status: string;
  created_at: string;
}

interface BetaMember {
  id: string;
  email: string;
  name: string | null;
  beta_tester: boolean;
}

export default function BetaLabAdmin({ submissions, betaMembers }: { submissions: Submission[]; betaMembers: BetaMember[] }) {
  const [items, setItems] = useState(submissions);
  const [processing, setProcessing] = useState<string | null>(null);

  async function handleApprove(id: string) {
    setProcessing(id);
    try {
      const res = await fetch('/api/admin/beta-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'approve' }),
      });
      if (res.ok) {
        setItems(prev => prev.map(s => s.id === id ? { ...s, status: 'approved' } : s));
      }
    } finally {
      setProcessing(null);
    }
  }

  const pending = items.filter(s => s.status === 'pending');
  const approved = items.filter(s => s.status === 'approved');

  return (
    <div>
      {pending.length > 0 && (
        <section className="mb-10">
          <p className="herr-label text-[var(--herr-pink)] mb-4">Pending Applications ({pending.length})</p>
          <div className="space-y-3">
            {pending.map(s => (
              <div key={s.id} className="bg-[var(--herr-surface)] border border-[var(--herr-border)] p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-[var(--herr-white)] text-sm font-medium">{s.name || 'Unknown'}</p>
                    <p className="text-[0.75rem] text-[var(--herr-faint)]">{s.email}</p>
                  </div>
                  <span className="text-[0.7rem] text-[var(--herr-faint)]">{new Date(s.created_at).toLocaleDateString()}</span>
                </div>
                {s.reason && <p className="text-[var(--herr-muted)] text-sm leading-relaxed mb-4">{s.reason}</p>}
                <button
                  onClick={() => handleApprove(s.id)}
                  disabled={processing === s.id}
                  className="btn-herr-primary text-[0.72rem] px-3 py-1 disabled:opacity-50"
                >
                  Approve as Beta Tester
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <p className="herr-label text-[var(--herr-cobalt)] mb-4">Active Beta Testers ({betaMembers.length})</p>
        {betaMembers.length > 0 ? (
          <div className="space-y-px">
            {betaMembers.map(m => (
              <div key={m.id} className="bg-[var(--herr-surface)] px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[var(--herr-white)] text-sm">{m.name || m.email}</p>
                  <p className="text-[0.72rem] text-[var(--herr-faint)]">{m.email}</p>
                </div>
                <span className="herr-label text-[var(--herr-cobalt)] text-[0.7rem]">Active</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[var(--herr-faint)] text-sm">No beta testers yet.</p>
        )}
      </section>
    </div>
  );
}
