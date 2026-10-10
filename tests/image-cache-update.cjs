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
let responseDelay = 0;
const legacyWorker = `const C='narrative-images-v3'; self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));self.addEventListener('fetch',e=>{if(e.request.destination==='image')e.respondWith(caches.open(C).then(async c=>{const r=await c.match(e.request);if(r)return r;const n=await fetch(e.request);await c.put(e.request,n.clone());return n;}));});`;
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === fixture) {
    hits++;
    if (failures) { res.writeHead(503); return res.end('unavailable'); }
    const etag = `"${createHash('sha256').update(bytes).digest('hex')}"`;
    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    if (req.headers['if-none-match'] === etag) { notModified++; res.writeHead(304); return setTimeout(() => res.end(), responseDelay); }
    res.setHeader('Content-Type', 'image/svg+xml');
    const body = bytes;
    return setTimeout(() => res.end(body), responseDelay);
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
    const backgroundPixel = async () => {
      const clip = await page.locator('#center-area').evaluate(element => {
        const r=element.getBoundingClientRect();return {x:r.left+3,y:r.top+r.height/2,width:2,height:2};
      });
      const screenshot = await page.screenshot({clip});
      return page.evaluate(async base64 => {
        const image=new Image();image.src='data:image/png;base64,'+base64;await image.decode();
        const canvas=document.createElement('canvas');canvas.width=canvas.height=2;
        const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);return [...ctx.getImageData(0,0,1,1).data];
      }, screenshot.toString('base64'));
    };
    const pixel = () => page.evaluate(() => { const img=document.querySelector('#cache-fixture'); const c=document.createElement('canvas'); c.width=c.height=16; const ctx=c.getContext('2d');ctx.drawImage(img,0,0);return [...ctx.getImageData(0,0,1,1).data]; });
    await page.waitForFunction(() => document.querySelector('#cache-fixture').complete);
    assert.deepEqual(await pixel(), [0, 0, 255, 255]);
    await page.waitForTimeout(500); // Let the startup/takeover refresh finish before measuring reuse.
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
    await page.waitForTimeout(1000);
    // Hold both network and decoded replacement: the old node and background
    // must remain painted, rather than merely eventually displaying new bytes.
    const beforeSwap = await page.evaluate(() => ({src:document.querySelector('#cache-fixture').src,
      background:document.querySelector('.creative-background-layer.is-active').style.backgroundImage}));
    await page.evaluate(() => {
      window.flashFrames = [];
      window.stopFlashProbe = false;
      const probe = () => {
        const img = document.querySelector('#cache-fixture');
        const layers = [...document.querySelectorAll('.creative-background-layer')];
        flashFrames.push({complete:img?.complete, width:img?.naturalWidth,
          opacity:img && getComputedStyle(img).opacity,
          covered:layers.some(layer => layer.style.backgroundImage !== 'none' && Number(getComputedStyle(layer).opacity) >= 0.99)});
        if (!stopFlashProbe) requestAnimationFrame(probe);
      };
      requestAnimationFrame(probe);
      window.nativeImageDecode = HTMLImageElement.prototype.decode;
      window.decodeGate = new Promise(resolve => window.releaseDecode = resolve);
      HTMLImageElement.prototype.decode = async function () {
        await nativeImageDecode.call(this);
        if (this.src.includes('__image_revision')) await decodeGate;
      };
    });
    responseDelay = 350;
    bytes = svg('lime');
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await page.waitForTimeout(600);
    assert.deepEqual(await page.evaluate(() => ({src:document.querySelector('#cache-fixture').src,
      background:document.querySelector('.creative-background-layer.is-active').style.backgroundImage})), beforeSwap,
      'old pixels and URLs survive network completion until replacement decode finishes');
    assert.deepEqual(await pixel(), [0, 0, 255, 255]);
    assert.deepEqual(await backgroundPixel(), [0,0,255,255], 'screenshot pixels stay blue during pending decode');
    await page.evaluate(fixture => navigator.serviceWorker.controller.postMessage({type:'REFRESH_IMAGES',urls:[location.origin+fixture]}), fixture);
    await page.waitForTimeout(30);
    const started = Date.now();
    await page.evaluate(fixture => new Promise((resolve, reject) => {
      const image = new Image(); image.onload=resolve; image.onerror=reject;
      image.src = fixture + '?__image_revision=' + 'f'.repeat(64);
    }), fixture);
    assert(Date.now() - started < 300, 'cached image response must not wait for slow validation');
    await page.evaluate(() => {releaseDecode();HTMLImageElement.prototype.decode=nativeImageDecode;});
    responseDelay = 0;
    await page.waitForFunction(hash => document.querySelector('#cache-fixture').src.includes(hash), hash());
    await page.waitForFunction(() => document.querySelector('#cache-fixture').complete);
    assert.deepEqual(await pixel(), [0, 255, 0, 255], 'foreground updates existing pixels without a page reload');
    await page.waitForFunction(hash => document.querySelector('.creative-background-layer.is-active').style.backgroundImage.includes(hash), hash());
    assert.deepEqual(await backgroundPixel(), [0,255,0,255], 'prepared green background paints without a white replacement');
    await page.waitForTimeout(150);
    const frames = await page.evaluate(() => {stopFlashProbe=true;return flashFrames;});
    assert(frames.length > 20);
    assert(frames.every(frame => frame.complete && frame.width > 0 && frame.opacity === '1' && frame.covered), 'no frame may expose an empty img or uncovered background');
    assert.deepEqual(await page.evaluate(() => ({url:visibleBackgroundUrl,memory:[...creativeBackgroundMemory]})), selection, 'foreground preserves random background and route memory');
    await page.evaluate(() => {selectSub('race'); navigateAddressBack();});
    await page.waitForFunction(url => visibleBackgroundUrl === url, selection.url);

    await page.evaluate(fixture => {
      CARD_DATA.cacheProbe = {groups:[{id:'probe',label:'Probe',img:fixture,cards:[{name:'Probe card',img:fixture,icon:'★'}]}]};
      window.nativeImageDecode = HTMLImageElement.prototype.decode;
      window.pageDecodeGate = new Promise(resolve => window.releasePageDecode=resolve);
      HTMLImageElement.prototype.decode = async function () {await nativeImageDecode.call(this);if(this.src.includes('cache-test')) await pageDecodeGate;};
      window.outgoingPage = document.querySelector('.center-page.active:not(#page-default)') || document.querySelector('#page-default');
      showGroupPage('cacheProbe');
    }, fixture);
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => outgoingPage.isConnected && !document.querySelector('#page-cacheProbe')), true,
      'first group visit must retain outgoing DOM while actual group images decode');
    await page.evaluate(() => {releasePageDecode();HTMLImageElement.prototype.decode=nativeImageDecode;});
    await page.waitForFunction(() => !!document.querySelector('#page-cacheProbe'));
    assert.equal(await page.evaluate(() => [...document.querySelectorAll('#page-cacheProbe img')].every(img=>img.complete&&img.naturalWidth>0&&getComputedStyle(img).opacity==='1')), true);
    await page.evaluate(() => {
      window.pageDecodeGate = new Promise(resolve => window.releasePageDecode=resolve);
      HTMLImageElement.prototype.decode = async function () {await nativeImageDecode.call(this);if(this.src.includes('cache-test')) await pageDecodeGate;};
      showGroupCards('cacheProbe',0);
    });
    await page.waitForTimeout(150);
    assert.equal(await page.locator('#page-cacheProbe').count(), 1, 'group remains while first card visit decodes');
    await page.evaluate(() => {releasePageDecode();HTMLImageElement.prototype.decode=nativeImageDecode;});
    await page.waitForFunction(() => !!document.querySelector('.center-page.active .card-img'));
    for(let i=0;i<3;i++) {
      await page.evaluate(() => showGroupPage('cacheProbe'));
      await page.waitForFunction(() => !!document.querySelector('#page-cacheProbe'));
      await page.evaluate(() => showGroupCards('cacheProbe',0));
      await page.waitForFunction(() => !!document.querySelector('.center-page.active .card-img'));
      assert.equal(await page.evaluate(() => [...document.querySelectorAll('.center-page.active .card-img')].every(img=>img.complete&&img.naturalWidth>0&&getComputedStyle(img).opacity==='1')), true);
    }
    await page.evaluate(() => {
      window.pageDecodeGate = new Promise(resolve => window.releasePageDecode=resolve);
      HTMLImageElement.prototype.decode = async function () {await nativeImageDecode.call(this);if(this.src.includes('cache-test')) await pageDecodeGate;};
      showGroupPage('cacheProbe');showDefaultCenter();
      releasePageDecode();HTMLImageElement.prototype.decode=nativeImageDecode;
    });
    await page.waitForTimeout(150);
    assert.equal(await page.locator('#page-cacheProbe').count(), 0, 'late image decoding cannot restore a cancelled route');
    // Cold home entry must not expose the create canvas before its background.
    responseDelay = 700;
    await page.evaluate(() => {
      goHome();CREATIVE_BACKGROUNDS.character.top=['cache-test.svg?cold=1'];goToCreate();
    });
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => document.querySelector('#screen-home').classList.contains('active')
      && !document.querySelector('#screen-create').classList.contains('active')), true);
    await page.waitForFunction(() => document.querySelector('#screen-create').classList.contains('active'));
    responseDelay = 0;
    await page.evaluate(() => {
      window.backgroundFrames=[];window.stopBackgroundProbe=false;
      const sample=()=>{const layers=[...document.querySelectorAll('.creative-background-layer')];
        backgroundFrames.push(layers.some(layer=>layer.style.backgroundImage!=='none'&&Number(getComputedStyle(layer).opacity)>=0.99));
        if(!stopBackgroundProbe)requestAnimationFrame(sample);};requestAnimationFrame(sample);
    });
    for (const nav of ['world','character','world','character']) {
      await page.evaluate(nav=>switchNav(nav,true),nav);
      await page.waitForTimeout(80);
    }
    await page.waitForTimeout(700);
    assert.equal(await page.evaluate(()=>{stopBackgroundProbe=true;return backgroundFrames.length>10&&backgroundFrames.every(Boolean);}),true,
      'random background/category changes retain opaque prepared coverage in every frame');
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
    for (let i=0; i<100 && await cachedHash() !== hash(); i++) await page.waitForTimeout(50);
    assert.equal(await cachedHash(), hash(), 'a fresh visit revalidates the same filename in the background');
    assert.equal(await page.evaluate(async fixture => (await (await caches.open('narrative-images-v4')).keys()).filter(r => r.url === location.origin + fixture).length, fixture), 1, 'automatic revisions do not multiply persistent cache entries');
    assert.deepEqual(errors, []);
    console.log('PASS frame-by-frame complete images/opaque backgrounds, screenshot pixels, decode-gated group/card visits, cancelled routes, slow cached responses, migration v3→v4, stale pixels, SHA versions only on changes, warm preload reuse, conditional 304, PWA/pageshow refresh, background/back memory, failed validation recovery and offline reload');
    await context.close();
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); server.close(); process.exitCode=1; });
