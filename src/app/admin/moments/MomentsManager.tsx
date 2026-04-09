'use client';

import { useState } from 'react';

interface Moment {
  id: string;
  producer_name: string;
  track_name: string;
  genre: string;
  activity_mode: string;
  caption: string;
  video_url: string | null;
  is_published: boolean;
  display_order: number;
}

export default function MomentsManager({ initialData }: { initialData: Moment[] }) {
  const [moments, setMoments] = useState(initialData);
  const [editing, setEditing] = useState<string | null>(null);

  async function togglePublished(id: string, current: boolean) {
    const res = await fetch('/api/admin/moderation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table: 'moment_for_music',
        id,
        updates: { is_published: !current },
      }),
    });
    if (res.ok) {
      setMoments((prev) => prev.map((m) => m.id === id ? { ...m, is_published: !current } : m));
    }
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-[0.82rem]">
          <thead>
            <tr className="border-b border-[var(--herr-border)] text-[var(--herr-faint)]">
              <th className="text-left py-3 herr-label">Order</th>
              <th className="text-left py-3 herr-label">Producer</th>
              <th className="text-left py-3 herr-label">Track</th>
              <th className="text-left py-3 herr-label">Genre</th>
              <th className="text-left py-3 herr-label">Mode</th>
              <th className="text-left py-3 herr-label">Caption</th>
              <th className="text-left py-3 herr-label">Published</th>
            </tr>
          </thead>
          <tbody>
            {moments.map((m) => (
              <tr key={m.id} className="border-b border-[var(--herr-border)]">
                <td className="py-3 text-[var(--herr-muted)]">{m.display_order}</td>
                <td className="py-3 text-[var(--herr-white)]">{m.producer_name}</td>
                <td className="py-3 text-[var(--herr-muted)]">{m.track_name}</td>
                <td className="py-3 text-[var(--herr-muted)]">{m.genre}</td>
                <td className="py-3 text-[var(--herr-muted)]">{m.activity_mode}</td>
                <td className="py-3 text-[var(--herr-muted)] max-w-[200px] truncate">{m.caption}</td>
                <td className="py-3">
                  <button
                    onClick={() => togglePublished(m.id, m.is_published)}
                    className={`text-[0.72rem] uppercase herr-label ${m.is_published ? 'text-[var(--herr-success)]' : 'text-[var(--herr-faint)]'}`}
                  >
                    {m.is_published ? 'Published' : 'Draft'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {moments.length === 0 && (
        <p className="text-center text-[var(--herr-muted)] py-12">No moments yet.</p>
      )}
    </div>
  );
}
