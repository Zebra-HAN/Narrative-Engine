const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 375, height: 667 }, serviceWorkers: 'block' });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', r => /fonts\.(googleapis|gstatic)\.com/.test(r.request().url()) ? r.abort() : r.continue());
    await page.goto(process.env.PERF_TEST_URL || 'http://127.0.0.1:8001');
    await page.waitForTimeout(1700);
    await page.evaluate(() => { goToCreate(); switchNav('character', true); selectSub('race'); showSubgroupPage('race', 1); });
    await page.waitForTimeout(450);
    const enter = () => page.evaluate(() => showSubgroupCards('race', 1, 1));
    await enter();
    await page.waitForTimeout(100);
    const initial = await page.evaluate(() => {
      const source = document.querySelector('.center-page.active[data-chrome-view]');
      window.revealSource = source;
      window.revealBefore = [...source.querySelectorAll('.card-name-text')].map(n => n.style.cssText);
      return { cards: source.querySelectorAll('.data-card').length,
        headers: source.querySelectorAll('.card-section-header').length,
        suspended: source.querySelectorAll('.card-reveal-suspended').length,
        delays: [...source.querySelectorAll('.data-card')].map(n => n.style.animationDelay),
        durations: [...source.querySelectorAll('.data-card')].map(n => getComputedStyle(n).getPropertyValue('--card-reveal-duration')) };
    });
    assert.equal(initial.cards, 20); assert.equal(initial.headers, 3);
    assert.equal(initial.suspended, 0, 'offscreen cards are finalized at entry');
    assert(initial.durations.every(v => v === '450ms'));
    await page.evaluate(() => {
      const source = revealSource;
      source.scrollTop = source.scrollHeight;
      source.dispatchEvent(new Event('scroll'));
    });
    assert.equal(await page.evaluate(() => {
      const source = revealSource; const view = source.getBoundingClientRect();
      return [...source.querySelectorAll('.card-reveal-suspended')].filter(n => {
        const r = n.getBoundingClientRect(); return r.top < view.bottom && r.bottom > view.top;
      }).length;
    }), 0, 'fast scroll must keep skipped cards ready');
    assert.deepEqual(await page.evaluate(() => [...revealSource.querySelectorAll('.card-name-text')].map(n => n.style.cssText)), await page.evaluate(() => revealBefore));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(80);
    assert.equal(await page.evaluate(() => {
      const view = revealSource.getBoundingClientRect();
      return [...revealSource.querySelectorAll('.card-reveal-suspended')].filter(n => { const r=n.getBoundingClientRect(); return r.top<view.bottom&&r.bottom>view.top; }).length;
    }), 0);
    await page.evaluate(() => navigateAddressBack());
    await page.waitForTimeout(100);
    assert.equal(await page.evaluate(() => revealSource.isConnected), false);
    assert.equal(await page.evaluate(() => revealSource.querySelectorAll('.card-reveal-suspended').length), 0, 'detach cleans waiting cards');
    await enter(); await page.waitForTimeout(80);
    assert.deepEqual(await page.locator('.center-page.active .data-card').evaluateAll(nodes => nodes.map(n => n.style.animationDelay)), initial.delays);
    await page.waitForTimeout(1400);
    assert.equal(await page.locator('.center-page.active .card-reveal-suspended').count(), 0);
    assert.equal(await page.locator('.center-page.active .card-deal').count(), 0);
    assert.equal(await page.locator('.center-page.active .data-card').evaluateAll(nodes => nodes.every(n => getComputedStyle(n).opacity === '1')), true);
    await page.evaluate(() => { navigateAddressBack(); showSubgroupCards('race', 1, 0); });
    await page.waitForTimeout(60);
    assert.equal(await page.locator('.center-page.active .card-reveal-suspended').count(), 0, '4-card control has no suspended cards');
    assert.deepEqual(errors, []);
    console.log('PASS sections, unchanged delays/duration, skipped cards ready on scroll/resize, title styles, detach/re-entry and 4-card control');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
