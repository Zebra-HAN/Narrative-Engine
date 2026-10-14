const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
for(const viewport of [{width:320,height:568},{width:393,height:852},{width:852,height:393}]){
 const page=await browser.newPage({viewport,hasTouch:true,serviceWorkers:'block'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());await page.goto(process.env.PERF_TEST_URL);await page.waitForTimeout(1600);
 await page.evaluate(()=>{goToCreate();switchNav('character',true);selectSub('race');});await page.waitForFunction(()=>document.querySelector('#page-race.active[data-chrome-view=group]'));
 for(const count of [1,2,3,4,5]){
  await page.evaluate(count=>{CARD_DATA.fixture=[{name:'Unclassified'},...Array.from({length:count},(_,i)=>[{type:'section',label:`Section ${i}`},{name:`Card ${i}`}]).flat()];currentSubId='fixture';showCardPage('fixture',false,true);},count);await page.waitForTimeout(350);await page.locator('#card-minimap-toggle').click();await page.waitForTimeout(250);
  assert.deepEqual(await page.locator('#card-minimap details').evaluateAll(ns=>ns.map(n=>n.open)),[true,...Array(count).fill(count<=3)]);
  assert.equal(await page.locator('#card-minimap-close').count(),0);
  const summary=page.locator('#card-minimap summary').first();assert.equal(await summary.evaluate(n=>getComputedStyle(n).listStyleType),'none');
  await summary.click();assert.equal(await summary.evaluate(n=>n.parentElement.open),false);await summary.click();assert.equal(await summary.evaluate(n=>n.parentElement.open),true);
  await page.locator('#card-minimap-expand').click();assert(await page.locator('#card-minimap details').evaluateAll(ns=>ns.every(n=>n.open)));
  await page.locator('#card-minimap-collapse').click();assert(await page.locator('#card-minimap details').evaluateAll(ns=>ns.every(n=>!n.open)));
  await page.locator('#card-minimap').press('Escape');await page.waitForTimeout(250);
 }
 await page.evaluate(()=>{CARD_DATA.fixture=[{name:'Fixture',img:'images/core/buttons/check.webp',desc:'Description',detail:'【Ideas】\n'+Array.from({length:30},(_,i)=>`Idea ${i}`).join('\n\n'),subImg:'images/core/buttons/lock.webp'}];showCardPage('fixture',false,true);cardClick('fixture',0);openDetailSheet('card');});await page.waitForTimeout(350);
 const paint=(sel,pseudo='')=>page.locator(sel).first().evaluate((n,p)=>{const s=getComputedStyle(n,p||null);return {bg:s.backgroundImage,color:s.color,filter:s.filter,transform:s.transform,pointer:s.pointerEvents}},pseudo);
 await page.evaluate(()=>toggleDetailCheck('fixture',0,0));assert((await paint('.detail-idea-block.checked','::after')).bg.includes('check.webp'));assert((await paint('.detail-sheet','::after')).bg.includes('check.webp'));
 await page.evaluate(()=>{toggleMainImageCheck('fixture',0);toggleDescCheck('fixture',0);});assert((await paint('#detail-icon .detail-image-selection-frame','::after')).bg.includes('cancel.webp'));assert((await paint('.detail-desc-selection-frame','::after')).bg.includes('cancel.webp'));
 await page.evaluate(()=>{toggleMainImageCheck('fixture',0);toggleDescCheck('fixture',0);toggleCurrentCardLock();});
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('.detail-idea-block:not(.checked)')).color === 'rgb(43, 64, 85)');assert((await paint('.detail-sheet','::after')).bg.includes('lock.webp'));const frozen=await paint('.detail-idea-block:not(.checked)');assert.deepEqual(await paint('#detail-desc'),{...await paint('#detail-desc'),bg:frozen.bg,color:frozen.color,filter:frozen.filter});assert.equal((await paint('#detail-name')).color,frozen.color);assert.equal((await paint('.detail-section-title')).color,frozen.color);
 const before=await page.evaluate(()=>JSON.stringify([Array.from(selectedDetails.fixture__0),selectedSubImages.fixture__0,selectedDescs.fixture__0,excludedMainImages.fixture__0]));
 await page.evaluate(()=>{toggleDetailCheck('fixture',0,1);toggleSubImageCheck('fixture',0);toggleDescCheck('fixture',0);toggleMainImageCheck('fixture',0);const n=document.querySelector('.detail-sub-image-row');const t=new Touch({identifier:1,target:n,clientX:100,clientY:300});n.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[t],changedTouches:[t]}));n.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[],changedTouches:[t]}));});
 assert.equal((await paint('.detail-sub-image-row')).transform,'none');assert.equal(await page.locator('.detail-sub-image-row').evaluate(n=>n.classList.contains('is-pressing')),false);
 assert.equal(await page.evaluate(()=>JSON.stringify([Array.from(selectedDetails.fixture__0),selectedSubImages.fixture__0,selectedDescs.fixture__0,excludedMainImages.fixture__0])),before);
 if(process.env.PREVIEW_DIR)await page.screenshot({path:`${process.env.PREVIEW_DIR}/detail-lock-${viewport.width}.png`});
 const seal=await page.locator('.detail-sheet').evaluate(n=>getComputedStyle(n,'::after').top);await page.evaluate(()=>document.getElementById('detail-content').scrollTop=500);assert.equal(await page.locator('.detail-sheet').evaluate(n=>getComputedStyle(n,'::after').top),seal);assert(await page.locator('#detail-content').evaluate(n=>n.scrollTop>0));
 await page.evaluate(()=>{toggleCurrentCardLock();toggleSubImageCheck('fixture',0);toggleDetailCheck('fixture',0,0);});assert.equal(await page.locator('.detail-sub-image-row').evaluate(n=>n.disabled),false);assert((await paint('.detail-sheet','::after')).bg.includes('check.webp'));assert.equal((await paint('.detail-idea-block:first-of-type','::after')).bg,'none');
 await page.evaluate(()=>{closeDetailSheet();openDetailSheet('card');});assert.equal(await page.locator('#detail-content').evaluate(n=>n.scrollTop),0);
 await page.evaluate(()=>toggleDescCheck('fixture',0));
 const cancel=await paint('.detail-desc-selection-frame','::after');assert.equal(cancel.filter,'none');assert.equal((await paint('.detail-desc-selection-frame')).filter,'none');assert.notEqual((await paint('#detail-desc')).filter,'none');assert(cancel.bg.includes('cancel.webp'));assert.equal(await page.locator('.detail-desc-selection-frame').evaluate(n=>getComputedStyle(n,'::after').backgroundSize),'65px 65px');assert((await paint('.detail-sub-image-row .detail-image-selection-frame','::before')).bg.includes('check.webp'));
 await page.evaluate(()=>toggleSubImageCheck('fixture',0));assert.equal((await paint('.detail-sub-image-row .detail-image-selection-frame','::before')).bg,'none');
 assert.deepEqual(errors,[]);console.log(`PASS ${viewport.width}x${viewport.height}: section counts, unclassified, controls, independent markers, lock and unlock, frozen scroll seal, reopening`);await page.close();
}
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
