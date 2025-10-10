// sw.js — robust update + sane caching
const CACHE_VERSION = 'pocketech-v0.83.3';
const HTML_CACHE = CACHE_VERSION + '-html';
const ASSET_CACHE = CACHE_VERSION + '-assets';

// files you want cached on install (add/trim as needed)
const PRECACHE = [
  '/',              // if your site is a root (GitHub Pages may need '/PockeTech/')
  './index.html',
  './manifest.webmanifest',
  './',             // GH Pages quirk
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// Immediately take control on new SW
self.addEventListener('install', (evt) => {
  self.skipWaiting();
  evt.waitUntil(
    caches.open(ASSET_CACHE).then((cache) => cache.addAll(PRECACHE).catch(()=>{}))
  );
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil((async () => {
    // Delete old caches
    const names = await caches.keys();
    await Promise.all(names.map(n => {
      if (!n.startsWith(CACHE_VERSION)) return caches.delete(n);
    }));
    await self.clients.claim();
  })());
});

// Network-first for HTML (so app updates), cache-first for assets
self.addEventListener('fetch', (evt) => {
  const req = evt.request;
  const url = new URL(req.url);
  const isHTML = req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    evt.respondWith((async () => {
      try {
        const fresh = await fetch(req, { cache: 'no-store' });
        const cache = await caches.open(HTML_CACHE);
        cache.put(req, fresh.clone());
        return fresh;
      } catch {
        const cache = await caches.open(HTML_CACHE);
        const cached = await cache.match(req);
        return cached || caches.match('./index.html');
      }
    })());
    return;
  }

  // assets: cache-first, then network
  evt.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      const cache = await caches.open(ASSET_CACHE);
      cache.put(req, res.clone());
      return res;
    } catch {
      return new Response('', { status: 503, statusText: 'Offline' });
    }
  })());
});

// Allow page to tell SW to activate now
self.addEventListener('message', (evt) => {
  if (evt.data === 'SKIP_WAITING') self.skipWaiting();
});
