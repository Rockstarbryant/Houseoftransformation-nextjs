// public/sw.js - Service Worker with AUTOMATIC versioning based on file hash

// 🔥 AUTOMATIC VERSION - This gets a new hash every time the file changes
// When you deploy, Vercel/Netlify serves this with a unique URL parameter
const CACHE_VERSION = `v-${self.location.search.slice(1) || Date.now()}`;
const CACHE_NAME = `hot-streaming-${CACHE_VERSION}`;

// Only cache static assets that don't change often
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon.jpg',
];

// Assets to NEVER cache (prevents chunk mismatch errors)
const NEVER_CACHE = [
  '/_next/static/chunks/',
  '/_next/static/css/',
  '/api/',
  'chrome-extension://',
  'analytics',
  'gtag',
];

const shouldCache = (url) => {
  if (NEVER_CACHE.some(pattern => url.includes(pattern))) {
    return false;
  }
  return url.startsWith(self.location.origin);
};

self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((err) => console.warn('⚠️ Cache addAll error:', err))
  );
  self.skipWaiting();
});

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

self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && shouldCache(request.url)) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        if (shouldCache(request.url)) {
          return caches.match(request);
        }
        return new Response('Network error', { 
          status: 503,
          statusText: 'Service Unavailable' 
        });
      })
  );
});

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

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/livestream'));
});

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