const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const baseline = execFileSync('git', ['show', '71896e2:js/app.js'], { encoding: 'utf8' });
  let reproduced = 0;
  try {
    for (const mode of ['before', 'after']) {
      const context = await browser.newContext({ viewport: { width: 393, height: 852 }, serviceWorkers: 'block' });
      const page = await context.newPage(); const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
      if (mode === 'before') await page.route('**/js/app.js', r => r.fulfill({ contentType: 'text/javascript', body: baseline }));
      await page.goto(process.env.PERF_TEST_URL); await page.waitForTimeout(1600);
      await page.evaluate(() => { goToCreate(); switchNav('character', true); selectSub('race'); });
      for (const index of [0, 69, 99]) for (const opened of [false, true]) {
        await page.evaluate(() => showGroupCards('race', 2)); await page.waitForTimeout(1300);
        await page.evaluate(index => {
          const source = document.querySelector('.center-page.active[data-chrome-view]');
          source.querySelectorAll('.data-card')[index].scrollIntoView({ block: 'start', behavior: 'instant' });
          source.dispatchEvent(new Event('scroll'));
        }, index);
        await page.waitForTimeout(100);
        if (opened) { await page.locator('#card-panel-toggle').click(); await page.waitForTimeout(350); }
        const frames = await page.evaluate(async () => {
          navigateAddressBack(); const frames = []; const start = performance.now();
          await new Promise(resolve => {
            function frame() {
              const top = document.getElementById('info-panel'), bottom = document.getElementById('create-chrome-bottom');
              const t = new DOMMatrixReadOnly(getComputedStyle(top).transform).m42;
              const b = new DOMMatrixReadOnly(getComputedStyle(bottom).transform).m42;
              frames.push(Math.abs(t + top.getBoundingClientRect().height) < 1 && Math.abs(b - bottom.getBoundingClientRect().height) < 1);
              if (performance.now() - start < 900 || frames.length < 12) requestAnimationFrame(frame); else resolve();
            } requestAnimationFrame(frame);
          }); return frames;
        });
        const exposed = frames.filter(hidden => !hidden).length;
        if (mode === 'before') reproduced += exposed;
        else assert.equal(exposed, 0, 'every return frame must keep both panels hidden');
        assert.equal(await page.locator('#card-panel-toggle').isVisible(), false);
        assert.equal(await page.locator('.center-page.active[data-chrome-view]').getAttribute('data-chrome-view'), 'group');
        console.log(`${mode} card ${index + 1}, ${opened ? 'opened' : 'hidden'}: ${exposed} exposed frames`);
      }
      for (const route of ['group-subgroup', 'subgroup-group', 'subgroup-card', 'card-subgroup', 'group-card', 'card-group']) {
        await page.evaluate(route => {
          selectSub('race');
          if (route === 'group-subgroup' || route === 'group-card' || route === 'card-group') {
            showGroupCards('race', 2);
          } else {
            showSubgroupPage('race', 1);
            showSubgroupCards('race', 1, 1);
          }
        }, route);
        await page.waitForTimeout(1000);
        if (route.startsWith('card-')) {
          await page.locator('#card-panel-toggle').click(); await page.waitForTimeout(350);
        } else {
          await page.evaluate(() => navigateAddressBack()); await page.waitForTimeout(900);
        }
        const exposure = await page.evaluate(async route => {
          if (route === 'group-subgroup') showSubgroupPage('race', 1);
          else if (route === 'subgroup-card') showSubgroupCards('race', 1, 1);
          else if (route === 'group-card') showGroupCards('race', 2);
          else navigateAddressBack();
          let exposure = 0, frames = 0; const start = performance.now();
          await new Promise(resolve => {
            function frame() {
              const top = document.getElementById('info-panel'), bottom = document.getElementById('create-chrome-bottom');
              const t = new DOMMatrixReadOnly(getComputedStyle(top).transform).m42;
              const b = new DOMMatrixReadOnly(getComputedStyle(bottom).transform).m42;
              if (Math.abs(t + top.getBoundingClientRect().height) >= 1 || Math.abs(b - bottom.getBoundingClientRect().height) >= 1) exposure++;
              frames++;
              if (performance.now() - start < 900 || frames < 12) requestAnimationFrame(frame); else resolve();
            } requestAnimationFrame(frame);
          }); return exposure;
        }, route);
        if (mode === 'before') reproduced += exposure;
        else assert.equal(exposure, 0, route + ' must remain hidden throughout');
        const destination = route.split('-')[1];
        assert.equal(await page.locator('.center-page.active[data-chrome-view]').getAttribute('data-chrome-view'), destination === 'card' ? 'cards' : destination);
        console.log(`${mode} ${route}: ${exposure} exposed frames`);
      }
      if (mode === 'after') {
        await page.evaluate(() => { showSubgroupPage('race', 1); showSubgroupCards('race', 1, 1); });
        await page.waitForTimeout(400); await page.locator('#card-panel-toggle').click(); await page.waitForTimeout(350);
        await page.evaluate(() => navigateAddressBack()); await page.waitForTimeout(50);
        assert(await page.locator('#info-panel').evaluate(n => Math.abs(new DOMMatrixReadOnly(getComputedStyle(n).transform).m42 + n.getBoundingClientRect().height) < 1));
        assert.equal(await page.locator('.center-page.active[data-chrome-view]').getAttribute('data-chrome-view'), 'subgroup');
      }
      if (mode === 'after') {
        await page.evaluate(() => selectSub('race')); await page.waitForTimeout(400);
        await page.evaluate(() => document.getElementById('center-area').dispatchEvent(new WheelEvent('wheel', { deltaY: -100, bubbles: true })));
        await page.waitForTimeout(350);
        assert(await page.locator('#info-panel').evaluate(n => Math.abs(new DOMMatrixReadOnly(getComputedStyle(n).transform).m42) < 1));
        await page.evaluate(() => showSubgroupPage('race', 1)); await page.waitForTimeout(100);
        assert(await page.locator('#info-panel').evaluate(n => Math.abs(new DOMMatrixReadOnly(getComputedStyle(n).transform).m42) < 1), 'subgroup inherits intentional visible state');
        console.log('PASS intentional scroll reveal and subgroup visible-state inheritance');
      }
      assert.deepEqual(errors, []); await context.close();
    }
    assert(reproduced > 0, 'baseline regression reproduced');
    console.log('PASS baseline flash reproduced; fixed top/70/100 opened/hidden returns and subgroup return');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
