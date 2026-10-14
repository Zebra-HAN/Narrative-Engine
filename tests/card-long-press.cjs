const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
 const browser = await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try {
  for (const touch of [false,true]) {
   const page = await browser.newPage({viewport:{width:393,height:852},hasTouch:touch,serviceWorkers:'block'});
   const errors=[]; page.on('pageerror',e=>errors.push(e.message));
   await page.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
   await page.addInitScript(() => {window.serializeStateForLP=()=>({cards:Object.fromEntries(Object.entries(selectedCards).map(([k,v])=>[k,[...v]])),locks:Object.fromEntries(Object.entries(lockedCards).map(([k,v])=>[k,[...v]])),details:Object.fromEntries(Object.entries(selectedDetails).map(([k,v])=>[k,[...v]])),descs:selectedDescs,images:selectedSubImages,excluded:excludedMainImages});});
   await page.goto(process.env.PERF_TEST_URL); await page.waitForTimeout(1600);
   await page.evaluate(()=>{goToCreate();switchNav('character',true);selectSub('race');});
   await page.waitForFunction(()=>document.querySelector('#page-race.active[data-chrome-view=group]'));
   const cdp=await page.context().newCDPSession(page);
   for (const kind of ['card','group','subgroup']) {
    await page.evaluate(kind=>{
     closeDetailSheet();closeCardInfo();
     if(kind==='card'){CARD_DATA.lpfixture=[{name:'Long press fixture',icon:'✦',desc:'Description',detail:'【Ideas】\nIdea one\nIdea two'}];showCardPage('lpfixture',false,true);}
     else if(kind==='group')showGroupCards('race',2,true);
     else showSubgroupCards('race',0,0,true);
    },kind);
    const card=page.locator('.center-page.active .data-card').first();
    await card.scrollIntoViewIfNeeded();await page.waitForTimeout(700);
    const short=()=>touch?card.tap():card.click();
    await short();
    const identity=await page.evaluate(()=>({subId:focusedCard.subId,idx:focusedCard.idx}));
    await page.locator('.card-info-popover:not(.is-closing) .card-info-copy').click();
    const expected=await page.locator('#detail-body').innerHTML();
    await page.evaluate(()=>closeDetailSheet());
    for(const status of ['unselected','selected','locked']) {
     await page.evaluate(({identity,status})=>{
      const {subId,idx}=identity;selectedCards[subId]=new Set(status==='unselected'?[]:[idx]);lockedCards[subId]=new Set(status==='locked'?[idx]:[]);
      selectedDetails[`${subId}__${idx}`]=new Set([0]);selectedDescs[`${subId}__${idx}`]=true;selectedSubImages[`${subId}__${idx}`]=true;
      refreshCardInfo();window.lpSnapshot=JSON.stringify(serializeStateForLP());
     },{identity,status});
     const box=await card.boundingBox();const x=box.x+box.width/2,y=box.y+box.height/2;
     if(touch)await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
     else {await page.mouse.move(x,y);await page.mouse.down();}
     await page.waitForTimeout(250);
     assert.equal(await page.locator('#detail-overlay').evaluate(n=>n.classList.contains('active')),false);
     await page.waitForTimeout(350);
     assert.equal(await page.locator('#detail-overlay').evaluate(n=>n.classList.contains('active')),true);
     assert.deepEqual(await page.evaluate(()=>({subId:focusedCard.subId,idx:focusedCard.idx})),identity);
     assert.equal(await page.evaluate(()=>JSON.stringify(serializeStateForLP())),await page.evaluate(()=>lpSnapshot));
     const focused=await page.evaluate(()=>focusedCard.name);
     if(touch)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});else await page.mouse.up();
     // Some browsers retarget the release to the overlay and emit no card click.
     if(await page.evaluate(()=>_lpDidFire))await card.dispatchEvent('click');
     assert.equal(await page.evaluate(()=>focusedCard?.name),focused);
     assert.equal(await page.evaluate(()=>JSON.stringify(serializeStateForLP())),await page.evaluate(()=>lpSnapshot));
     await page.evaluate(()=>closeDetailSheet());
    }
    await page.evaluate(()=>{lockedCards[focusedCard.subId]=new Set();selectedCards[focusedCard.subId]=new Set();refreshCardInfo();});
    await page.locator('.card-info-select').click();assert(await page.evaluate(()=>selectedCards[focusedCard.subId].has(focusedCard.idx)));
    await page.locator('.card-info-lock').click();assert(await page.evaluate(()=>isCardLocked(focusedCard.subId,focusedCard.idx)));
    await page.locator('.card-info-lock').click();await page.locator('.card-info-select').click();
    await short();assert.equal(await page.evaluate(()=>focusedCard),null);
    await short();assert(await page.evaluate(()=>Boolean(focusedCard)));
    await page.evaluate(()=>{const el=getFocusedCardElement();startLongPress({touches:[{clientX:20,clientY:20}]},el,'card','lpfixture',0);document.dispatchEvent(new TouchEvent('touchmove',{touches:[new Touch({identifier:1,target:el,clientX:29,clientY:20})]}));});
    await page.waitForTimeout(550);assert.equal(await page.locator('#detail-overlay').evaluate(n=>n.classList.contains('active')),false);
    if(kind==='card'){await page.locator('.card-info-popover:not(.is-closing) .card-info-copy').click();assert.equal(await page.locator('#detail-body').innerHTML(),expected);await page.evaluate(()=>closeDetailSheet());}
    console.log(`PASS ${touch?'touch':'mouse'} ${kind}: threshold, details, preserved state, release click, short click, select/lock`);
   }
   assert.deepEqual(errors,[]);await page.close();
  }
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
