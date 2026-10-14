const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try {
  for(const viewport of [{width:393,height:852},{width:320,height:568},{width:852,height:393}]){
   const page=await browser.newPage({viewport,hasTouch:true,serviceWorkers:'block'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
   await page.goto(process.env.PERF_TEST_URL);await page.waitForTimeout(1600);
   await page.evaluate(()=>{goToCreate();switchNav('character',true);selectSub('race');});
   await page.waitForFunction(()=>document.querySelector('#page-race.active[data-chrome-view=group]'));
   await page.evaluate(()=>{showGroupCards('race',2,true);const i=CARD_DATA.race.groups[2].cards.findIndex(c=>c.type!=='section');window.testIndex=i;window.testCard=CARD_DATA.race.groups[2].cards[i];testCard.subImg=testCard.img;testCard.detail='【Ideas】\nFirst idea\nSecond idea';groupCardClick('race',2,i);openDetailSheet('card');});
   const paint=()=>page.evaluate(()=>{
    const main=document.querySelector('#detail-icon img'),sub=document.querySelector('.detail-sub-img');
    const state=img=>{const s=getComputedStyle(img),frame=getComputedStyle(img.parentElement,'::after');let opacity=1;for(let n=img;n&&n!==document.querySelector('.detail-sheet');n=n.parentElement)opacity*=Number(getComputedStyle(n).opacity);return {opacity,filter:s.filter,overlay:frame.backgroundColor,edge:frame.boxShadow};};
    return {main:state(main),sub:state(sub),mainSelected:document.getElementById('detail-icon').classList.contains('checked'),subSelected:document.querySelector('.detail-sub-image-row').classList.contains('checked')};
   });
   const normal=async()=>{const p=await paint();for(const image of [p.main,p.sub])assert.equal(image.opacity,1);assert.equal(p.sub.filter,'none');assert.equal(p.main.filter,p.mainSelected?'none':'grayscale(0.9) brightness(0.45)');return p;};
   let p=await normal();assert.equal(p.mainSelected,true);assert.equal(p.main.overlay,'rgba(0, 0, 0, 0)');assert.equal(p.subSelected,false);
   await page.evaluate(()=>{selectCurrentCard();toggleDetailCheck('race',focusedCard.idx,0);});
   for(let repeat=0;repeat<3;repeat++){
    await page.evaluate(()=>toggleMainImageCheck('race',focusedCard.idx));p=await normal();assert.equal(p.mainSelected,false);assert.equal(p.main.edge,'none');
    await page.evaluate(()=>{renderStatusContent();});assert.equal(await page.locator('#status-body .status-chip-img').count(),0);
    assert(await page.evaluate(()=>selectedCards.race.has(focusedCard.idx)&&selectedDetails[`race__${focusedCard.idx}`].has(0)));
    await page.evaluate(()=>toggleSubImageCheck('race',focusedCard.idx));p=await normal();assert.equal(p.subSelected,true);assert.notEqual(p.sub.edge,'none');
    await page.evaluate(()=>renderStatusContent());assert.equal(await page.locator('#status-body .status-chip-sub-img').count(),1);assert.equal(await page.locator('#status-body .status-chip-img').count(),0);
    await page.evaluate(()=>toggleMainImageCheck('race',focusedCard.idx));p=await normal();assert.equal(p.mainSelected,true);assert.equal(p.main.overlay,'rgba(0, 0, 0, 0)');assert.equal(p.main.edge,'none');assert.notEqual(p.sub.edge,'none');
    await page.evaluate(()=>renderStatusContent());assert.equal(await page.locator('#status-body .status-chip-img').count(),1);
    await page.evaluate(()=>toggleSubImageCheck('race',focusedCard.idx));p=await normal();assert.equal(p.subSelected,false);assert.equal(p.sub.edge,'none');assert.equal(p.mainSelected,true);
    await page.evaluate(()=>renderStatusContent());assert.equal(await page.locator('#status-body .status-chip-sub-img').count(),0);
   }
   await page.evaluate(()=>{toggleCurrentCardLock();openDetailSheet('card');});await normal();assert(await page.locator('.detail-sub-image-row').isDisabled());
   const locked=await page.evaluate(()=>JSON.stringify({excludedMainImages,selectedSubImages}));await page.evaluate(()=>{toggleMainImageCheck('race',focusedCard.idx);toggleSubImageCheck('race',focusedCard.idx);});assert.equal(await page.evaluate(()=>JSON.stringify({excludedMainImages,selectedSubImages})),locked);
   await page.evaluate(()=>{toggleCurrentCardLock();closeDetailSheet();});
   const toggle=page.locator('#card-panel-toggle');await page.waitForTimeout(500);
   const arrow=()=>toggle.evaluate(n=>{const s=getComputedStyle(n),plate=getComputedStyle(n,'::before'),a=getComputedStyle(n.querySelector('svg')),r=n.getBoundingClientRect(),dock=document.getElementById('card-controls-dock').getBoundingClientRect();return {plate:[plate.width,plate.height,plate.opacity,plate.backgroundImage,plate.borderColor],arrow:[a.width,a.height,a.opacity,a.transform,a.transitionDuration],center:r.x+r.width/2,bottom:r.bottom,dockTop:dock.top,opacity:s.opacity};});
   const initial=await arrow();assert.deepEqual(initial.plate.slice(0,3),['35px','35px','1']);assert(!initial.plate[3].includes('rgba'));assert.deepEqual(initial.arrow,['21px','21px','1','none','0s']);assert.equal(initial.opacity,'1');assert(Math.abs(initial.center-viewport.width/2)<1);assert(initial.bottom<=viewport.height);
   for(let i=0;i<2;i++){await toggle.click();await page.waitForTimeout(350);assert.equal(await toggle.getAttribute('aria-expanded'),'true');assert.deepEqual((await arrow()).arrow,initial.arrow);assert(await page.locator('#create-chrome-bottom').evaluate(n=>Math.abs(new DOMMatrixReadOnly(getComputedStyle(n).transform).m42)<1));assert.equal(await toggle.isVisible(),false);await page.evaluate(()=>document.getElementById('center-area').dispatchEvent(new WheelEvent('wheel',{deltaY:80,bubbles:true})));await page.waitForTimeout(350);assert.equal(await toggle.getAttribute('aria-expanded'),'false');assert(await toggle.isVisible());assert.deepEqual((await arrow()).arrow,initial.arrow);}
   const styles=await page.evaluate(()=>{const area=getComputedStyle(document.getElementById('center-area'),'::before');const title=document.querySelector('.card-section-title'),detail=document.querySelector('.card-section-detail');return {border:area.borderColor,width:area.borderWidth,radius:area.borderRadius,title:title&&getComputedStyle(title).color,detail:detail&&getComputedStyle(detail).color};});assert.equal(styles.border,'rgb(208, 184, 138)');assert.equal(styles.width,'1px');assert.equal(styles.radius,'50%');assert.equal(styles.title,'rgb(214, 174, 85)');assert.equal(styles.detail,'rgb(191, 184, 168)');
   // Real browser touch events drive the existing back gesture.
   await page.evaluate(()=>closeCardInfo());
   const cdp=await page.context().newCDPSession(page);const bounds=await page.locator('#center-area').boundingBox();const y=Math.min(viewport.height/2,bounds.y+40);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:bounds.x+30,y}]});for(const x of [60,110,190])await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:bounds.x+x,y}]});
   assert(await page.locator('#center-area').evaluate(n=>n.classList.contains('is-back-swiping')));await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(300);assert.equal(await page.locator('.center-page.active[data-chrome-view]').getAttribute('data-chrome-view'),'group');
   await page.evaluate(async()=>{showGroupCards('race',2,true);window.savedConfirm=showAppConfirm;showAppConfirm=async()=>true;await randomSelectCurrent();showAppConfirm=savedConfirm;});
   assert(await page.evaluate(()=>{const idx=[...selectedCards.race][0];return selectedCards.race.size===1&&!excludedMainImages[`race__${idx}`]&&selectedDescs[`race__${idx}`];}));
   assert.deepEqual(errors,[]);console.log(`PASS ${viewport.width}x${viewport.height}: image state/paint/integration/lock/random, arrow size/opacity/direction/panel, section colors, back gesture`);await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
