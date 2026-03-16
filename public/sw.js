const CACHE_NAME = 'nova-cache-v2';
const STATIC_ASSETS = [
  '/nova-logo-icon.png',
  '/favicon-32.png',
  '/favicon-16.png',
  '/apple-touch-icon.png',
  '/favicon-192.png',
  '/favicon-512.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.pathname.match(/\.(png|jpg|jpeg|svg|webp|avif|woff|woff2|ico)$/)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/v1/')) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(event.request).then((cached) => cached || new Response(
          '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NOVA</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#050508;color:#fff;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:2rem;text-align:center}.c{max-width:400px}h1{font-size:1.5rem;margin-bottom:.5rem}p{color:#888;font-size:.9rem;margin-bottom:1.5rem}a{display:inline-block;padding:.75rem 2rem;background:linear-gradient(135deg,#7c3aed,#3b82f6);color:#fff;border-radius:999px;text-decoration:none;font-weight:600}</style></head><body><div class="c"><h1>You\'re offline</h1><p>Check your connection and try again.</p><a href="/">Retry</a></div></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        ))
      )
    );
    return;
  }
});
