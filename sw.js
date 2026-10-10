const SHELL_CACHE = 'narrative-shell-v8';
const IMAGE_CACHE = 'narrative-images-v4';
const LEGACY_IMAGE_CACHE = 'narrative-images-v3';
const REVISION_HEADER = 'X-Narrative-Image-Revision';
const SHELL = ['./', './index.html', './css/style.css', './css/layout-3.css',
  './css/fantasy-bottom-ui.css', './css/fantasy-top-panel.css', './js/app.js',
  './data/character.js', './data/narrative.js', './data/world.js', './data/compass.js'];
const checkedByClient = new Map();
const pending = new Map();
let activationReady = Promise.resolve();

self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL_CACHE).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  activationReady = (async () => {
    // Preserve offline images during migration; validate each one when used online.
    const keys = await caches.keys();
    if (keys.includes(LEGACY_IMAGE_CACHE)) {
      const oldCache = await caches.open(LEGACY_IMAGE_CACHE);
      const cache = await caches.open(IMAGE_CACHE);
      for (const request of await oldCache.keys()) {
        if (!await cache.match(request)) await cache.put(request, await oldCache.match(request));
      }
    }
    const current = new Set([SHELL_CACHE, IMAGE_CACHE]);
    await Promise.all(keys.filter(key => key.startsWith('narrative-') && !current.has(key))
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })();
  event.waitUntil(activationReady);
});

function imageURL(value) {
  const url = new URL(value, self.location.href);
  url.searchParams.delete('__image_revision');
  return url.href;
}

async function revision(response) {
  const existing = response.headers.get(REVISION_HEADER);
  if (existing) return existing;
  const digest = await crypto.subtle.digest('SHA-256', await response.clone().arrayBuffer());
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function imageResponse(response, hash, forBrowser = false) {
  const headers = new Headers(response.headers);
  headers.delete('Content-Encoding');
  headers.delete('Content-Length');
  if (hash) headers.set(REVISION_HEADER, hash);
  // CacheStorage owns reuse. WebKit's memory cache must not hide a new request
  // from this worker after a reload or PWA foreground transition.
  if (forBrowser) headers.set('Cache-Control', 'no-store');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

async function validateImage(url) {
  if (pending.has(url)) return (await pending.get(url)).clone();
  const job = (async () => {
    const cache = await caches.open(IMAGE_CACHE);
    const cached = await cache.match(url);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const headers = new Headers();
      const etag = cached?.headers.get('ETag');
      const modified = cached?.headers.get('Last-Modified');
      if (etag) headers.set('If-None-Match', etag);
      else if (modified) headers.set('If-Modified-Since', modified);
      // Revalidate the HTTP/CDN cache too; an ordinary fetch can still be stale.
      const response = await fetch(url, { cache: 'no-cache', headers, signal: controller.signal });
      if (response.status === 304 && cached) {
        const updated = imageResponse(cached, await revision(cached));
        await cache.put(url, updated.clone());
        return updated;
      }
      if (!response.ok) {
        if (cached) {
          const fallback = imageResponse(cached, cached.headers.get(REVISION_HEADER));
          fallback.headers.set('X-Narrative-Offline', '1');
          return fallback;
        }
        return response;
      }
      const hash = await revision(response);
      const oldHash = cached && await revision(cached);
      const updated = imageResponse(response, hash);
      await cache.put(url, updated.clone());
      if (oldHash && oldHash !== hash) {
        for (const client of await self.clients.matchAll({ type: 'window', includeUncontrolled: true })) {
          client.postMessage({ type: 'IMAGE_UPDATED', url, revision: hash });
        }
      }
      return updated;
    } catch (error) {
      if (cached) {
        const fallback = imageResponse(cached, cached.headers.get(REVISION_HEADER));
        fallback.headers.set('X-Narrative-Offline', '1');
        return fallback;
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  })();
  pending.set(url, job);
  try { return (await job).clone(); }
  finally { if (pending.get(url) === job) pending.delete(url); }
}

async function serveImage(value, clientId) {
  await activationReady;
  const url = imageURL(value);
  let checked = checkedByClient.get(clientId);
  if (!checked) checkedByClient.set(clientId, checked = new Set());
  const cache = await caches.open(IMAGE_CACHE);
  let response = checked.has(url) && await cache.match(url);
  if (!response) {
    response = await validateImage(url);
    // Offline fallback is useful, but must not suppress the next online check.
    if (response.ok && response.headers.has(REVISION_HEADER) && !response.headers.has('X-Narrative-Offline')) checked.add(url);
  }
  return imageResponse(response, response.headers.get(REVISION_HEADER), true);
}

self.addEventListener('message', event => {
  if (event.data?.type !== 'REFRESH_IMAGES' || !event.source?.id) return;
  event.waitUntil((async () => {
    checkedByClient.delete(event.source.id);
    const urls = [...new Set((event.data.urls || []).filter(value => {
      try {
        const url = new URL(value);
        return url.origin === self.location.origin && /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(url.pathname);
      } catch (_) { return false; }
    }).map(imageURL))];
    // Only displayed images, at most four conditional requests in parallel.
    for (let index = 0; index < urls.length; index += 4) {
      await Promise.allSettled(urls.slice(index, index + 4).map(url => serveImage(url, event.source.id)));
    }
    const live = new Set((await self.clients.matchAll({ type: 'window', includeUncontrolled: true })).map(client => client.id));
    for (const id of checkedByClient.keys()) if (!live.has(id)) checkedByClient.delete(id);
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.destination === 'image') {
    event.respondWith(serveImage(url.href, event.clientId));
    return;
  }
  // App code remains network-first, with the existing offline shell fallback.
  event.respondWith(fetch(request).then(response => {
    if (response.ok && ['document', 'script', 'style'].includes(request.destination)) {
      event.waitUntil(caches.open(SHELL_CACHE).then(cache => cache.put(request, response.clone())));
    }
    return response;
  }).catch(() => caches.match(request)));
});
