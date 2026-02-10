// public/sw.js - Fixed Service Worker (no POST caching errors)

// Auto-versioning using timestamp
const CACHE_VERSION = `v-${Date.now()}`;
const CACHE_NAME = `hot-streaming-${CACHE_VERSION}`;

// Only cache static assets
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon.jpg',
];

// Assets to NEVER cache
const NEVER_CACHE = [
  '/_next/static/chunks/',
  '/_next/static/css/',
  '/api/',
  'chrome-extension://',
  'analytics',
  'gtag',
];

// Helper: Should we cache this request?
const shouldCache = (request) => {
  const url = request.url;
  
  // ✅ CRITICAL FIX: Only cache GET requests
  if (request.method !== 'GET') {
    return false;
  }
  
  // Never cache if URL matches our blacklist
  if (NEVER_CACHE.some(pattern => url.includes(pattern))) {
    return false;
  }
  
  // Only cache same-origin requests
  return url.startsWith(self.location.origin);
};

// Install event
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((err) => console.warn('⚠️ Cache addAll error:', err))
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activated', CACHE_NAME);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('hot-streaming-') && cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Network first, cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // ✅ CRITICAL FIX: Don't try to cache non-GET requests
  if (request.method !== 'GET') {
    // Just pass through POST, PUT, DELETE, etc.
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache successful GET responses for cacheable URLs
        if (response && response.status === 200 && shouldCache(request)) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            // ✅ Double-check before caching
            if (request.method === 'GET') {
              cache.put(request, responseToCache).catch((err) => {
                console.warn('⚠️ Cache put error:', err);
              });
            }
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try cache (only for GET requests)
        if (shouldCache(request)) {
          return caches.match(request);
        }
        return new Response('Network error', { 
          status: 503,
          statusText: 'Service Unavailable' 
        });
      })
  );
});

// Message handler
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'SAVE_PIP_STATE') {
    const state = event.data.payload;
    savePiPStateToIndexedDB(state);
  }
  
  if (event.data && event.data.type === 'GET_PIP_STATE') {
    getPiPStateFromIndexedDB().then((state) => {
      event.ports[0].postMessage({ type: 'PIP_STATE', payload: state });
    });
  }
});

// Sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pip-state') {
    event.waitUntil(
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

// Push notification
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  if (data.type === 'pip-reminder') {
    event.waitUntil(
      self.registration.showNotification('Video Still Playing', {
        body: 'Your livestream video is still playing in the background',
        icon: '/icon.jpg',
        tag: 'pip-active',
        requireInteraction: false,
      })
    );
  }
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/livestream'));
});

// IndexedDB helpers for PiP state
async function savePiPStateToIndexedDB(state) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('HOTPiPDatabase', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pipState')) {
        db.createObjectStore('pipState', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['pipState'], 'readwrite');
      const store = transaction.objectStore('pipState');
      
      store.put({ id: 'current', ...state, timestamp: Date.now() });
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };
  });
}

async function getPiPStateFromIndexedDB() {
  return new Promise((resolve) => {
    const request = indexedDB.open('HOTPiPDatabase', 1);
    
    request.onerror = () => resolve(null);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('pipState')) {
        resolve(null);
        return;
      }
      
      const transaction = db.transaction(['pipState'], 'readonly');
      const store = transaction.objectStore('pipState');
      const getRequest = store.get('current');
      
      getRequest.onsuccess = () => resolve(getRequest.result || null);
      getRequest.onerror = () => resolve(null);
    };
  });
}