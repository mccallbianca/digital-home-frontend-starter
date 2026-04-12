'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import Link from 'next/link';

const GENRES = [
  { id: 'ambient', name: 'Ambient', desc: 'Atmospheric, expansive, spacious', gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
  { id: 'rnb', name: 'R&B / Soul', desc: 'Warm, rhythmic, emotionally rich', gradient: 'linear-gradient(135deg, #2d1b3d, #4a1942)' },
  { id: 'classical', name: 'Classical', desc: 'Structured, timeless, cerebral', gradient: 'linear-gradient(135deg, #1b2838, #0d1b2a)' },
  { id: 'lofi', name: 'Lo-Fi', desc: 'Textured, nostalgic, grounded', gradient: 'linear-gradient(135deg, #2b2d42, #3d405b)' },
  { id: 'jazz', name: 'Jazz', desc: 'Improvisational, fluid, sophisticated', gradient: 'linear-gradient(135deg, #3c2415, #5c3d2e)' },
  { id: 'electronic', name: 'Electronic', desc: 'Pulse-driven, modern, immersive', gradient: 'linear-gradient(135deg, #0f0c29, #302b63)' },
  { id: 'acoustic', name: 'Acoustic', desc: 'Organic, intimate, natural', gradient: 'linear-gradient(135deg, #2d3436, #3d6249)' },
  { id: 'orchestral', name: 'Orchestral', desc: 'Cinematic, sweeping, powerful', gradient: 'linear-gradient(135deg, #1a1a2e, #e94560)' },
];

interface GenresClientProps {
  userId: string;
  plan: string;
  existingGenres: string[];
}

export default function GenresClient({ userId, plan, existingGenres }: GenresClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [selected, setSelected] = useState<string[]>(existingGenres);
  const [saving, setSaving] = useState(false);

  const isLocked = plan === 'free' || plan === 'collective';
  const maxGenres = 2;

  const toggleGenre = (id: string) => {
    if (isLocked) return;
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(g => g !== id);
      if (prev.length >= maxGenres) return prev;
      return [...prev, id];
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('user_preferences').upsert({
      user_id: userId,
      genres: selected,
    }, { onConflict: 'user_id' });
    router.push('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', padding: '80px 24px 60px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '2px', color: '#C42D8E', marginBottom: 8, textAlign: 'center' }}>
          GENRES
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 600, color: '#FFFFFF', textAlign: 'center', marginBottom: 8 }}>
          Choose Your Sound
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 32 }}>
          Select up to 2 genres per week. Your sonic architecture will be calibrated to your selection.
        </p>

        {!isLocked && (
          <div style={{ background: '#16161F', borderRadius: 12, padding: '16px 24px', marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Max 2 genres per week.</p>
            <p style={{ fontSize: 14, color: '#C42D8E' }}>{selected.length} of {maxGenres} selected</p>
          </div>
        )}

        {isLocked && (
          <div style={{ background: '#16161F', borderRadius: 16, padding: 40, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', marginBottom: 32 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px', display: 'block' }}>
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, color: '#FFFFFF', marginBottom: 8 }}>Unlock Genre Selection</p>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>Upgrade to Personalized to choose your genres.</p>
            <Link href="/checkout?tier=personalized" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 48, padding: '0 32px', background: '#C42D8E', color: '#FFFFFF', borderRadius: 12, fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', textDecoration: 'none' }}>
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
                  background: '#16161F',
                  borderRadius: 16,
                  padding: 0,
                  border: isSelected ? '2px solid #C42D8E' : '1px solid rgba(255,255,255,0.08)',
                  cursor: isDisabled && !isSelected ? 'not-allowed' : 'pointer',
                  opacity: isDisabled && !isSelected ? 0.4 : 1,
                  overflow: 'hidden',
                  textAlign: 'left',
                  transition: 'all 200ms ease',
                  position: 'relative',
                }}
              >
                {isSelected && (
                  <div style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: '50%', background: '#C42D8E', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  </div>
                )}
                <div style={{ height: 80, background: genre.gradient }} />
                <div style={{ padding: '16px 20px' }}>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#FFFFFF', marginBottom: 4 }}>{genre.name}</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{genre.desc}</p>
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
              display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 48, marginTop: 32,
              background: selected.length === 0 ? 'rgba(196,45,142,0.3)' : '#C42D8E',
              color: '#FFFFFF', borderRadius: 12, border: 'none', fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px',
              cursor: selected.length === 0 ? 'default' : 'pointer', opacity: selected.length === 0 ? 0.5 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save Genre Preferences'}
          </button>
        )}

        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', textAlign: 'center', marginTop: 16 }}>
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
