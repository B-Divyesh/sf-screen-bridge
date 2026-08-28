const CACHE = 'screen-bridge-v1';
const SHELL = ['/', '/index.html', '/offline.html', '/manifest.webmanifest', '/icon.svg', '/signal-desk.webp'];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL);
    // Vite hashes app files. Discover the current shell's module URLs so a
    // newly installed PWA can open without a second network visit.
    const response = await fetch('/');
    const html = await response.text();
    await cache.put('/index.html', new Response(html, { headers: { 'content-type': 'text/html' } }));
    const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?]+)"/g)].map(match => match[1]);
    await cache.addAll(assets);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.mode === 'navigate') {
    if (['/privacy', '/privacy/', '/terms', '/terms/'].includes(new URL(event.request.url).pathname)) {
      event.respondWith(fetch(event.request).catch(() => caches.match('/offline.html')));
      return;
    }
    event.respondWith(caches.match('/index.html').then(hit => hit || fetch(event.request)).catch(() => caches.match('/offline.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(response => { if (response.ok && new URL(event.request.url).origin === location.origin) caches.open(CACHE).then(cache => cache.put(event.request, response.clone())); return response; })));
});
