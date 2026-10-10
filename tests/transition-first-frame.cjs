const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  const baseline = execFileSync('git', ['show', 'ed1d1df:js/app.js'], { encoding: 'utf8' });
  const results = {};
  try {
    for (const mode of ['before', 'after']) {
      const context = await browser.newContext({ viewport: { width: 393, height: 852 }, serviceWorkers: 'block' });
      const page = await context.newPage(); const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
      if (mode === 'before') await page.route('**/js/app.js', r => r.fulfill({ contentType: 'text/javascript', body: baseline }));
      await page.goto(process.env.PERF_TEST_URL || 'http://127.0.0.1:8008/');
      await page.waitForTimeout(1600);
      await page.evaluate(async () => {
        Math.random = () => 0; goToCreate(); switchNav('character', true); selectSub('race');
        await IMAGE_LOADER.preload(CREATIVE_BACKGROUND_SOURCES, { background: false });
      });
      await page.waitForTimeout(600); results[mode] = [];
      for (const restored of [false, true]) {
        await page.evaluate(() => showGroupCards('race', 2)); await page.waitForTimeout(1400);
        if (restored) await page.evaluate(() => {
          const source = document.querySelector('.center-page.active[data-chrome-view]');
          source.querySelectorAll('.data-card')[99].scrollIntoView({ block: 'start', behavior: 'instant' });
          source.dispatchEvent(new Event('scroll'));
        });
        await page.waitForTimeout(100); await page.evaluate(() => navigateAddressBack()); await page.waitForTimeout(600);
        const sample = await page.evaluate(async () => {
          const frames = []; let blocked = false;
          const observer = new MutationObserver(() => {
            const source = document.querySelector('.center-page.active[data-chrome-view]');
            if (!source || source.dataset.chromeView !== 'cards') return;
            observer.disconnect();
            // Emulate a costly initial render after route RAF callbacks but
            // before the first paint, independent of image requests or caching.
            requestAnimationFrame(() => {
              const end = performance.now() + 420;
              while (performance.now() < end) { /* one controlled long frame */ }
              blocked = true;
            });
          });
          observer.observe(document.getElementById('center-area'), { childList: true });
          const start = performance.now(); showGroupCards('race', 2);
          await new Promise(resolve => {
            function frame() {
              const incoming = document.querySelector('.creative-background-layer.is-incoming');
              frames.push({ t: performance.now() - start, opacity: incoming ? Number(getComputedStyle(incoming).opacity) : null,
                panel: document.getElementById('info-panel').style.transform });
              if (performance.now() - start < 1300) requestAnimationFrame(frame); else resolve();
            }
            requestAnimationFrame(frame);
          });
          return { frames, blocked, scroll: document.querySelector('.center-page.active[data-chrome-view]').scrollTop };
        });
        assert(sample.blocked); if (restored) assert(sample.scroll > 1000);
        const intermediate = sample.frames.filter(f => f.opacity > 0 && f.opacity < 1).length;
        const panelFrames = sample.frames.filter(f => { const match = f.panel.match(/(-?[\d.]+)%/); const progress = match ? Math.abs(Number(match[1])) : 0; return progress > 0 && progress < 100; }).length;
        results[mode].push({ fade: intermediate, panel: panelFrames });
        if (mode === 'after') {
          assert(intermediate >= 3, 'fade must retain intermediate frames after slow first paint');
          assert.equal(await page.locator('.creative-background-layer.is-incoming').count(), 0);
          assert.equal(await page.locator('.center-page.active .data-card').count(), 139);
          await page.waitForFunction(() => [...document.querySelectorAll('.center-page.active .data-card')].every(n => getComputedStyle(n).opacity === '1'));
          assert(panelFrames >= 3, 'panel must retain intermediate movement after slow first paint');
        }
        console.log(`${mode} ${restored ? 'restored card 100' : 'top'}: ${intermediate} intermediate fade frames, ${panelFrames} panel frames`);
      }
      if (mode === 'after') {
        await page.evaluate(async () => {
          selectSub('race'); await new Promise(resolve => requestAnimationFrame(resolve));
          showGroupCards('race', 2); await new Promise(resolve => requestAnimationFrame(resolve));
          selectSub('race');
        });
        await page.waitForTimeout(600);
        assert.equal(await page.locator('.center-page.active[data-chrome-view]').getAttribute('id'), 'page-race');
        assert.equal(await page.locator('.creative-background-layer.is-active').getAttribute('data-background-owner'), 'character:group:group:race');
        assert.equal(await page.locator('.creative-background-layer.is-incoming').count(), 0);
        assert.equal(await page.locator('#info-panel').evaluate(n => n.style.transform), 'translate3d(0px, -100%, 0px)');
        console.log('PASS navigation during queued frame: final background owner and panel state preserved');
      }
      assert.deepEqual(errors, []); await context.close();
    }
    assert(results.after[1].fade > results.before[1].fade, 'restored-position fade regression must improve');
    console.log('PASS initial long-frame regression, top/restored fades, scroll memory and final card visibility');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
