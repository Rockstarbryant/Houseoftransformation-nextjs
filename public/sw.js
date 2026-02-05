// Public/sw.js - Enhanced Service Worker for persistent floating PiP

const CACHE_NAME = 'hot-streaming-v2';
const urlsToCache = [
  '/',
  '/livestream',
  '/manifest.json',
];

// Install event
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch((err) => {
        console.log('⚠️ Cache addAll error:', err);
        // Don't fail if we can't cache everything
      });
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // This empty handler is enough to satisfy the "Installable" requirement
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
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

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SAVE_PIP_STATE') {
    const state = event.data.payload;
    console.log('💾 Service Worker received PiP state:', state);
    
    // Store in IndexedDB for true persistence
    savePiPStateToIndexedDB(state);
  }
  
  if (event.data && event.data.type === 'GET_PIP_STATE') {
    // Respond with saved PiP state
    getPiPStateFromIndexedDB().then((state) => {
      event.ports[0].postMessage({ type: 'PIP_STATE', payload: state });
    });
  }
});

// Periodic sync to maintain PiP state
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pip-state') {
    console.log('🔄 Syncing PiP state...');
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

// Handle push notifications (for future use with PiP reminders)
self.addEventListener('push', (event) => {
  console.log('📬 Push notification received');
  const data = event.data ? event.data.json() : {};
  
  if (data.type === 'pip-reminder') {
    event.waitUntil(
      self.registration.showNotification('Video Still Playing', {
        body: 'Your livestream video is still playing in the background',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        tag: 'pip-active',
        requireInteraction: false,
      })
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/livestream')
  );
});

// IndexedDB helper functions for PiP state persistence
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
      
      transaction.oncomplete = () => {
        console.log('✅ PiP state saved to IndexedDB');
        resolve();
      };
      
      transaction.onerror = () => reject(transaction.error);
    };
  });
}

async function getPiPStateFromIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('HOTPiPDatabase', 1);
    
    request.onerror = () => {
      console.log('⚠️ IndexedDB error');
      resolve(null);
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('pipState')) {
        resolve(null);
        return;
      }
      
      const transaction = db.transaction(['pipState'], 'readonly');
      const store = transaction.objectStore('pipState');
      const getRequest = store.get('current');
      
      getRequest.onsuccess = () => {
        resolve(getRequest.result || null);
      };
      
      getRequest.onerror = () => {
        resolve(null);
      };
    };
  });
}