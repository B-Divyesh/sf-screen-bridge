const CACHE = 'screen-bridge-v2'
const SHELL = ['/', '/index.html', '/offline.html', '/manifest.webmanifest', '/icon.svg', '/icon-192.png', '/signal-desk.webp']

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE)
    await cache.addAll(SHELL)
    const response = await fetch('/index.html', { cache: 'no-store' })
    const html = await response.text()
    await cache.put('/index.html', new Response(html, { headers: { 'content-type': 'text/html' } }))
    const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?]+)"/g)].map(match => match[1])
    await cache.addAll(assets)
    await self.skipWaiting()
  })())
})
self.addEventListener('activate', event => event.waitUntil((async () => {
  await Promise.all((await caches.keys()).filter(key => key.startsWith('screen-bridge-') && key !== CACHE).map(key => caches.delete(key)))
  await self.clients.claim()
})()))
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return
  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE)
      try {
        const response = await fetch(event.request)
        if (response.ok) await cache.put('/index.html', response.clone())
        return response
      } catch {
        return (await cache.match('/index.html')) || (await cache.match('/offline.html'))
      }
    })())
    return
  }
  event.respondWith((async () => {
    const cache = await caches.open(CACHE)
    // Vite's module requests carry request headers that differ between the
    // install fetch and a later navigation. The hashed URL is the identity.
    const hit = await cache.match(event.request, { ignoreSearch: true, ignoreVary: true })
    if (hit) return hit
    try {
      const response = await fetch(event.request)
      if (response.ok) await cache.put(event.request, response.clone())
      return response
    } catch {
      return new Response('', { status: 503, statusText: 'Offline' })
    }
  })())
})
