'use client';

/**
 * JourneyPostCreator — modal/sheet for creating a HERR Journey post.
 *
 * Supports text-only reflections, plus optional image (jpg/png/webp,
 * max 10MB) or short video (mp4/mov, max 50MB) attached. Posts are
 * tagged with one of the three BFRW circles: mindset / mental-health /
 * money.
 *
 * Block 4 bug 5: wire the "Share your first reflection" CTA on
 * /dashboard/community to actually open a creator that writes to
 * journey_posts.
 */

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';

const HERR_INK = '#0A0A0F';
const HERR_MAGENTA = '#C42D8E';
const HERR_CREAM = '#F4F1EB';
const HERR_LINE = 'rgba(244,241,235,0.18)';
const MAX_CAPTION = 500;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_VIDEO_SECONDS = 60;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const VIDEO_TYPES = ['video/mp4', 'video/quicktime'];

type Category = 'mindset' | 'mental-health' | 'money';

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'mindset', label: 'Mindset' },
  { value: 'mental-health', label: 'Mental Health' },
  { value: 'money', label: 'Money' },
];

interface JourneyPostCreatorProps {
  userId: string;
  open: boolean;
  onClose: () => void;
  onPosted?: (postId: string) => void;
}

export default function JourneyPostCreator({ userId, open, onClose, onPosted }: JourneyPostCreatorProps) {
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<Category>('mindset');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setCaption('');
      setFile(null);
      setCategory('mindset');
      setSubmitting(false);
      setError(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [open]);

  if (!open) return null;

  async function probeVideoDuration(f: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(f);
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(v.duration);
      };
      v.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Could not read video metadata.'));
      };
      v.src = url;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedCaption = caption.trim();
    if (!trimmedCaption && !file) {
      setError('Share a few words or attach an image or video.');
      return;
    }

    let mediaType: 'image' | 'video' | null = null;
    if (file) {
      if (IMAGE_TYPES.includes(file.type)) {
        if (file.size > MAX_IMAGE_BYTES) {
          setError('Images can be up to 10MB.');
          return;
        }
        mediaType = 'image';
      } else if (VIDEO_TYPES.includes(file.type)) {
        if (file.size > MAX_VIDEO_BYTES) {
          setError('Videos can be up to 50MB.');
          return;
        }
        try {
          const seconds = await probeVideoDuration(file);
          if (Number.isFinite(seconds) && seconds > MAX_VIDEO_SECONDS + 0.5) {
            setError('Videos are limited to 60 seconds for short-form reflection.');
            return;
          }
        } catch {
          // If we can't read duration, allow upload — server enforces size.
        }
        mediaType = 'video';
      } else {
        setError('Use jpg, png, webp, mp4, or mov.');
        return;
      }
    }

    setSubmitting(true);
    try {
      let mediaPath: string | null = null;
      if (file && mediaType) {
        const supabase = createClient();
        const ext = file.name.split('.').pop() || 'bin';
        const path = `${userId}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('journey-media')
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) throw new Error(upErr.message);
        mediaPath = path;
      }

      const res = await fetch('/api/journey/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: trimmedCaption || null,
          media_url: mediaPath,
          media_type: mediaType ?? 'text',
          category,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Could not save your reflection.');
      }
      onPosted?.(json.post_id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your reflection.');
    } finally {
      setSubmitting(false);
    }
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Share a reflection"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: 'rgba(10,10,15,0.6)',
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: isMobile ? 0 : 24,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: HERR_INK,
          color: HERR_CREAM,
          width: isMobile ? '100%' : 'min(520px, 100%)',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderBottomLeftRadius: isMobile ? 0 : 20,
          borderBottomRightRadius: isMobile ? 0 : 20,
          border: `1px solid ${HERR_LINE}`,
          padding: 24,
          paddingBottom: `max(24px, env(safe-area-inset-bottom))`,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <header>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 24,
              fontWeight: 500,
              margin: 0,
            }}
          >
            Share a reflection
          </p>
          <p style={{ fontSize: 13, color: 'rgba(244,241,235,0.55)', margin: '4px 0 0', lineHeight: 1.5 }}>
            Your voice strengthens HERR Nation. Choose a circle, share what is alive.
          </p>
        </header>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(244,241,235,0.55)' }}>
            Circle
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map((c) => {
              const isActive = category === c.value;
              return (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 999,
                    border: `1px solid ${isActive ? HERR_MAGENTA : HERR_LINE}`,
                    background: isActive ? HERR_MAGENTA : 'transparent',
                    color: isActive ? '#FFFFFF' : HERR_CREAM,
                    fontSize: 13,
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(244,241,235,0.55)' }}>
            Your reflection
          </span>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION))}
            placeholder="What is alive for you right now?"
            rows={5}
            style={{
              background: 'rgba(244,241,235,0.04)',
              border: `1px solid ${HERR_LINE}`,
              borderRadius: 12,
              padding: '12px 14px',
              color: HERR_CREAM,
              fontFamily: 'inherit',
              fontSize: 15,
              lineHeight: 1.5,
              resize: 'vertical',
              outline: 'none',
            }}
          />
          <span style={{ fontSize: 11, color: 'rgba(244,241,235,0.45)', textAlign: 'right' }}>
            {caption.length}/{MAX_CAPTION}
          </span>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(244,241,235,0.55)' }}>
            Optional media
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            style={{
              color: 'rgba(244,241,235,0.7)',
              fontSize: 13,
            }}
          />
          <span style={{ fontSize: 11, color: 'rgba(244,241,235,0.45)' }}>
            Image up to 10MB. Video up to 60 seconds or 50MB.
          </span>
        </label>

        {error && (
          <p
            role="alert"
            style={{
              fontSize: 13,
              color: '#FBA8C9',
              background: 'rgba(196,45,142,0.12)',
              border: '1px solid rgba(196,45,142,0.4)',
              borderRadius: 10,
              padding: '8px 12px',
              margin: 0,
            }}
          >
            {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexDirection: isMobile ? 'column-reverse' : 'row' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{
              background: 'transparent',
              border: `1px solid ${HERR_LINE}`,
              borderRadius: 10,
              padding: '12px 18px',
              fontSize: 14,
              color: HERR_CREAM,
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{
              background: HERR_MAGENTA,
              border: 'none',
              borderRadius: 10,
              padding: '12px 22px',
              fontSize: 14,
              fontWeight: 600,
              color: '#FFFFFF',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Sharing…' : 'Share Reflection'}
          </button>
        </div>
      </form>
    </div>
  );
}
