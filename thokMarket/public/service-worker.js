// service-worker.js

const CACHE_NAME = "thokmarket-cache-v1";
const urlsToCache = [
  "/", 
  "/index.html",
  "/vite.svg", // आपके logo या icon का path
];

// 🔹 Install event: cache basic files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("✅ Files cached successfully");
      return cache.addAll(urlsToCache);
    })
  );
});

// 🔹 Fetch event: serve cached content when offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // अगर cache में मिल जाए तो वही दो
      if (response) {
        return response;
      }
      // नहीं मिले तो नेटवर्क से लाओ और cache में डालो
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      });
    })
  );
});

// 🔹 Activate event: old cache हटाओ
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("🧹 Old cache deleted:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});
