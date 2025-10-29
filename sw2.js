self.addEventListener("install", (e) => {
  // Always use a new cache name (e.g., v3) when you change the list of files to cache.
  e.waitUntil(
    caches.open("luangwa-cache-v3").then((cache) => {
      return cache.addAll([
        // ----------------------------------------------
        // 1. Critical Core PWA Files
        // ----------------------------------------------
        "./",                             // Caches the root URL (e.g., your website base)
        "customerrideview.html",           // Your main HTML file
        "manifest2.json",                 // Your PWA configuration file
        "sw2.js",                         // The service worker itself

        // ----------------------------------------------
        // 2. Icon and External Assets
        // ----------------------------------------------
        "lfr.jpg",                        // Your confirmed icon file
        
        // Font Awesome CSS
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css",
        // Roboto Font CSS
        "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
        // Audio for the beep sound
        "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
        
        // ----------------------------------------------
        // 3. Firebase Dependencies (Essential for offline script execution)
        // ----------------------------------------------
        "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js",
        "https://www.gstatic.com/firebasejs/12.4.0/firebase-messaging.js"
      ]);
    })
  );
});

self.addEventListener("fetch", (e) => {
  // This is a "Cache-first, falling back to network" strategy.
  // It checks the cache for a resource first, and only goes to the network if it's not found.
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
