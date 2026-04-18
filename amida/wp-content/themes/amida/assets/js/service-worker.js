/**
 * Amida service worker.
 *
 * Strategies:
 *   cache-first           for static assets (CSS, fonts, manifest, icons, landing)
 *   stale-while-revalidate for product grid images and COA PDFs (non-sensitive)
 *   network-first         for authenticated pages (/catalog, /product/*, /account/*)
 *   never-cache           for /wp-admin, /checkout, /compound-img
 */

const VERSION = 'amida-v1.0.0';
const STATIC_CACHE  = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(c => c.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(k => !k.startsWith(VERSION))
        .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Never cache sensitive endpoints.
  if (/^\/wp-admin|^\/wp-login|^\/checkout|^\/compound-img|wc-ajax=/.test(url.pathname + url.search)) {
    return;
  }

  // Authenticated pages: network-first, fall back to offline page.
  if (/^\/(catalog|product|category|cart|account|thank-you)/.test(url.pathname)) {
    event.respondWith(
      fetch(req)
        .then(resp => {
          const clone = resp.clone();
          caches.open(RUNTIME_CACHE).then(c => c.put(req, clone));
          return resp;
        })
        .catch(() => caches.match(req).then(m => m || caches.match('/offline')))
    );
    return;
  }

  // Images + COA PDFs: stale-while-revalidate.
  if (/\.(png|jpe?g|webp|gif|svg|pdf)$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(cache =>
        cache.match(req).then(cached => {
          const fetched = fetch(req).then(r => { cache.put(req, r.clone()); return r; }).catch(() => cached);
          return cached || fetched;
        })
      )
    );
    return;
  }

  // Everything else: cache-first.
  event.respondWith(
    caches.match(req).then(cached =>
      cached || fetch(req).then(r => {
        const clone = r.clone();
        caches.open(STATIC_CACHE).then(c => c.put(req, clone));
        return r;
      }).catch(() => caches.match('/offline'))
    )
  );
});
