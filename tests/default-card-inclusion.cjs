const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
 const browser = await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try {
  for (const config of [{width:320,height:568,kind:'group'},{width:393,height:852,kind:'group'},{width:852,height:393,kind:'group'},{width:393,height:852,kind:'subgroup'},{width:393,height:852,kind:'plain'}]) {
   const page = await browser.newPage({viewport:config,hasTouch:true,serviceWorkers:'block'});
   const errors=[]; page.on('pageerror',e=>errors.push(e.message));
   await page.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
   await page.goto(process.env.PERF_TEST_URL);await page.waitForTimeout(1600);
   await page.evaluate(()=>{goToCreate();switchNav('character',true);selectSub('race');});
   await page.waitForFunction(()=>document.querySelector('#page-race.active[data-chrome-view=group]'));
   await page.evaluate(kind=>{
    selectedCards={};lockedCards={};selectedDescs={};excludedMainImages={};selectedSubImages={};selectedDetails={};
    let subId='race',idx;
    if(kind==='plain'){
     subId='archetype';currentSubId=subId;NAV_DATA.character.subs.find(s=>s.id===subId).type=undefined;
     CARD_DATA[subId]=[{name:'Default inclusion fixture',img:'images/core/buttons/check.webp',desc:'Default description',detail:'【Ideas】\nFirst idea\nSecond idea',subImg:'images/core/buttons/lock.webp'}];
     showCardPage(subId,false,true);cardClick(subId,0);
    }else if(kind==='subgroup'){showSubgroupCards(subId,0,0,true);idx=CARD_DATA.race.groups[0].subgroups[0].cards.findIndex(c=>c.type!=='section');subgroupCardClick(subId,0,0,idx);}
    else{showGroupCards(subId,2,true);idx=CARD_DATA.race.groups[2].cards.findIndex(c=>c.type!=='section');groupCardClick(subId,2,idx);}
    const card=getCardByGlobalIdx(focusedCard.subId,focusedCard.idx);card.desc='Default description';card.detail='【Ideas】\nFirst idea\nSecond idea';card.subImg='images/core/buttons/lock.webp';card.img ||= 'images/core/buttons/check.webp';focusedCard.desc=card.desc;focusedCard.img=card.img;
    window.cardIdentity={subId:focusedCard.subId,idx:focusedCard.idx};window.cardKey=`${cardIdentity.subId}__${cardIdentity.idx}`;
    openDetailSheet('card');
   },config.kind);
   await page.waitForTimeout(450);
   const includedPaint=()=>page.evaluate(()=>{
    const main=document.querySelector('#detail-icon .detail-card-img'),desc=document.getElementById('detail-desc'),frame=getComputedStyle(main.parentElement,'::after'),s=getComputedStyle(desc);
    return {main:getComputedStyle(main).filter,overlay:frame.backgroundColor,edge:frame.boxShadow,descFilter:s.filter,descBackground:s.backgroundImage,descColor:s.color};
   });
   const original=await includedPaint();assert.equal(original.main,'none');assert.equal(original.edge,'none');assert.equal(original.overlay,'rgba(0, 0, 0, 0)');assert.equal(original.descFilter,'none');
   // Inclusion preferences are independent even before the card has been selected.
   await page.evaluate(()=>{toggleMainImageCheck(cardIdentity.subId,cardIdentity.idx);toggleDescCheck(cardIdentity.subId,cardIdentity.idx);});
   assert(await page.evaluate(()=>!selectedCards[cardIdentity.subId]?.has(cardIdentity.idx)));
   await page.evaluate(()=>{closeDetailSheet();});await page.locator('.card-info-select').click();
   assert(await page.evaluate(()=>selectedCards[cardIdentity.subId].has(cardIdentity.idx)&&selectedDescs[cardKey]===false&&excludedMainImages[cardKey]));
   await page.evaluate(()=>openDetailSheet('card'));await page.waitForTimeout(400);assert.notEqual((await includedPaint()).main,'none');assert.notEqual((await includedPaint()).descFilter,'none');
   await page.evaluate(()=>{toggleMainImageCheck(cardIdentity.subId,cardIdentity.idx);toggleDescCheck(cardIdentity.subId,cardIdentity.idx);});assert.deepEqual(await includedPaint(),original);
   const assertStatus=async(main,desc,sub)=>{
    await page.evaluate(()=>openStatusOverlay());
    assert.equal(await page.locator('#status-body .status-chip-img').count(),main);
    assert.equal(await page.locator('#status-body .status-chip-desc').count(),desc);
    assert.equal(await page.locator('#status-body .status-chip-sub-img').count(),sub);
    assert.equal(await page.locator('#status-body .status-chip-name').count(),1);
    await page.evaluate(()=>closeStatusOverlay());
   };
   await assertStatus(1,1,0);
   await page.evaluate(()=>{toggleDetailCheck(cardIdentity.subId,cardIdentity.idx,0);toggleSubImageCheck(cardIdentity.subId,cardIdentity.idx);});
   const subPaint=await page.locator('.detail-sub-image-row .detail-image-selection-frame').evaluate(n=>({background:getComputedStyle(n,'::after').backgroundColor,edge:getComputedStyle(n,'::after').boxShadow}));assert.notEqual(subPaint.edge,'none');
   const visiblePoint=locator=>locator.evaluate(n=>{const r=n.getBoundingClientRect(),v=n.closest('.detail-sheet').getBoundingClientRect();return {x:(Math.max(r.left,v.left)+Math.min(r.right,v.right))/2,y:(Math.max(r.top,v.top+12)+Math.min(r.bottom,v.bottom-12))/2};});
   for(let repeat=0;repeat<3;repeat++){
    // A real press on the main image has feedback before release, then excludes it.
    const main=page.locator('#detail-icon');await main.scrollIntoViewIfNeeded();const r=await visiblePoint(main);await page.mouse.move(r.x,r.y);await page.mouse.down();await page.waitForTimeout(180);
    assert(await main.evaluate(n=>new DOMMatrixReadOnly(getComputedStyle(n).transform).a<.99));await page.mouse.up();
    assert.notEqual((await includedPaint()).main,'none');await assertStatus(0,1,1);
    const desc=page.locator('#detail-desc');await desc.scrollIntoViewIfNeeded();const d=await visiblePoint(desc);await page.mouse.move(d.x,d.y);await page.mouse.down();await page.waitForTimeout(180);
    assert(await desc.evaluate(n=>new DOMMatrixReadOnly(getComputedStyle(n).transform).a<.99));await page.mouse.up();
    assert.notEqual((await includedPaint()).descFilter,'none');await assertStatus(0,0,1);
    assert(await page.evaluate(()=>selectedCards[cardIdentity.subId].has(cardIdentity.idx)&&selectedDetails[cardKey].has(0)&&selectedSubImages[cardKey]));
    await main.click();await assertStatus(1,0,1);await desc.click();await assertStatus(1,1,1);
    assert.deepEqual(await includedPaint(),original);
    assert.deepEqual(await page.locator('.detail-sub-image-row .detail-image-selection-frame').evaluate(n=>({background:getComputedStyle(n,'::after').backgroundColor,edge:getComputedStyle(n,'::after').boxShadow})),subPaint);
   }
   // Exclusions survive reopening and are immutable while locked.
   await page.evaluate(()=>{toggleMainImageCheck(cardIdentity.subId,cardIdentity.idx);toggleDescCheck(cardIdentity.subId,cardIdentity.idx);closeDetailSheet();openDetailSheet('card');toggleCurrentCardLock();});
   await page.waitForTimeout(400);assert.notEqual((await includedPaint()).main,'none');assert.notEqual((await includedPaint()).descFilter,'none');
   await page.evaluate(()=>{toggleMainImageCheck(cardIdentity.subId,cardIdentity.idx);toggleDescCheck(cardIdentity.subId,cardIdentity.idx);toggleDetailCheck(cardIdentity.subId,cardIdentity.idx,0);toggleSubImageCheck(cardIdentity.subId,cardIdentity.idx);});await assertStatus(0,0,1);
   assert(await page.evaluate(()=>selectedDetails[cardKey].has(0)&&selectedSubImages[cardKey]));
   await page.evaluate(()=>{toggleCurrentCardLock();closeDetailSheet();selectCurrentCard();selectCurrentCard();openDetailSheet('card');});
   await page.waitForTimeout(400);assert.notEqual((await includedPaint()).main,'none');assert.notEqual((await includedPaint()).descFilter,'none');await assertStatus(0,0,0);
   // Long press still opens detail, without changing card selection or defaults.
   await page.evaluate(()=>{closeDetailSheet();const el=getFocusedCardElement();window.beforeLongPress=JSON.stringify({cards:[...selectedCards[cardIdentity.subId]],selectedDescs,excludedMainImages});el.dispatchEvent(new MouseEvent('mousedown',{bubbles:true,clientX:100,clientY:200}));});
   await page.waitForTimeout(550);assert(await page.locator('#detail-overlay').evaluate(n=>n.classList.contains('active')));
   assert.equal(await page.evaluate(()=>JSON.stringify({cards:[...selectedCards[cardIdentity.subId]],selectedDescs,excludedMainImages})),await page.evaluate(()=>beforeLongPress));
   await page.evaluate(()=>{cancelLongPress();_lpDidFire=false;closeDetailSheet();closeCardInfo();});
   // Arrow disappears while the bottom panel is visible, and restores after a closing gesture.
   const toggle=page.locator('#card-panel-toggle');await page.waitForTimeout(300);
   const cdp=await page.context().newCDPSession(page);
   const touch=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});
   for(let repeat=0;repeat<3;repeat++){
    const r=await toggle.boundingBox();assert(r);
    if(repeat===0)await touch('touchStart',r.x+r.width/2,r.y+r.height/2);
    else{await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();}
    await page.waitForTimeout(180);
    const press=await toggle.evaluate(n=>{const s=getComputedStyle(n);return {scale:new DOMMatrixReadOnly(s.transform).a,bg:s.backgroundColor,shadow:s.boxShadow,tap:s.webkitTapHighlightColor};});assert(press.scale<.99);assert.equal(press.bg,'rgba(0, 0, 0, 0)');assert.equal(press.shadow,'none');assert.equal(press.tap,'rgba(0, 0, 0, 0)');if(repeat===0)await touch('touchEnd');else await page.mouse.up();
    await page.waitForTimeout(300);assert.equal(await toggle.isVisible(),false);assert.equal(await toggle.evaluate(n=>getComputedStyle(n).pointerEvents),'none');
    if(repeat===0){
     const point=await page.locator('#create-chrome-bottom').evaluate(n=>{const r=n.getBoundingClientRect();return {x:r.x+r.width/2,y:(Math.max(36,r.top)+Math.min(innerHeight-90,r.bottom))/2};});
     assert(await page.evaluate(p=>Boolean(document.elementFromPoint(p.x,p.y)?.closest('#create-chrome-bottom')),point));
     await touch('touchStart',point.x,point.y);await touch('touchMove',point.x,point.y-70);await touch('touchEnd');
    }else await page.evaluate(()=>document.getElementById('center-area').dispatchEvent(new WheelEvent('wheel',{deltaY:80,bubbles:true})));
    await page.waitForTimeout(300);assert(await toggle.isVisible());
   }
   const plates=await page.evaluate(()=>{
    const lower=getComputedStyle(document.getElementById('card-panel-toggle'),'::before'),back=getComputedStyle(document.getElementById('center-area'),'::before');
    const style=s=>({width:s.width,height:s.height,border:s.border,color:s.backgroundColor,radius:s.borderRadius,shadow:s.boxShadow});return {lower:style(lower),back:style(back),lowerBG:lower.backgroundImage,backBG:back.backgroundImage,backSize:back.backgroundSize};
   });assert.deepEqual(plates.lower,plates.back);assert(plates.backBG.includes(plates.lowerBG));assert(plates.backBG.includes('m11%207-5%205%205%205m7-10-5%205%205%205')||plates.backBG.includes('m11 7-5 5 5 5m7-10-5 5 5 5'));assert(plates.backSize.startsWith('21px 21px'));
   await page.locator('#card-menu-toggle').click();assert.equal(await toggle.isVisible(),false);await page.locator('#card-menu-toggle').click();await page.waitForTimeout(250);assert(await toggle.isVisible());
   // Random commands change selected cards without overwriting exclusion preferences.
   await page.evaluate(async()=>{window.savedConfirm=showAppConfirm;showAppConfirm=async()=>true;Math.random=()=>0;excludedMainImages[cardKey]=true;selectedDescs[cardKey]=false;window.beforeRandom=JSON.stringify([excludedMainImages,selectedDescs]);await randomSelectCurrent();});
   assert(await page.evaluate(()=>JSON.stringify([excludedMainImages,selectedDescs])===beforeRandom));
   await page.evaluate(async()=>{lockedCards={};await randomSelectAll();showAppConfirm=savedConfirm;});
   assert(await page.evaluate(()=>JSON.stringify([excludedMainImages,selectedDescs])===beforeRandom));
   assert.deepEqual(errors,[]);console.log(`PASS ${config.width}x${config.height} ${config.kind}: defaults, independent exclusions, original/dim paint, feedback, status, lock/reselect/random, long press, panel/menu visibility and matching gesture plate`);await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
