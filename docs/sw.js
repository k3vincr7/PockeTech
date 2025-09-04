const CACHE = 'pocketech-v3'; // <— bump this
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './sw.js',
];
  // add icons when you have them, e.g.:
  // './icons/pwa-192.png',
  // './icons/pwa-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Navigation fallback + cache-first with background refresh
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // SPA navigations: serve app shell
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then((cached) =>
        cached || fetch('./index.html').catch(() => caches.match('./index.html'))
      )
    );
    return;
  }

  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin) return; // don't cache cross-origin

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
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
