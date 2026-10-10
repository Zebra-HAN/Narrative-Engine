const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args:['--no-sandbox']});
  try {
    for (const query of ['', '?fantasyFlip=off', '?perf=1&fantasyFlip=on', '?perf=1&fantasyFlip=off']) {
      const context = await browser.newContext({viewport:{width:393,height:695},hasTouch:true,serviceWorkers:'block'});
      const page = await context.newPage(); const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
      await page.goto((process.env.PERF_TEST_URL || 'http://127.0.0.1:8001/')+query);
      await page.waitForTimeout(1600);
      const off = query === '?perf=1&fantasyFlip=off';
      await page.evaluate(()=>{goToCreate();switchNav('character',true);selectSub('race');});
      await page.waitForTimeout(350);
      const immediate = await page.evaluate(()=>{
        showGroupCards('race',2);
        const page=document.querySelector('.center-page.active[data-chrome-view]');
        return {flag:page.dataset.perfFantasyFlip, cards:[...page.querySelectorAll('.data-card')].map(card=>{
          const s=getComputedStyle(card);return {opacity:s.opacity,animation:s.animationName,transform:s.transform,pointer:s.pointerEvents};
        })};
      });
      assert.equal(immediate.cards.length,139);
      assert.equal(immediate.flag,off?'off':undefined);
      if(off) for(const card of immediate.cards) {
        const {pointer, ...visual} = card;
        assert.deepEqual(visual,{opacity:'1',animation:'none',transform:'none'});
        // Finalized non-sequential cards use the normal pressable rule ('all');
        // the remaining reveal cards use the diagnostic override ('auto').
        assert(['auto','all'].includes(pointer), 'all cards remain interactive');
      }
      else {
        await page.waitForTimeout(50);
        assert(await page.evaluate(()=>[...document.querySelectorAll('.center-page.active .data-card')].some(card=>getComputedStyle(card).animationName==='cardFlip')));
      }
      await page.waitForTimeout(700);
      await page.locator('.center-page.active .data-card').first().click();
      await page.locator('.card-info-select').click();
      await page.locator('.card-info-lock').click();
      assert.equal(await page.locator('.card-info-select').isDisabled(),true);
      await page.locator('.card-info-detail').click();
      assert(await page.locator('.detail-overlay').evaluate(e=>e.classList.contains('active')));
      await page.evaluate(()=>{closeDetailSheet();closeCardInfo();});
      const cdp=await context.newCDPSession(page);
      const touch=(type,x)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'||type==='touchCancel'?[]:[{x,y:420}]});
      await touch('touchStart',30);await touch('touchMove',55);await touch('touchCancel');
      await page.waitForTimeout(250);
      assert.equal(await page.locator('.center-page.active[data-chrome-view]').getAttribute('id'),'page-race_race_fantasy');
      await touch('touchStart',30);await touch('touchMove',160);await touch('touchEnd');await page.waitForTimeout(250);
      assert.equal(await page.locator('.center-page.active[data-chrome-view]').getAttribute('id'),'page-race');
      await page.evaluate(()=>showGroupCards('race',2));
      assert.equal(await page.locator('#page-race_race_fantasy').getAttribute('data-perf-fantasy-flip'),off?'off':null);
      await page.evaluate(()=>{showSubgroupPage('race',1);showSubgroupCards('race',1,1);});
      await page.waitForTimeout(50);
      const other=await page.evaluate(()=>[...document.querySelectorAll('.center-page.active .data-card')].map(c=>getComputedStyle(c).animationName));
      assert(other.includes('cardFlip'),'other screens retain their reveal');
      assert.equal(await page.locator('[data-perf-fantasy-flip]').count(),0);
      assert.deepEqual(errors,[]);
      console.log('PASS',query||'normal','visibility, opt-in, select/lock/detail, cancel/back/re-entry and other screen reveal');
      await context.close();
    }
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
