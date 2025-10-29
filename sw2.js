
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("luangwa-cache").then((cache) => {
      return cache.addAll(["./", "customerideview.html", "icon-192.jpg", "icon-512.jpg"]);
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
