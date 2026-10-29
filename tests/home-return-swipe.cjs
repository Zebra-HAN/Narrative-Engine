const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const fs=require('node:fs/promises');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try {
  const page=await browser.newPage({viewport:{width:393,height:852},hasTouch:true,serviceWorkers:'block'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',async route=>{
   const u=new URL(route.request().url());if(u.hostname!=='swipe.test')return route.abort();
   const pathname=decodeURIComponent(u.pathname.replace(/^\/app(?=\/)/,''));
   const file=path.join(__dirname,'..',pathname==='/'?'index.html':pathname);
   try{await route.fulfill({body:await fs.readFile(file),contentType:file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'image/webp'})}catch{await route.fulfill({status:404,body:''})}
  });
  await page.goto('https://swipe.test/app/');await page.waitForTimeout(1600);
  await page.evaluate(()=>{window.swipeSounds=[];UI_SOUND.play=name=>swipeSounds.push(name);});
  const cdp=await page.context().newCDPSession(page);
  async function swipe({x=150,y=420,dx=110,dy=0,cancel=false,expectCue=false,expectMotion=false,expectedPrevious=null,expectLegacy=false,hold=0}={}){
   const returnSound=expectLegacy||await page.evaluate(()=>document.querySelector('body > .screen.active')?.id!=='screen-idea-mine'||!window.IdeaMineBackRoute?.());
   await page.evaluate(()=>swipeSounds.length=0);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
   for(const progress of (dx>0&&dx<52?[1]:[.15,.4,.7,1])) {
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*progress,y:y+dy*progress}]});
    if(progress===.4 && expectLegacy) {
     assert.equal(await page.locator('[data-back-preview]').count(),0,'creative descendants do not show a previous-page preview');
     assert.equal(await page.locator('body > .screen.active').evaluate(n=>new DOMMatrixReadOnly(getComputedStyle(n).transform).m41),0,'creative descendant canvas stays stationary');
     if(expectLegacy) {
      const offset=await page.locator('#center-area .center-page.active[data-chrome-view]').evaluate(n=>new DOMMatrixReadOnly(getComputedStyle(n).transform).m41);
      assert(Math.abs(offset-Math.min(dx*progress*.35,42))<2,'original partial content drag is retained');
     }
    }
    if(progress===.4 && expectMotion) {
     const offset=await page.locator('body > .screen.active').evaluate(n=>new DOMMatrixReadOnly(getComputedStyle(n).transform).m41);
     assert(Math.abs(offset-dx*progress)<2,'internal back also translates whole screen');
     assert(await page.locator('[data-back-preview]').count()>0,'internal previous page is shown');
     assert.equal(await page.locator('body > .screen.active > .home-return-cue').evaluate(n=>getComputedStyle(n).display),'none','moving refinery/storage screen has no arrow');
     assert.equal(await page.locator('[data-back-preview]').evaluate(n=>getComputedStyle(n.shadowRoot.querySelector('.home-return-cue')).display),'none','previous-screen preview also has no arrow');
     const previewBackground=await page.locator('[data-back-preview]').evaluate(n=>{const page=n.shadowRoot.querySelector('#mine-page-main:not([hidden])');return page?getComputedStyle(page,'::before').backgroundImage:null;});
     if(previewBackground) {
      assert(previewBackground.includes('/app/images/core/mine/'),'preview CSS asset paths retain hosted subdirectory');
      const original=await page.evaluate(()=>getComputedStyle(document.getElementById('mine-page-main'),'::before').backgroundImage);
      assert.equal(previewBackground,original,'preview uses the currently configured mine background');
     }
     if(expectedPrevious)assert.equal(await page.locator('[data-back-preview]').evaluate(n=>n.shadowRoot.querySelector('.mine-page:not([hidden])')?.id),expectedPrevious,'preview matches actual entry route');
    }
    if(expectCue && progress>=.7)assert.equal(await page.locator('body > .screen.active > .home-return-cue').evaluate(n=>new DOMMatrixReadOnly(getComputedStyle(n).transform).m41),0,'continued pulling never moves the settled arrow');
    if(progress===.4 && expectCue) {
     await page.waitForTimeout(180);
     assert(await page.locator('body > .screen.active').evaluate(n=>n.classList.contains('is-home-swiping')),'drag shows home cue');
     const paint=await page.locator('body > .screen.active > .home-return-cue').evaluate(n=>{
      const s=getComputedStyle(n), ref=getComputedStyle(document.getElementById('center-area'),'::before');
      const keys=['width','height','left','top','borderRadius','borderColor','backgroundImage','boxShadow','transitionDuration','transitionTimingFunction'];
      return {opacity:s.opacity,own:keys.map(k=>s[k]),reference:keys.map(k=>ref[k])};
     });
     assert.equal(paint.opacity,'1');
     const motion=await page.locator('body > .screen.active').evaluate(n=>new DOMMatrixReadOnly(getComputedStyle(n).transform).m41);
     assert.equal(motion,0,'home-return screen remains stationary');
     const arrowOffset=await page.locator('body > .screen.active > .home-return-cue').evaluate(n=>new DOMMatrixReadOnly(getComputedStyle(n).transform).m41);
     assert.equal(arrowOffset,0,'arrow rests at the same fixed position as hierarchy back cues');
     assert.equal(await page.locator('[data-back-preview]').count(),0,'home never appears behind a home-return gesture');
     assert.deepEqual(paint.own,paint.reference,'existing double-arrow plate design and animation are reused');
    }
   }
   if(hold)await page.waitForTimeout(hold);
   assert.deepEqual(await page.evaluate(()=>swipeSounds.slice()),[],'drag itself stays silent');
   await cdp.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});
   await page.waitForTimeout(700);
   const sounds=await page.evaluate(()=>swipeSounds.slice());
   if(dx>0){assert(sounds.length<=1,JSON.stringify(sounds));assert(sounds.every(x=>(returnSound?['softTouch5','softPage3']:['paper3']).includes(x)),JSON.stringify(sounds));}
   if(!cancel&&(expectCue||expectMotion)){if(returnSound)assert.equal(sounds.length,1);else assert.deepEqual(sounds,['paper3']);}if(!cancel&&expectLegacy)assert.equal(sounds.length,1);
   if(cancel||dx<=24||Math.abs(dy)>Math.abs(dx))assert.deepEqual(sounds,[]);
   assert.equal(await page.locator('.is-home-swiping').count(),0,'cue clears on finish/cancel');
   assert.equal(await page.locator('[data-back-preview]').count(),0,'preview is removed after settle');
   assert.equal(await page.locator('.back-motion-source').count(),0,'source positioning is restored');
  }
  // Isolate app routing guards from Chromium's own browser-history overscroll.
  async function guardedSwipe(){
   await page.evaluate(()=>{
    const target=document.elementFromPoint(64,420);
    const touch=x=>new Touch({identifier:1,target,clientX:x,clientY:420});
    for(const [type,x] of [['touchstart',64],['touchmove',100],['touchmove',234],['touchend',234]]){
     const t=touch(x);target.dispatchEvent(new TouchEvent(type,{bubbles:true,cancelable:true,touches:type==='touchend'?[]:[t],changedTouches:[t]}));
    }
   });
   await page.waitForTimeout(700);
  }
  const active=async()=>{const id=await page.locator('body > .screen.active').getAttribute('id',{timeout:1500}).catch(()=>null);assert(id,'active screen missing at '+page.url());return id};
  async function mine(){await page.evaluate(()=>switchScreen('screen-home',null,{type:'instant'}));await page.locator('#btn-idea-mine').click()}
  await mine();
  for(const invalid of [{dx:24},{dx:0,dy:150},{dx:-25},{cancel:true}]){
   await swipe(invalid);assert.equal(await active(),'screen-idea-mine','short, vertical, left and canceled gestures do not return home');
  }
  await page.locator('#mine-open-guide').click();await guardedSwipe();assert.equal(await active(),'screen-idea-mine','popup blocks home swipe');
  await page.locator('#app-dialog-actions button').click();
  await swipe({cancel:true,expectCue:true});assert.equal(await active(),'screen-idea-mine','canceled home arrow gesture stays in place');
  await swipe({expectCue:true});assert.equal(await active(),'screen-home','mine main returns home from center');
  for(const options of [{x:32,dx:100},{x:260,dx:90,dy:35},{x:150,dx:70,hold:1250},{x:150,dx:35}]) {
   await mine();await swipe(options);assert.equal(await active(),'screen-home','natural root swipe '+JSON.stringify(options));
  }
  await page.evaluate(()=>goToCreate());await page.waitForTimeout(300);
  await swipe({expectCue:true});assert.equal(await active(),'screen-home','initial create returns home');
  await page.evaluate(()=>goToNarrative());await page.waitForTimeout(500);
  await swipe({expectCue:true});assert.equal(await active(),'screen-home','story structure returns home');
  await mine();await page.locator('#mine-open-mining').click();await swipe({x:160,y:260,expectCue:true});
  assert.equal(await active(),'screen-idea-mine');assert(await page.locator('#mine-page-main').isVisible(),'mine subpage swipes to mine main');
  await page.locator('#mine-open-mining').click();await page.locator('#mine-roll').click();
  const idea=await page.locator('#mine-result').textContent();
  const values=await page.locator('#mine-slots textarea').evaluateAll(ns=>ns.map(n=>n.value));
  await swipe({x:160,y:260,cancel:true,expectCue:true});
  assert(await page.locator('#mine-page-mining').isVisible(),'canceled mine back stays in place');
  assert.equal(await page.locator('#mine-result').textContent(),idea);
  assert.deepEqual(await page.locator('#mine-slots textarea').evaluateAll(ns=>ns.map(n=>n.value)),values);
  await page.locator('#mine-refineShortcut').click();
  await swipe({x:160,y:280,cancel:true,expectMotion:true,expectedPrevious:'mine-page-mining'});
  assert(await page.locator('#mine-page-refinery').isVisible(),'canceled refinery swipe preserves its page');
  await swipe({x:160,y:280,expectMotion:true,expectedPrevious:'mine-page-mining'});
  assert(await page.locator('#mine-page-mining').isVisible(),'refinery swipe returns to actual mining origin');
  assert.equal(await page.locator('#mine-result').textContent(),idea);
  await page.locator('#mine-back').click();await page.locator('#mine-open-storage').click();
  await swipe({x:160,y:280,cancel:true,expectMotion:true,expectedPrevious:'mine-page-main'});
  assert(await page.locator('#mine-page-storage').isVisible(),'canceled storage swipe preserves its page');
  await swipe({x:160,y:280,expectMotion:true,expectedPrevious:'mine-page-main'});
  assert(await page.locator('#mine-page-main').isVisible(),'storage swipe returns to actual entry page');
  await page.evaluate(()=>goToCreate());await page.waitForTimeout(250);
  const strip=await page.locator('#subnav-scroll').boundingBox();
  await swipe({x:strip.x+40,y:strip.y+strip.height/2,dx:100});
  assert.equal(await active(),'screen-create','category strip keeps horizontal gesture ownership');
  await page.evaluate(()=>selectSub('race'));await page.waitForTimeout(500);
  assert.equal(await page.locator('.center-page.active[data-chrome-view]').getAttribute('data-chrome-view'),'group');
  const bounds=await page.locator('#center-area').boundingBox();
  await swipe({x:bounds.x+32,y:bounds.y+40,expectLegacy:true});
  assert.equal(await active(),'screen-create','existing group back stays in creative flow');
  assert(await page.locator('#page-default').evaluate(n=>n.classList.contains('active')),'existing group back returns to category selection');
  assert.equal(await page.locator('#center-area .center-page.active[data-chrome-view]').count(),0);
  assert.deepEqual(errors,[]);
  console.log('PASS: four stationary screens reuse fixed hierarchy arrows; refinery/storage reveal previous pages with no arrows; legacy creative navigation preserved');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
