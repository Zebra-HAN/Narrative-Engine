const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');

function load(source) {
  return vm.runInNewContext(`${source}\nJSON.stringify({nav:COMPASS_NAV,cards:COMPASS_CARDS})`);
}
const data = JSON.parse(load(fs.readFileSync('data/compass.js', 'utf8')));
const baseline = JSON.parse(load(execFileSync('git', ['show', 'fce1bca:data/compass.js'], {encoding:'utf8',maxBuffer:8*1024*1024})));
assert.deepEqual(data.nav.subs.map(s => s.id), ['type','genre','destination',...baseline.nav.subs.slice(2).map(s => s.id)]);
assert.equal(data.nav.subs[2].img, data.nav.subs.find(s => s.id === 'experience').img);
assert.deepEqual({...data.nav,subs:data.nav.subs.filter(s => s.id !== 'destination')}, baseline.nav);
const {destination,...existing} = data.cards;
assert.deepEqual(existing, baseline.cards, 'existing category data is unchanged');
const source = fs.readFileSync('docs/dramatic-destination-source.md', 'utf8');
const expectedCards = [...source.matchAll(/^\d+\. \*\*(.+)\*\* — (.+)$/gm)].map(m => ({name:m[1],desc:m[2]}));
const expectedSections = [...source.matchAll(/^\*\*([A-E]\d+\. .+)\*\*$/gm)].map(m => m[1]);
assert.equal(destination.groups.length,5);
assert.deepEqual(destination.groups.map(g => g.cards.filter(c => c.type !== 'section').length),[85,64,65,32,43]);
assert.deepEqual(destination.groups.flatMap(g => g.cards.filter(c => c.type === 'section').map(c => c.label)),expectedSections);
assert.equal(expectedSections.length,19);
assert.equal(expectedCards.length,289);
assert.deepEqual(destination.groups.flatMap(g => g.cards.filter(c => c.type !== 'section')),expectedCards);

(async () => {
 const browser = await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try {
  for (const width of [393,1280]) {
   const page = await browser.newPage({viewport:{width,height:852},serviceWorkers:'block'});
   const errors=[];page.on('pageerror',e => errors.push(e.message));
   await page.goto(process.env.PERF_TEST_URL || 'http://127.0.0.1:8000');
   await page.waitForTimeout(1600);
   await page.evaluate(() => {goToCreate();switchNav('compass',true);selectSub('destination');});
   await page.waitForSelector('#page-destination.active[data-chrome-view=group]');
   assert.equal(await page.locator('#page-destination [data-group-action=cards]').count(),5);
   for (let gi=0;gi<5;gi++) {
    await page.locator(`#page-destination [data-group-idx="${gi}"]`).click();
    await page.waitForSelector('.center-page.active[data-chrome-view=cards]');
    const group = destination.groups[gi];
    assert.equal(await page.locator('.center-page.active .card-section-header').count(),group.cards.filter(c => c.type === 'section').length);
    assert.deepEqual(await page.locator('.center-page.active .card-name-text').allTextContents(),group.cards.filter(c => c.type !== 'section').map(c => c.name));
    const rendered = await page.evaluate(gi => {
     const results=[];
     CARD_DATA.destination.groups[gi].cards.forEach((c,ci) => {
      if(c.type === 'section')return;
      groupCardClick('destination',gi,ci);openDetailSheet('card');
      results.push({name:document.querySelector('#detail-name').textContent,desc:document.querySelector('#detail-desc').textContent,extras:document.querySelectorAll('#detail-body .detail-idea-block').length});
      closeDetailSheet();closeCardInfo();
     });return results;
    },gi);
    assert.deepEqual(rendered,group.cards.filter(c => c.type !== 'section').map(c => ({...c,extras:0})));
    await page.evaluate(() => navigateAddressBack());
    await page.waitForSelector('#page-destination.active[data-chrome-view=group]');
   }
   const state = await page.evaluate(async () => {
    showAppConfirm=async()=>true;
    const candidates=getRandomCandidates('destination');
    const idx=candidates[0].globalIdx;
    selectCardWithDefaults('destination',idx,true);
    const automatic=selectedCards.destination.has(idx)&&autoSelectedCardKeys.has(`destination__${idx}`);
    showGroupCards('destination',0,true);groupCardClick('destination',0,idx);
    toggleCurrentCardLock();groupCardDblClick('destination',0,idx);
    const lockPreserved=selectedCards.destination.has(idx)&&isCardLocked('destination',idx);
    await randomSelectCurrent();
    const scoped=[...selectedCards.destination];
    await randomSelectAll();
    const all=[...selectedCards.destination];
    const valid=candidates.every(c=>c.type!=='section'&&getCardByGlobalIdx('destination',c.globalIdx).name===c.name);
    showGroupCards('destination',0,true);groupCardClick('destination',0,idx);toggleCurrentCardLock();
    const unlocked=!isCardLocked('destination',idx);
    return {count:candidates.length,automatic,lockPreserved,scoped,all,valid,unlocked,idx};
   });
   assert.equal(state.count,289);assert(state.automatic&&state.lockPreserved&&state.valid&&state.unlocked);
   for(const selection of [state.scoped,state.all]) {assert.equal(selection.length,2);assert(selection.includes(state.idx));}
   await page.evaluate(() => {selectSub('genre');selectSub('destination');});
   await page.waitForSelector('#page-destination.active[data-chrome-view=group]');
   assert.equal(await page.locator('#page-destination [data-group-action=cards]').count(),5);
   await page.reload();
   await page.waitForTimeout(1600);
   await page.evaluate(() => {goToCreate();switchNav('compass',true);selectSub('destination');});
   await page.waitForSelector('#page-destination.active[data-chrome-view=group]');
   assert.deepEqual(errors,[]);
   console.log(`PASS ${width}: source parity, 5 groups/19 sections/289 details, navigation/reentry, automatic/random selection and locks`);
   await page.close();
  }
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
