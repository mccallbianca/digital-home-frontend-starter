'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import Link from 'next/link';

interface SettingsClientProps {
  userId: string;
  email: string;
  displayName: string;
  plan: string;
  hasVoice: boolean;
  voiceActive: boolean;
  modes: string[];
  genres: string[];
}

const TIER_LABELS: Record<string, string> = {
  free: 'HERR Free',
  collective: 'HERR Collective — $9/mo',
  personalized: 'HERR Personalized — $19/mo',
  elite: 'HERR Elite — $29/mo',
};

export default function SettingsClient({
  userId, email, displayName: initialName, plan, hasVoice, voiceActive, modes, genres,
}: SettingsClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    await supabase.from('profiles').update({ preferred_name: name }).eq('id', userId);
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    await supabase.from('profiles').delete().eq('id', userId);
    await supabase.auth.signOut();
    router.push('/');
  };

  const cardStyle = {
    background: '#16161F',
    borderRadius: 16,
    padding: 32,
    border: '1px solid rgba(255,255,255,0.08)',
    marginBottom: 16,
  };

  const labelStyle = {
    fontSize: 12,
    textTransform: 'uppercase' as const,
    letterSpacing: '2px',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 12,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', padding: '80px 24px 60px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 600, color: '#FFFFFF', marginBottom: 32, textAlign: 'center' }}>
          Settings
        </h1>

        {/* 1. Profile */}
        <div style={cardStyle}>
          <p style={labelStyle}>PROFILE</p>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Display Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%', height: 48, background: '#111118', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 12, padding: '0 16px', color: '#FFFFFF', fontSize: 15, outline: 'none',
              }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Email</label>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.3)', padding: '12px 0' }}>{email}</p>
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            style={{
              height: 48, padding: '0 32px', background: '#C42D8E', color: '#FFFFFF', borderRadius: 12,
              border: 'none', fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px',
              cursor: 'pointer', opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Update Profile'}
          </button>
        </div>

        {/* 2. Subscription */}
        <div style={cardStyle}>
          <p style={labelStyle}>SUBSCRIPTION</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: '#C42D8E', border: '1px solid #C42D8E', padding: '4px 12px', borderRadius: 12 }}>
              {TIER_LABELS[plan] || plan}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/checkout" style={{ height: 40, padding: '0 20px', background: 'transparent', color: '#FFFFFF', borderRadius: 12, border: '1px solid rgba(255,255,255,0.3)', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              Change Plan
            </Link>
          </div>
        </div>

        {/* 3. Voice Clone */}
        {hasVoice && (
          <div style={cardStyle}>
            <p style={labelStyle}>VOICE CLONE</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: voiceActive ? '#22C55E' : 'rgba(255,255,255,0.3)' }} />
              <span style={{ fontSize: 14, color: '#FFFFFF' }}>{voiceActive ? 'Active' : 'Not Set Up'}</span>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/dashboard/voice-setup" style={{ height: 40, padding: '0 20px', background: 'transparent', color: '#FFFFFF', borderRadius: 12, border: '1px solid rgba(255,255,255,0.3)', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                {voiceActive ? 'Re-record Voice' : 'Set Up Voice'}
              </Link>
              {voiceActive && (
                <button style={{ height: 40, padding: '0 20px', background: 'transparent', color: '#EF4444', borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Delete Voice Profile
                </button>
              )}
            </div>
          </div>
        )}

        {/* 4. Activity Modes */}
        <div style={cardStyle}>
          <p style={labelStyle}>ACTIVITY MODES</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {modes.length > 0 ? modes.map((m: string) => (
              <span key={m} style={{ fontSize: 12, color: '#C42D8E', border: '1px solid #C42D8E', padding: '4px 12px', borderRadius: 12 }}>
                {m.replace('-', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
              </span>
            )) : <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>None selected</span>}
          </div>
          <Link href="/dashboard/modes" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'underline' }}>Change Modes</Link>
        </div>

        {/* 5. Genre Preferences */}
        {hasVoice && (
          <div style={cardStyle}>
            <p style={labelStyle}>GENRE PREFERENCES</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {genres.length > 0 ? genres.map((g: string) => (
                <span key={g} style={{ fontSize: 12, color: '#C42D8E', border: '1px solid #C42D8E', padding: '4px 12px', borderRadius: 12 }}>
                  {g.replace('-', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                </span>
              )) : <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>None selected</span>}
            </div>
            <Link href="/dashboard/genres" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'underline' }}>Change Genres</Link>
          </div>
        )}

        {/* 6. Notifications */}
        <div style={cardStyle}>
          <p style={labelStyle}>NOTIFICATIONS</p>
          {['Daily affirmation ready', 'New journal articles', 'Community mentions', 'Live session announcements'].map((label) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{label}</span>
              <label style={{ position: 'relative', width: 44, height: 24, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
                <span style={{ position: 'absolute', inset: 0, background: '#C42D8E', borderRadius: 12, transition: 'background 200ms' }}>
                  <span style={{ position: 'absolute', left: 22, top: 2, width: 20, height: 20, background: '#FFF', borderRadius: '50%', transition: 'left 200ms' }} />
                </span>
              </label>
            </div>
          ))}
        </div>

        {/* 7. Data & Privacy */}
        <div style={cardStyle}>
          <p style={labelStyle}>DATA &amp; PRIVACY</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button style={{ height: 40, padding: '0 20px', background: 'transparent', color: '#FFFFFF', borderRadius: 12, border: '1px solid rgba(255,255,255,0.3)', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' }}>
              Download My Data
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{ height: 40, padding: '0 20px', background: 'transparent', color: '#EF4444', borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Delete My Account
            </button>
          </div>
        </div>

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ background: '#16161F', borderRadius: 16, padding: 32, border: '2px solid #EF4444', maxWidth: 480, width: '100%' }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, color: '#FFFFFF', marginBottom: 12 }}>
                Delete Your Account?
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 24 }}>
                This will permanently delete your account, all assessment data, affirmation history, voice clone, and community posts. This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{ height: 48, padding: '0 24px', background: 'transparent', color: '#FFFFFF', borderRadius: 12, border: '1px solid rgba(255,255,255,0.3)', fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  style={{ height: 48, padding: '0 24px', background: '#EF4444', color: '#FFFFFF', borderRadius: 12, border: 'none', fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' }}
                >
                  Delete Everything
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
