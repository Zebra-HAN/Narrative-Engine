const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');
const fixtures = [
  { name: 'four', g: 1, sg: 0, count: 4 },
  { name: 'section20', g: 1, sg: 1, count: 20 },
  { name: 'fantasy139', g: 2, count: 139 }
];
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  try {
    const before = process.env.REVEAL_BASELINE_FILE && fs.readFileSync(process.env.REVEAL_BASELINE_FILE, 'utf8');
    const samples = { before: [], after: [] };
    for (const mode of before ? ['before', 'after'] : ['after']) {
      const context = await browser.newContext({ viewport: { width: 393, height: 695 }, serviceWorkers: 'block' });
      const page = await context.newPage(); const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
      if (mode === 'before') await page.route('**/js/app.js', r => r.fulfill({ contentType: 'text/javascript', body: before }));
      await page.goto(process.env.PERF_TEST_URL || 'http://127.0.0.1:8004/');
      await page.waitForTimeout(1600);
      await page.evaluate(() => { goToCreate(); switchNav('character', true); selectSub('race'); });
      for (const fixture of fixtures) {
        const snapshot = await page.evaluate(async f => {
          if (f.sg === undefined) showGroupCards('race', f.g);
          else { showSubgroupPage('race', f.g); showSubgroupCards('race', f.g, f.sg); }
          await new Promise(resolve => requestAnimationFrame(resolve));
          const source = document.querySelector('.center-page.active[data-chrome-view]');
          window.entrySource = source;
          const offsets = new Map([[source, 0]]);
          function topOf(n) { if (!n || n === source) return 0; if (!offsets.has(n)) offsets.set(n, n.offsetTop + topOf(n.offsetParent)); return offsets.get(n); }
          const cards = [...source.querySelectorAll('.data-card')];
          window.skippedCards = cards.filter(c => !(topOf(c) < source.scrollTop + source.clientHeight && topOf(c) + c.offsetHeight > source.scrollTop));
          return cards.map(c => {
            const s = getComputedStyle(c); const animation = c.getAnimations().find(a => a.animationName === 'cardFlip');
            return { visible: !skippedCards.includes(c), deal: c.classList.contains('card-deal'), opacity: s.opacity, pointer: s.pointerEvents,
              transform: s.transform, delay: c.style.animationDelay, animation: s.animationName, duration: s.animationDuration,
              easing: s.animationTimingFunction, origin: s.transformOrigin, keyframes: animation?.effect.getKeyframes().map(k => ({ offset: k.offset, opacity: k.opacity, transform: k.transform })) };
          });
        }, fixture);
        assert.equal(snapshot.length, fixture.count);
        assert(snapshot.some(c => c.visible));
        samples[mode].push(snapshot);
        if (mode === 'after') {
          for (const c of snapshot) {
            if (c.visible) assert.equal(c.animation, 'cardFlip', 'all initially visible cards retain flip');
            else { assert.equal(c.deal, false); assert.equal(c.animation, 'none'); assert.equal(c.opacity, '1'); assert.equal(c.transform, 'none'); assert.notEqual(c.pointer, 'none'); }
          }
          assert.equal(await page.locator('.center-page.active .card-reveal-suspended').count(), 0);
          await page.evaluate(() => { window.lateFlips = 0; entrySource.addEventListener('animationstart', e => { if (skippedCards.includes(e.target) && e.animationName === 'cardFlip') lateFlips++; }); entrySource.scrollTop = entrySource.scrollHeight; });
          await page.waitForTimeout(60);
          await page.setViewportSize({ width: 390, height: 844 });
          await page.waitForTimeout(60);
          const skipped = await page.evaluate(() => skippedCards.map(c => { const s = getComputedStyle(c); return { opacity: s.opacity, animation: s.animationName, pointer: s.pointerEvents }; }));
          for (const c of skipped) assert.deepEqual(c, { opacity: '1', animation: 'none', pointer: 'all' });
          assert.equal(await page.evaluate(() => lateFlips), 0);
          // A formerly offscreen card is usable immediately, before the wave ends.
          if (snapshot.some(c => !c.visible)) {
            await page.locator('.center-page.active .data-card').last().click();
            await page.locator('.card-info-select').waitFor({ state: 'visible' });
            await page.evaluate(() => closeCardInfo());
          }
          await page.setViewportSize({ width: 393, height: 695 });
          await page.waitForTimeout(1400);
          assert.equal(await page.locator('.center-page.active .card-deal').count(), 0);
          assert(await page.locator('.center-page.active .data-card').evaluateAll(nodes => nodes.every(c => getComputedStyle(c).opacity === '1')));
        }
        console.log(`PASS ${mode} ${fixture.name}: visible=${snapshot.filter(c => c.visible).length}, flips=${snapshot.filter(c => c.animation === 'cardFlip').length}`);
      }
      assert.deepEqual(errors, []); await context.close();
    }
    if (before) {
      for (let i = 0; i < fixtures.length; i++) {
        const old = samples.before[i], next = samples.after[i];
        next.forEach((c, index) => {
          assert.equal(c.delay, old[index].delay, 'original wave delays unchanged for every card');
          if (c.visible) for (const key of ['animation', 'duration', 'easing', 'origin', 'keyframes']) assert.deepEqual(c[key], old[index][key], `visible ${key} unchanged`);
        });
      }
      assert(samples.after[2].filter(c => c.deal).length < samples.before[2].filter(c => c.deal).length);
      console.log('PASS baseline equivalence: visible flip keyframes, timing, direction, origin and all wave delays; offscreen work reduced');
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
