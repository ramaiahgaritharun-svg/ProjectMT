const CACHE_NAME = "rmt-app-v5"; // Increment version when updating files

// Files to cache (all pages + assets)
const urlsToCache = [
  "index.html",
  "reveal.html",
  "video.html",
  "heart.html",
  "quiz.html",
  "style.css",
  "assets/song.mp3.mpeg",
  "assets/song2.mp3.mpeg",
  "assets/song3.mp3.mpeg",
  "assets/video1.mp4",
  "assets/logo192.png",
  "assets/logo512.png"
];

// INSTALL EVENT - cache all files
self.addEventListener("install", event => {
  console.log("[SW] Installing...");
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log("[SW] Caching all files");
        return cache.addAll(urlsToCache);
      })
  );
});

// ACTIVATE EVENT - remove old caches
self.addEventListener("activate", event => {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Removing old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// FETCH EVENT - serve from cache first
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse; // Serve cached file
        }
        return fetch(event.request)  // Otherwise fetch from network
          .then(networkResponse => {
            // Optional: cache new requests dynamically
            return caches.open(CACHE_NAME).then(cache => {
              // Only cache GET requests
              if (event.request.method === "GET" &&
                  event.request.url.startsWith(self.location.origin)) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            });
          })
          .catch(() => {
            // Offline fallback: optional page or image
            if (event.request.destination === "document") {
              return caches.match("index.html");
            } else if (event.request.destination === "image") {
              return caches.match("assets/image.png");
            }
          });
      })
  );
});
