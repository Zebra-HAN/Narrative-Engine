const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const data = require('./compass-data.cjs');
const reader = data.cards.reader;

(async () => {
 const browser = await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try {
  for (const width of [393,1280]) {
   const page = await browser.newPage({viewport:{width,height:852},serviceWorkers:'block'});
   const errors=[];page.on('pageerror',e => errors.push(e.message));
   await page.goto(process.env.PERF_TEST_URL || 'http://127.0.0.1:8000');
   await page.waitForTimeout(1600);
   await page.evaluate(() => {goToCreate();switchNav('compass',true);selectSub('reader');});
   await page.waitForSelector('#page-reader.active[data-chrome-view=group]');
   assert.equal(await page.locator('#page-reader [data-group-action=cards]').count(),9);
   for (let gi=0;gi<9;gi++) {
    await page.locator(`#page-reader [data-group-idx="${gi}"]`).click();
    await page.waitForSelector('.center-page.active[data-chrome-view=cards]');
    const group = reader.groups[gi];
    assert.equal(await page.locator('.center-page.active .card-grid:not(.card-grid-layout-d)').count(),0);
    assert.equal(await page.locator('.center-page.active .card-section-header').count(),group.cards.filter(c => c.type === 'section').length);
    assert.deepEqual(await page.locator('.center-page.active .card-name-text').allTextContents(),group.cards.filter(c => c.type !== 'section').map(c => c.name));
    const rendered = await page.evaluate(gi => {
     const results=[];
     CARD_DATA.reader.groups[gi].cards.forEach((c,ci) => {
      if(c.type === 'section')return;
      groupCardClick('reader',gi,ci);openDetailSheet('card');
      results.push({name:document.querySelector('#detail-name').textContent,desc:document.querySelector('#detail-desc').textContent,extras:document.querySelectorAll('#detail-body .detail-idea-block').length});
      closeDetailSheet();closeCardInfo();
     });return results;
    },gi);
    assert.deepEqual(rendered,group.cards.filter(c => c.type !== 'section').map(c => ({...c,extras:0})));
    await page.evaluate(() => navigateAddressBack());
    await page.waitForSelector('#page-reader.active[data-chrome-view=group]');
   }
   const state = await page.evaluate(async () => {
    showAppConfirm=async()=>true;
    const candidates=getRandomCandidates('reader');
    const idx=candidates[0].globalIdx;
    selectCardWithDefaults('reader',idx,true);
    const automatic=selectedCards.reader.has(idx)&&autoSelectedCardKeys.has(`reader__${idx}`);
    showGroupCards('reader',0,true);groupCardClick('reader',0,idx);
    toggleCurrentCardLock();groupCardDblClick('reader',0,idx);
    const lockPreserved=selectedCards.reader.has(idx)&&isCardLocked('reader',idx);
    await randomSelectCurrent();
    const scoped=[...selectedCards.reader];
    await randomSelectAll();
    const all=[...selectedCards.reader];
    const valid=candidates.every(c=>c.type!=='section'&&getCardByGlobalIdx('reader',c.globalIdx).name===c.name);
    showGroupCards('reader',0,true);groupCardClick('reader',0,idx);toggleCurrentCardLock();
    const unlocked=!isCardLocked('reader',idx);
    return {count:candidates.length,automatic,lockPreserved,scoped,all,valid,unlocked,idx};
   });
   assert.equal(state.count,1944);assert(state.automatic&&state.lockPreserved&&state.valid&&state.unlocked);
   for(const selection of [state.scoped,state.all]) {assert.equal(selection.length,2);assert(selection.includes(state.idx));}
   await page.evaluate(() => {selectSub('genre');selectSub('reader');});
   await page.waitForSelector('#page-reader.active[data-chrome-view=group]');
   assert.equal(await page.locator('#page-reader [data-group-action=cards]').count(),9);
   await page.reload();
   await page.waitForTimeout(1600);
   await page.evaluate(() => {goToCreate();switchNav('compass',true);selectSub('reader');});
   await page.waitForSelector('#page-reader.active[data-chrome-view=group]');
   assert.deepEqual(errors,[]);
   console.log(`PASS ${width}: source parity, 9 groups/51 sections/1944 details, navigation/reentry, automatic/random selection and locks`);
   await page.close();
  }
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
