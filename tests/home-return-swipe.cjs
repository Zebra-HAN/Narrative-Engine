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
   const file=path.join(__dirname,'..',u.pathname==='/'?'index.html':decodeURIComponent(u.pathname));
   try{await route.fulfill({body:await fs.readFile(file),contentType:file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'image/webp'})}catch{await route.fulfill({status:404,body:''})}
  });
  await page.goto('https://swipe.test/');await page.waitForTimeout(1600);
  const cdp=await page.context().newCDPSession(page);
  async function swipe({x=64,y=420,dx=170,dy=0,cancel=false}={}){
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
   for(const progress of [.15,.4,.7,1])await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*progress,y:y+dy*progress}]});
   await cdp.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});
   await page.waitForTimeout(500);
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
   await page.waitForTimeout(500);
  }
  const active=async()=>{const id=await page.locator('.screen.active').getAttribute('id',{timeout:1500}).catch(()=>null);assert(id,'active screen missing at '+page.url());return id};
  async function mine(){await page.evaluate(()=>switchScreen('screen-home',null,{type:'instant'}));await page.locator('#btn-idea-mine').click()}
  await mine();
  for(const invalid of [{dx:24},{dx:0,dy:150},{dx:-25},{cancel:true}]){
   await swipe(invalid);assert.equal(await active(),'screen-idea-mine','short, vertical, left and canceled gestures do not return home');
  }
  await page.locator('#mine-open-guide').click();await guardedSwipe();assert.equal(await active(),'screen-idea-mine','popup blocks home swipe');
  await page.locator('#app-dialog-actions button').click();
  await swipe();assert.equal(await active(),'screen-home','mine main returns home');
  await page.evaluate(()=>goToCreate());await page.waitForTimeout(300);
  await swipe();assert.equal(await active(),'screen-home','initial create returns home');
  await page.evaluate(()=>goToNarrative());await page.waitForTimeout(500);
  await swipe();assert.equal(await active(),'screen-home','story structure returns home');
  await mine();await page.locator('#mine-open-mining').click();await guardedSwipe();
  assert.equal(await active(),'screen-idea-mine');assert(await page.locator('#mine-page-mining').isVisible(),'mine subpage does not return home');
  await page.evaluate(()=>goToCreate());await page.waitForTimeout(250);
  await page.evaluate(()=>selectSub('race'));await page.waitForTimeout(500);
  assert.equal(await page.locator('.center-page.active[data-chrome-view]').getAttribute('data-chrome-view'),'group');
  const bounds=await page.locator('#center-area').boundingBox();
  await swipe({x:bounds.x+32,y:bounds.y+40});
  assert.equal(await active(),'screen-create','existing group back stays in creative flow');
  assert(await page.locator('#page-default').evaluate(n=>n.classList.contains('active')),'existing group back returns to category selection');
  assert.deepEqual(errors,[]);
  console.log('PASS: real-touch home swipes on three roots; cancellation, popup guards; mine subpage and existing group back preserved');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
