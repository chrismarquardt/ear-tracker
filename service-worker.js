console.log('Service Worker: script loaded');
const CACHE_NAME = 'ear-tracker-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png',
  '/favicon.ico',
  '/src/app.js',
  '/src/storage.js',
  '/src/ui.js',
  '/src/styles.css',
  '/src/components/Tabs.js',
  '/src/components/TrackerRow.js',
  '/src/components/WaterButton.js',
  '/src/components/SettingsModal.js',
  '/src/components/DebugPanel.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
  console.log('Service Worker: install event');
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
  console.log('Service Worker: activate event');
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request && event.request.url) {
    console.log('Service Worker: fetch', event.request.url);
  }
  event.respondWith(
    caches.match(event.request).then(response =>
      response || fetch(event.request)
    )
  );
});

// yeah