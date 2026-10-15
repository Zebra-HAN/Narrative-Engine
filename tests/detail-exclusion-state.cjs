const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { execFileSync } = require('node:child_process');

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  try {
    for (const width of [320, 393, 852]) {
      const page = await browser.newPage({ viewport: { width, height: 852 }, hasTouch: true, serviceWorkers: 'block' });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route(/fonts\.(googleapis|gstatic)\.com/, route => route.abort());
      if (process.env.BASELINE_COMMIT) {
        const body = execFileSync('git', ['show', `${process.env.BASELINE_COMMIT}:js/app.js`], { encoding: 'utf8' });
        await page.route('**/js/app.js', route => route.fulfill({ body, contentType: 'application/javascript' }));
      }
      await page.goto(process.env.PERF_TEST_URL);
      await page.waitForTimeout(1600);
      await page.evaluate(() => { goToCreate(); switchNav('character', true); selectSub('race'); });
      await page.waitForFunction(() => document.querySelector('#page-race.active[data-chrome-view=group]'));
      await page.evaluate(() => {
        CARD_DATA.fixture = [0, 1].map(i => ({ name: `Exclusion fixture ${i}`, desc: `Description ${i}`, img: 'images/core/buttons/check.webp', subImg: 'images/core/buttons/lock.webp', detail: 'Idea A\n\nIdea B' }));
        NAV_DATA.character.subs.push({ id: 'fixture', label: 'Fixture', icon: '✦' });
        currentSubId = 'fixture'; showCardPage('fixture', false, true); cardClick('fixture', 0); openDetailSheet('card');
      });
      const result = await page.evaluate(async () => {
        const key = 'fixture__0', completed = [];
        const check = (condition, message) => { if (!condition) throw new Error(message); };
        const idea = i => toggleDetailCheck('fixture', 0, i);
        const excluded = (image, desc, label) => {
          check(!!excludedMainImages[key] === image, `${label}: image preference`);
          check((selectedDescs[key] === false) === desc, `${label}: description preference`);
          check(document.querySelector('.main-image-selectable').classList.contains('checked') === !image, `${label}: image UI`);
          check(document.getElementById('detail-desc').getAttribute('aria-pressed') === String(!desc), `${label}: description UI`);
        };
        const card = (expected, label) => {
          check(!!selectedCards.fixture?.has(0) === expected, `${label}: card selection`);
          check(document.querySelector('.detail-sheet').classList.contains('card-selected') === expected, `${label}: seal`);
        };
        const reset = () => {
          selectedCards = {}; lockedCards = {}; selectedDetails = {}; selectedSubImages = {}; selectedDescs = {}; excludedMainImages = {}; autoSelectedCardKeys.clear();
          closeDetailSheet(); closeCardInfo(); cardClick('fixture', 0); openDetailSheet('card');
        };
        for (const [image, desc] of [[true, false], [false, true], [true, true]]) {
          for (const beforeIdea of [true, false]) {
            reset();
            if (!beforeIdea) idea(0);
            if (image) toggleMainImageCheck('fixture', 0);
            if (desc) toggleDescCheck('fixture', 0);
            if (beforeIdea) { card(false, 'exclusions alone'); idea(0); }
            excluded(image, desc, 'after selection'); card(true, 'automatic selection');
            idea(0); excluded(image, desc, 'after last idea removal'); card(false, 'automatic deselection');
            completed.push(`${image}/${desc}/${beforeIdea}`);
          }
        }
        reset(); toggleMainImageCheck('fixture', 0); toggleDescCheck('fixture', 0);
        idea(0); idea(1); idea(0); card(true, 'one idea remains'); excluded(true, true, 'partial removal');
        idea(1); card(false, 'all removed'); idea(0); excluded(true, true, 'reselect');
        toggleMainImageCheck('fixture', 0); excluded(false, true, 'only image included');
        toggleMainImageCheck('fixture', 0); toggleDescCheck('fixture', 0); excluded(true, false, 'only description included');
        toggleDescCheck('fixture', 0);
        closeDetailSheet(); closeCardInfo(); cardClick('fixture', 1); openDetailSheet('card');
        check(!excludedMainImages.fixture__1 && selectedDescs.fixture__1 !== false, 'other card isolation');
        closeDetailSheet(); closeCardInfo(); cardClick('fixture', 0); openDetailSheet('card'); excluded(true, true, 'reentry');
        toggleCardSelect('fixture', 0); // Explicit cancellation clears ideas, retaining exclusions.
        card(false, 'direct cancel'); check(!selectedDetails[key] && !selectedSubImages[key], 'direct cancel clears ideas'); excluded(true, true, 'direct cancel preferences');
        toggleCardSelect('fixture', 0); idea(0); idea(0); card(true, 'manual selection survives'); excluded(true, true, 'manual selection preferences');
        toggleCurrentCardLock(); idea(0); toggleMainImageCheck('fixture', 0); toggleDescCheck('fixture', 0);
        excluded(true, true, 'locked'); check(!selectedDetails[key], 'lock blocks idea selection');
        toggleCurrentCardLock(); idea(0);
        toggleSubImageCheck('fixture', 0); idea(0); card(true, 'subimage keeps selection');
        toggleSubImageCheck('fixture', 0); card(true, 'manual card remains'); excluded(true, true, 'subimage changes');
        toggleCardSelect('fixture', 0); toggleSubImageCheck('fixture', 0); card(true, 'subimage auto selects');
        toggleSubImageCheck('fixture', 0); card(false, 'subimage auto deselects'); excluded(true, true, 'subimage automatic cycle');
        // Random-selection cleanup must not discard exclusions on unselected cards.
        selectCardWithDefaults('fixture', 1); clearDeselectedDetails('fixture'); excluded(true, true, 'random cleanup');
        const confirm = showAppConfirm; showAppConfirm = async () => true;
        try {
          await partialReset(); excluded(false, false, 'explicit category reset');
          toggleMainImageCheck('fixture', 0); toggleDescCheck('fixture', 0);
          await fullReset(); excluded(false, false, 'explicit full reset');
        } finally { showAppConfirm = confirm; }
        completed.push('multiple ideas, independent preferences, reentry, direct selection/cancel, lock, subimages, random cleanup, explicit resets');
        return completed;
      });
      assert.equal(result.length, 7);
      // Exercise the real tap handlers, then inspect the integrated output.
      await page.evaluate(() => { closeDetailSheet(); closeCardInfo(); cardClick('fixture', 0); openDetailSheet('card'); });
      await page.waitForTimeout(400);
      await page.locator('.main-image-selectable').tap();
      await page.locator('#detail-desc').tap();
      await page.locator('.detail-idea-block').first().tap();
      await page.evaluate(() => openStatusOverlay());
      assert.equal(await page.locator('#status-body .status-chip-name').count(), 1);
      assert.equal(await page.locator('#status-body .status-chip-desc').count(), 0);
      assert.equal(await page.locator('#status-body .status-chip-img').count(), 0);
      await page.evaluate(() => closeStatusOverlay());
      await page.locator('.detail-idea-block').first().tap();
      assert.equal(await page.locator('#detail-desc').getAttribute('aria-pressed'), 'false');
      assert.equal(await page.locator('.main-image-selectable').getAttribute('aria-pressed'), 'false');
      assert.equal(await page.locator('.detail-sheet').evaluate(n => n.classList.contains('card-selected')), false);
      assert.deepEqual(errors, []);
      console.log(`PASS ${width}: exclusions independent of automatic/manual selection, subimages, locks, reentry, integration and explicit resets`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
