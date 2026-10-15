const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { execFileSync } = require('node:child_process');

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  try {
    for (const width of [320, 393, 852]) {
      const page = await browser.newPage({ viewport: { width, height: width === 852 ? 393 : 852 }, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      await page.route(/fonts\.(googleapis|gstatic)\.com/, route => route.abort());
      if (process.env.BASELINE_COMMIT) {
        const body = execFileSync('git', ['show', `${process.env.BASELINE_COMMIT}:css/style.css`], { encoding: 'utf8' });
        await page.route('**/css/style.css', route => route.fulfill({ body, contentType: 'text/css' }));
      }
      await page.goto(process.env.PERF_TEST_URL); await page.waitForTimeout(1600);
      await page.evaluate(() => { goToCreate(); switchNav('character', true); selectSub('race'); });
      await page.waitForFunction(() => document.querySelector('#page-race.active[data-chrome-view=group]'));
      await page.evaluate(() => {
        window.fixtureDetail = '[[section:Ideas]]\n\n' + Array.from({ length: 60 }, (_, i) => `Idea ${i}\nLong text for a tall plate.\nAnother line of detail.\nMore text inside the same button.\nFinal line of detail.`).join('\n\n');
        CARD_DATA.fixture = [{ name: 'Entrance fixture', desc: 'Description remains unchanged', detail: fixtureDetail }];
        currentSubId = 'fixture'; showCardPage('fixture', false, true); cardClick('fixture', 0);
      });
      for (const title of [false, true]) {
        const animation = await page.evaluate(title => {
          closeDetailSheet(); document.querySelector('.detail-sheet').getBoundingClientRect();
          if (title) openLocationInfo({ item: { label: 'Title fixture' }, description: 'Description remains unchanged', detail: fixtureDetail, isTitleCard: true });
          else openDetailSheet('card');
          const sheet = document.querySelector('.detail-sheet'), root = document.getElementById('detail-content');
          window.savedScrollRoot = root; root.scrollTop = 100;
          const effect = sheet.getAnimations().find(a => a.effect.target === sheet);
          const duration = effect.effect.getTiming().duration;
          effect.pause();
          const size = [sheet.offsetWidth, sheet.offsetHeight, root.offsetWidth, root.offsetHeight];
          const scales = [0, .25, .5, .75, 1].map(f => {
            effect.currentTime = duration * f;
            assertSize();
            return new DOMMatrixReadOnly(getComputedStyle(sheet).transform).a;
          });
          function assertSize() { if (JSON.stringify(size) !== JSON.stringify([sheet.offsetWidth, sheet.offsetHeight, root.offsetWidth, root.offsetHeight])) throw Error('Entrance changed layout size'); }
          effect.finish();
          return { duration, scales, end: getComputedStyle(sheet).transform, opacity: getComputedStyle(sheet).opacity, scroll: root.scrollTop, sameRoot: savedScrollRoot === root, width: root.scrollWidth, client: root.clientWidth };
        }, title);
        if (!process.env.BASELINE_COMMIT) {
          assert.equal(animation.duration, 200); assert.equal(animation.scales[0], .85);
          assert(animation.scales.every((s, i, a) => s >= .85 && s <= 1 && (!i || s >= a[i - 1])));
          assert(animation.scales[1] < .95, 'keep visible expansion beyond the first quarter of the entrance');
          assert.equal(animation.end, 'none', 'release scale after entrance');
        }
        assert.equal(animation.opacity, '1'); assert.equal(animation.scroll, 100); assert(animation.sameRoot); assert.equal(animation.width, animation.client);
        console.log(JSON.stringify({ width, title, animation }));
      }
      // Observe the running entrance across rendering frames, without seeking or pausing it.
      for (const title of [false, true]) {
        const frames = await page.evaluate(async title => {
          closeDetailSheet();
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          if (title) openLocationInfo({ item: { label: 'Title fixture' }, description: 'Description remains unchanged', detail: fixtureDetail, isTitleCard: true });
          else openDetailSheet('card');
          const sheet = document.querySelector('.detail-sheet'), root = document.getElementById('detail-content');
          root.scrollTop = 100;
          const result = [], started = performance.now();
          await new Promise(resolve => {
            const sample = now => {
              result.push({ elapsed: now - started, scale: new DOMMatrixReadOnly(getComputedStyle(sheet).transform).a, scroll: root.scrollTop, sameRoot: root === document.getElementById('detail-content') });
              if (now - started < 240) requestAnimationFrame(sample); else resolve();
            };
            requestAnimationFrame(sample);
          });
          return result;
        }, title);
        if (!process.env.BASELINE_COMMIT) {
          assert(frames.some(f => f.scale > .85 && f.scale < .99), 'running entrance must render an intermediate scale');
          assert(frames.every(f => f.scale >= .85 && f.scale <= 1), 'running entrance must not overshoot');
          assert.equal(frames.at(-1).scale, 1);
        }
        assert(frames.every(f => f.scroll === 100 && f.sameRoot), 'running entrance preserves scroll position and root');
        console.log(JSON.stringify({ width, title, renderedFrames: frames }));
      }
      const cdp = await page.context().newCDPSession(page);
      for (const delay of [0, 220]) for (const [distance, wait, steps] of [[40, 4, 2], [180, 65, 5]]) {
        const point = await page.evaluate(() => {
          closeDetailSheet(); document.querySelector('.detail-sheet').getBoundingClientRect();
          selectedCards = {}; selectedDetails = {}; autoSelectedCardKeys.clear(); openDetailSheet('card');
          const root = document.getElementById('detail-content'); root.scrollTop = 500;
          window.scrollEvents = []; window.touchEvents = []; window.savedScrollRoot = root;
          root.onscroll = () => scrollEvents.push(root.scrollTop);
          window.recordTouch ||= e => { if (savedScrollRoot.contains(e.target)) touchEvents.push({ type: e.type, prevented: e.defaultPrevented, top: savedScrollRoot.scrollTop }); };
          for (const type of ['click', 'touchmove', 'touchend', 'touchcancel']) { document.removeEventListener(type, recordTouch); document.addEventListener(type, recordTouch); }
          const view = root.getBoundingClientRect();
          const node = [...root.querySelectorAll('.detail-idea-block')].find(n => { const r = n.getBoundingClientRect(); return Math.min(view.bottom, r.bottom) - Math.max(view.top, r.top) > 75; });
          const rect = node.getBoundingClientRect(), top = Math.max(view.top, rect.top);
          return { x: rect.left + rect.width / 2, y: top + 60, shortEndInside: top + 20 > rect.top, start: root.scrollTop };
        });
        assert(point.shortEndInside); if (delay) await page.waitForTimeout(delay);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: point.x, y: point.y }] });
        for (let step = 1; step <= steps; step++) {
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: point.x, y: point.y - distance * step / steps }] });
          await page.waitForTimeout(wait);
        }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        const release = await page.evaluate(() => savedScrollRoot.scrollTop); await page.waitForTimeout(400);
        const state = await page.evaluate(() => ({ after: savedScrollRoot.scrollTop, samples: scrollEvents, events: touchEvents, selected: !!selectedDetails.fixture__0?.size, sameRoot: savedScrollRoot === document.getElementById('detail-content') }));
        assert(release > point.start, 'native vertical scroll starts'); assert(state.after >= release, 'no reset after release'); assert(state.sameRoot); assert(!state.selected);
        assert(!state.events.some(e => e.type === 'click' || e.prevented));
        console.log(JSON.stringify({ width, delay, distance, atRelease: release - point.start, afterRelease: state.after - point.start, momentumObserved: state.after > release + 5 }));
      }
      await page.evaluate(() => { closeDetailSheet(); openDetailSheet('card'); }); await page.waitForTimeout(220);
      const idea = page.locator('.detail-idea-block').first(); await idea.tap(); assert.equal(await idea.getAttribute('aria-pressed'), 'true'); await idea.tap(); assert.equal(await idea.getAttribute('aria-pressed'), 'false');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.evaluate(() => { closeDetailSheet(); openDetailSheet('card'); });
      assert.equal(await page.locator('.detail-sheet').evaluate(n => getComputedStyle(n).animationName), 'none');
      assert.deepEqual(errors, []);
      console.log(`PASS ${width}: shared entrance, stable layout/root/scroll, immediate and settled short/slow pans, normal taps and reduced motion`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
