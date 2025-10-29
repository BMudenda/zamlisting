// Service Worker version name
// IMPORTANT: Increment this version whenever you update the files in urlsToCache
const CACHE_NAME = 'rides-dashboard-v4'; 

// List of all files to cache (NOTE: Paths are now ABSOLUTE from the website root)
const urlsToCache = [
  // ----------------------------------------------
  // 1. Critical Core PWA Files (Absolute paths for /install/ directory)
  // ----------------------------------------------
  '/install/',                             // Caches the directory's index URL
  '/install/index.html',                   // Your main HTML file inside /install/
  '/install/manifest2.json',               // Your PWA configuration file
  '/install/sw2.js',                       // The service worker itself

  // ----------------------------------------------
  // 2. Icon and External Assets
  // ----------------------------------------------
  '/install/lfr.jpg',                      // Your confirmed icon file
  
  // Font Awesome CSS (External)
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
  // Roboto Font CSS (External)
  'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
  // Audio for the beep sound (External)
  'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
  
  // ----------------------------------------------
  // 3. Firebase Dependencies (External)
  // ----------------------------------------------
  "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js",
  "https://www.gstatic.com/firebasejs/12.4.0/firebase-messaging.js"
];

// 1. Installation: Open cache and store all files
self.addEventListener("install", (e) => {
  // force the waiting service worker to become the active service worker
  self.skipWaiting(); 
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache and added all static assets to: ' + CACHE_NAME);
      // Note: If any file fails to load, the entire installation will fail.
      return cache.addAll(urlsToCache);
    })
  );
});

// 2. Fetch: Respond with correct strategy (Cache-First for Static, Network-Only for Data)
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  
  // IMPORTANT FIX: Network-Only strategy for Live Data Feed
  // This prevents caching the data results, ensuring the user always gets fresh data when online.
  if (url.hostname === 'script.google.com' || url.href.includes('script.google.com')) {
    e.respondWith(
      fetch(e.request).catch(error => {
        console.error('API fetch failed when offline or network error:', error);
        // Fallback for API calls (optional, but good practice to inform user)
        return new Response(JSON.stringify({ error: 'Data feed unavailable offline.' }), { 
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }
  
  // Cache-First, falling back to network for all other resources (static files)
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});

// 3. Activation: Clear old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache: ' + cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 4. Push Notification Handling (Required for Firebase)
self.addEventListener('push', event => {
    const data = event.data.json();
    const title = data.notification.title || 'New Notification';
    const options = {
        body: data.notification.body || 'New data available.',
        // IMPORTANT: Icon path must also be absolute
        icon: '/install/lfr.jpg', 
        badge: '/install/lfr.jpg' 
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});
