'use strict';

const SW_VERSION = 'v1.0.0';
const PRECACHE = `precache-${SW_VERSION}`;
const RUNTIME = `runtime-${SW_VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => ![PRECACHE, RUNTIME].includes(key))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Helper: Stale-While-Revalidate
async function staleWhileRevalidate(request, cacheName = RUNTIME) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      // Only cache OK responses
      if (response && response.status === 200 && request.method === 'GET') {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);
  return cached || networkPromise || Response.error();
}

// Helper: Network-first with cache fallback (for HTML navigations)
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(RUNTIME);
    cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cache = await caches.open(RUNTIME);
    const cached = await cache.match(request);
    if (cached) return cached;
    // as a last resort, return cached homepage
    return cache.match('/');
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Bypass non-GET
  if (request.method !== 'GET') return;

  // App shell navigations
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets (same-origin)
  if (url.origin === self.location.origin) {
    // Cache CSS/JS/images with SWR
    if (request.destination === 'style' || request.destination === 'script' || request.destination === 'image' || request.destination === 'font') {
      event.respondWith(staleWhileRevalidate(request));
      return;
    }
  }

  // Open-Meteo APIs (runtime cache)
  if (url.hostname.endsWith('open-meteo.com') || url.hostname.includes('geocoding-api.open-meteo.com')) {
    event.respondWith(staleWhileRevalidate(request, 'weather-runtime'));
    return;
  }
});

// Optional: Listen for skipWaiting messages for faster updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
