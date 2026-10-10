const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { execFileSync } = require('node:child_process');
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const reference = new Map();
  try {
    for (const mode of ['before', 'after']) {
      const page = await browser.newPage({ viewport: { width: 393, height: 852 }, serviceWorkers: 'block' });
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
      if (mode === 'before') await page.route('**/css/style.css', r => r.fulfill({ contentType: 'text/css', body: execFileSync('git', ['show', '21a71a8:css/style.css'], { encoding: 'utf8' }) }));
      await page.goto(process.env.PERF_TEST_URL); await page.waitForTimeout(1600);
      await page.evaluate(() => { goToCreate(); switchNav('character', true); selectSub('race'); });
      await page.waitForTimeout(600);
      const group = await page.locator('.center-page.active[data-chrome-view]').evaluate(n => ({ top: n.getBoundingClientRect().top, padding: getComputedStyle(n).padding }));
      if (mode === 'before') reference.set('group', group); else assert.deepEqual(group, reference.get('group'));
      for (const count of [2, 4, 5, 20, 139]) {
        await page.evaluate(count => {
          if (count === 2) showGroupCards('attribute', 2);
          else if (count === 5) showGroupCards('archetype', 1);
          else if (count === 139) showGroupCards('race', 2);
          else { showSubgroupPage('race', 1); showSubgroupCards('race', 1, count === 4 ? 0 : 1); }
        }, count);
        const early = await page.locator('.center-page.active[data-chrome-view]').evaluate(n => ({ top: n.getBoundingClientRect().top, padding: getComputedStyle(n).paddingTop }));
        await page.waitForTimeout(1500);
        const state = await page.evaluate(() => {
          const source = document.querySelector('.center-page.active[data-chrome-view]'), card = source.querySelector('.data-card'), grid = source.querySelector('.card-grid');
          const button = document.getElementById('card-panel-toggle'), b = button.getBoundingClientRect(), s = getComputedStyle(button), c = card.getBoundingClientRect();
          const header = source.querySelector('.card-section-header');
          return { sourceTop: source.getBoundingClientRect().top, padding: getComputedStyle(source).paddingTop,
            contentTop: source.firstElementChild.getBoundingClientRect().top, buttonBottom: b.bottom, buttonTop: b.top,
            buttonWidth: b.width, buttonHeight: b.height, center: b.left + b.width / 2, color: s.color, background: s.backgroundColor, border: s.border, radius: s.borderRadius,
            design: { cardWidth: c.width, cardHeight: c.height, gridGap: getComputedStyle(grid).gap, gridMargin: getComputedStyle(grid).margin,
              header: header ? { margin: getComputedStyle(header).margin, padding: getComputedStyle(header).padding, font: getComputedStyle(header).fontSize } : null } };
        });
        assert.equal(state.sourceTop, early.top); assert.equal(state.padding, early.padding);
        if (mode === 'before') reference.set(count, state);
        else {
          const old = reference.get(count); assert.deepEqual(state.design, old.design);
          assert.equal(state.sourceTop, 52); assert.equal(state.padding, '0px');
          assert(state.contentTop >= state.buttonBottom + 8); assert.equal(state.center, 393 / 2);
          assert.equal(state.buttonTop, 8); assert.equal(state.buttonWidth, old.buttonWidth); assert.equal(state.buttonHeight, old.buttonHeight);
          assert.equal(state.background, old.background); assert.equal(state.border, old.border); assert.equal(state.radius, old.radius);
          assert.equal(state.color, 'rgb(47, 143, 78)'); assert.equal(await page.locator('#card-panel-toggle').textContent(), '▼');
          await page.evaluate(() => { const n = document.querySelector('.center-page.active[data-chrome-view]'); n.scrollTop = n.scrollHeight; });
          assert.equal(await page.locator('.center-page.active[data-chrome-view]').evaluate(n => n.getBoundingClientRect().top), 52);
          // Simulate a 59px safe-area value through the shared derived variable.
          await page.evaluate(() => document.getElementById('screen-create').style.setProperty('--card-panel-button-top', '67px'));
          assert.equal(await page.locator('#card-panel-toggle').evaluate(n => n.getBoundingClientRect().top), 67);
          assert.equal(await page.locator('.center-page.active[data-chrome-view]').evaluate(n => n.getBoundingClientRect().top), 111);
          await page.evaluate(() => document.getElementById('screen-create').style.removeProperty('--card-panel-button-top'));
          console.log(`PASS ${count} cards: initial top alignment/no jump, unchanged card/section design, button styling, protected scroll strip, simulated safe area`);
        }
      }
      assert.deepEqual(errors, []); await page.close();
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
