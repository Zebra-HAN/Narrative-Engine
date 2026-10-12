const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
 const browser = await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try {
  for (const viewport of [{width:393,height:852},{width:320,height:568},{width:852,height:393},{width:1280,height:800}]) {
   const page = await browser.newPage({viewport,serviceWorkers:'block'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
   await page.goto(process.env.PERF_TEST_URL);await page.waitForTimeout(1600);
   await page.evaluate(()=>{goToCreate();switchNav('character',true);showGroupCards('race',2)});
   await page.waitForTimeout(1800);
   const source = page.locator('.center-page.active[data-chrome-view="cards"]');
   await source.evaluate(n=>{n.scrollTop=500;window.minimapOriginalCard=n.querySelector('.data-card');});
   const before=await source.evaluate(n=>({scroll:n.scrollTop,height:n.scrollHeight,width:n.clientWidth}));
   for(let i=0;i<3;i++) {
    await page.locator('#card-minimap-toggle').click();
    assert.equal(await page.locator('#card-minimap-toggle').isVisible(),false);
    assert.equal(await page.locator('#card-minimap details[open]').count(),0);
    const counts=await page.evaluate(()=>{const p=document.querySelector('.center-page.active[data-chrome-view="cards"]');return [p.querySelectorAll('.data-card').length,document.querySelectorAll('.card-minimap-tag').length]});
    assert.equal(counts[0],counts[1]);
    await page.locator('#card-minimap summary').first().click();
    assert(await page.locator('#card-minimap details').first().evaluate(n=>n.open));
    await page.locator('#card-minimap-close').click();
    assert.deepEqual(await source.evaluate(n=>({scroll:n.scrollTop,height:n.scrollHeight,width:n.clientWidth})),before);
    assert(await source.evaluate(n=>n.querySelector('.data-card')===window.minimapOriginalCard));
   }
   // Use the actual renderer with synthetic edge-case data; do not edit persisted data.
   await page.evaluate(()=>{CARD_DATA.minimapFixture=[{name:'동일 이름'},{type:'section',label:'테스트 섹션'},...Array.from({length:250},(_,i)=>({name:i===0?'긴이름'.repeat(120):'동일 이름'}))];showCardPage('minimapFixture',false)});
   await page.locator('#card-minimap-toggle').click();
   assert.deepEqual(await page.locator('#card-minimap summary').allTextContents(),['미분류 — 1','테스트 섹션 — 250']);
   await page.locator('#card-minimap-expand').click();
   const geometry=await page.evaluate(()=>{const p=document.getElementById('card-minimap');const c=document.getElementById('card-minimap-content');const r=p.getBoundingClientRect();const b=document.getElementById('create-chrome-bottom').getBoundingClientRect();return {top:r.top,bottom:r.bottom,right:r.right,height:r.height,bottomUI:b.height,overflow:c.scrollWidth>c.clientWidth,scrollable:c.scrollHeight>c.clientHeight};});
   assert(geometry.top>=0&&geometry.right<=viewport.width&&geometry.height>44);
   assert.equal(geometry.top,18);assert.equal(geometry.bottom,viewport.height-18);
   assert(!geometry.overflow);assert(geometry.scrollable);
   await page.locator('#card-minimap-content').evaluate(n=>n.scrollTop=1000);
   assert(await page.locator('#card-minimap-content').evaluate(n=>n.scrollTop>0));
   await page.locator('#card-minimap-close').press('Escape');
   assert.equal(await page.locator('#card-minimap').isVisible(),false);
   await page.evaluate(()=>{CARD_DATA.minimapFixture=[{name:'첫 카드'},{name:'둘째 카드'}];showCardPage('minimapFixture',false)});
   await page.locator('#card-minimap-toggle').click();
   assert.equal(await page.locator('#card-minimap details').count(),0);
   assert.deepEqual(await page.locator('.card-minimap-tag').allTextContents(),['첫 카드','둘째 카드']);
   await page.evaluate(()=>showGroupPage('race',false));
   assert.equal(await page.locator('#card-minimap').isVisible(),false);
   assert.equal(await page.locator('#card-minimap-toggle').isVisible(),false);
   assert.deepEqual(errors,[]);
   console.log(`PASS minimap ${viewport.width}x${viewport.height}: counts, collapsed sections, wrapping, duplicate/long names, 251 cards, no-section, route close, independent scroll and unchanged card DOM`);
   await page.close();
  }
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
