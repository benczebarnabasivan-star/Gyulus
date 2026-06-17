/* Vadász Gyula fan site — minimal service worker for PWA offline support.
 *
 * Strategy:
 *   - Precache the app shell + offline fallback on install.
 *   - Navigations: network-first, falling back to cache, then /offline.
 *   - Static assets (images, JS, CSS): stale-while-revalidate.
 * Bump CACHE_VERSION to invalidate old caches on deploy.
 */
const CACHE_VERSION = 'vg-cache-v1';
const APP_SHELL = ['/', '/offline', '/icon.svg', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Never cache API responses (always fresh).
  if (url.pathname.startsWith('/api/')) return;

  // Navigations: network-first with offline fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(request, copy));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match('/offline');
        }),
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(request, copy));
            return res;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
  }
});
