'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import Link from 'next/link';
import PushNotificationToggle from '@/components/PushNotificationToggle';

interface SettingsClientProps {
  userId: string;
  email: string;
  /** The warm/relational "what should we call you" value (profiles.preferred_name). */
  displayName: string;
  /** The unique handle (profiles.display_name). Optional — backfilled by migration. */
  uniqueHandle: string;
  plan: string;
  hasVoice: boolean;
  voiceActive: boolean;
  modes: string[];
  genres: string[];
}

const TIER_LABELS: Record<string, string> = {
  free: 'HERR Free',
  collective: 'HERR Collective: $9/mo',
  personalized: 'HERR Personalized: $19/mo',
  elite: 'HERR Elite: $29/mo',
};

const cardStyle: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid var(--herr-line)',
  borderRadius: 16,
  padding: 28,
  marginBottom: 16,
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  color: 'var(--herr-ink-soft)',
  fontWeight: 600,
  marginBottom: 12,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 44,
  background: 'var(--herr-cream)',
  border: '1px solid var(--herr-line)',
  borderRadius: 10,
  padding: '0 14px',
  color: 'var(--herr-ink)',
  fontSize: 15,
  outline: 'none',
};

const primaryBtnStyle: React.CSSProperties = {
  height: 44,
  padding: '0 22px',
  background: 'var(--herr-magenta)',
  color: 'var(--herr-cream)',
  borderRadius: 10,
  border: 'none',
  fontSize: 13,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const secondaryBtnStyle: React.CSSProperties = {
  height: 40,
  padding: '0 18px',
  background: 'transparent',
  color: 'var(--herr-ink)',
  borderRadius: 10,
  border: '1px solid var(--herr-line)',
  fontSize: 13,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export default function SettingsClient({
  userId, email, displayName: initialName, uniqueHandle, plan, hasVoice, voiceActive, modes, genres,
}: SettingsClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState(initialName);
  const [savingName, setSavingName] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // FIX-1 A8 — unique handle (display_name) with API-side uniqueness check
  const [handle, setHandle] = useState(uniqueHandle);
  const [savingHandle, setSavingHandle] = useState(false);
  const [handleStatus, setHandleStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Phase 1 v2 EPIC B7: change email
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Phase 1 v2 EPIC B7: change password
  const [showPwForm, setShowPwForm] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwStatus, setPwStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const handleSaveProfile = async () => {
    setSavingName(true);
    await supabase.from('profiles').update({ preferred_name: name }).eq('id', userId);
    setSavingName(false);
  };

  const handleSaveHandle = async () => {
    setHandleStatus(null);
    const trimmed = handle.trim();
    if (trimmed && !/^[a-zA-Z0-9_]{3,30}$/.test(trimmed)) {
      setHandleStatus({ type: 'error', msg: '3–30 characters, letters/numbers/underscore only.' });
      return;
    }
    setSavingHandle(true);
    try {
      const res = await fetch('/api/profile/display-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: trimmed || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setHandleStatus({ type: 'error', msg: data?.error ?? `Save failed (HTTP ${res.status})` });
      } else {
        setHandleStatus({ type: 'success', msg: 'Saved' });
      }
    } catch (err) {
      setHandleStatus({ type: 'error', msg: err instanceof Error ? err.message : String(err) });
    } finally {
      setSavingHandle(false);
    }
  };

  const handleChangeEmail = async () => {
    setEmailStatus(null);
    if (!newEmail || !newEmail.includes('@')) {
      setEmailStatus({ type: 'error', msg: 'Enter a valid email address.' });
      return;
    }
    if (newEmail.trim().toLowerCase() === email.trim().toLowerCase()) {
      setEmailStatus({ type: 'error', msg: 'New email matches your current email.' });
      return;
    }
    setEmailSaving(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    setEmailSaving(false);
    if (error) {
      setEmailStatus({ type: 'error', msg: error.message });
      return;
    }
    setEmailStatus({
      type: 'success',
      msg: `Verification email sent to ${newEmail.trim()}. Click the link to confirm the change.`,
    });
    setNewEmail('');
    setShowEmailForm(false);
  };

  const handleChangePassword = async () => {
    setPwStatus(null);
    if (newPw.length < 8) {
      setPwStatus({ type: 'error', msg: 'New password must be at least 8 characters.' });
      return;
    }
    if (newPw !== confirmPw) {
      setPwStatus({ type: 'error', msg: 'New password and confirmation do not match.' });
      return;
    }
    setPwSaving(true);
    // Re-authenticate by attempting sign-in with current password.
    const { error: reauthErr } = await supabase.auth.signInWithPassword({
      email,
      password: currentPw,
    });
    if (reauthErr) {
      setPwSaving(false);
      setPwStatus({ type: 'error', msg: 'Current password is incorrect.' });
      return;
    }
    const { error: updateErr } = await supabase.auth.updateUser({ password: newPw });
    setPwSaving(false);
    if (updateErr) {
      setPwStatus({ type: 'error', msg: updateErr.message });
      return;
    }
    setPwStatus({ type: 'success', msg: 'Password updated successfully.' });
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setShowPwForm(false);
  };

  const handleDeleteAccount = async () => {
    await supabase.from('profiles').delete().eq('id', userId);
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--herr-cream)', padding: '40px 24px 80px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 34, fontWeight: 500, color: 'var(--herr-ink)', marginBottom: 32, textAlign: 'center' }}>
          Settings
        </h1>

        {/* 1. Profile */}
        <div style={cardStyle}>
          <p style={labelStyle}>PROFILE</p>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: 'var(--herr-ink-soft)', display: 'block', marginBottom: 6 }}>Preferred Name</label>
            <p style={{ fontSize: 12, color: 'var(--herr-ink-soft)', margin: '0 0 8px' }}>What we call you (e.g. &ldquo;Boss&rdquo;). Not shared publicly.</p>
            <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ marginBottom: 16, paddingTop: 16, borderTop: '1px solid var(--herr-line)' }}>
            <label style={{ fontSize: 13, color: 'var(--herr-ink-soft)', display: 'block', marginBottom: 6 }}>Display Name</label>
            <p style={{ fontSize: 12, color: 'var(--herr-ink-soft)', margin: '0 0 8px' }}>Your public handle. 3–30 chars, letters/numbers/underscore. Must be unique.</p>
            <input
              value={handle}
              onChange={(e) => { setHandle(e.target.value); if (handleStatus) setHandleStatus(null); }}
              placeholder="e.g. biancalmft"
              style={inputStyle}
              autoCapitalize="off"
              autoCorrect="off"
            />
            {handleStatus && (
              <p style={{ fontSize: 13, marginTop: 8, color: handleStatus.type === 'error' ? '#b91c1c' : 'var(--herr-magenta-deep,#1b6b2c)' }}>
                {handleStatus.msg}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleSaveProfile} disabled={savingName} style={{ ...primaryBtnStyle, opacity: savingName ? 0.6 : 1 }}>
              {savingName ? 'Saving…' : 'Update Profile'}
            </button>
            <button
              onClick={handleSaveHandle}
              disabled={savingHandle || handle === uniqueHandle}
              style={{ ...secondaryBtnStyle, opacity: (savingHandle || handle === uniqueHandle) ? 0.6 : 1 }}
            >
              {savingHandle ? 'Saving…' : 'Save Display Name'}
            </button>
          </div>
        </div>

        {/* 2. Email — Phase 1 v2 EPIC B7 */}
        <div style={cardStyle}>
          <p style={labelStyle}>EMAIL</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showEmailForm ? 16 : 0 }}>
            <span style={{ fontSize: 15, color: 'var(--herr-ink)', fontWeight: 500 }}>{email}</span>
            <button
              onClick={() => { setShowEmailForm(!showEmailForm); setEmailStatus(null); }}
              style={secondaryBtnStyle}
            >
              {showEmailForm ? 'Cancel' : 'Change Email'}
            </button>
          </div>
          {showEmailForm && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--herr-line)' }}>
              <label style={{ fontSize: 13, color: 'var(--herr-ink-soft)', display: 'block', marginBottom: 6 }}>New Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ ...inputStyle, marginBottom: 12 }}
                autoComplete="email"
              />
              <button onClick={handleChangeEmail} disabled={emailSaving} style={{ ...primaryBtnStyle, opacity: emailSaving ? 0.6 : 1 }}>
                {emailSaving ? 'Sending…' : 'Send Verification'}
              </button>
              <p style={{ fontSize: 12, color: 'var(--herr-ink-soft)', marginTop: 12, lineHeight: 1.5 }}>
                We&apos;ll send a verification link to the new address. The change takes effect once you click that link.
              </p>
            </div>
          )}
          {emailStatus && (
            <p style={{
              marginTop: 12,
              fontSize: 13,
              color: emailStatus.type === 'success' ? 'var(--herr-magenta)' : 'var(--herr-magenta-deep)',
              fontWeight: 500,
            }}>
              {emailStatus.msg}
            </p>
          )}
        </div>

        {/* Push notifications — Phase 1 v2 Block 3 Part 1 (PWA) */}
        <div style={cardStyle}>
          <p style={labelStyle}>NOTIFICATIONS</p>
          <PushNotificationToggle />
        </div>

        {/* 3. Password — Phase 1 v2 EPIC B7 */}
        <div style={cardStyle}>
          <p style={labelStyle}>PASSWORD</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: 'var(--herr-ink-soft)' }}>Last updated through Supabase auth</span>
            <button
              onClick={() => { setShowPwForm(!showPwForm); setPwStatus(null); }}
              style={secondaryBtnStyle}
            >
              {showPwForm ? 'Cancel' : 'Change Password'}
            </button>
          </div>
          {showPwForm && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--herr-line)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, color: 'var(--herr-ink-soft)', display: 'block', marginBottom: 6 }}>Current Password</label>
                <input
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  style={inputStyle}
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--herr-ink-soft)', display: 'block', marginBottom: 6 }}>New Password</label>
                <input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  style={inputStyle}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'var(--herr-ink-soft)', display: 'block', marginBottom: 6 }}>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  style={inputStyle}
                  autoComplete="new-password"
                />
              </div>
              <button onClick={handleChangePassword} disabled={pwSaving} style={{ ...primaryBtnStyle, opacity: pwSaving ? 0.6 : 1, alignSelf: 'flex-start' }}>
                {pwSaving ? 'Updating…' : 'Update Password'}
              </button>
              <p style={{ fontSize: 12, color: 'var(--herr-ink-soft)', lineHeight: 1.5 }}>
                Minimum 8 characters. We verify your current password before applying the change.
              </p>
            </div>
          )}
          {pwStatus && (
            <p style={{
              marginTop: 12,
              fontSize: 13,
              color: pwStatus.type === 'success' ? 'var(--herr-magenta)' : 'var(--herr-magenta-deep)',
              fontWeight: 500,
            }}>
              {pwStatus.msg}
            </p>
          )}
        </div>

        {/* 4. Subscription */}
        <div style={cardStyle}>
          <p style={labelStyle}>SUBSCRIPTION</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--herr-magenta)', border: '1px solid var(--herr-magenta)', padding: '4px 12px', borderRadius: 12, fontWeight: 600 }}>
              {TIER_LABELS[plan] || plan}
            </span>
          </div>
          <Link href="/dashboard/billing" style={{ ...secondaryBtnStyle, textDecoration: 'none' }}>
            Manage Subscription
          </Link>
        </div>

        {/* 5. Voice Clone */}
        {hasVoice && (
          <div style={cardStyle}>
            <p style={labelStyle}>VOICE CLONE</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: voiceActive ? '#22C55E' : 'var(--herr-ink-soft)' }} />
              <span style={{ fontSize: 14, color: 'var(--herr-ink)' }}>{voiceActive ? 'Active' : 'Not Set Up'}</span>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/dashboard/voice-setup" style={{ ...secondaryBtnStyle, textDecoration: 'none' }}>
                {voiceActive ? 'Re-record Voice' : 'Set Up Voice'}
              </Link>
              {voiceActive && (
                <button style={{ ...secondaryBtnStyle, color: 'var(--herr-magenta-deep)', borderColor: 'var(--herr-magenta-deep)' }}>
                  Delete Voice Profile
                </button>
              )}
            </div>
          </div>
        )}

        {/* 6. Activity Modes */}
        <div style={cardStyle}>
          <p style={labelStyle}>ACTIVITY MODES</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {modes.length > 0 ? modes.map((m: string) => (
              <span key={m} style={{ fontSize: 12, color: 'var(--herr-magenta)', border: '1px solid var(--herr-magenta)', padding: '4px 12px', borderRadius: 12, fontWeight: 600 }}>
                {m.replace('-', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
              </span>
            )) : <span style={{ fontSize: 13, color: 'var(--herr-ink-soft)' }}>None selected</span>}
          </div>
          <Link href="/dashboard/modes" style={{ fontSize: 13, color: 'var(--herr-magenta)', textDecoration: 'underline', fontWeight: 600 }}>Change Modes</Link>
        </div>

        {/* 7. Genre Preferences */}
        {hasVoice && (
          <div style={cardStyle}>
            <p style={labelStyle}>GENRE PREFERENCES</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {genres.length > 0 ? genres.map((g: string) => (
                <span key={g} style={{ fontSize: 12, color: 'var(--herr-magenta)', border: '1px solid var(--herr-magenta)', padding: '4px 12px', borderRadius: 12, fontWeight: 600 }}>
                  {g.replace('-', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                </span>
              )) : <span style={{ fontSize: 13, color: 'var(--herr-ink-soft)' }}>None selected</span>}
            </div>
            <Link href="/dashboard/genres" style={{ fontSize: 13, color: 'var(--herr-magenta)', textDecoration: 'underline', fontWeight: 600 }}>Change Genres</Link>
          </div>
        )}

        {/* 8. Notifications */}
        <div style={cardStyle}>
          <p style={labelStyle}>NOTIFICATIONS</p>
          {['Daily affirmation ready', 'New journal articles', 'Community mentions', 'Live session announcements'].map((label) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--herr-line)' }}>
              <span style={{ fontSize: 14, color: 'var(--herr-ink)' }}>{label}</span>
              <label style={{ position: 'relative', width: 44, height: 24, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
                <span style={{ position: 'absolute', inset: 0, background: 'var(--herr-magenta)', borderRadius: 12, transition: 'background 200ms' }}>
                  <span style={{ position: 'absolute', left: 22, top: 2, width: 20, height: 20, background: 'var(--herr-cream)', borderRadius: '50%', transition: 'left 200ms' }} />
                </span>
              </label>
            </div>
          ))}
        </div>

        {/* 9. Data & Privacy */}
        <div style={cardStyle}>
          <p style={labelStyle}>DATA &amp; PRIVACY</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button style={secondaryBtnStyle}>Download My Data</button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{ ...secondaryBtnStyle, color: 'var(--herr-magenta-deep)', borderColor: 'var(--herr-magenta-deep)' }}
            >
              Delete My Account
            </button>
          </div>
        </div>

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,15,26,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 32, border: '2px solid var(--herr-magenta-deep)', maxWidth: 480, width: '100%' }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, color: 'var(--herr-ink)', marginBottom: 12 }}>
                Delete Your Account?
              </h2>
              <p style={{ fontSize: 14, color: 'var(--herr-ink-soft)', lineHeight: 1.6, marginBottom: 24 }}>
                This will permanently delete your account, all assessment data, affirmation history, voice clone, and community posts. This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setShowDeleteConfirm(false)} style={secondaryBtnStyle}>
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  style={{ ...primaryBtnStyle, background: 'var(--herr-magenta-deep)' }}
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
