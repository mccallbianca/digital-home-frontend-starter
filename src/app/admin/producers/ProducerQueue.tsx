'use client';

import { useState } from 'react';

interface Application {
  id: string;
  first_name: string;
  last_name: string;
  stage_name: string;
  email: string;
  genre_specialties: string[];
  portfolio_url: string;
  sample_track_url: string | null;
  statement: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

export default function ProducerQueue({ initialData }: { initialData: Application[] }) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [data, setData] = useState(initialData);

  const filtered = filter === 'all' ? data : data.filter((a) => a.status === filter);

  async function handleDecision(id: string, decision: 'approved' | 'rejected') {
    setLoading(id);
    try {
      const res = await fetch('/api/admin/producer-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: id, decision, adminNotes: notes[id] || '' }),
      });
      if (res.ok) {
        setData((prev) => prev.map((a) => a.id === id ? { ...a, status: decision } : a));
      }
    } catch {
      // Error handling
    }
    setLoading(null);
  }

  const statusColor = (s: string) => {
    if (s === 'approved') return 'text-[var(--herr-success)]';
    if (s === 'rejected') return 'text-[var(--herr-pink)]';
    return 'text-[var(--herr-warning)]';
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-[0.78rem] uppercase tracking-wider border transition-colors ${
              filter === f
                ? 'border-[var(--herr-pink)] text-[var(--herr-white)] bg-[var(--herr-surface)]'
                : 'border-[var(--herr-border)] text-[var(--herr-muted)] hover:border-[var(--herr-muted)]'
            }`}
          >
            {f} ({f === 'all' ? data.length : data.filter((a) => a.status === f).length})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[0.82rem]">
          <thead>
            <tr className="border-b border-[var(--herr-border)] text-[var(--herr-faint)]">
              <th className="text-left py-3 herr-label">Date</th>
              <th className="text-left py-3 herr-label">Name</th>
              <th className="text-left py-3 herr-label">Stage Name</th>
              <th className="text-left py-3 herr-label">Genres</th>
              <th className="text-left py-3 herr-label">Status</th>
              <th className="text-left py-3 herr-label">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((app) => (
              <>
                <tr key={app.id} className="border-b border-[var(--herr-border)] hover:bg-[var(--herr-surface)] transition-colors">
                  <td className="py-3 text-[var(--herr-muted)]">
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-[var(--herr-white)]">{app.first_name} {app.last_name}</td>
                  <td className="py-3 text-[var(--herr-muted)]">{app.stage_name}</td>
                  <td className="py-3 text-[var(--herr-muted)]">{app.genre_specialties.join(', ')}</td>
                  <td className={`py-3 uppercase herr-label ${statusColor(app.status)}`}>{app.status}</td>
                  <td className="py-3">
                    <button
                      onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                      className="text-[var(--herr-cobalt)] hover:text-[var(--herr-white)] text-[0.78rem]"
                    >
                      {expanded === app.id ? 'Close' : 'View'}
                    </button>
                  </td>
                </tr>
                {expanded === app.id && (
                  <tr key={`${app.id}-detail`}>
                    <td colSpan={6} className="bg-[var(--herr-surface)] p-6 border-b border-[var(--herr-border)]">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <p className="herr-label text-[var(--herr-faint)] mb-1">Email</p>
                          <p className="text-[var(--herr-muted)] mb-4">{app.email}</p>
                          <p className="herr-label text-[var(--herr-faint)] mb-1">Portfolio</p>
                          <a href={app.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-[var(--herr-cobalt)] hover:underline mb-4 block">{app.portfolio_url}</a>
                          {app.sample_track_url && (
                            <>
                              <p className="herr-label text-[var(--herr-faint)] mb-1">Sample Track</p>
                              <audio controls src={app.sample_track_url} className="w-full mb-4" />
                            </>
                          )}
                        </div>
                        <div>
                          <p className="herr-label text-[var(--herr-faint)] mb-1">Statement</p>
                          <p className="text-[var(--herr-muted)] text-[0.85rem] leading-relaxed mb-4">{app.statement}</p>
                          <p className="herr-label text-[var(--herr-faint)] mb-1">Admin Notes</p>
                          <textarea
                            value={notes[app.id] ?? app.admin_notes ?? ''}
                            onChange={(e) => setNotes({ ...notes, [app.id]: e.target.value })}
                            rows={3}
                            className="w-full bg-[var(--herr-card)] border border-[var(--herr-border)] text-[var(--herr-white)] px-3 py-2 text-sm mb-4"
                          />
                          {app.status === 'pending' && (
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleDecision(app.id, 'approved')}
                                disabled={loading === app.id}
                                className="btn-herr-primary text-[0.72rem] px-4 py-2 disabled:opacity-50"
                              >
                                {loading === app.id ? '...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleDecision(app.id, 'rejected')}
                                disabled={loading === app.id}
                                className="btn-herr-ghost text-[0.72rem] px-4 py-2 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-[var(--herr-muted)] py-12">No applications found.</p>
      )}
    </div>
  );
}
