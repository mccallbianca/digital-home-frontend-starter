'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';

export type FeedPost = {
  id: string;
  member_id: string;
  author_name: string;
  caption: string | null;
  media_url: string | null;
  media_type: 'image' | 'video';
  created_at: string;
  comment_count: number;
  reactions: Record<string, number>;
};

const MAX_MEDIA_BYTES = 50 * 1024 * 1024;

const REACTION_LABELS: Record<string, string> = {
  heart: '\u2764',
  strength: '\ud83d\udcaa',
  support: '\ud83e\udd1d',
};

export default function JourneyClient({ userId, posts }: { userId: string; posts: FeedPost[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingReaction, setPendingReaction] = useState<string | null>(null);

  async function createPost(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError('Choose an image or video.');
      return;
    }
    if (file.size > MAX_MEDIA_BYTES) {
      setError('Max 50MB.');
      return;
    }
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop() || 'bin';
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('journey-media')
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;

      const isVideo = file.type.startsWith('video/');
      const res = await fetch('/api/journey/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: caption.trim() || null,
          media_url: path,
          media_type: isVideo ? 'video' : 'image',
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Post failed');
      }
      setModalOpen(false);
      setCaption('');
      setFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function toggleReaction(postId: string, reaction: string) {
    setPendingReaction(`${postId}:${reaction}`);
    try {
      await fetch(`/api/journey/${postId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction }),
      });
      router.refresh();
    } finally {
      setPendingReaction(null);
    }
  }

  function fmt(s: string) {
    return new Date(s).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  }

  return (
    <main className="px-6 py-10 max-w-[640px] mx-auto pb-32">
      <p className="herr-label mb-2" style={{ color: 'var(--herr-magenta)' }}>HERR Journey</p>
      <h1 className="font-display text-3xl font-light mb-2" style={{ color: 'var(--herr-ink)' }}>
        Share Your Journey
      </h1>
      <p className="text-sm mb-10" style={{ color: 'rgba(26,15,26,0.7)' }}>
        Moments from the path. Each post is held by this community.
      </p>

      {posts.length === 0 ? (
        <div className="p-8 rounded-lg text-center" style={{ background: '#FFFFFF', border: '1px solid var(--herr-line)' }}>
          <p className="text-sm mb-3" style={{ color: 'rgba(26,15,26,0.7)' }}>
            No posts yet. Be the first to share.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-6">
          {posts.map((p) => (
            <li key={p.id} className="rounded-lg overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid var(--herr-line)' }}>
              <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid var(--herr-line)' }}>
                <div
                  className="rounded-full flex items-center justify-center"
                  style={{ width: 36, height: 36, background: 'var(--herr-magenta-soft)', color: 'var(--herr-magenta)', fontWeight: 600, fontSize: 14 }}
                >
                  {p.author_name.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{p.author_name}</span>
                  <span className="text-xs" style={{ color: 'rgba(26,15,26,0.55)' }}>{fmt(p.created_at)}</span>
                </div>
              </div>

              {p.media_url ? (
                p.media_type === 'video' ? (
                  <video
                    src={p.media_url}
                    controls
                    preload="metadata"
                    style={{ width: '100%', maxHeight: 600, background: '#000' }}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.media_url}
                    alt={p.caption ?? 'Journey post'}
                    style={{ width: '100%', maxHeight: 800, objectFit: 'cover', display: 'block' }}
                  />
                )
              ) : (
                <div className="px-4 py-12 text-center text-sm" style={{ color: 'rgba(26,15,26,0.5)' }}>Media unavailable.</div>
              )}

              <div className="px-4 py-3">
                <div className="flex gap-2 mb-3">
                  {(['heart', 'strength', 'support'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => toggleReaction(p.id, r)}
                      disabled={pendingReaction === `${p.id}:${r}`}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-full"
                      style={{
                        background: 'rgba(26,15,26,0.04)',
                        border: '1px solid var(--herr-line)',
                        cursor: 'pointer',
                      }}
                    >
                      <span>{REACTION_LABELS[r]}</span>
                      <span>{p.reactions[r] ?? 0}</span>
                    </button>
                  ))}
                </div>

                {p.caption && (
                  <p className="text-sm mb-2" style={{ whiteSpace: 'pre-wrap' }}>
                    <strong>{p.author_name}</strong> {p.caption}
                  </p>
                )}

                <Link
                  href={`/dashboard/journey/${p.id}`}
                  className="text-xs"
                  style={{ color: 'rgba(26,15,26,0.55)' }}
                >
                  {p.comment_count === 0 ? 'Add a comment' : `View ${p.comment_count} comment${p.comment_count === 1 ? '' : 's'}`}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Floating action button */}
      <button
        onClick={() => setModalOpen(true)}
        aria-label="New post"
        className="fixed rounded-full shadow-lg flex items-center justify-center"
        style={{
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          background: 'var(--herr-magenta)',
          color: '#FFFFFF',
          border: 'none',
          fontSize: 28,
          cursor: 'pointer',
          zIndex: 20,
        }}
      >
        +
      </button>

      {modalOpen && (
        <div
          onClick={() => !uploading && setModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: 12,
              width: '100%',
              maxWidth: 500,
              padding: 24,
            }}
          >
            <h2 className="font-display text-xl mb-4">New Post</h2>
            {error && (
              <div className="mb-4 px-3 py-2 rounded-md text-sm" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.4)', color: '#B91C1C' }}>
                {error}
              </div>
            )}
            <form onSubmit={createPost} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="herr-label">Caption (optional)</span>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={500}
                  rows={3}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--herr-line)', background: '#FFFFFF', resize: 'vertical' }}
                />
                <span className="text-xs" style={{ color: 'rgba(26,15,26,0.5)' }}>{caption.length}/500</span>
              </label>
              <label className="flex flex-col gap-1">
                <span className="herr-label">Media (image or video, max 50MB)</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  required
                />
              </label>
              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={uploading}
                  className="px-4 py-2 text-sm rounded-md"
                  style={{ background: 'transparent', border: '1px solid var(--herr-line)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 text-sm rounded-md"
                  style={{
                    background: 'var(--herr-magenta)',
                    color: '#FFFFFF',
                    border: 'none',
                    opacity: uploading ? 0.6 : 1,
                    cursor: uploading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {uploading ? 'Posting\u2026' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
