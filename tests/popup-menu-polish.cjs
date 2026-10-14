const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { execFileSync } = require('node:child_process');

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  try {
    for (const viewport of [{ width: 320, height: 568 }, { width: 393, height: 852 }, { width: 852, height: 393 }]) {
      const baselineTheme = execFileSync('git', ['show', 'a08ffd5:css/deep-blue-gold-theme.css'], { encoding: 'utf8' });
      const context = await browser.newContext({ viewport, hasTouch: true, serviceWorkers: 'block' });
      const page = await context.newPage();
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
      await page.goto(process.env.PERF_TEST_URL); await page.waitForTimeout(1600);
      await page.evaluate(() => {
        goToCreate(); switchNav('character', true); selectSub('race');
      });
      await page.waitForFunction(() => document.querySelector('#page-race.active[data-chrome-view=group]'));
      await page.evaluate(() => {
        showGroupCards('race', 2, true);
        window.popupTestIndices = CARD_DATA.race.groups[2].cards.flatMap((c, i) => c.type === 'section' ? [] : [i]).slice(0, 25);
        selectedCards.race = new Set(popupTestIndices.map(i => getGroupCardGlobalIdx(2, i)));
        openStatusOverlay();
      });
      await page.waitForTimeout(400);
      await page.waitForFunction(() => [...document.querySelectorAll('#status-body img')].every(i => i.complete));
      const geometry = () => page.evaluate(() => {
        const chip = document.querySelector('.status-chip'), meta = chip.querySelector('.status-card-meta'), image = chip.querySelector('.status-chip-img');
        const rect = n => { const r = n.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom }; };
        const style = n => { const s = getComputedStyle(n); return { color: s.color, opacity: s.opacity, width: s.width, height: s.height }; };
        return { chip: rect(chip), meta: rect(meta), image: rect(image), naturalRatio: image.naturalWidth / image.naturalHeight, icon: style(meta.querySelector('.status-category-mark')), name: style(meta.querySelector('.status-category-name')), path: style(meta.querySelector('.status-card-path')), border: getComputedStyle(chip).border, shadow: getComputedStyle(chip).boxShadow };
      });
      const after = await geometry();
      await page.addStyleTag({ content: baselineTheme });
      const before = await geometry();
      await page.evaluate(() => document.head.querySelector('style:last-of-type').remove());
      assert(after.meta.y - after.chip.y < before.meta.y - before.chip.y);
      assert(after.meta.x - after.chip.x < before.meta.x - before.chip.x);
      assert(after.image.y - after.meta.bottom <= 2.1);
      assert(after.image.y - after.chip.y < before.image.y - before.chip.y);
      for (const key of ['icon', 'border', 'shadow']) assert.deepEqual(after[key], before[key]);
      for (const key of ['name', 'path']) for (const prop of ['color', 'opacity']) assert.equal(after[key][prop], before[key][prop]);
      assert(Math.abs((after.image.width - 2) / (after.image.height - 2) - after.naturalRatio) < .03, 'main image preserves its source ratio');
      assert(after.image.x >= after.chip.x && after.image.x + after.image.width <= after.chip.x + after.chip.width);
      const state = () => page.evaluate(() => JSON.stringify({ cards: [...selectedCards.race], details: Object.fromEntries(Object.entries(selectedDetails).map(([k, v]) => [k, [...v]])), selectedSubImages, excludedMainImages }));
      const originalState = await state();
      for (let repeat = 0; repeat < 3; repeat++) {
        await page.locator('#status-body').evaluate(n => { n.scrollTop = n.scrollHeight; });
        assert(await page.locator('#status-body').evaluate(n => n.scrollTop > 0));
        await page.locator('.status-close').tap();
        assert.equal(await page.locator('#status-overlay').evaluate(n => n.classList.contains('active')), false);
        const frames = await page.evaluate(async () => {
          openStatusOverlay(); const positions = [document.getElementById('status-body').scrollTop];
          for (let frame = 0; frame < 30; frame++) { await new Promise(requestAnimationFrame); positions.push(document.getElementById('status-body').scrollTop); }
          return positions;
        });
        assert(frames.every(y => y === 0), 'reopen starts and remains at the top through animation');
      }
      await page.evaluate(() => { closeStatusOverlay(); groupCardClick('race', 2, popupTestIndices[0]); openDetailSheet('card'); });
      await page.waitForTimeout(400);
      const surfaces = await page.evaluate(() => {
        const close = selector => { const n = document.querySelector(selector), s = getComputedStyle(n); return { color: s.color, background: s.backgroundImage, border: s.border, radius: s.borderRadius, icon: getComputedStyle(n.querySelector('.close-icon')).display, strokes: ['::before', '::after'].map(p => { const v = getComputedStyle(n, p); return { color: v.backgroundColor, width: v.width, height: v.height, transform: v.transform }; }) }; };
        const scroll = selector => { const n = document.querySelector(selector); return { color: getComputedStyle(n).scrollbarColor, thumb: getComputedStyle(n, '::-webkit-scrollbar-thumb').backgroundColor }; };
        return { detail: close('.detail-close'), status: close('.status-close'), detailScroll: scroll('.detail-sheet'), statusScroll: scroll('.status-body') };
      });
      assert.deepEqual(surfaces.detail, surfaces.status);
      assert.deepEqual(surfaces.detailScroll, surfaces.statusScroll);
      assert.equal(surfaces.detailScroll.color, 'rgb(240, 233, 220) rgba(0, 0, 0, 0)');
      assert.equal(surfaces.detailScroll.thumb, 'rgb(240, 233, 220)');
      await page.locator('.detail-sheet').evaluate(n => { n.scrollTop = n.scrollHeight; });
      await page.evaluate(() => { closeDetailSheet(); openDetailSheet('card'); });
      await page.waitForTimeout(400); assert.equal(await page.locator('.detail-sheet').evaluate(n => n.scrollTop), 0);
      await page.locator('.detail-close').tap(); assert.equal(await page.locator('#detail-overlay').evaluate(n => n.classList.contains('active')), false);
      assert.equal(await state(), originalState);
      await page.evaluate(() => closeCardInfo());
      const toggle = page.locator('#card-panel-toggle'), menu = page.locator('#card-menu-toggle');
      for (let repeat = 0; repeat < 3; repeat++) {
        await menu.tap(); assert.equal(await menu.getAttribute('aria-expanded'), 'true');
        assert.equal(await toggle.isVisible(), false);
        assert.equal(await toggle.evaluate(n => getComputedStyle(n).pointerEvents), 'none');
        await menu.tap(); await page.waitForTimeout(250); assert.equal(await menu.getAttribute('aria-expanded'), 'false'); assert(await toggle.isVisible());
      }
      await page.evaluate(() => { setExtraMenuOpen('main', true); }); assert.equal(await toggle.isVisible(), false);
      await page.evaluate(() => closeExtraMenu({ instant: true })); assert(await toggle.isVisible());
      const rect = await toggle.boundingBox(); await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2); await page.mouse.down();
      const pressed = await toggle.evaluate(n => { const s = getComputedStyle(n), plate = getComputedStyle(n, '::before'), arrow = getComputedStyle(n.querySelector('svg')); return { background: s.backgroundColor, shadow: s.boxShadow, tap: s.webkitTapHighlightColor, outline: s.outlineStyle, plate: [plate.width, plate.height, plate.opacity], arrow: [arrow.width, arrow.height, arrow.opacity, arrow.transform] }; });
      assert.equal(pressed.background, 'rgba(0, 0, 0, 0)'); assert.equal(pressed.shadow, 'none'); assert.equal(pressed.tap, 'rgba(0, 0, 0, 0)'); assert.equal(pressed.outline, 'none');
      assert.deepEqual(pressed.plate, ['35px', '35px', '1']); assert.deepEqual(pressed.arrow, ['21px', '21px', '1', 'none']);
      await page.mouse.up(); await page.waitForTimeout(300); assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
      await toggle.tap(); await page.waitForTimeout(300); assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      assert.deepEqual(errors, []);
      console.log(`PASS ${viewport.width}x${viewport.height}: popup scrollbar/close parity, compact layout, repeated scroll reset, menu visibility, transparent press and panel toggle`);
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
