// Rasoi service worker: offline support and reminder notifications.
// - The app shell and its scripts are cached so Rasoi opens without a connection.
// - Dish photos (bundled, Unsplash, YouTube thumbnails) are cached as they are seen.
// - Push messages from the server are shown as notifications.
const SHELL = 'rasoi-shell-v1';
const PHOTOS = 'rasoi-photos-v1';
const PRECACHE = ['/', '/manifest.webmanifest', '/sql-wasm.wasm', '/icon.svg', '/icons/icon-192.png', '/icons/apple-touch-icon.png'];
const PHOTO_HOSTS = ['images.unsplash.com', 'img.youtube.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keep = new Set([SHELL, PHOTOS]);
    for (const key of await caches.keys()) if (!keep.has(key)) await caches.delete(key);
    await self.clients.claim();
  })());
});

// The page sends the files it already loaded (and the bundled photos) to be cached.
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type !== 'cache-urls' || !Array.isArray(data.urls)) return;
  event.waitUntil(caches.open(SHELL).then(async (cache) => {
    for (const url of data.urls) {
      if (await cache.match(url)) continue;
      try { await cache.add(url); } catch { /* skip files that fail */ }
    }
  }));
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok || res.type === 'opaque') cache.put(request, res.clone()).catch(() => {});
  return res;
}

async function networkFirst(request) {
  const cache = await caches.open(SHELL);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone()).catch(() => {});
    return res;
  } catch {
    return (await cache.match(request)) || (await cache.match('/')) || Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(SHELL);
  const hit = await cache.match(request);
  const fresh = fetch(request).then((res) => {
    if (res.ok) cache.put(request, res.clone()).catch(() => {});
    return res;
  }).catch(() => hit || Response.error());
  return hit || fresh;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith('/api/')) return; // always live
    if (request.mode === 'navigate') { event.respondWith(networkFirst(request)); return; }
    if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/') || url.pathname === '/sql-wasm.wasm') {
      event.respondWith(cacheFirst(request, SHELL));
      return;
    }
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  if (PHOTO_HOSTS.includes(url.hostname)) event.respondWith(cacheFirst(request, PHOTOS));
});

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { body: event.data && event.data.text() }; }
  event.waitUntil(self.registration.showNotification(data.title || 'Rasoi 🍛', {
    body: data.body || "Send today's menu to your cook",
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'rasoi-daily',
    data: { url: '/' },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) if ('focus' in c) return c.focus();
    return self.clients.openWindow('/');
  })());
});
