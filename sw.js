// Porcelain Ballerina service worker. Build 1795375176.
// Pages and data: network first (always the newest build when online), cache only as an offline fallback.
// Versioned files (?v=1795375176): cache first. Every new build gets a new cache; old caches are deleted.
const BUILD = '1795375176';
const CACHE = 'pb-' + BUILD;
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('pb-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin) return;
  if (/sealed-room|images\/room\//.test(url.pathname)) return; // never cache local-only rooms
  const versioned = url.searchParams.has('v');
  if (versioned) {
    e.respondWith(caches.open(CACHE).then(async (c) => { const hit = await c.match(req); if (hit) return hit; const res = await fetch(req); if (res.ok) c.put(req, res.clone()); return res; }));
    return;
  }
  e.respondWith(fetch(req, { cache: 'no-store' }).then((res) => { if (res.ok && (req.mode === 'navigate' || /\.(html|json)$/.test(url.pathname))) { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); } return res; })
    .catch(() => caches.match(req).then((hit) => hit || caches.match(new URL('./', self.registration.scope).href).then((h) => h || caches.match(new URL('index.html', self.registration.scope).href)))));
});
