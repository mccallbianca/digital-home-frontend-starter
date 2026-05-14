'use client';

import { useEffect, useState } from 'react';

const DISMISS_KEY = 'pwa-install-dismissed-until';
const DISMISS_DAYS = 7;

// Minimum BeforeInstallPromptEvent surface — not in TS lib.dom yet.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window);
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia?.('(display-mode: standalone)').matches) return true;
  // iOS Safari sets navigator.standalone when launched from home screen
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

function dismissUntilNow(): number {
  if (typeof window === 'undefined') return 0;
  const v = window.localStorage.getItem(DISMISS_KEY);
  return v ? parseInt(v, 10) : 0;
}

function setDismissed() {
  if (typeof window === 'undefined') return;
  const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
  window.localStorage.setItem(DISMISS_KEY, String(until));
}

export default function PWAInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [mode, setMode] = useState<'hidden' | 'browser' | 'ios'>('hidden');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isStandalone()) return; // already installed
    if (Date.now() < dismissUntilNow()) return; // user said not now

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
      setMode('browser');
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    // iOS Safari never fires beforeinstallprompt; surface manual guidance.
    // Defer slightly so we don't compete with first paint.
    const iosTimer = setTimeout(() => {
      if (isIos() && !isStandalone()) {
        setMode((current) => (current === 'hidden' ? 'ios' : current));
      }
    }, 1200);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      clearTimeout(iosTimer);
    };
  }, []);

  if (mode === 'hidden') return null;

  function dismiss() {
    setDismissed();
    setMode('hidden');
  }

  async function install() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    try {
      const choice = await promptEvent.userChoice;
      if (choice.outcome === 'dismissed') setDismissed();
    } catch {
      // user-agent quirks: silently bail
    }
    setMode('hidden');
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Install HERR to your home screen"
      style={{
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: 'max(16px, env(safe-area-inset-bottom))',
        zIndex: 60,
        background: '#FFFFFF',
        borderRadius: 16,
        boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
        border: '1px solid var(--herr-line, rgba(26,15,26,0.12))',
        padding: 20,
        maxWidth: 460,
        margin: '0 auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/icon-192.png"
          alt=""
          width={48}
          height={48}
          style={{ borderRadius: 10, flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 18,
              fontWeight: 500,
              color: 'var(--herr-ink, #1A0F1A)',
              margin: '0 0 4px',
            }}
          >
            Install HERR to your home screen
          </p>
          {mode === 'browser' ? (
            <p style={{ fontSize: 13, color: 'rgba(26,15,26,0.65)', margin: 0, lineHeight: 1.5 }}>
              Get faster access to your daily affirmations. Works offline.
            </p>
          ) : (
            <p style={{ fontSize: 13, color: 'rgba(26,15,26,0.65)', margin: 0, lineHeight: 1.5 }}>
              On iPhone: tap the Share icon at the bottom of Safari, then choose <strong>Add to Home Screen</strong>.
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
        <button
          onClick={dismiss}
          style={{
            background: 'transparent',
            border: '1px solid var(--herr-line, rgba(26,15,26,0.12))',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 13,
            color: 'rgba(26,15,26,0.65)',
            cursor: 'pointer',
          }}
        >
          Not now
        </button>
        {mode === 'browser' && (
          <button
            onClick={install}
            style={{
              background: 'var(--herr-magenta, #C42D8E)',
              border: 'none',
              borderRadius: 8,
              padding: '8px 18px',
              fontSize: 13,
              fontWeight: 600,
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            Install
          </button>
        )}
      </div>
    </div>
  );
}
