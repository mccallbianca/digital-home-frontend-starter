'use client';

import { useEffect } from 'react';

/**
 * Registers /sw.js once on mount. Mounted in src/app/layout.tsx so it
 * runs across the whole app. Silently no-ops on unsupported browsers
 * and during local dev when service workers are disabled.
 */
export default function PWAServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    // Avoid console noise during HMR cycles
    const onLoad = () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((err) => {
        console.warn('[sw] registration failed:', err);
      });
    };
    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad, { once: true });
    return () => window.removeEventListener('load', onLoad);
  }, []);
  return null;
}
