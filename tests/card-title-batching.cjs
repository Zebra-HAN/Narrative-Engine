const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const fixtures = [
  { name: 'section20', nav: 'character', id: 'race', g: 1, sg: 1 },
  { name: 'control4', nav: 'character', id: 'race', g: 1, sg: 0 },
  { name: 'race139', nav: 'character', id: 'race', g: 2 },
  { name: 'compass116', nav: 'compass', id: 'experience', g: 1 }
];
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', r => /fonts\.(googleapis|gstatic)\.com/.test(r.request().url()) ? r.abort() : r.continue());
    await page.goto(process.env.PERF_TEST_URL || 'http://127.0.0.1:8001');
    await page.waitForTimeout(1600);
    await page.evaluate(() => goToCreate());
    // Freeze motion for geometry equivalence only; product animations are untouched.
    await page.addStyleTag({ content: '.data-card{animation:none!important;transform:none!important}' });
    let comparisons = 0;
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      for (const fixture of fixtures) {
        await page.evaluate(f => {
          switchNav(f.nav, true); selectSub(f.id);
          if (f.sg === undefined) showGroupCards(f.id, f.g);
          else { showSubgroupPage(f.id, f.g); showSubgroupCards(f.id, f.g, f.sg); }
        }, fixture);
        await page.waitForTimeout(180);
        for (const layout of ['a', 'b', 'c', 'd']) {
          const result = await page.evaluate(layout => {
            document.querySelectorAll('.center-page.active .card-grid').forEach(grid => { grid.className = 'card-grid card-grid-layout-' + layout; });
            const titles = [...document.querySelectorAll('.center-page.active .card-name')];
            const reset = () => titles.forEach(container => {
              cardTitleFitCache.delete(container);
              const text = container.querySelector('.card-name-text');
              text.style.removeProperty('font-size'); text.style.removeProperty('line-height');
            });
            const snapshot = () => titles.map(container => {
              const text = container.querySelector('.card-name-text');
              const range = document.createRange(); range.selectNodeContents(text);
              return { fontSize: text.style.fontSize, lineHeight: text.style.lineHeight,
                width: container.clientWidth, height: container.clientHeight,
                lines: [...range.getClientRects()].map(r => [Math.round(r.width * 100), Math.round(r.height * 100)]) };
            });
            reset(); titles.forEach(fitCardTitle); const reference = snapshot();
            reset(); fitAllCardTitles(); const batched = snapshot();
            // A repeated fit must be a cache hit with no changed output.
            fitAllCardTitles(); const repeated = snapshot();
            return { reference, batched, repeated };
          }, layout);
          assert.deepEqual(result.batched, result.reference, `${fixture.name} width ${width}, layout ${layout}`);
          assert.deepEqual(result.repeated, result.reference);
          comparisons++;
        }
      }
    }
    assert.deepEqual(errors, []);
    console.log(`PASS ${comparisons} sequential/batched/cache-hit comparisons: all title sizes, line boxes and container geometry identical`);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
