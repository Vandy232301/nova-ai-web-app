// Simple service worker for caching static assets
const CACHE_NAME = 'nova-cache-v1';
const urlsToCache = [
  '/nova-logo-icon.png',
  '/favicon-32.png',
  '/favicon-16.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  // Only cache GET requests for static assets
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Cache images and fonts
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|webp|avif|woff|woff2)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => response || fetch(event.request)
          .then((fetchResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, fetchResponse.clone());
              return fetchResponse;
            });
          })
        )
    );
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
