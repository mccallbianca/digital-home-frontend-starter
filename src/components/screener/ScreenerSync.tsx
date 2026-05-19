'use client';

import { useEffect, useRef } from 'react';
import {
  STORAGE_KEY_RESPONSES,
  STORAGE_KEY_CRISIS,
} from '@/lib/screener-scoring';

const RETRY_KEY = 'ecqo_screener_sync_retries';
const MAX_RETRIES = 3;

/**
 * Mounts inside the authenticated dashboard layout. On first mount per
 * page load, checks localStorage for an anonymous screener payload
 * (buffered by the publicMode ScreenerClient at /screener) and POSTs
 * it to /api/screener/sync-anonymous. Clears the payload on 200.
 *
 * Idempotent — does nothing on subsequent mounts after a successful
 * sync. Retries up to MAX_RETRIES on transient failure, then surfaces
 * a console warning. Failures retain the localStorage payload for the
 * next mount.
 */
export default function ScreenerSync() {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    if (typeof window === 'undefined') return;

    const rawResponses = window.localStorage.getItem(STORAGE_KEY_RESPONSES);
    if (!rawResponses) return;

    let responses: Record<string, number>;
    try {
      responses = JSON.parse(rawResponses) as Record<string, number>;
    } catch {
      window.localStorage.removeItem(STORAGE_KEY_RESPONSES);
      return;
    }
    if (!responses || Object.keys(responses).length === 0) {
      window.localStorage.removeItem(STORAGE_KEY_RESPONSES);
      return;
    }

    const rawCrisis = window.localStorage.getItem(STORAGE_KEY_CRISIS);
    let crisisFlag: unknown = null;
    if (rawCrisis) {
      try {
        crisisFlag = JSON.parse(rawCrisis);
      } catch { /* ignore */ }
    }

    const retries = parseInt(window.localStorage.getItem(RETRY_KEY) || '0', 10);
    if (retries >= MAX_RETRIES) {
      console.warn('[screener-sync] max retries reached; not attempting another sync');
      return;
    }

    (async () => {
      try {
        const res = await fetch('/api/screener/sync-anonymous', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ responses, crisis_flag: crisisFlag }),
        });
        if (!res.ok) {
          window.localStorage.setItem(RETRY_KEY, String(retries + 1));
          console.warn('[screener-sync] sync failed, will retry on next mount');
          return;
        }
        window.localStorage.removeItem(STORAGE_KEY_RESPONSES);
        window.localStorage.removeItem(STORAGE_KEY_CRISIS);
        window.localStorage.removeItem(RETRY_KEY);
      } catch (e) {
        window.localStorage.setItem(RETRY_KEY, String(retries + 1));
        console.warn('[screener-sync] sync error, will retry on next mount', e);
      }
    })();
  }, []);

  return null;
}
