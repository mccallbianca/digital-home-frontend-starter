/* HERR service worker
 * Cache strategy:
 *   - Static (_next/static, icons, fonts, images): cache-first
 *   - API (/api/*): network-first with 5s timeout, fallback to cache
 *   - Everything else: network-first with offline page fallback
 *
 * Versioned cache name lets us roll updates without leaking stale
 * assets — bump CACHE_VERSION when changing this file.
 */

const CACHE_VERSION = 'herr-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const OFFLINE_URL = '/offline';

const PRECACHE = [
  '/offline',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-256.png',
  '/icons/icon-384.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((n) => !n.startsWith(CACHE_VERSION))
          .map((n) => caches.delete(n)),
      );
      await self.clients.claim();
    })(),
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/fonts/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/videos/')
  );
}

function networkFirstWithTimeout(request, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Network timeout')), timeoutMs);
    fetch(request).then(
      (response) => {
        clearTimeout(timer);
        resolve(response);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle GETs, skip cross-origin
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache auth-callback or Supabase tokens
  if (url.pathname.startsWith('/auth/callback')) return;

  if (isStaticAsset(url)) {
    // Cache-first
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      }),
    );
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    // Network-first with 5s timeout, fallback to cache
    event.respondWith(
      (async () => {
        try {
          const response = await networkFirstWithTimeout(request, 5000);
          if (response.ok) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        } catch (err) {
          const cached = await caches.match(request);
          if (cached) return cached;
          return new Response(JSON.stringify({ error: 'Offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      })(),
    );
    return;
  }

  // HTML / everything else: network-first, offline-page fallback
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);
        return response;
      } catch (err) {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
          const offline = await caches.match(OFFLINE_URL);
          if (offline) return offline;
        }
        return new Response('Offline', { status: 503 });
      }
    })(),
  );
});

// Push subscription scaffolding: handler stub. Send logic not yet
// implemented per Phase 1 v2 Block 3 Part 1 scope (subscribe-only).
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || 'HERR', {
        body: data.body || '',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        data: data.url ? { url: data.url } : undefined,
      }),
    );
  } catch (err) {
    // swallow malformed payloads
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/dashboard';
  event.waitUntil(self.clients.openWindow(url));
});
