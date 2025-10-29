
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("luangwa-cache").then((cache) => {
      return cache.addAll(["./", "luangwa.html", "icon-192.png", "icon-512.png"]);
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
