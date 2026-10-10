const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  try {
    for (const height of [695, 1100]) {
      const context = await browser.newContext({ viewport: { width: 393, height }, serviceWorkers: 'block' });
      const page = await context.newPage(); const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
      await page.goto(process.env.PERF_TEST_URL);
      await page.waitForTimeout(1600);
      await page.evaluate(() => { goToCreate(); switchNav('character', true); selectSub('race'); });
      const enter = count => page.evaluate(async count => {
        if (count === 139) showGroupCards('race', 2);
        else { showSubgroupPage('race', 1); showSubgroupCards('race', 1, count === 4 ? 0 : 1); }
        await new Promise(resolve => queueMicrotask(resolve));
        const source = document.querySelector('.center-page.active[data-chrome-view]'), v = source.getBoundingClientRect();
        const top = Math.max(v.top + source.clientTop, 0, document.getElementById('info-panel').getBoundingClientRect().bottom);
        const bottom = Math.min(v.top + source.clientTop + source.clientHeight, innerHeight, document.getElementById('create-chrome-bottom').getBoundingClientRect().top);
        window.entryVisible = [...source.querySelectorAll('.data-card')].map((c, i) => {
          const r = c.getBoundingClientRect(); return r.bottom > top && r.top < bottom && r.right > Math.max(v.left, 0) && r.left < Math.min(v.right, innerWidth) ? i : -1;
        }).filter(i => i >= 0);
      }, count);
      const inspect = () => page.evaluate(() => {
        const source = document.querySelector('.center-page.active[data-chrome-view]');
        const v = source.getBoundingClientRect();
        const top = Math.max(v.top + source.clientTop, 0), bottom = Math.min(v.top + source.clientTop + source.clientHeight, innerHeight);
        const left = Math.max(v.left + source.clientLeft, 0), right = Math.min(v.left + source.clientLeft + source.clientWidth, innerWidth);
        return { scroll: source.scrollTop, cards: [...source.querySelectorAll('.data-card')].map((c, i) => {
          const r = c.getBoundingClientRect(); const s = getComputedStyle(c);
          return { i, visible: entryVisible.includes(i),
            deal: c.classList.contains('card-deal'), suspended: c.classList.contains('card-reveal-suspended'),
            delay: parseFloat(c.style.animationDelay), duration: s.getPropertyValue('--card-reveal-duration'),
            opacity: s.opacity, pointer: s.pointerEvents, animations: c.getAnimations().filter(a => a.animationName === 'cardFlip').length };
        }) };
      });
      const verify = async label => {
        await page.waitForTimeout(100);
        const state = await inspect(); const visible = state.cards.filter(c => c.visible);
        assert(visible.length > 0);
        assert.equal(visible[0].delay, 0, 'first visible card starts without list-index delay');
        for (const c of state.cards) {
          assert(!c.suspended);
          assert.equal(c.duration, '450ms');
          if (c.visible) { assert(c.deal); assert.equal(c.animations, 1); }
          else { assert(!c.deal); assert.equal(c.animations, 0); assert.equal(c.opacity, '1'); assert.notEqual(c.pointer, 'none'); }
        }
        const outside = state.cards.filter(c => !c.visible).map(c => c.i);
        await page.evaluate(() => {
          const source = document.querySelector('.center-page.active[data-chrome-view]');
          source.scrollTop = source.scrollHeight; source.dispatchEvent(new Event('scroll'));
        });
        const scrolled = await inspect();
        for (const i of outside) { assert.equal(scrolled.cards[i].animations, 0); assert.equal(scrolled.cards[i].opacity, '1'); }
        await page.waitForTimeout(1800);
        assert(await page.locator('.center-page.active .data-card').evaluateAll(cards => cards.every(c => getComputedStyle(c).opacity === '1' && getComputedStyle(c).pointerEvents !== 'none')));
        console.log(`PASS ${label}, height ${height}: only ${visible.length}/${state.cards.length} visible cards animate; fast-scroll cards ready`);
      };
      for (const count of [4, 20, 139]) { await enter(count); await verify(`${count} initial`); }
      for (const index of [49, 69, 99]) {
        const saved = await page.evaluate(index => {
          const source = document.querySelector('.center-page.active[data-chrome-view]');
          source.querySelectorAll('.data-card')[index].scrollIntoView({ block: 'start', behavior: 'instant' });
          source.dispatchEvent(new Event('scroll')); return source.scrollTop;
        }, index);
        await page.waitForTimeout(80); await page.evaluate(() => navigateAddressBack());
        await page.waitForTimeout(300); await enter(139); await page.waitForTimeout(30);
        assert(Math.abs((await inspect()).scroll - saved) < 1);
        await verify(`restored card ${index + 1}`);
      }
      await page.locator('.center-page.active .data-card').nth(99).click();
      await page.locator('.card-info-select').click(); await page.locator('.card-info-lock').click();
      assert(await page.locator('.card-info-select').isDisabled());
      await page.locator('.card-info-detail').click();
      assert(await page.locator('.detail-overlay').evaluate(n => n.classList.contains('active')));
      await page.evaluate(() => { closeDetailSheet(); closeCardInfo(); navigateAddressBack(); });
      assert.deepEqual(errors, []);
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
