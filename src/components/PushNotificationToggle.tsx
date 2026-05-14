'use client';

import { useEffect, useState } from 'react';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

type Status = 'unsupported' | 'loading' | 'denied' | 'off' | 'on' | 'error';

export default function PushNotificationToggle() {
  const [status, setStatus] = useState<Status>('loading');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (typeof window === 'undefined') return;
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        if (active) setStatus('unsupported');
        return;
      }
      if (Notification.permission === 'denied') {
        if (active) setStatus('denied');
        return;
      }
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (active) setStatus(sub ? 'on' : 'off');
      } catch (err) {
        if (active) setStatus('error');
        console.warn('[push] init error:', err);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function enable() {
    setBusy(true);
    setError(null);
    try {
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        setError('Push notifications are not yet configured.');
        setStatus('error');
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'denied' : 'off');
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      const sub =
        existing ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          // urlBase64ToUint8Array returns Uint8Array; PushManager accepts
          // BufferSource — the underlying ArrayBuffer is the right shape.
          applicationServerKey: urlBase64ToUint8Array(publicKey).buffer as ArrayBuffer,
        }));
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Subscribe failed.');
        setStatus('error');
        return;
      }
      setStatus('on');
    } catch (err) {
      console.warn('[push] enable error:', err);
      setError(err instanceof Error ? err.message : 'Subscribe failed.');
      setStatus('error');
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push/unsubscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setStatus('off');
    } catch (err) {
      console.warn('[push] disable error:', err);
      setError(err instanceof Error ? err.message : 'Unsubscribe failed.');
      setStatus('error');
    } finally {
      setBusy(false);
    }
  }

  let body: React.ReactNode;
  if (status === 'loading') {
    body = <span style={{ fontSize: 13, color: 'var(--herr-ink-soft)' }}>Checking…</span>;
  } else if (status === 'unsupported') {
    body = <span style={{ fontSize: 13, color: 'var(--herr-ink-soft)' }}>Not supported on this browser.</span>;
  } else if (status === 'denied') {
    body = (
      <span style={{ fontSize: 13, color: 'var(--herr-ink-soft)' }}>
        Notifications blocked at the browser/OS level. Enable in your browser settings, then reload.
      </span>
    );
  } else {
    body = (
      <button
        onClick={status === 'on' ? disable : enable}
        disabled={busy}
        style={{
          height: 44,
          padding: '0 22px',
          background: status === 'on' ? 'transparent' : 'var(--herr-magenta)',
          color: status === 'on' ? 'var(--herr-ink)' : 'var(--herr-cream)',
          border: status === 'on' ? '1px solid var(--herr-line)' : 'none',
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 600,
          cursor: busy ? 'not-allowed' : 'pointer',
          opacity: busy ? 0.6 : 1,
        }}
      >
        {busy ? 'Saving…' : status === 'on' ? 'Disable Push' : 'Enable Push'}
      </button>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <p style={{ fontSize: 15, color: 'var(--herr-ink)', fontWeight: 500, margin: '0 0 4px' }}>
            Push notifications
          </p>
          <p style={{ fontSize: 13, color: 'var(--herr-ink-soft)', margin: 0, lineHeight: 1.5 }}>
            Receive your daily affirmation cue and live session reminders on this device.
          </p>
        </div>
        {body}
      </div>
      {error && (
        <p style={{ fontSize: 12, color: '#B91C1C', marginTop: 10 }}>{error}</p>
      )}
    </div>
  );
}
