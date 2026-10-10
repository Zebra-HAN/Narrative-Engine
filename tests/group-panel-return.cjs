const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const baseline = execFileSync('git', ['show', '7a2aef0:js/app.js'], { encoding: 'utf8' });
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
      if (mode === 'after') {
        await page.evaluate(() => { showSubgroupPage('race', 1); showSubgroupCards('race', 1, 1); });
        await page.waitForTimeout(400); await page.locator('#card-panel-toggle').click(); await page.waitForTimeout(350);
        await page.evaluate(() => navigateAddressBack()); await page.waitForTimeout(50);
        assert(await page.locator('#info-panel').evaluate(n => Math.abs(new DOMMatrixReadOnly(getComputedStyle(n).transform).m42 + n.getBoundingClientRect().height) < 1));
        assert.equal(await page.locator('.center-page.active[data-chrome-view]').getAttribute('data-chrome-view'), 'subgroup');
      }
      assert.deepEqual(errors, []); await context.close();
    }
    assert(reproduced > 0, 'baseline regression reproduced');
    console.log('PASS baseline flash reproduced; fixed top/70/100 opened/hidden returns and subgroup return');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
