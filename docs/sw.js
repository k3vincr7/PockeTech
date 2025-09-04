// docs/sw.js
const CACHE = 'pocketech-v2'; // ⬅️ bump this on each release to force update
const ASSETS = [
  './',              // index route
  './index.html',    // explicit on GitHub Pages
  './manifest.webmanifest',
  './sw.js',
  // add icons here when you have them, e.g.:
  // './icons/pwa-192.png',
  // './icons/pwa-512.png',
];

// Install: pre-cache core assets (app shell)
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: 
// 1) For navigations, serve app shell (index.html) so SPA works offline.
// 2) For same-origin GET requests, use cache-first and then update cache in background.
// 3) For cross-origin, just pass through network.
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Handle navigation requests (address bar, refresh, anchorless links)
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then((cached) =>
        cached ||
        fetch('./index.html').catch(() => caches.match('./index.html'))
      )
    );
    return;
  }

  // Only handle GET
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  if (!sameOrigin) {
    // Don’t try to cache cross-origin requests here
    return;
  }

  // Cache-first; update cache in background (stale-while-revalidate-ish)
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached); // if network fails, fall back to cache
      return cached || fetchPromise;
    })
  );
});
