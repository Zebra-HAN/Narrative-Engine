const SHELL_CACHE = 'narrative-shell-v7';
const IMAGE_CACHE = 'narrative-images-v3';
const SHELL = ['./', './index.html', './css/style.css', './css/layout-3.css',
  './css/fantasy-bottom-ui.css', './css/fantasy-top-panel.css', './js/app.js'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL_CACHE).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  const current = new Set([SHELL_CACHE, IMAGE_CACHE]);
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith('narrative-') && !current.has(key))
      .map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.destination === 'image') {
    event.respondWith(caches.open(IMAGE_CACHE).then(async cache => {
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) cache.put(request, response.clone());
      return response;
    }));
    return;
  }

  // 앱 코드는 네트워크 우선으로 갱신하되 오프라인/재방문 실패 때 셸을 사용한다.
  event.respondWith(fetch(request).then(response => {
    if (response.ok && ['document', 'script', 'style'].includes(request.destination)) {
      caches.open(SHELL_CACHE).then(cache => cache.put(request, response.clone()));
    }
    return response;
  }).catch(() => caches.match(request)));
});
