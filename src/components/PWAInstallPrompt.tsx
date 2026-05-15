'use client';

/**
 * PWA install prompt — platform-aware.
 *
 * iOS Chrome / Firefox / Edge cannot programmatically install PWAs
 * (no beforeinstallprompt on WebKit). They get a tailored modal with
 * step-by-step guidance pointing at the iOS Chrome share button.
 *
 * iOS Safari gets the classic share-icon-then-Add-to-Home-Screen path.
 *
 * Android Chrome / Edge / Samsung Internet uses the native
 * beforeinstallprompt + deferredPrompt.prompt() flow.
 *
 * Block 4 bug 1: the previous version showed a generic "Install" button
 * on iOS Chrome that did nothing because beforeinstallprompt never fired.
 */

import { useEffect, useState } from 'react';

const DISMISS_KEY = 'pwa-install-dismissed-until';
const DISMISS_DAYS = 7;

const HERR_INK = '#0A0A0F';
const HERR_MAGENTA = '#C42D8E';
const HERR_CREAM = '#F4F1EB';
const HERR_LINE = 'rgba(244,241,235,0.18)';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

type Platform =
  | 'ios-safari'
  | 'ios-chrome'
  | 'ios-firefox'
  | 'android'
  | 'desktop'
  | 'unknown';

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window);
  if (isIos) {
    if (/CriOS/.test(ua)) return 'ios-chrome';
    if (/FxiOS/.test(ua)) return 'ios-firefox';
    if (/EdgiOS/.test(ua)) return 'ios-chrome'; // iOS Edge is also WebKit + no BIP, same guidance
    return 'ios-safari';
  }
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia?.('(display-mode: standalone)').matches) return true;
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
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [bipEvent, setBipEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isStandalone()) return;
    if (Date.now() < dismissUntilNow()) return;

    const p = detectPlatform();
    setPlatform(p);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setBipEvent(e as BeforeInstallPromptEvent);
      if (p === 'android' || p === 'desktop') setOpen(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    // iOS never fires beforeinstallprompt — surface manual guidance after first paint.
    let iosTimer: ReturnType<typeof setTimeout> | null = null;
    if (p === 'ios-safari' || p === 'ios-chrome' || p === 'ios-firefox') {
      iosTimer = setTimeout(() => setOpen(true), 1200);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  if (!open) return null;

  function dismiss() {
    setDismissed();
    setOpen(false);
  }

  async function installAndroid() {
    if (!bipEvent) return;
    await bipEvent.prompt();
    try {
      const choice = await bipEvent.userChoice;
      if (choice.outcome === 'dismissed') setDismissed();
    } catch {
      // some UA quirks throw; treat as dismiss
    }
    setOpen(false);
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Add HERR to your home screen"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'rgba(10,10,15,0.55)',
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: isMobile ? 0 : 24,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div
        style={{
          background: HERR_INK,
          color: HERR_CREAM,
          width: isMobile ? '100%' : 'min(440px, 100%)',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderBottomLeftRadius: isMobile ? 0 : 20,
          borderBottomRightRadius: isMobile ? 0 : 20,
          border: `1px solid ${HERR_LINE}`,
          boxShadow: '0 -10px 40px rgba(0,0,0,0.4), 0 10px 40px rgba(0,0,0,0.4)',
          paddingTop: 24,
          paddingBottom: `max(24px, env(safe-area-inset-bottom))`,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        {isMobile && (
          <div
            aria-hidden
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              background: HERR_LINE,
              margin: '0 auto 16px',
            }}
          />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/icon-192.png"
            alt=""
            width={44}
            height={44}
            style={{ borderRadius: 10, flexShrink: 0 }}
          />
          <div>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 22,
                fontWeight: 500,
                color: HERR_CREAM,
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Add HERR to your home screen
            </p>
            <p
              style={{
                fontSize: 12,
                color: 'rgba(244,241,235,0.55)',
                margin: '4px 0 0',
                letterSpacing: '0.05em',
              }}
            >
              Your daily affirmations, one tap away.
            </p>
          </div>
        </div>

        {platform === 'android' || platform === 'desktop' ? (
          <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(244,241,235,0.75)', margin: '0 0 20px' }}>
            Install HERR as an app for faster access and offline support.
          </p>
        ) : platform === 'ios-safari' ? (
          <IosSafariSteps />
        ) : (
          <IosChromeSteps />
        )}

        <div
          style={{
            display: 'flex',
            gap: 10,
            marginTop: 12,
            flexDirection: isMobile ? 'column-reverse' : 'row',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={dismiss}
            style={{
              background: 'transparent',
              border: `1px solid ${HERR_LINE}`,
              borderRadius: 10,
              padding: '12px 18px',
              fontSize: 14,
              color: HERR_CREAM,
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            {platform === 'android' || platform === 'desktop' ? 'Not now' : 'Got it'}
          </button>
          {(platform === 'android' || platform === 'desktop') && bipEvent && (
            <button
              onClick={installAndroid}
              style={{
                background: HERR_MAGENTA,
                border: 'none',
                borderRadius: 10,
                padding: '12px 20px',
                fontSize: 14,
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
    </div>
  );
}

function IosSafariSteps() {
  return (
    <ol style={{ margin: '0 0 20px', padding: '0 0 0 18px', color: 'rgba(244,241,235,0.8)', fontSize: 14, lineHeight: 1.7 }}>
      <li>
        Tap the <strong style={{ color: HERR_CREAM }}>Share</strong> icon{' '}
        <SafariShareIcon /> at the bottom of Safari.
      </li>
      <li>
        Scroll and select <strong style={{ color: HERR_CREAM }}>Add to Home Screen</strong>.
      </li>
      <li>
        Tap <strong style={{ color: HERR_CREAM }}>Add</strong> in the top right.
      </li>
    </ol>
  );
}

function IosChromeSteps() {
  return (
    <>
      <p style={{ fontSize: 13, color: 'rgba(244,241,235,0.6)', margin: '0 0 12px' }}>
        Add HERR using Chrome on iPhone:
      </p>
      <ol style={{ margin: '0 0 20px', padding: '0 0 0 18px', color: 'rgba(244,241,235,0.8)', fontSize: 14, lineHeight: 1.7 }}>
        <li>
          Tap the <strong style={{ color: HERR_CREAM }}>Share</strong> icon{' '}
          <ChromeShareIcon /> in the address bar.
        </li>
        <li>
          Scroll and select <strong style={{ color: HERR_CREAM }}>Add to Home Screen</strong>.
        </li>
        <li>
          Tap <strong style={{ color: HERR_CREAM }}>Add</strong> to confirm.
        </li>
      </ol>
    </>
  );
}

function SafariShareIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden
      style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0 2px' }}
      fill="none"
      stroke={HERR_MAGENTA}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v12" />
      <path d="m8 7 4-4 4 4" />
      <rect x="5" y="11" width="14" height="10" rx="2" />
    </svg>
  );
}

function ChromeShareIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden
      style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0 2px' }}
      fill="none"
      stroke={HERR_MAGENTA}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="18" cy="6" r="2.4" />
      <circle cx="18" cy="18" r="2.4" />
      <path d="m8 11 8-4M8 13l8 4" />
    </svg>
  );
}
