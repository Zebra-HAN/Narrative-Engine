const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');
(async () => {
  const baseline = execFileSync('git', ['show', 'b8dc0df:js/app.js'], { encoding: 'utf8' });
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  const references = [];
  try {
    for (const mode of ['baseline', 'restored']) {
      const context = await browser.newContext({ viewport: { width: 393, height: 695 }, serviceWorkers: 'block' });
      const page = await context.newPage(); const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
      if (mode === 'baseline') await page.route('**/js/app.js', r => r.fulfill({ contentType: 'text/javascript', body: baseline }));
      await page.goto(process.env.PERF_TEST_URL);
      await page.waitForTimeout(1600);
      await page.evaluate(() => { goToCreate(); switchNav('character', true); selectSub('race'); });
      for (const [index, count] of [4, 20, 139].entries()) {
        const snapshot = await page.evaluate(count => {
          if (count === 139) showGroupCards('race', 2);
          else { showSubgroupPage('race', 1); showSubgroupCards('race', 1, count === 4 ? 0 : 1); }
          return [...document.querySelectorAll('.center-page.active .data-card')].map(c => ({ delay: c.style.animationDelay, classes: c.className, duration: c.style.getPropertyValue('--card-reveal-duration') }));
        }, count);
        assert.equal(snapshot.length, count);
        if (mode === 'baseline') references[index] = snapshot;
        else snapshot.forEach((card, i) => {
          if (i < 17) assert.deepEqual(card, references[index][i], 'upper cards preserve baseline');
          else {
            assert.equal(card.delay, snapshot[1].delay, 'lower starts with second card');
            assert.equal(card.duration, '550ms');
            assert.equal(card.classes, references[index][i].classes);
          }
        });
        if (mode === 'restored' && count === 139) {
          await page.waitForTimeout(100);
          const timing = await page.evaluate(() => {
            const cards = [...document.querySelectorAll('.center-page.active .data-card')];
            const animation = i => cards[i].getAnimations().find(a => a.animationName === 'cardFlip');
            const second = animation(1), lower = animation(17);
            return { secondStart: second.startTime + second.effect.getTiming().delay,
              lowerStart: lower.startTime + lower.effect.getTiming().delay,
              lowerDuration: lower.effect.getTiming().duration,
              active: cards.filter(c => c.getAnimations().some(a => a.animationName === 'cardFlip')).length,
              suspended: cards.filter(c => c.classList.contains('card-reveal-suspended')).length };
          });
          assert.equal(timing.secondStart, timing.lowerStart);
          assert.equal(timing.lowerDuration, 550);
          assert(timing.active < 139 && timing.suspended > 0);
          console.log(`PASS synchronized second/lower start; ${timing.active}/139 scoped animations`);
        }
        await page.waitForTimeout(1500);
        assert(await page.locator('.center-page.active .data-card').evaluateAll(cards => cards.every(c => getComputedStyle(c).opacity === '1' && getComputedStyle(c).pointerEvents !== 'none')));
        console.log(`PASS ${mode} ${count} cards: upper baseline/lower timing and final visibility`);
      }
      const saved = await page.evaluate(() => {
        const source = document.querySelector('.center-page.active[data-chrome-view]');
        source.querySelectorAll('.data-card')[99].scrollIntoView({ block: 'start', behavior: 'instant' });
        source.dispatchEvent(new Event('scroll')); return source.scrollTop;
      });
      await page.waitForTimeout(80); await page.evaluate(() => navigateAddressBack());
      await page.waitForTimeout(300); await page.evaluate(() => showGroupCards('race', 2));
      if (mode === 'restored') {
        await page.waitForTimeout(100);
        const timing = await page.locator('.center-page.active .data-card').nth(99).evaluate(c => {
          const a = c.getAnimations().find(a => a.animationName === 'cardFlip');
          return { delay: a.effect.getTiming().delay, duration: a.effect.getTiming().duration };
        });
        assert.deepEqual(timing, { delay: 80, duration: 550 });
        await page.waitForTimeout(600);
        assert.equal(await page.locator('.center-page.active .data-card').nth(99).evaluate(c => getComputedStyle(c).opacity), '1');
        console.log('PASS restored card 100: original timeline 80ms/550ms, complete by 700ms');
      } else await page.waitForTimeout(1500);
      assert(Math.abs(await page.locator('.center-page.active[data-chrome-view]').evaluate(n => n.scrollTop) - saved) < 1);
      await page.locator('.center-page.active .data-card').nth(99).click();
      await page.locator('.card-info-select').click(); await page.locator('.card-info-lock').click();
      assert(await page.locator('.card-info-select').isDisabled());
      await page.locator('.card-info-detail').click();
      assert(await page.locator('.detail-overlay').evaluate(n => n.classList.contains('active')));
      await page.evaluate(() => { closeDetailSheet(); closeCardInfo(); navigateAddressBack(); showGroupCards('race', 2); });
      await page.waitForTimeout(1500);
      assert.equal(await page.locator('.center-page.active .data-card').count(), 139);
      assert.deepEqual(errors, []);
      console.log(`PASS ${mode}: card-100 scroll restoration, select/lock/detail, back/re-entry`);
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
