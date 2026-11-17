// Query Path service worker: keeps the app working offline and fetches fresh job data when online.
const VERSION = 'qp-febe2d6b42';
const SHELL = ['./', './index.html', './manifest.webmanifest', './vendor/sql-asm.js', './icons/icon-192.png', './icons/icon-512.png', './icons/favicon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const same = url.origin === self.location.origin;
  // Page and daily data: try the network first so updates show up, fall back to the saved copy offline.
  if (same && (req.mode === 'navigate' || url.pathname.includes('/data/') || url.pathname.endsWith('/index.html'))) {
    const key = url.origin + url.pathname;
    e.respondWith(fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(key, copy)); }
      return res;
    }).catch(() => caches.match(key).then((hit) => hit || caches.match('./index.html'))));
    return;
  }
  // Everything else (SQL engine, icons, fonts): saved copy first.
  if (same || /(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
      return res;
    })));
  }
});
