const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const measurements = {};
  try {
    for (const mode of ['before', 'after']) {
      const context = await browser.newContext({ viewport: { width: 393, height: 852 }, serviceWorkers: 'block' });
      const page = await context.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
      await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
      if (mode === 'before') await page.route('**/js/app.js', r => r.fulfill({ contentType: 'text/javascript', body: execFileSync('git', ['show', '1ad1d16:js/app.js'], { encoding: 'utf8' }) }));
      const cdp = await context.newCDPSession(page); let layers = [];
      cdp.on('LayerTree.layerTreeDidChange', e => { layers = e.layers || []; }); await cdp.send('LayerTree.enable');
      await page.goto(process.env.PERF_TEST_URL); await page.waitForTimeout(1600);
      await page.evaluate(() => { goToCreate(); switchNav('character', true); selectSub('race'); });
      await page.waitForTimeout(1200);
      const snapshot = () => page.evaluate(() => ['info-panel', 'create-chrome-bottom'].map(id => {
        const n = document.getElementById(id), s = getComputedStyle(n);
        return { visibility: s.visibility, willChange: s.willChange, height: n.getBoundingClientRect().height, transform: s.transform };
      }));
      measurements[mode] = { layers: layers.length || null, drawingLayers: layers.length ? layers.filter(l => l.drawsContent).length : null, panels: await snapshot() };
      if (mode === 'after') {
        assert((await snapshot()).every(n => n.visibility === 'hidden' && n.willChange === 'auto' && n.height > 0));
        const geometry = (await snapshot()).map(n => n.height);
        const animate = delta => page.evaluate(async delta => {
          const frames = []; const start = performance.now();
          document.getElementById('center-area').dispatchEvent(new WheelEvent('wheel', { deltaY: delta, bubbles: true }));
          await new Promise(resolve => {
            function frame() {
              frames.push(['info-panel', 'create-chrome-bottom'].map(id => {
                const n = document.getElementById(id), s = getComputedStyle(n);
                return { visible: s.visibility, y: new DOMMatrixReadOnly(s.transform).m42, height: n.getBoundingClientRect().height };
              }));
              if (performance.now() - start < 450 || frames.length < 12) requestAnimationFrame(frame); else resolve();
            } requestAnimationFrame(frame);
          }); return frames;
        }, delta);
        const shown = await animate(-100);
        assert(shown.filter(f => f.every(n => n.visible === 'visible' && Math.abs(n.y) > 1 && Math.abs(n.y) < n.height - 1)).length >= 3);
        assert((await snapshot()).every(n => n.visibility === 'visible'));
        const hidden = await animate(100);
        assert(hidden.filter(f => f.every(n => n.visible === 'visible' && Math.abs(n.y) > 1 && Math.abs(n.y) < n.height - 1)).length >= 3, JSON.stringify(hidden));
        assert((await snapshot()).every(n => n.visibility === 'hidden'));
        assert.deepEqual((await snapshot()).map(n => n.height), geometry);
        const topFrames = await page.evaluate(async () => {
          switchNav('character', true); const frames = []; const start = performance.now();
          await new Promise(resolve => {
            function frame() {
              frames.push(['info-panel', 'create-chrome-bottom'].map(id => {
                const n = document.getElementById(id), s = getComputedStyle(n);
                return { visibility: s.visibility, y: new DOMMatrixReadOnly(s.transform).m42, height: n.getBoundingClientRect().height };
              }));
              if (performance.now() - start < 900 || frames.length < 12) requestAnimationFrame(frame); else resolve();
            } requestAnimationFrame(frame);
          }); return frames;
        });
        assert(topFrames.filter(f => f.every(n => n.visibility === 'visible' && Math.abs(n.y) > 1 && Math.abs(n.y) < n.height - 1)).length >= 3, 'group to top retains intermediate entry frames');
        assert((await snapshot()).every(n => n.visibility === 'visible'), 'top/category restore');
        await page.evaluate(() => { selectSub('race'); goHome(); }); await page.waitForTimeout(900);
        assert(await page.locator('#screen-home').evaluate(n => n.classList.contains('active') && n.classList.contains('home-animate')));
        assert.equal(await page.locator('#screen-home').evaluate(n => getComputedStyle(n, '::before').animationName), 'homeRoyalBannerDrop');
        await page.evaluate(() => goToCreate()); await page.waitForTimeout(1200);
        assert((await snapshot()).every(n => n.visibility === 'visible'), 'home to create restores paint');
        await page.evaluate(() => {
          selectSub('race'); showGroupCards('race', 2);
          document.getElementById('card-panel-toggle').click(); navigateAddressBack();
          showGroupCards('race', 2); navigateAddressBack();
        }); await page.waitForTimeout(900);
        assert((await snapshot()).every(n => n.visibility === 'hidden'));
        console.log('PASS hidden paint/layer-hint exclusion, show/hide intermediate frames, stable heights, home/top restore, rapid interrupted navigation');
      }
      assert.deepEqual(errors, []); await context.close();
    }
    assert.deepEqual(measurements.after.panels.map(n => n.height), measurements.before.panels.map(n => n.height));
    console.log('COMPOSITOR MEASUREMENT ' + JSON.stringify(measurements));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
