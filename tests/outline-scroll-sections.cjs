const assert = require('node:assert/strict');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  try {
    for (const viewport of [{ width: 375, height: 667 }, { width: 852, height: 393 }]) {
      const page = await browser.newPage({ viewport, hasTouch: true, serviceWorkers: 'block' });
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
      await page.goto(process.env.PERF_TEST_URL); await page.waitForTimeout(1600);
      await page.evaluate(() => {
        goToCreate(); switchNav('character', true); selectSub('race');
      });
      await page.waitForFunction(() => document.querySelector('#page-race.active[data-chrome-view=group]'));
      await page.evaluate(() => {
        CARD_DATA.outlineScroll = Array.from({ length: 6 }, (_, section) => [
          { type: 'section', label: `Section ${section + 1} — description` },
          ...Array.from({ length: 24 }, (_, card) => ({ name: `Card ${section + 1}.${card + 1}`, icon: '✦' }))
        ]).flat();
        showCardPage('outlineScroll', false, true);
        window.scrollPage = document.querySelector('.center-page.active[data-chrome-view="cards"]');
        selectedCards.outlineScroll = new Set([0]); lockedCards.outlineScroll = new Set([0]);
      });
      await page.waitForTimeout(500);
      const toggle = page.locator('#card-minimap-toggle'), close = page.locator('#card-minimap-close');
      const active = async () => {
        const sections = page.locator('#card-minimap details.is-current-section');
        assert.equal(await sections.count(), 1);
        assert.equal(await page.locator('#card-minimap summary[aria-current="location"]').count(), 1);
        return sections.locator('summary').evaluate(n=>[...n.childNodes].filter(c=>c.nodeType===3||!c.classList?.contains('card-minimap-count')).map(c=>c.textContent).join(''));
      };
      const open = async () => { await toggle.click(); await page.waitForTimeout(250); };
      const dismiss = async () => { await close.click(); await page.waitForTimeout(250); };
      await open(); assert((await active()).startsWith('Section 1'));
      await page.locator('#card-minimap summary').first().click(); assert(await page.locator('#card-minimap details').first().evaluate(n => n.open));
      await page.locator('#card-minimap summary').first().click(); assert.equal(await page.locator('#card-minimap details').first().evaluate(n => n.open), false);
      // Update the underlying page while the outline is open, including boundary noise.
      const boundary = await page.evaluate(() => {
        const rows=[...new Set([...scrollPage.querySelectorAll('.data-card')].slice(0,24).map(c=>c.getBoundingClientRect().top))].sort((a,b)=>a-b);
        const heading={getBoundingClientRect:()=>({top:rows[Math.max(0,rows.length-3)]})};
        return scrollPage.scrollTop + heading.getBoundingClientRect().top - scrollPage.getBoundingClientRect().top;
      });
      for (const delta of [-7, -4, -3]) {
        await page.evaluate(top => { scrollPage.scrollTop = top; }, boundary + delta); await page.waitForTimeout(40);
        assert((await active()).startsWith('Section 1'), 'small boundary jitter retains the marker');
      }
      await page.evaluate(top => { scrollPage.scrollTop = top; }, boundary + 1); await page.waitForTimeout(40);
      assert((await active()).startsWith('Section 2'));
      for (const delta of [0, -1, 1]) {
        await page.evaluate(top => { scrollPage.scrollTop = top; }, boundary + delta); await page.waitForTimeout(40);
        assert((await active()).startsWith('Section 2'));
      }
      await dismiss();
      await page.evaluate(() => { scrollPage.scrollTop = scrollPage.scrollHeight; });
      await open(); assert((await active()).startsWith('Section 6')); await dismiss();
      // Actual title clicks: compare slow glide samples and the precise card destination.
      let previousSectionDestination;
      for (const [index, label] of [[2, 'short'], [107, 'long'], [119, 'same-section'], [26, 'reverse']]) {
        await page.evaluate(() => { closeCardInfo(); });
        if (label !== 'reverse') await page.evaluate(label => { scrollPage.scrollTop = label === 'short' ? 120 : 0; }, label);
        await open(); await page.locator('#card-minimap-expand').click();
        const target = page.locator('.card-minimap-tag').nth(index); await target.scrollIntoViewIfNeeded();
        const motion = await page.evaluate(index => {
          const card = scrollPage.querySelectorAll('.data-card')[index];
          const grid = card.closest('.card-grid-section') || card.closest('.card-grid');
          let heading = grid.previousElementSibling;
          while (heading && !heading.classList.contains('card-section-header')) heading = heading.previousElementSibling;
          const target = heading || grid;
          const view = scrollPage.getBoundingClientRect(), info = document.getElementById('info-panel');
          const top = Math.max(0, view.top + scrollPage.clientTop, getComputedStyle(info).visibility === 'hidden' ? 0 : info.getBoundingClientRect().bottom);
          const from = scrollPage.scrollTop;
          const to = Math.max(0, Math.min(scrollPage.scrollHeight - scrollPage.clientHeight, from + target.getBoundingClientRect().top - top - 8));
          window.trace = []; window.recordMotion = true;
          const sample = () => { if (!recordMotion) return; trace.push({ time: performance.now(), top: scrollPage.scrollTop }); requestAnimationFrame(sample); }; requestAnimationFrame(sample);
          return { from, to, duration: Math.min(2600, 220 + Math.sqrt(Math.abs(to - from)) * 30), index };
        }, index);
        await target.click(); await page.waitForTimeout(motion.duration + 500);
        const trace = await page.evaluate(() => { recordMotion = false; return trace; });
        const destination = await page.evaluate(() => scrollPage.scrollTop);
        assert(Math.abs(destination - motion.to) <= 1, `${label}: exact section-start destination`);
        if (label === 'long') previousSectionDestination = destination;
        if (label === 'same-section') assert.equal(destination, previousSectionDestination);
        assert.equal(await page.locator('#card-minimap').isVisible(), false);
        const sign = Math.sign(motion.to - motion.from);
        for (let i = 1; i < trace.length; i++) assert((trace[i].top - trace[i - 1].top) * sign >= -1, `${label}: no rebound`);
        const moving = trace.filter(p => Math.abs(p.top - motion.from) > 1 && Math.abs(p.top - motion.to) > 1);
        assert(moving.length > 3, `${label}: animated travel`);
        if (label !== 'short') {
          const duration = moving.at(-1).time - moving[0].time;
          const d=Math.abs(motion.to-motion.from),r=Math.max(0,Math.min(1,(d-800)/2200)),compression=r*r*(3-2*r);
          const halfway = moving[0].time + motion.duration * (.65-.35*compression);
          const early = moving.find(p => p.time >= halfway);
          const tail = moving.find(p => p.time >= moving[0].time + motion.duration * (.75-.35*compression));
          assert(early && tail);
          assert(Math.abs(early.top - motion.to) < Math.abs(motion.to - motion.from) * .09, JSON.stringify({motion,first:moving[0],last:moving.at(-1),early,tail}));
          assert(Math.abs(tail.top - motion.to) < Math.abs(motion.to - motion.from) * .01);
          assert(Math.abs(tail.top - motion.to) > .5, 'tail still glides before settling');
        } else assert(motion.duration < 1100, 'short trips remain bounded');
        await page.waitForTimeout(200); assert.equal(await page.evaluate(() => scrollPage.scrollTop), destination);
        await open(); assert((await active()).startsWith(`Section ${Math.floor(index / 24) + 1}`)); await dismiss();
        console.log(`PASS ${viewport.width} ${label}: exact section target, monotonic glide, slow tail, bounded finish, correct section`);
      }
      // Direct touch/wheel takes precedence; no resumed animation or forced correction.
      for (const input of ['touchstart', 'wheel']) {
        await page.evaluate(() => { scrollPage.scrollTop = 0; }); await open(); await page.locator('#card-minimap-expand').click();
        await page.locator('.card-minimap-tag').nth(120).click(); await page.waitForTimeout(450);
        const stop = await page.evaluate(input => {
          const event = input === 'touchstart' ? new TouchEvent('touchstart', { bubbles: true, touches: [new Touch({ identifier: 1, target: scrollPage, clientX: 30, clientY: 100 })] }) : new WheelEvent('wheel', { bubbles: true, deltaY: 40 });
          scrollPage.dispatchEvent(event); scrollPage.scrollTop += 80; return scrollPage.scrollTop;
        }, input);
        await page.waitForTimeout(300); assert.equal(await page.evaluate(() => scrollPage.scrollTop), stop, `${input}: user motion wins immediately`);
      }
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await open(); await page.locator('#card-minimap-expand').click(); await page.locator('.card-minimap-tag').nth(12).click(); await page.waitForTimeout(50);
      assert.equal(await page.locator('#card-minimap').isVisible(), false);
      assert(await page.evaluate(() => selectedCards.outlineScroll.size === 1 && lockedCards.outlineScroll.has(0)));
      // Unclassified runs, repeated labels and empty section headers retain distinct anchors.
      await page.evaluate(() => {
        CARD_DATA.outlineEdges = [...Array.from({ length: 30 }, (_, i) => ({ name: `Unclassified ${i}`, icon: '✦' })),
          { type: 'section', label: 'Repeated' }, { name: 'Only card', icon: '✦' },
          { type: 'section', label: 'Repeated' }];
        showCardPage('outlineEdges', false, true);
        scrollPage = document.querySelector('.center-page.active[data-chrome-view="cards"]');
      });
      await open(); assert((await active()).startsWith('미분류'));
      await page.evaluate(() => { scrollPage.scrollTop = scrollPage.scrollHeight; }); await page.waitForTimeout(40);
      const expectedEdge=await page.evaluate(()=>{const view=scrollPage.getBoundingClientRect(),info=document.getElementById('info-panel'),top=Math.max(view.top,getComputedStyle(info).visibility==='hidden'?0:info.getBoundingClientRect().bottom),cards=[...scrollPage.querySelectorAll('.data-card')];let index=0;if([...new Set(cards.slice(0,30).map(c=>c.getBoundingClientRect().top))].sort((a,b)=>a-b).at(-3)<=top)index=1;if(cards[30].getBoundingClientRect().top<=top)index=2;return ['미분류 — 30','Repeated — 1','Repeated — 0'][index];});
      assert.equal(await active(), expectedEdge); await dismiss();
      assert.deepEqual(errors, []); await page.close();
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
