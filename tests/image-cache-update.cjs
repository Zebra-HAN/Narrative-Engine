const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { chromium, webkit } = require('playwright');
const root = path.resolve(__dirname, '..');
const fixture = '/images/core/home/cache-test.svg';
const svg = color => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="${color}"/></svg>`);
let bytes = svg('red');
let oldWorker = true;
let failures = false;
let hits = 0;
let notModified = 0;
const legacyWorker = `const C='narrative-images-v3'; self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));self.addEventListener('fetch',e=>{if(e.request.destination==='image')e.respondWith(caches.open(C).then(async c=>{const r=await c.match(e.request);if(r)return r;const n=await fetch(e.request);await c.put(e.request,n.clone());return n;}));});`;
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === fixture) {
    hits++;
    if (failures) { res.writeHead(503); return res.end('unavailable'); }
    const etag = `"${createHash('sha256').update(bytes).digest('hex')}"`;
    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    if (req.headers['if-none-match'] === etag) { notModified++; res.writeHead(304); return res.end(); }
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.end(bytes);
  }
  if (url.pathname === '/harness.html') {
    res.setHeader('Content-Type', 'text/html');
    return res.end('<img id="fixture" src="' + fixture + '"><script>navigator.serviceWorker.register("./sw.js")</script>');
  }
  if (url.pathname === '/sw.js' && oldWorker) {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-cache');
    return res.end(legacyWorker);
  }
  const filename = path.join(root, url.pathname === '/' ? 'index.html' : url.pathname);
  if (!filename.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
  fs.readFile(filename, (error, data) => {
    if (error) { res.writeHead(404); return res.end(); }
    const mime = { '.js': 'application/javascript', '.css': 'text/css', '.html': 'text/html', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
    res.setHeader('Content-Type', mime[path.extname(filename)] || 'application/octet-stream');
    if (url.pathname === '/sw.js') res.setHeader('Cache-Control', 'no-cache');
    res.end(data);
  });
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const engine = process.env.IMAGE_TEST_ENGINE === 'webkit' ? webkit : chromium;
  const browser = await engine.launch(engine === chromium ? { executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] } : {});
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route(/fonts\.(googleapis|gstatic)\.com/, route => route.abort());
    await page.goto(origin + '/harness.html');
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await page.reload();
    for (let i = 0; i < 100; i++) {
      if (await page.evaluate(async () => !!await (await caches.open('narrative-images-v3')).match('/images/core/home/cache-test.svg'))) break;
      await page.waitForTimeout(100);
    }
    assert((await page.evaluate(async () => (await (await (await caches.open('narrative-images-v3')).match('/images/core/home/cache-test.svg')).text()))).includes('red'));
    oldWorker = false;
    await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
    for (let i = 0; i < 100; i++) {
      const keys = await page.evaluate(() => caches.keys());
      if (keys.includes('narrative-images-v4') && !keys.includes('narrative-images-v3')) break;
      await page.waitForTimeout(100);
    }
    assert((await page.evaluate(async () => (await (await (await caches.open('narrative-images-v4')).match('/images/core/home/cache-test.svg')).text()))).includes('red'), 'migration preserves old offline bytes before validation');
    bytes = svg('blue');
    await page.goto(origin);
    await page.evaluate(fixture => {
      const img = new Image(); img.id = 'cache-fixture'; img.style.cssText = 'position:fixed;top:0;left:0;width:16px;height:16px;z-index:99999'; img.src = fixture; document.body.append(img);
    }, fixture);
    const hash = () => createHash('sha256').update(bytes).digest('hex');
    await page.waitForFunction(hash => document.querySelector('#cache-fixture').src.includes(hash), hash());
    async function cachedHash() {
      return page.evaluate(async fixture => {
        const response = await (await caches.open('narrative-images-v4')).match(fixture);
        return response.headers.get('X-Narrative-Image-Revision');
      }, fixture);
    }
    assert.equal(await cachedHash(), hash(), 'legacy stale bytes replaced automatically');
    const pixel = () => page.evaluate(() => { const img=document.querySelector('#cache-fixture'); const c=document.createElement('canvas'); c.width=c.height=16; const ctx=c.getContext('2d');ctx.drawImage(img,0,0);return [...ctx.getImageData(0,0,1,1).data]; });
    await page.waitForFunction(() => document.querySelector('#cache-fixture').complete);
    assert.deepEqual(await pixel(), [0, 0, 255, 255]);
    const warmHits = hits;
    await page.evaluate(fixture => Promise.all(Array.from({length: 8}, () => new Promise((resolve,reject) => {const img=new Image();img.onload=resolve;img.onerror=reject;img.src=fixture;}))), fixture);
    assert.equal(hits, warmHits, 'warm concurrent preloads require no network');
    const oldSrc = await page.locator('#cache-fixture').getAttribute('src');
    await page.evaluate(() => dispatchEvent(new Event('pageshow')));
    await page.waitForFunction(before => document.querySelector('#cache-fixture').src === before, oldSrc);
    await page.waitForTimeout(500);
    assert(notModified > 0, 'unchanged bytes use conditional 304');
    assert.equal(await page.locator('#cache-fixture').getAttribute('src'), oldSrc, 'unchanged image keeps its automatic version');

    await page.evaluate(() => { goToCreate(); CREATIVE_BACKGROUNDS.character.top = ['cache-test.svg']; switchNav('character', true); });
    await page.waitForFunction(() => visibleBackgroundUrl && !document.querySelector('#center-area').classList.contains('is-background-pending'));
    const selection = await page.evaluate(() => ({url:visibleBackgroundUrl, memory:[...creativeBackgroundMemory]}));
    bytes = svg('lime');
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await page.waitForFunction(hash => document.querySelector('#cache-fixture').src.includes(hash), hash());
    await page.waitForFunction(() => document.querySelector('#cache-fixture').complete);
    assert.deepEqual(await pixel(), [0, 255, 0, 255], 'foreground updates existing pixels without a page reload');
    await page.waitForFunction(hash => document.querySelector('.creative-background-layer.is-active').style.backgroundImage.includes(hash), hash());
    assert.deepEqual(await page.evaluate(() => ({url:visibleBackgroundUrl,memory:[...creativeBackgroundMemory]})), selection, 'foreground preserves random background and route memory');
    await page.evaluate(() => {selectSub('race'); navigateAddressBack();});
    await page.waitForFunction(url => visibleBackgroundUrl === url, selection.url);

    // A failed validation must not make offline bytes count as validated online.
    failures = true;
    await page.evaluate(() => dispatchEvent(new Event('pageshow')));
    await page.waitForTimeout(500);
    assert.equal(await cachedHash(), hash());
    failures = false; bytes = svg('yellow');
    await page.evaluate(() => dispatchEvent(new Event('online')));
    await page.waitForFunction(hash => document.querySelector('#cache-fixture').src.includes(hash), hash());
    await context.setOffline(true);
    await page.reload();
    await page.waitForFunction(() => { try { return typeof IMAGE_LOADER !== 'undefined'; } catch (_) { return false; } });
    await page.evaluate(fixture => IMAGE_LOADER.load(fixture), fixture);
    assert.equal(await cachedHash(), hash(), 'offline shell and migrated image remain available');
    await context.setOffline(false);
    bytes = svg('purple');
    await page.reload();
    await page.evaluate(fixture => IMAGE_LOADER.load(fixture), fixture);
    assert.equal(await cachedHash(), hash(), 'a fresh visit revalidates the same filename');
    assert.equal(await page.evaluate(async fixture => (await (await caches.open('narrative-images-v4')).keys()).filter(r => r.url.includes(fixture)).length, fixture), 1, 'automatic revisions do not multiply persistent cache entries');
    assert.deepEqual(errors, []);
    console.log('PASS migration v3→v4, stale pixels, SHA versions only on changes, warm preload reuse, conditional 304, PWA/pageshow refresh, background/back memory, failed validation recovery and offline reload');
    await context.close();
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); server.close(); process.exitCode=1; });
