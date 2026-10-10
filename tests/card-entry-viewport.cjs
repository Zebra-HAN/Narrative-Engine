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
      // Capture live animation timing at start, before end handlers remove it.
      await page.evaluate(() => {
        window.flipTimeline = new WeakMap();
        document.addEventListener('animationstart', event => {
          if (event.animationName !== 'cardFlip') return;
          const animation = event.target.getAnimations().find(a => a.animationName === 'cardFlip');
          flipTimeline.set(event.target, { start: animation?.startTime,
            duration: animation?.effect.getTiming().duration });
        }, true);
      });
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
          window.offscreenCards = cards.filter(c => !(topOf(c) < source.scrollTop + source.clientHeight && topOf(c) + c.offsetHeight > source.scrollTop));
          return cards.map(c => {
            const s = getComputedStyle(c); const animation = c.getAnimations().find(a => a.animationName === 'cardFlip');
            return { visible: !offscreenCards.includes(c), deal: c.classList.contains('card-deal'), opacity: s.opacity, pointer: s.pointerEvents,
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
            else { assert.equal(c.deal, true); assert.equal(c.animation, 'cardFlip'); assert.equal(c.delay, '0ms'); assert.equal(c.duration, '0.45s'); }
          }
          await page.waitForFunction(() => [...entrySource.querySelectorAll('.data-card')].every(c => { const start = flipTimeline.get(c)?.start ?? c.getAnimations().find(a => a.animationName === 'cardFlip')?.startTime; return start !== null && start !== undefined; }));
          const starts = await page.evaluate(async () => {
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            return [...entrySource.querySelectorAll('.data-card')].map(c => flipTimeline.get(c)?.start ?? c.getAnimations().find(a => a.animationName === 'cardFlip')?.startTime);
          });
          assert(starts[0] !== null && starts[0] !== undefined, JSON.stringify({starts, fixture}));
          assert(starts.every(t => Math.abs(t - starts[0]) < 0.01), 'initial visible/offscreen flips share the exact start');
          assert.equal(await page.locator('.center-page.active .card-reveal-suspended').count(), 0);
          await page.evaluate(() => { window.lateFlips = 0; entrySource.addEventListener('animationstart', e => { if (offscreenCards.includes(e.target) && e.animationName === 'cardFlip') lateFlips++; }); entrySource.scrollTop = entrySource.scrollHeight; });
          await page.waitForTimeout(500);
          await page.evaluate(() => { lateFlips = 0; });
          await page.setViewportSize({ width: 390, height: 844 });
          await page.waitForTimeout(60);
          const offscreen = await page.evaluate(() => offscreenCards.map(c => { const s = getComputedStyle(c); return { opacity: s.opacity, animation: s.animationName, pointer: s.pointerEvents }; }));
          for (const c of offscreen) assert.deepEqual(c, { opacity: '1', animation: 'none', pointer: 'all' });
          assert.equal(await page.evaluate(() => lateFlips), 0, 'no offscreen restart after the first flip finishes');
          // Offscreen cards finish with the first visible card, not the final wave.
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
      if (mode === 'after') {
        await page.evaluate(() => { selectSub('race'); showGroupCards('race', 2); });
        await page.waitForTimeout(1000);
        const saved = await page.evaluate(() => {
          const source = document.querySelector('.center-page.active[data-chrome-view]');
          source.querySelectorAll('.data-card')[99].scrollIntoView({ block: 'start', behavior: 'instant' });
          source.dispatchEvent(new Event('scroll'));
          return source.scrollTop;
        });
        assert(saved > 0);
        await page.waitForTimeout(60);
        await page.evaluate(() => navigateAddressBack());
        await page.waitForTimeout(100);
        const restored = await page.evaluate(async () => {
          showGroupCards('race', 2);
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          await new Promise(resolve => { const check = () => { const nodes = [...document.querySelectorAll('.center-page.active .data-card')]; if (nodes.every(c => flipTimeline.has(c))) resolve(); else requestAnimationFrame(check); }; check(); });
          const source = document.querySelector('.center-page.active[data-chrome-view]');
          const view = source.getBoundingClientRect();
          const cards = [...source.querySelectorAll('.data-card')];
          return { scrollTop: source.scrollTop, cards: cards.map((c, index) => {
            const r = c.getBoundingClientRect();
            const live = c.getAnimations().find(a => a.animationName === 'cardFlip');
            const a = flipTimeline.get(c) || (live && { start: live.startTime, duration: live.effect.getTiming().duration });
            return { index, visible: r.top < view.bottom && r.bottom > view.top,
              delay: parseFloat(c.style.animationDelay), duration: a?.duration,
              start: a?.start };
          }) };
        });
        assert(Math.abs(restored.scrollTop - saved) < 1, 'scroll memory unchanged');
        const visible = restored.cards.filter(c => c.visible);
        assert(visible[0].index > 80, 'restored viewport is near card 100');
        assert.equal(visible[0].delay, 0, 'restored first visible card starts immediately');
        assert(visible.some(c => c.delay > 0), 'restored visible cards still form a wave');
        assert(restored.cards.filter(c => !c.visible).every(c => c.delay === 0));
        assert(restored.cards.every(c => c.duration === 450));
        assert(restored.cards[0].start !== null);
        assert(restored.cards.every(c => Math.abs(c.start - restored.cards[0].start) < 0.01), 'all flips share the exact timeline start');
        await page.waitForTimeout(500);
        const finished = await page.evaluate(() => [...document.querySelectorAll('.center-page.active .data-card')].map(c => ({ delay: c.style.animationDelay, opacity: getComputedStyle(c).opacity, deal: c.classList.contains('card-deal') })));
        assert(finished.filter(c => c.delay === '0ms').every(c => c.opacity === '1' && !c.deal));
        console.log('PASS restored card-100 viewport: local wave starts at zero; all offscreen flips share start and finish after 450ms');
      }
      assert.deepEqual(errors, []); await context.close();
    }
    if (before) {
      for (let i = 0; i < fixtures.length; i++) {
        const old = samples.before[i], next = samples.after[i];
        next.forEach((c, index) => {
          if (c.visible) assert.equal(c.delay, old[index].delay, 'original visible wave delays unchanged');
          if (c.visible) for (const key of ['animation', 'duration', 'easing', 'origin', 'keyframes']) assert.deepEqual(c[key], old[index][key], `visible ${key} unchanged`);
        });
      }
      assert(samples.after[2].filter(c => !c.visible).every(c => c.delay === '0ms'));
      console.log('PASS baseline equivalence: visible flip keyframes, timing, direction, origin and all wave delays; offscreen flips have no delay');
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
