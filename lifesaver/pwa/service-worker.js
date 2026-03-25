/**
 * LifeSaver Service Worker
 * Provides offline-first caching for PWA functionality
 */

const CACHE_NAME = 'lifesaver-v1';
const DATA_CACHE_NAME = 'lifesaver-data-v1';

// Core assets to cache on install
const STATIC_ASSETS = [
  '/lifesaver/',
  '/lifesaver/index.html',
  '/lifesaver/emergency.html',
  '/lifesaver/css/styles.css',
  '/lifesaver/js/main.js',
  '/lifesaver/js/router.js',
  '/lifesaver/modules/uiModule.js',
  '/lifesaver/modules/emergencyLoader.js',
  '/lifesaver/modules/voiceModule.js',
  '/lifesaver/modules/locationModule.js',
  '/lifesaver/modules/sosModule.js',
  '/lifesaver/pwa/manifest.json',
  '/lifesaver/assets/icons/icon-192.png',
  '/lifesaver/assets/icons/icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
];

// Emergency data JSON files to cache
const DATA_ASSETS = [
  '/lifesaver/data/burns.json',
  '/lifesaver/data/bleeding.json',
  '/lifesaver/data/fractures.json',
  '/lifesaver/data/choking.json',
  '/lifesaver/data/heartattack.json',
  '/lifesaver/data/snakebite.json',
  '/lifesaver/data/fainting.json',
  '/lifesaver/data/cpr.json',
];

// ── Install Event: Pre-cache all static assets and data ──────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Installing LifeSaver Service Worker...');
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS.filter(url => !url.startsWith('http')));
      }),
      // Cache data JSON files
      caches.open(DATA_CACHE_NAME).then((cache) => {
        console.log('[SW] Caching emergency data');
        return cache.addAll(DATA_ASSETS);
      }),
    ])
  );
  // Activate immediately without waiting for the old SW to die
  self.skipWaiting();
});

// ── Activate Event: Clean old caches ─────────────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating LifeSaver Service Worker...');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// ── Fetch Event: Cache-first for data, Network-first for HTML ─────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle data (JSON) requests – Cache first, fallback to network
  if (DATA_ASSETS.some(asset => request.url.includes(asset))) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((networkResponse) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Handle navigation requests – Network first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, response.clone());
            return response;
          });
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match('/lifesaver/index.html');
          });
        })
    );
    return;
  }

  // For all other requests – Cache first, then network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request)
        .then((networkResponse) => {
          // Don't cache external cross-origin requests
          if (
            networkResponse.ok &&
            url.origin === self.location.origin
          ) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Return fallback for images if offline
          if (request.destination === 'image') {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text y="50" font-size="50">🏥</text></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
        });
    })
  );
});

// ── Background Sync (Optional) ────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
