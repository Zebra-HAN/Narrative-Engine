const assert=require('node:assert/strict');const {chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 for(const viewport of [{width:393,height:852},{width:852,height:393}]){
  const page=await browser.newPage({viewport,hasTouch:true,serviceWorkers:'block'});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());await page.goto(process.env.PERF_TEST_URL);await page.waitForTimeout(1600);
  await page.evaluate(()=>{goToCreate();switchNav('character',true);selectSub('race');});await page.waitForFunction(()=>document.querySelector('#page-race.active[data-chrome-view=group]'));
  await page.evaluate(()=>{CARD_DATA.race.groups[2].cards=[{type:'section',label:'Swipe fixture'},...Array.from({length:150},(_,i)=>({name:'Card '+i,icon:'✦'}))];showGroupCards('race',2,true);});await page.waitForTimeout(1200);
  const cdp=await page.context().newCDPSession(page),panel=page.locator('#card-minimap');const send=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});
  const open=async()=>{await page.locator('#card-minimap-toggle').click();await page.waitForTimeout(250);};
  const headerPoint=()=>page.locator('.card-minimap-content').evaluate(n=>{const r=n.getBoundingClientRect();return {x:r.left+5,y:r.top+10};});
  const offset=()=>page.locator('#card-minimap-overlay .popup-swipe-frame').evaluate(n=>new DOMMatrixReadOnly(getComputedStyle(n).transform).m41);
  await open();
  for(const kind of ['tap','tiny','slow-short','vertical','reverse','slow-close','fast-short']){
   if(!(await panel.isVisible())){await page.waitForTimeout(500);await open();}
   const p=await headerPoint();await send('touchStart',p.x,p.y);
   if(kind==='tap'){}
   else if(kind==='tiny'){await send('touchMove',p.x+6,p.y);}
   else if(kind==='vertical'){await send('touchMove',p.x+2,p.y+45);}
   else if(kind==='fast-short'){await send('touchMove',p.x+20,p.y);}
   else if(kind==='reverse'){await send('touchMove',p.x+70,p.y);const right=await offset();await send('touchMove',p.x+8,p.y);assert((await offset())<right,'page follows direction reversal immediately');}
   else{for(const dx of (kind==='slow-close'?[10,20,32]:[8,12,18])){await page.waitForTimeout(100);await send('touchMove',p.x+dx,p.y);}await page.waitForTimeout(120);}
   await send('touchEnd');await page.waitForTimeout(300);assert.equal(await panel.isVisible(),!['slow-close','fast-short'].includes(kind),kind);await page.waitForTimeout(500);
  }
  // The unchanged opening policy rejects a 20px flick and accepts a clear 55px flick.
  await page.evaluate(()=>{const p=document.querySelector('.center-page.active[data-chrome-view=cards]'),c=p.querySelector('.data-card');p.scrollTop+=c.getBoundingClientRect().top-p.getBoundingClientRect().top-80;});await page.waitForTimeout(150);
  const bounds=await page.locator('#center-area').boundingBox(),card=await page.locator('.center-page.active .data-card').first().boundingBox(),x=bounds.x+bounds.width-30,y=card.y+card.height/2;
  for(const dx of [20,55]){await send('touchStart',x,y);await send('touchMove',x-dx,y);await send('touchEnd');await page.waitForTimeout(300);assert.equal(await panel.isVisible(),dx===55,'opening thresholds unchanged');await page.waitForTimeout(500);}
  // Existing vertical native scrolling inside the outline still works without closing.
  await page.locator('#card-minimap-expand').click();const r=await page.locator('#card-minimap-content').boundingBox();const cx=r.x+r.width/2,cy=r.y+r.height*.65;await send('touchStart',cx,cy);await send('touchMove',cx,cy-90);await send('touchEnd');await page.waitForTimeout(300);assert(await panel.isVisible());assert(await page.locator('#card-minimap-content').evaluate(n=>n.scrollTop>0));
  assert.deepEqual(errors,[]);console.log(`PASS ${viewport.width}: tap/tiny/vertical protection, reversal tracking, short flick and slow close, unchanged open threshold, native list scroll`);await page.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
