const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 393, height: 852 }, serviceWorkers: 'block' });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await page.goto(process.env.PERF_TEST_URL); await page.waitForTimeout(1600);
    await page.evaluate(() => { goToCreate(); switchNav('character', true); });
    await page.waitForTimeout(500);
    const state = () => page.evaluate(() => {
      const source = (document.querySelector('.center-page.active[data-chrome-view]') || document.querySelector('.center-page.active'));
      return { top: document.getElementById('info-panel').style.transform,
        bottom: document.getElementById('create-chrome-bottom').style.transform,
        button: !document.getElementById('card-panel-toggle').hidden,
        scroll: source.scrollTop, height: source.scrollHeight, width: source.clientWidth };
    });
    const hidden = s => { assert(s.top.includes('-100%')); assert(s.bottom.includes('100%')); assert(s.button); };
    const wheel = delta => page.evaluate(delta => document.getElementById('center-area').dispatchEvent(new WheelEvent('wheel', { deltaY: delta, bubbles: true })), delta);
    // Start with visible panels and sample every first-entry frame.
    const frames = await page.evaluate(async () => {
      showGroupCards('race', 2);
      const frames = []; const start = performance.now();
      await new Promise(resolve => {
        function frame() {
          frames.push([document.getElementById('info-panel').style.transform, document.getElementById('create-chrome-bottom').style.transform]);
          if (frames.length < 12) requestAnimationFrame(frame); else resolve();
        } requestAnimationFrame(frame);
      }); return frames;
    });
    assert(frames.length > 2); assert(frames.every(([top, bottom]) => top.includes('-100%') && bottom.includes('100%')));
    hidden(await state()); await wheel(-100); await page.waitForTimeout(350); hidden(await state());
    for (const index of [69, 99]) {
      await page.waitForTimeout(1300);
      const saved = await page.evaluate(index => {
        const source = (document.querySelector('.center-page.active[data-chrome-view]') || document.querySelector('.center-page.active'));
        source.querySelectorAll('.data-card')[index].scrollIntoView({ block: 'start', behavior: 'instant' });
        source.dispatchEvent(new Event('scroll')); return source.scrollTop;
      }, index);
      await page.waitForTimeout(80); await page.evaluate(() => navigateAddressBack());
      await page.waitForTimeout(350); await page.evaluate(() => showGroupCards('race', 2));
      await page.waitForTimeout(100); hidden(await state()); assert(Math.abs((await state()).scroll - saved) < 1);
      const before = await state();
      await page.locator('#card-panel-toggle').click(); await page.waitForTimeout(350);
      const opened = await state(); assert(!opened.button); assert(opened.top.includes('0%')); assert(opened.bottom.includes('0%'));
      assert.equal(opened.scroll, before.scroll); assert.equal(opened.height, before.height); assert.equal(opened.width, before.width);
      await wheel(100); await page.waitForTimeout(350); hidden(await state());
      await wheel(-100); await page.waitForTimeout(350); hidden(await state());
      await page.evaluate(() => { const source = (document.querySelector('.center-page.active[data-chrome-view]') || document.querySelector('.center-page.active')); source.scrollTop = 0; source.dispatchEvent(new Event('scroll')); });
      await page.waitForTimeout(350); hidden(await state());
      await page.locator('#card-panel-toggle').click(); await page.waitForTimeout(350); assert(!(await state()).button);
      console.log(`PASS card ${index + 1}: hidden entry, restored scroll, button show, scroll hide/lock, unchanged geometry`);
    }
    await page.evaluate(() => navigateAddressBack()); await page.waitForTimeout(350);
    assert(!(await state()).button);
    await wheel(-100); await page.waitForTimeout(350); assert((await state()).top.includes('0%'));
    await wheel(100); await page.waitForTimeout(350); assert((await state()).top.includes('-100%'));
    await page.evaluate(() => switchNav('compass', true)); await page.waitForTimeout(350);
    assert(!(await state()).button); assert((await state()).top.includes('0%'));
    assert.deepEqual(errors, []);
    console.log('PASS first-entry frames without flash; group/category unchanged; no JS errors');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
