self.addEventListener("install", (e) => {
  e.waitUntil(
    // NOTE: Use a new cache name (e.g., v2) to force the browser to update the files!
    caches.open("luangwa-cache-v2").then((cache) => {
      return cache.addAll([
        // Critical Core PWA Files
        "./",                                 // Caches the root URL
        "customerideview.html",               // Your main dashboard page
        "manifest2.json",                     // The PWA configuration file
        "sw2.js",                             // The service worker itself

        // Icons and Images (Ensure these names match your files exactly)
        "lfr.jpg",                            // Apple Touch Icon
        "icon-192.png",                       // Example PWA Icon
        "icon-512.png",                       // Example PWA Icon

        // External Dependencies (Required for offline styling and functionality)
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css",
        "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
        "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
        
        // Note: You must also cache any Firebase JavaScript files if you want 
        // the Firebase logic to run immediately upon opening offline:
        "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js",
        "https://www.gstatic.com/firebasejs/12.4.0/firebase-messaging.js"
      ]);
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
