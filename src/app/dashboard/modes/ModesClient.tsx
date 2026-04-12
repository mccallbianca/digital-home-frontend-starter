'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import Link from 'next/link';

const MODES = [
  { id: 'workout', name: 'Workout', desc: 'High-intensity reprogramming for physical performance', icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' },
  { id: 'driving', name: 'Driving', desc: 'Transform your commute into a reprogramming session', icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { id: 'sleep', name: 'Sleep', desc: 'Subconscious work while you rest', icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' },
  { id: 'morning', name: 'Morning', desc: 'Start every day with intention', icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' },
  { id: 'deep-work', name: 'Deep Work', desc: 'Flow state activation for focus', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { id: 'love-family', name: 'Love + Family', desc: 'Relational affirmations for connection', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { id: 'abundance', name: 'Abundance', desc: 'Wealth consciousness and financial wellness', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  { id: 'healing', name: 'Healing', desc: 'Restoration, recovery, and nervous system repair', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
];

interface ModesClientProps {
  userId: string;
  plan: string;
  existingModes: string[];
}

export default function ModesClient({ userId, plan, existingModes }: ModesClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [selected, setSelected] = useState<string[]>(existingModes);
  const [saving, setSaving] = useState(false);

  const isLocked = plan === 'free' || plan === 'collective';
  const maxModes = plan === 'elite' ? 5 : 3;

  const toggleMode = (id: string) => {
    if (isLocked) return;
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(m => m !== id);
      if (prev.length >= maxModes) return prev;
      return [...prev, id];
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('user_preferences').upsert({
      user_id: userId,
      activity_modes: selected,
    }, { onConflict: 'user_id' });
    router.push('/dashboard');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0A0A0F',
        padding: '80px 24px 60px',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '2px', color: '#C42D8E', marginBottom: 8, textAlign: 'center' }}>
          ACTIVITY MODES
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 600, color: '#FFFFFF', textAlign: 'center', marginBottom: 8 }}>
          Choose Your Modes
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 32 }}>
          Select the moments where HERR meets you. Your daily affirmations will be calibrated to each mode.
        </p>

        {/* Tier limit notice */}
        {!isLocked && (
          <div
            style={{
              background: '#16161F',
              borderRadius: 12,
              padding: '16px 24px',
              marginBottom: 32,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
              You can select up to {maxModes} activity modes.
            </p>
            <p style={{ fontSize: 14, color: '#C42D8E' }}>
              {selected.length} of {maxModes} selected
            </p>
          </div>
        )}

        {/* Locked state */}
        {isLocked && (
          <div
            style={{
              background: '#16161F',
              borderRadius: 16,
              padding: 40,
              border: '1px solid rgba(255,255,255,0.08)',
              textAlign: 'center',
              marginBottom: 32,
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px', display: 'block' }}>
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, color: '#FFFFFF', marginBottom: 8 }}>
              Unlock Activity Modes
            </p>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>
              Upgrade to Personalized to select your activity modes.
            </p>
            <Link
              href="/checkout?tier=personalized"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 48,
                padding: '0 32px',
                background: '#C42D8E',
                color: '#FFFFFF',
                borderRadius: 12,
                border: 'none',
                fontSize: 14,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                textDecoration: 'none',
              }}
            >
              Upgrade
            </Link>
          </div>
        )}

        {/* Mode grid */}
        <div className="modes-grid">
          {MODES.map((mode) => {
            const isSelected = selected.includes(mode.id);
            const isDisabled = isLocked || (!isSelected && selected.length >= maxModes);
            return (
              <button
                key={mode.id}
                onClick={() => toggleMode(mode.id)}
                disabled={isDisabled && !isSelected}
                style={{
                  background: '#16161F',
                  borderRadius: 16,
                  padding: 24,
                  border: isSelected ? '2px solid #C42D8E' : '1px solid rgba(255,255,255,0.08)',
                  cursor: isDisabled && !isSelected ? 'not-allowed' : 'pointer',
                  opacity: isDisabled && !isSelected ? 0.4 : 1,
                  textAlign: 'center',
                  transition: 'all 200ms ease',
                  position: 'relative',
                }}
              >
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: '#C42D8E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                )}
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={isSelected ? '#C42D8E' : 'rgba(255,255,255,0.4)'}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ margin: '0 auto 12px', display: 'block' }}
                >
                  <path d={mode.icon} />
                </svg>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#FFFFFF', marginBottom: 4 }}>
                  {mode.name}
                </p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
                  {mode.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Save button */}
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
              background: selected.length === 0 ? 'rgba(196,45,142,0.3)' : '#C42D8E',
              color: '#FFFFFF',
              borderRadius: 12,
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              cursor: selected.length === 0 ? 'default' : 'pointer',
              opacity: selected.length === 0 ? 0.5 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save Activity Modes'}
          </button>
        )}
      </div>

      <style>{`
        .modes-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        @media (max-width: 768px) {
          .modes-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
