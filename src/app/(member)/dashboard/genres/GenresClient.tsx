'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import Link from 'next/link';

// Genre IDs match the CHECK enum on public.member_genre_preferences.
// IDs must match ecqo_sound_tracks.genre and the CHECK constraint in
// member_genre_preferences (joined form, no hyphens).
const GENRES = [
  { id: 'hiphop',    name: 'Hip-Hop',       desc: 'Rhythmic, grounded, lyrical power',     gradient: 'linear-gradient(135deg, #2d1b3d, #8E1A66)' },
  { id: 'rnb',       name: 'R&B / Soul',    desc: 'Warm, rhythmic, emotionally rich',      gradient: 'linear-gradient(135deg, #2d1b3d, #4a1942)' },
  { id: 'ambient',   name: 'Ambient',       desc: 'Atmospheric, expansive, spacious',      gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
  { id: 'classical', name: 'Classical',     desc: 'Structured, timeless, cerebral',        gradient: 'linear-gradient(135deg, #1b2838, #0d1b2a)' },
  { id: 'lofi',      name: 'Lo-Fi',         desc: 'Textured, nostalgic, grounded',         gradient: 'linear-gradient(135deg, #2b2d42, #3d405b)' },
  { id: 'jazz',      name: 'Jazz',          desc: 'Improvisational, fluid, sophisticated', gradient: 'linear-gradient(135deg, #3c2415, #5c3d2e)' },
  { id: 'gospel',    name: 'Gospel',        desc: 'Spiritual, anchored, soulful',          gradient: 'linear-gradient(135deg, #1a1a2e, #4a1942)' },
  { id: 'latin',     name: 'Latin',         desc: 'Rhythmic, embodied, vibrant',           gradient: 'linear-gradient(135deg, #3c2415, #e94560)' },
  { id: 'reggae',    name: 'Reggae / Island', desc: 'Easy, rooted, sun-warmed',            gradient: 'linear-gradient(135deg, #1b3a1f, #d4a017)' },
];

type Plan = 'free' | 'collective' | 'personalized' | 'elite';

interface GenresClientProps {
  userId: string;
  plan: Plan;
  existingGenres: string[];
}

export default function GenresClient({ userId, plan, existingGenres }: GenresClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [selected, setSelected] = useState<string[]>(existingGenres);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tier gate per spec: free locked, collective sees PERSONALIZED upgrade,
  // personalized + elite unlocked. Multi-select cap = 2 (existing UX).
  const isLocked = plan === 'free' || plan === 'collective';
  const maxGenres = 2;

  const toggleGenre = (id: string) => {
    if (isLocked) return;
    setError(null);
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((g) => g !== id);
      if (prev.length >= maxGenres) {
        setError(`You can select up to ${maxGenres} genres at a time.`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleSave = async () => {
    if (isLocked) return;
    if (selected.length > maxGenres) {
      setError(`Cannot save more than ${maxGenres} genres.`);
      return;
    }
    setSaving(true);
    setError(null);

    // UPSERT all 8 genre rows with active boolean derived from selected[].
    const rows = GENRES.map((g) => ({
      member_id: userId,
      genre: g.id,
      active: selected.includes(g.id),
      updated_at: new Date().toISOString(),
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: upsertErr } = await (supabase as any)
      .from('member_genre_preferences')
      .upsert(rows, { onConflict: 'member_id,genre' });

    if (upsertErr) {
      setSaving(false);
      setError(`Save failed: ${upsertErr.message}`);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--herr-cream)', padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--herr-magenta)', fontWeight: 600, marginBottom: 8, textAlign: 'center' }}>
          GENRES
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 34, fontWeight: 500, color: 'var(--herr-ink)', textAlign: 'center', marginBottom: 8 }}>
          Choose Your Sound
        </h1>
        <p style={{ fontSize: 16, color: 'var(--herr-ink-soft)', textAlign: 'center', marginBottom: 32, maxWidth: 540, marginLeft: 'auto', marginRight: 'auto' }}>
          Select up to 2 genres. Your sonic architecture will be calibrated to your selection.
        </p>

        {!isLocked && (
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--herr-line)',
              borderRadius: 12,
              padding: '16px 24px',
              marginBottom: 24,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <p style={{ fontSize: 14, color: 'var(--herr-ink-soft)' }}>Max {maxGenres} genres.</p>
            <p style={{ fontSize: 14, color: 'var(--herr-magenta)', fontWeight: 600 }}>
              {selected.length} of {maxGenres} selected
            </p>
          </div>
        )}

        {error && (
          <div
            style={{
              background: 'var(--herr-magenta-soft)',
              border: '1px solid var(--herr-magenta)',
              borderRadius: 12,
              padding: '12px 20px',
              marginBottom: 24,
              color: 'var(--herr-magenta-deep)',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        {isLocked && (
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--herr-line)',
              borderRadius: 16,
              padding: 40,
              textAlign: 'center',
              marginBottom: 32,
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--herr-magenta)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px', display: 'block' }}>
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, color: 'var(--herr-ink)', marginBottom: 8 }}>
              Unlock Genre Selection
            </p>
            <p style={{ fontSize: 15, color: 'var(--herr-ink-soft)', marginBottom: 24 }}>
              Upgrade to Personalized to choose your genres.
            </p>
            <Link
              href="/checkout?tier=personalized"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 48,
                padding: '0 32px',
                background: 'var(--herr-magenta)',
                color: 'var(--herr-cream)',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                textDecoration: 'none',
              }}
            >
              Upgrade
            </Link>
          </div>
        )}

        <div className="genres-grid">
          {GENRES.map((genre) => {
            const isSelected = selected.includes(genre.id);
            const isDisabled = isLocked || (!isSelected && selected.length >= maxGenres);
            return (
              <button
                key={genre.id}
                onClick={() => toggleGenre(genre.id)}
                disabled={isDisabled && !isSelected}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  padding: 0,
                  border: isSelected ? '2px solid var(--herr-magenta)' : '1px solid var(--herr-line)',
                  cursor: isDisabled && !isSelected ? 'not-allowed' : 'pointer',
                  opacity: isDisabled && !isSelected ? 0.4 : 1,
                  overflow: 'hidden',
                  textAlign: 'left',
                  transition: 'all 200ms ease',
                  position: 'relative',
                }}
              >
                {isSelected && (
                  <div style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: '50%', background: 'var(--herr-magenta)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--herr-cream)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  </div>
                )}
                <div style={{ height: 80, background: genre.gradient }} />
                <div style={{ padding: '16px 20px' }}>
                  <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--herr-ink)', marginBottom: 4 }}>{genre.name}</p>
                  <p style={{ fontSize: 13, color: 'var(--herr-ink-soft)' }}>{genre.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {!isLocked && (
          <button
            onClick={handleSave}
            disabled={selected.length === 0 || saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: 48,
              marginTop: 32,
              background: selected.length === 0 ? 'rgba(196,45,142,0.3)' : 'var(--herr-magenta)',
              color: 'var(--herr-cream)',
              borderRadius: 12,
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              cursor: selected.length === 0 ? 'default' : 'pointer',
              opacity: selected.length === 0 ? 0.5 : 1,
            }}
          >
            {saving ? 'Saving…' : 'Save Genre Preferences'}
          </button>
        )}

        <p style={{ fontSize: 13, color: 'var(--herr-ink-soft)', fontStyle: 'italic', textAlign: 'center', marginTop: 16 }}>
          Genre preferences reset weekly. Come back every Monday to update your selection.
        </p>
      </div>

      <style>{`
        .genres-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        @media (max-width: 768px) {
          .genres-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}
