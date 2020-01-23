const cacheName = 'generic-cache';
const cachedRequests = [
  '/src/base/component.js',
  '/src/base/dom_component.js',
  '/src/base/map_variables.js',
  '/src/base/render.js',
  '/src/base/variable.js',
  '/src/app.js',
  '/src/clock_component.js',
  '/src/daily_tracker_component.js',
  '/src/main.js',
  '/src/task_list_component.js',
  '/src/time_ticket_component.js',
  '/src/toggle_button_component.js',
  '/style/main.css',
  '/index.html',
  '/',
];

self.addEventListener('install', (event) => {
  console.log('service worker installed');
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      cache.addAll(cachedRequests);
    })
  );
});
// 

self.addEventListener('activate', (event) => {
  console.log('service worker activated');
});

self.addEventListener('fetch', (event) => {
  console.log('fetch event', event);
  event.respondWith(caches.match(event.request).then((cachedResponse) => {
    return (cachedResponse || fetch(event.request));
  }));
});