const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
 const browser = await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try {
  for (const touch of [false,true]) {
   const page=await browser.newPage({viewport:{width:393,height:852},hasTouch:touch,serviceWorkers:'block'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
   await page.goto(process.env.PERF_TEST_URL);await page.waitForTimeout(1600);
   await page.evaluate(()=>{goToCreate();switchNav('character',true);showGroupCards('race',2)});
   await page.waitForTimeout(1800);
   const toggle=page.locator('#card-minimap-toggle'),panel=page.locator('#card-minimap');
   const original=await page.evaluate(()=>{const p=document.querySelector('.center-page.active[data-chrome-view="cards"]');p.scrollTop=200;window.outlineCard=p.querySelector('.data-card');return {scroll:p.scrollTop,selection:JSON.stringify([...selectedCards.race]),locks:JSON.stringify([...lockedCards.race||[]])};});
   const button=await toggle.boundingBox();
   if(!touch){
    await page.mouse.move(button.x+button.width/2,button.y+button.height/2);await page.mouse.down();await page.waitForTimeout(110);
    const scale=await toggle.evaluate(n=>getComputedStyle(n).transform);
    assert(scale.includes('0.94'),'existing pressable scale visible before release');
    assert.equal(await panel.isVisible(),false);await page.mouse.up();
   }else{await toggle.tap();}
   assert(await panel.isVisible());
   const section=page.locator('#card-minimap details').filter({has:page.locator('.card-minimap-tag')}).first();
   const summary=section.locator('summary');
   if(touch)await summary.tap();else await summary.click();
   assert(await section.evaluate(n=>n.open));
   const tag=section.locator('.card-minimap-tag').first();
   if(touch)await tag.tap();else await tag.click();
   assert(await panel.isVisible());
   const styles=await page.evaluate(()=>({heading:getComputedStyle(document.querySelector('#card-minimap summary')).fontSize,tag:getComputedStyle(document.querySelector('.card-minimap-tag')).fontSize,padding:getComputedStyle(document.querySelector('.card-minimap-tag')).padding,highlight:[document.getElementById('card-minimap-toggle'),document.getElementById('card-minimap-close'),document.querySelector('#card-minimap summary'),document.querySelector('.card-minimap-tag')].map(n=>getComputedStyle(n).webkitTapHighlightColor)}));
   assert.equal(styles.heading,'14px');assert.equal(styles.tag,'9.8px');assert.equal(styles.padding,'4px 7px');assert(styles.highlight.every(v=>v==='rgba(0, 0, 0, 0)'));
   // The narrow left gutter is outside the centered popup.
   if(touch)await page.touchscreen.tap(5,200);else await page.mouse.click(5,200);
   assert.equal(await panel.isVisible(),false);
   const state=await page.evaluate(()=>({scroll:document.querySelector('.center-page.active[data-chrome-view="cards"]').scrollTop,selection:JSON.stringify([...selectedCards.race]),locks:JSON.stringify([...lockedCards.race||[]])}));
   assert.deepEqual(state,original);assert.equal(await page.locator('.card-info-popover').count(),0);
   // Holding outside cannot start a card long-press or open details.
   await toggle.click();await page.mouse.move(5,200);await page.mouse.down();await page.waitForTimeout(750);await page.mouse.up();
   assert.equal(await panel.isVisible(),false);assert.equal(await page.locator('.card-info-popover').count(),0);
   await page.evaluate(()=>{CARD_DATA.outlineFixture=[{type:'section',label:'핵심 제목 — 부가 설명'},{name:'카드'},{type:'section',label:'둘째 제목 | 추가 설명'},{name:'카드'},{type:'section',label:'분리 없는 제목'},{name:'카드'}];showCardPage('outlineFixture',false)});
   await toggle.click();assert.deepEqual(await page.locator('#card-minimap summary').allTextContents(),['핵심 제목 — 1','둘째 제목 — 1','분리 없는 제목 — 1']);
   assert.deepEqual(await page.locator('.center-page.active .card-section-detail').allTextContents(),['— 부가 설명','| 추가 설명']);
   assert.equal(await page.evaluate(()=>CARD_DATA.outlineFixture[0].label),'핵심 제목 — 부가 설명');
   await page.locator('#card-minimap-close').click();
   // Swallow only the dismissal: the following card click still opens its info normally.
   await page.locator('.center-page.active .data-card').first().click();
   assert.equal(await page.locator('.card-info-popover').count(),1);
   assert.deepEqual(errors,[]);
   console.log(`PASS ${touch?'touch emulation':'mouse'}: title rules, unchanged detail/data, font/padding, native highlight, internal taps, outside dismissal/no card activation, long press, scroll and next card click`);
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
