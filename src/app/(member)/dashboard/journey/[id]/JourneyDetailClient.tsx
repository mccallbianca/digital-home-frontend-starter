'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export type DetailPost = {
  id: string;
  member_id: string;
  author_name: string;
  caption: string | null;
  media_url: string | null;
  media_type: 'image' | 'video' | string;
  created_at: string;
};

export type DetailComment = {
  id: string;
  comment_text: string;
  created_at: string;
  author_name: string;
};

const REACTION_LABELS: Record<string, string> = {
  heart: '\u2764',
  strength: '\ud83d\udcaa',
  support: '\ud83e\udd1d',
};

export default function JourneyDetailClient({
  post,
  comments,
  reactionCounts,
  myReactions,
}: {
  post: DetailPost;
  comments: DetailComment[];
  reactionCounts: Record<string, number>;
  myReactions: string[];
}) {
  const router = useRouter();
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [busyReaction, setBusyReaction] = useState<string | null>(null);

  async function toggleReaction(reaction: string) {
    setBusyReaction(reaction);
    try {
      await fetch(`/api/journey/${post.id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction }),
      });
      router.refresh();
    } finally {
      setBusyReaction(null);
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/journey/${post.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment_text: comment }),
      });
      if (res.ok) {
        setComment('');
        router.refresh();
      }
    } finally {
      setPosting(false);
    }
  }

  function fmt(s: string) {
    return new Date(s).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
    });
  }

  return (
    <main className="px-6 py-10 max-w-[720px] mx-auto">
      <p className="herr-label mb-2" style={{ color: 'var(--herr-magenta)' }}>HERR Journey</p>

      <div className="rounded-lg overflow-hidden mb-6" style={{ background: '#FFFFFF', border: '1px solid var(--herr-line)' }}>
        <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid var(--herr-line)' }}>
          <div
            className="rounded-full flex items-center justify-center"
            style={{ width: 40, height: 40, background: 'var(--herr-magenta-soft)', color: 'var(--herr-magenta)', fontWeight: 600 }}
          >
            {post.author_name.slice(0, 1).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{post.author_name}</span>
            <span className="text-xs" style={{ color: 'rgba(26,15,26,0.55)' }}>{fmt(post.created_at)}</span>
          </div>
        </div>

        {post.media_url ? (
          post.media_type === 'video' ? (
            <video src={post.media_url} controls style={{ width: '100%', maxHeight: 720, background: '#000' }} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.media_url} alt={post.caption ?? 'Journey post'} style={{ width: '100%', display: 'block' }} />
          )
        ) : (
          <div className="px-4 py-12 text-center text-sm" style={{ color: 'rgba(26,15,26,0.5)' }}>Media unavailable.</div>
        )}

        <div className="px-4 py-4">
          <div className="flex gap-2 mb-3">
            {(['heart', 'strength', 'support'] as const).map((r) => {
              const active = myReactions.includes(r);
              return (
                <button
                  key={r}
                  onClick={() => toggleReaction(r)}
                  disabled={busyReaction === r}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-full"
                  style={{
                    background: active ? 'var(--herr-magenta-soft)' : 'rgba(26,15,26,0.04)',
                    border: active ? '1px solid var(--herr-magenta)' : '1px solid var(--herr-line)',
                    cursor: 'pointer',
                  }}
                >
                  <span>{REACTION_LABELS[r]}</span>
                  <span>{reactionCounts[r] ?? 0}</span>
                </button>
              );
            })}
          </div>

          {post.caption && (
            <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>
              <strong>{post.author_name}</strong> {post.caption}
            </p>
          )}
        </div>
      </div>

      <section className="rounded-lg p-4" style={{ background: '#FFFFFF', border: '1px solid var(--herr-line)' }}>
        <h2 className="font-display text-lg mb-4">Comments</h2>

        <div className="flex flex-col gap-3 mb-4">
          {comments.length === 0 ? (
            <p className="text-sm" style={{ color: 'rgba(26,15,26,0.5)' }}>Be the first to respond.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="text-sm">
                <p>
                  <strong>{c.author_name}</strong>{' '}
                  <span style={{ color: 'rgba(26,15,26,0.55)' }}>{fmt(c.created_at)}</span>
                </p>
                <p style={{ whiteSpace: 'pre-wrap' }}>{c.comment_text}</p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={submitComment} className="flex flex-col gap-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="Add a comment\u2026"
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--herr-line)', background: '#FFFFFF', resize: 'vertical' }}
          />
          <button
            type="submit"
            disabled={posting || !comment.trim()}
            className="self-end px-4 py-2 text-sm rounded-md"
            style={{
              background: 'var(--herr-magenta)',
              color: '#FFFFFF',
              opacity: posting || !comment.trim() ? 0.5 : 1,
              border: 'none',
              cursor: posting ? 'not-allowed' : 'pointer',
            }}
          >
            {posting ? 'Posting\u2026' : 'Post'}
          </button>
        </form>
      </section>
    </main>
  );
}
