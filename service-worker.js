/**
 * Service Worker for Chemical Formula Optimizer
 * Enables PWA functionality and offline support
 */

const CACHE_NAME = 'chemical-formula-optimizer-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/ar.html',
  '/manifest.json',
  '/assets/css/main.css',
  '/assets/css/components.css',
  '/assets/js/app.js',
  '/assets/js/optimizer.js',
  '/assets/js/database.js',
  '/assets/js/charts.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

// Install Event
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell and critical resources');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('All resources cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Cache installation failed:', error);
      })
  );
});

// Activate Event
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch Event
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip Chrome extensions
  if (event.request.url.startsWith('chrome-extension://')) return;
  
  // Skip analytics and external APIs (optional)
  if (event.request.url.includes('analytics') || event.request.url.includes('api.')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          console.log('Cache hit for:', event.request.url);
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            // Cache the new resource
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
                console.log('Cached new resource:', event.request.url);
              });
            
            return response;
          })
          .catch(error => {
            console.error('Fetch failed:', error);
            
            // For HTML requests, return offline page
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
            
            // For other requests, return a fallback
            return new Response(JSON.stringify({
              error: 'Network error',
              message: 'You are offline. Please check your connection.'
            }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          });
      })
  );
});

// Background Sync (for offline data sync)
self.addEventListener('sync', event => {
  console.log('Background sync event:', event.tag);
  
  if (event.tag === 'sync-formulations') {
    event.waitUntil(syncFormulations());
  }
});

// Periodic Background Sync (for updates)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-resources') {
    console.log('Periodic background sync for updates');
    event.waitUntil(updateCachedResources());
  }
});

// Sync Formulations Function
async function syncFormulations() {
  try {
    // Get unsynchronized formulations from IndexedDB
    const db = await openDatabase();
    const unsynced = await getUnsyncedFormulations(db);
    
    if (unsynced.length === 0) {
      console.log('No formulations to sync');
      return;
    }
    
    console.log(`Syncing ${unsynced.length} formulations`);
    
    // In a real application, you would send these to your server
    // For now, we'll just mark them as synced
    for (const formulation of unsynced) {
      await markAsSynced(db, formulation.id);
      console.log(`Synced formulation ${formulation.id}`);
    }
    
    // Show notification
    self.registration.showNotification('Chemical Formula Optimizer', {
      body: `Successfully synced ${unsynced.length} formulation(s)`,
      icon: '/assets/images/icon-192x192.png',
      badge: '/assets/images/icon-72x72.png'
    });
    
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Update Cached Resources
async function updateCachedResources() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    
    let updatedCount = 0;
    
    for (const request of requests) {
      try {
        const response = await fetch(request.url);
        
        if (response.ok) {
          await cache.put(request, response);
          updatedCount++;
        }
      } catch (error) {
        console.error(`Failed to update ${request.url}:`, error);
      }
    }
    
    if (updatedCount > 0) {
      console.log(`Updated ${updatedCount} cached resources`);
    }
    
  } catch (error) {
    console.error('Resource update failed:', error);
  }
}

// Push Notification Event
self.addEventListener('push', event => {
  console.log('Push notification received');
  
  let data = {
    title: 'Chemical Formula Optimizer',
    body: 'New optimization results available',
    icon: '/assets/images/icon-192x192.png',
    badge: '/assets/images/icon-72x72.png'
  };
  
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: 'View Results'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Event
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(windowClients => {
      // Check if there's already a window open
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Database Helper Functions
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ChemicalFormulaDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('formulations')) {
        const store = db.createObjectStore('formulations', { 
          keyPath: 'id',
          autoIncrement: true 
        });
        store.createIndex('synced', 'synced', { unique: false });
      }
    };
  });
}

async function getUnsyncedFormulations(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['formulations'], 'readonly');
    const store = transaction.objectStore('formulations');
    const index = store.index('synced');
    
    const request = index.getAll(false); // Get unsynced items
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function markAsSynced(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['formulations'], 'readwrite');
    const store = transaction.objectStore('formulations');
    
    const getRequest = store.get(id);
    
    getRequest.onsuccess = () => {
      const formulation = getRequest.result;
      if (formulation) {
        formulation.synced = true;
        formulation.syncedAt = new Date().toISOString();
        
        const updateRequest = store.put(formulation);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      } else {
        reject(new Error('Formulation not found'));
      }
    };
    
    getRequest.onerror = () => reject(getRequest.error);
  });
}

// Message Event (for communication with client)
self.addEventListener('message', event => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CACHE_RESOURCES') {
    cacheResources(event.data.urls);
  }
});

// Cache Additional Resources
async function cacheResources(urls) {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(urls);
    console.log('Additional resources cached:', urls);
  } catch (error) {
    console.error('Failed to cache additional resources:', error);
  }
}

// Periodic cleanup of old cache entries
setInterval(async () => {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const dateHeader = response.headers.get('date');
        if (dateHeader) {
          const responseDate = new Date(dateHeader).getTime();
          if (responseDate < weekAgo) {
            await cache.delete(request);
            console.log('Cleaned old cache entry:', request.url);
          }
        }
      }
    }
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }
}, 24 * 60 * 60 * 1000); // Run once per day
