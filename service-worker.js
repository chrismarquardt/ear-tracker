console.log('Service Worker: script loaded');
const CACHE_NAME = 'ear-tracker-v2';
const BASE = (self.location.pathname.replace(/\/[^\/]*$/, '') || '/') + (self.location.pathname.endsWith('/') ? '' : '/');
const ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'icon.png',
  BASE + 'favicon.ico',
  BASE + 'src/app.js',
  BASE + 'src/storage.js',
  BASE + 'src/styles.css',
  BASE + 'src/components/Tabs.js',
  BASE + 'src/components/TrackerRow.js',
  BASE + 'src/components/WaterButton.js',
  BASE + 'src/components/SettingsModal.js',
  BASE + 'src/components/DebugPanel.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});