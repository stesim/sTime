// NOTE: bump the static cache version if any of the statically cached resources
// listed below have been modified, or if entries need to be added or removed
const staticCacheVersion = 3;

// NOTE: bump the dynamic cache version if any of the resources loaded by the
// static resources have been modified (e.g. JS or CSS files)
const dynamicCacheVersion = 3;

const staticCacheResources = [
  'src/app.js',
  'apple-touch-icon.png',
  'index.html',
  '.',
];

const staticCacheName = `static-cache-v${staticCacheVersion}`;
const dynamicCacheName = `dynamic-cache-v${dynamicCacheVersion}`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      cache.addAll(staticCacheResources);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys
        .filter((key) => (key !== staticCacheName && key !== dynamicCacheName))
        .forEach((key) => caches.delete(key)));
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request).then((cachedResponse) => {
    return (cachedResponse || fetch(event.request).then((response) => {
      return caches.open(dynamicCacheName).then((dynamicCache) => {
        dynamicCache.put(event.request.url, response.clone());
        return response;
      });
    }));
  }));
});