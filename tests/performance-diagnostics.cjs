const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.env.PERF_TEST_URL || 'http://127.0.0.1:8001';
const fixtures = [
  { id: 'race', nav: 'character', g: 2, cards: 139 },
  { id: 'race', nav: 'character', g: 1, sg: 0, cards: 4 },
  { id: 'race', nav: 'character', g: 1, sg: 1, cards: 20 },
  { id: 'experience', nav: 'compass', g: 1, cards: 116 },
  { id: 'attribute', nav: 'character', g: 2, cards: 2 }
];
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true,
      serviceWorkers: 'block', permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await context.newPage();
    const errors = [], diagnosticRequests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (request.url().includes('perf-diagnostics.js')) diagnosticRequests.push(request.url()); });
    await page.route('**/*', route => /fonts\.(googleapis|gstatic)\.com/.test(route.request().url()) ? route.abort() : route.continue());
    await page.goto(base);
    await page.waitForTimeout(1600);
    assert.equal(await page.evaluate(() => !!window.APP_PERF), false);
    assert.equal(diagnosticRequests.length, 0, 'normal visits must not fetch diagnostics');
    await page.goto(base + '/?perf=1');
    await page.waitForTimeout(1600);
    assert.equal(await page.evaluate(() => APP_PERF.recording), false);
    const controls = page.locator('#perf-diagnostics');
    assert.equal(await controls.locator('section').isVisible(), true);
    await page.evaluate(() => goToCreate());
    const cdp = await context.newCDPSession(page);
    const touch = (type, x) => cdp.send('Input.dispatchTouchEvent', { type,
      touchPoints: type === 'touchEnd' || type === 'touchCancel' ? [] : [{ x, y: 420 }] });
    const reports = [];
    for (const fixture of fixtures) {
      await page.evaluate(f => { switchNav(f.nav, true); selectSub(f.id); if (f.sg !== undefined) showSubgroupPage(f.id, f.g); }, fixture);
      await page.waitForTimeout(350);
      await controls.locator('#start').click();
      await page.evaluate(f => { if (f.sg === undefined) showGroupCards(f.id, f.g); else showSubgroupCards(f.id, f.g, f.sg); }, fixture);
      await page.waitForTimeout(650);
      // Card entry now hides chrome immediately; its animation is user-triggered.
      if (await page.locator('#card-panel-toggle').isVisible()) {
        await page.locator('#card-panel-toggle').click();
        await page.waitForTimeout(350);
      }
      assert.equal(await page.locator('.center-page.active[data-chrome-view] .data-card').count(), fixture.cards);
      if (fixture.cards === 20) assert.equal(await page.locator('.center-page.active .card-section-header').count(), 3);
      // Existing information/select/lock/detail behavior must survive instrumentation.
      if (fixture.cards === 139) {
        await page.locator('.center-page.active[data-chrome-view] .data-card').first().click();
        await page.locator('.card-info-select').click();
        await page.locator('.card-info-lock').click();
        assert.equal(await page.locator('.card-info-select').isDisabled(), true);
        assert.equal(await page.locator('.card-info-lock').getAttribute('aria-pressed'), 'true');
        await page.locator('.card-info-detail').click();
        assert.equal(await page.locator('#detail-overlay').evaluate(e => e.classList.contains('active')), true);
        await page.evaluate(() => closeDetailSheet());
        await page.locator('.card-info-lock').click();
        await page.locator('.card-info-select').click();
        await page.locator('.center-page.active[data-chrome-view] .data-card').first().click();
        await page.waitForTimeout(220);
        assert.equal(await page.locator('.card-info-popover:not(.is-closing)').count(), 0);
        await page.evaluate(() => { document.querySelector('.center-page.active[data-chrome-view]').scrollTop = 180; });
        await page.waitForTimeout(100);
      }
      await touch('touchStart', 30); await touch('touchMove', 50); await touch('touchCancel');
      await page.waitForTimeout(220);
      assert.equal(await page.locator('.center-page.active[data-chrome-view]').getAttribute('data-chrome-view'), 'cards');
      await touch('touchStart', 30); await touch('touchMove', 90); await touch('touchMove', 160); await touch('touchEnd');
      await page.waitForTimeout(450);
      assert.equal(await page.locator('.center-page.active[data-chrome-view]').getAttribute('data-chrome-view'), fixture.sg === undefined ? 'group' : 'subgroup');
      if (fixture.cards === 139) {
        await page.evaluate(f => showGroupCards(f.id, f.g), fixture);
        await page.waitForTimeout(450);
        assert.equal(await page.locator('.center-page.active[data-chrome-view]').evaluate(e => e.scrollTop), 180);
        await page.evaluate(() => navigateAddressBack());
        await page.waitForTimeout(250);
      }
      if (fixture.sg !== undefined) {
        await touch('touchStart', 30); await touch('touchMove', 160); await touch('touchEnd');
        await page.waitForTimeout(250);
        assert.equal(await page.locator('.center-page.active[data-chrome-view]').getAttribute('data-chrome-view'), 'group');
      }
      await controls.locator('#stop').click();
      const report = await page.evaluate(() => JSON.parse(APP_PERF.report()));
      reports.push(report);
      assert.equal(report.recording, false);
      for (const name of ['transition.start', 'swipe.drag-start', 'swipe.decision', 'navigateAddressBack',
        'gesture.onTouchEnd', 'fitAllCardTitles', 'fitInfoPanelText', 'observer.MutationObserver.callback',
        'scroll.read', 'background.request', 'panel.animation-start', 'panel.animation-finish',
        'render-opportunity-proxy.second-raf']) {
        assert(report.events.some(event => event.name === name), `missing ${name} on ${fixture.id}/${fixture.g}`);
      }
      assert(report.frames.length > 0 && report.frames.every(frame => report.screens[frame.screen]));
      assert(report.observers.length <= 64);
      const count = report.events.length;
      await page.waitForTimeout(120);
      assert.equal(await page.evaluate(() => JSON.parse(APP_PERF.report()).events.length), count, 'stop must freeze log');
      console.log(`PASS ${fixture.id}/${fixture.g}: ${fixture.cards} cards, cancel/back${fixture.sg === undefined ? '' : '/consecutive back'}`);
    }
    const eventNames = new Set(reports.flatMap(report => report.events.map(event => event.name)));
    for (const name of ['background.fade-start', 'background.fade-finish', 'image.prepare', 'image.decode', 'scroll.restore']) {
      assert(eventNames.has(name), `missing phase ${name}`);
    }
    await controls.locator('#copy').click();
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    assert.equal(JSON.parse(clipboard).format, 'narrative-perf-v1');
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: () => Promise.reject(new Error('denied'))
    } }));
    await controls.locator('#copy').click();
    assert.equal(await controls.locator('#output').isVisible(), true);
    assert.equal(JSON.parse(await controls.locator('#output').inputValue()).format, 'narrative-perf-v1');
    await controls.locator('#start').click();
    await page.evaluate(() => { for (let n = 0; n < 3100; n++) APP_PERF.mark('test.limit'); });
    const limited = await page.evaluate(() => JSON.parse(APP_PERF.report()));
    assert.equal(limited.stopReason, 'event-limit');
    assert.equal(limited.recording, false);
    assert(limited.events.length <= 3000);
    // An async span from a previous recording cannot leak into a new recording.
    await page.evaluate(() => { APP_PERF.start(); window.oldPerfToken = APP_PERF.begin('test.old'); APP_PERF.stop(); APP_PERF.start(); APP_PERF.end(oldPerfToken); APP_PERF.stop(); });
    assert.equal(await page.evaluate(() => JSON.parse(APP_PERF.report()).events.some(e => e.name === 'test.old')), false);
    await page.setViewportSize({ width: 320, height: 568 });
    const bounds = await controls.locator('section').boundingBox();
    assert(bounds.x >= 0 && bounds.x + bounds.width <= 320, 'developer controls fit narrow iPhone width');
    await page.goto(base);
    assert.equal(await page.evaluate(() => !!window.APP_PERF), false, 'normal URL must never inherit opt-in');
    await page.goto(base + '/?perf=1');
    await controls.locator('#disable').click();
    await page.waitForURL('**perf=0');
    await page.waitForLoadState();
    assert.equal(await page.evaluate(() => !!window.APP_PERF), false);
    await page.goto(base);
    assert.equal(await page.evaluate(() => !!window.APP_PERF), false, 'disable clears persisted opt-in');
    assert.deepEqual(errors, []);
    await context.close();
    console.log('PASS query-only opt-in/off, frozen/bounded logs, isolated sessions, clipboard and fallback; no JS errors');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
