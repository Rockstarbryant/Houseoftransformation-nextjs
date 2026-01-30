// Public/sw.js - Service Worker for persistent floating PiP

const CACHE_NAME = 'hot-streaming-v1';
const urlsToCache = [
  '/',
  '/livestream',
  '/manifest.json',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch((err) => {
        console.log('Cache addAll error:', err);
        // Don't fail if we can't cache everything
      });
    })
  );
  self.skipWaiting();
});

// Activate event
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
  self.clients.claim();
});

// Fetch event - network first, then cache
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Return cached version if fetch fails
        return caches.match(event.request).then((response) => {
          return response || new Response('Network error', { status: 503 });
        });
      })
  );
});

// Listen for messages from the app (e.g., to update PiP state)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SAVE_PIP_STATE') {
    // Save PiP state to IndexedDB for persistence
    const state = event.data.payload;
    console.log('Service Worker received PiP state:', state);
  }
});

// Periodic sync to check if PiP should continue
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pip-state') {
    event.waitUntil(
      // Notify all clients about sync
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SYNC_PIP_STATE',
            timestamp: Date.now(),
          });
        });
      })
    );
  }
});