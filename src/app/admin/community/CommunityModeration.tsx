'use client';

import { useState } from 'react';

interface FlaggedPost {
  id: string;
  thread_id: string;
  body: string;
  author_id: string;
  created_at: string;
  flagged: boolean;
  hidden: boolean;
}

interface ModLog {
  id: string;
  action: string;
  target_user_id: string | null;
  target_post_id: string | null;
  admin_id: string | null;
  reason: string | null;
  created_at: string;
}

export default function CommunityModeration({ flaggedPosts, modLog }: { flaggedPosts: FlaggedPost[]; modLog: ModLog[] }) {
  const [posts, setPosts] = useState(flaggedPosts);
  const [processing, setProcessing] = useState<string | null>(null);

  async function handleAction(postId: string, action: 'dismiss' | 'hide') {
    setProcessing(postId);
    try {
      const res = await fetch('/api/admin/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, action }),
      });
      if (res.ok) {
        if (action === 'hide') {
          setPosts(prev => prev.map(p => p.id === postId ? { ...p, hidden: true } : p));
        } else {
          setPosts(prev => prev.map(p => p.id === postId ? { ...p, flagged: false } : p));
        }
      }
    } finally {
      setProcessing(null);
    }
  }

  const active = posts.filter(p => p.flagged && !p.hidden);
  const resolved = posts.filter(p => !p.flagged || p.hidden);

  return (
    <div>
      {active.length > 0 ? (
        <section className="mb-10">
          <p className="herr-label text-[var(--herr-pink)] mb-4">Flagged ({active.length})</p>
          <div className="space-y-3">
            {active.map(p => (
              <div key={p.id} className="bg-[var(--herr-surface)] border border-[var(--herr-border)] border-l-2 border-l-[var(--herr-pink)] p-6">
                <p className="text-[var(--herr-white)] text-sm leading-relaxed mb-2">{p.body}</p>
                <p className="text-[0.75rem] text-[var(--herr-faint)] mb-4">
                  Author: {p.author_id.slice(0, 8)}... &middot; {new Date(p.created_at).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(p.id, 'hide')}
                    disabled={processing === p.id}
                    className="text-[0.72rem] bg-[var(--herr-pink)]/20 text-[var(--herr-pink)] px-3 py-1.5 hover:bg-[var(--herr-pink)]/30 disabled:opacity-50"
                  >
                    Hide Post
                  </button>
                  <button
                    onClick={() => handleAction(p.id, 'dismiss')}
                    disabled={processing === p.id}
                    className="text-[0.72rem] text-[var(--herr-muted)] hover:text-[var(--herr-white)] px-3 py-1.5"
                  >
                    Dismiss Flag
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="border border-[var(--herr-border)] border-l-2 border-l-[var(--herr-cobalt)] p-8 mb-10">
          <p className="text-[var(--herr-cobalt)] herr-label mb-2">No Flagged Posts</p>
          <p className="text-[var(--herr-muted)] text-sm">Community is clean.</p>
        </div>
      )}

      {modLog.length > 0 && (
        <section>
          <p className="herr-label text-[var(--herr-muted)] mb-4">Moderation Log</p>
          <div className="space-y-px">
            {modLog.map(entry => (
              <div key={entry.id} className="bg-[var(--herr-surface)] px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[var(--herr-white)] text-[0.82rem]">{entry.action}</p>
                  {entry.reason && <p className="text-[0.72rem] text-[var(--herr-faint)]">{entry.reason}</p>}
                </div>
                <span className="text-[0.7rem] text-[var(--herr-faint)]">{new Date(entry.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
