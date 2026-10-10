const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');
const fixtures = [{ name: 'four', g: 1, sg: 0, count: 4 }, { name: 'section20', g: 1, sg: 1, count: 20 }, { name: 'fantasy139', g: 2, count: 139 }];
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  const baseline = execFileSync('git', ['show', 'b8dc0df:js/app.js'], { encoding: 'utf8' });
  const reference = [];
  try {
    for (const mode of ['before', 'after']) {
      const context = await browser.newContext({ viewport: { width: 393, height: 695 }, serviceWorkers: 'block' });
      const page = await context.newPage(); const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
      if (mode === 'before') await page.route('**/js/app.js', r => r.fulfill({ contentType: 'text/javascript', body: baseline }));
      await page.goto(process.env.PERF_TEST_URL || 'http://127.0.0.1:8006/');
      await page.waitForTimeout(1600);
      await page.evaluate(() => { goToCreate(); switchNav('character', true); selectSub('race'); });
      for (let f = 0; f < fixtures.length; f++) {
        const snapshot = await page.evaluate(fixture => {
          window.lowerFlipEvents = 0;
          if (fixture.sg === undefined) showGroupCards('race', fixture.g);
          else { showSubgroupPage('race', fixture.g); showSubgroupCards('race', fixture.g, fixture.sg); }
          const source = document.querySelector('.center-page.active[data-chrome-view]');
          window.upperSource = source;
          const cards = [...source.querySelectorAll('.data-card')];
          window.upperIndices = new Set(cards.map((c, i) => c.classList.contains('card-deal') ? i : -1).filter(i => i >= 0));
          source.addEventListener('animationstart', e => { if (e.animationName === 'cardFlip' && !window.upperIndices.has(cards.indexOf(e.target))) lowerFlipEvents++; });
          return cards.map(c => ({ delay: parseFloat(c.style.animationDelay), deal: c.classList.contains('card-deal'), opacity: getComputedStyle(c).opacity,
            pointer: getComputedStyle(c).pointerEvents, animation: getComputedStyle(c).animationName }));
        }, fixtures[f]);
        assert.equal(snapshot.length, fixtures[f].count);
        if (mode === 'before') { reference.push(snapshot); await page.evaluate(() => { upperIndices = new Set(Array.from({ length: 139 }, (_, i) => i)); }); }
        else {
          const old = reference[f];
          const limit = old.length < 12 ? Infinity : old[11].delay + 160;
          const upper = old.map((c, i) => c.delay <= limit ? i : -1).filter(i => i >= 0);
          await page.evaluate(indices => { window.upperIndices = new Set(indices); }, upper);
          snapshot.forEach((c, i) => {
            if (upper.includes(i)) { assert.equal(c.delay, old[i].delay); assert(c.deal); }
            else { assert(!c.deal); assert.equal(c.animation, 'none'); assert.equal(c.opacity, '1'); assert.notEqual(c.pointer, 'none'); }
          });
          assert(upper.length < 139);
          await page.evaluate(indices => {
            window.instantCards = [...upperSource.querySelectorAll('.data-card')].filter((_, i) => !indices.includes(i));
            upperSource.scrollTop = upperSource.scrollHeight;
            upperSource.dispatchEvent(new Event('scroll'));
          }, upper);
          const instant = await page.evaluate(() => instantCards.map(c => ({ opacity: getComputedStyle(c).opacity, animation: getComputedStyle(c).animationName, pointer: getComputedStyle(c).pointerEvents })));
          assert(instant.every(c => c.opacity === '1' && c.animation === 'none' && c.pointer !== 'none'));
          await page.waitForTimeout(1500);
          assert.equal(await page.evaluate(() => lowerFlipEvents), 0);
          assert(await page.locator('.center-page.active .data-card').evaluateAll(nodes => nodes.every(c => getComputedStyle(c).opacity === '1')));
          console.log(`PASS ${fixtures[f].name}: original sequential set ${upper.length}/${snapshot.length}, threshold ${limit}ms; remaining cards instantly ready with no flip`);
        }
        await page.waitForTimeout(1500);
      }
      if (mode === 'after') {
        const saved = await page.evaluate(() => {
          upperSource.querySelectorAll('.data-card')[99].scrollIntoView({ block: 'start', behavior: 'instant' });
          upperSource.dispatchEvent(new Event('scroll')); return upperSource.scrollTop;
        });
        await page.waitForTimeout(80); await page.evaluate(() => navigateAddressBack());
        await page.waitForTimeout(80);
        const restored = await page.evaluate(async () => {
          showGroupCards('race', 2); await new Promise(resolve => requestAnimationFrame(resolve));
          const source = document.querySelector('.center-page.active[data-chrome-view]'); const view = source.getBoundingClientRect();
          return { scroll: source.scrollTop, visible: [...source.querySelectorAll('.data-card')].map((c, i) => {
            const r = c.getBoundingClientRect(); const s = getComputedStyle(c);
            return { i, visible: r.top < view.bottom && r.bottom > view.top, opacity: s.opacity, animation: s.animationName, pointer: s.pointerEvents };
          }).filter(c => c.visible) };
        });
        assert(Math.abs(restored.scroll - saved) < 1); assert(restored.visible[0].i > 80);
        assert(restored.visible.every(c => c.opacity === '1' && c.animation === 'none' && c.pointer !== 'none'));
        await page.locator('.center-page.active .data-card').nth(99).click();
        await page.locator('.card-info-select').click(); await page.locator('.card-info-lock').click();
        assert(await page.locator('.card-info-select').isDisabled());
        await page.locator('.card-info-detail').click(); assert(await page.locator('.detail-overlay').evaluate(n => n.classList.contains('active')));
        await page.evaluate(() => { closeDetailSheet(); closeCardInfo(); navigateAddressBack(); showGroupCards('race', 2); });
        console.log('PASS card-100 scroll restoration, immediate visible cards, selection/lock/detail, back/re-entry');
      }
      assert.deepEqual(errors, []); await context.close();
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
