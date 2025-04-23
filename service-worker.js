const CACHE_NAME = 'moi-notes-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/images/logo.png',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.all(
        ASSETS.map(url =>
          fetch(url)
            .then(resp => {
              if (!resp.ok) throw new Error('bad status');
              return cache.put(url, resp);
            })
            .catch(() => { /* swallow missing/404 */ })
        )
      ))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});
