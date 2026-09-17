// Minimal service worker — required by Android/Chrome to allow
// "Add to Home Screen" / installing the site as an app.
const CACHE_NAME = "sana-boutique-v1";

self.addEventListener("install", function (event) {
    self.skipWaiting();
});

self.addEventListener("activate", function (event) {
    event.waitUntil(self.clients.claim());
});

// Pass-through fetch handler (no offline caching logic, just enough
// to satisfy installability requirements). Safe to expand later.
self.addEventListener("fetch", function (event) {
    event.respondWith(
        fetch(event.request).catch(function () {
            return caches.match(event.request);
        })
    );
});
