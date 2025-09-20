// sw.js — PockeTech v0.83
// ----------------------------------------------------
// Strategy:
// - Precache the app shell (index, manifest, icons)
// - Navigation requests -> network first, fallback to cached index.html
// - Same-origin GET requests -> stale-while-revalidate
// - Clean up old caches on activate
// ----------------------------------------------------

const SW_VERSION = 'v0.83';
const CACHE_NAME = `pocketech-${SW_VERSION}`;
const PRECACHE_ASSETS = [
  './',                 // GH Pages root
  './index.html',
  './manifest.webmanifest',
  './sw.js',
  // (optional) comment out if you don't have these:
  './icons/icon-192.png',
  './icons/icon-512.png',
  './favicon.ico'
];

// Install: precache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// Activate: drop old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('pocketech-') && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch handler
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GETs
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;

  // 1) Navigation requests: Network first, fallback to cached index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Cache a copy of index.html opportunistically
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put('./index.html', resClone)).catch(()=>{});
          return res;
        })
        .catch(() =>
          caches.match('./index.html').then((cached) => cached || new Response('Offline', { status: 503 }))
        )
    );
    return;
  }

  // 2) Same-origin static files: stale-while-revalidate
  if (isSameOrigin) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // 3) Cross-origin: try network, fall back to cache if we somehow precached it
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});

// Stale-while-revalidate helper
async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);

  const networkPromise = fetch(req)
    .then((res) => {
      // Only cache successful, basic/opaque responses for GET
      if (res && res.status === 200 && (res.type === 'basic' || res.type === 'opaque')) {
        cache.put(req, res.clone()).catch(()=>{});
      }
      return res;
    })
    .catch(() => null);

  // Return cached immediately if we have it; otherwise wait for network
  return cached || networkPromise || new Response('Offline', { status: 503 });
}

// Optional: handle messages from the page to control the SW
self.addEventListener('message', (event) => {
  const msg = event.data;
  if (msg === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (msg === 'CLEAR_CACHE') {
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k.startsWith('pocketech-')).map((k) => caches.delete(k)))
    );
  }
});
