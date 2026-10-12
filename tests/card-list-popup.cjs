const assert = require('node:assert/strict');
const {chromium} = require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try {
  for(const viewport of [{width:320,height:568},{width:393,height:852},{width:852,height:393},{width:1280,height:800}]) {
   const page=await browser.newPage({viewport,hasTouch:true,serviceWorkers:'block'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   const exportErrors=[];page.on('console',m=>{if(m.type()==='error'&&m.text().includes('SecurityError'))exportErrors.push(m.text());});
   await page.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
   await page.goto(process.env.PERF_TEST_URL);await page.waitForTimeout(1600);
   await page.evaluate(()=>{goToCreate();switchNav('character',true);selectSub('race');showGroupCards('race',2)});
   await page.waitForTimeout(1800);
   const open=async()=>page.locator('#card-minimap-toggle').tap();
   const panel=page.locator('#card-minimap');
   const rect=async locator=>locator.evaluate(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}});
   await open();
   assert.equal(await page.locator('#card-minimap-title').textContent(),await page.evaluate(()=>CARD_DATA.race.groups[2].label+' — '+CARD_DATA.race.groups[2].cards.filter(c=>!isSectionItem(c)).length));
   assert(!(await panel.innerText()).includes('전체 목록'));
   const popupRect=await rect(panel);
   assert(Math.abs(popupRect.x+popupRect.width/2-viewport.width/2)<0.1);
   assert.equal(popupRect.y,18);assert.equal(popupRect.bottom,viewport.height-18);
   assert(await page.locator('#card-minimap-close img').evaluate(n=>n.complete&&n.naturalWidth>0&&n.getAttribute('src')==='images/core/buttons/cancel.webp'));
   for(const id of ['card-minimap-close','card-minimap-expand','card-minimap-collapse']){
    const style=await page.locator('#'+id).evaluate(n=>({highlight:getComputedStyle(n).webkitTapHighlightColor,width:n.offsetWidth,height:n.offsetHeight,press:n.classList.contains('pressable')}));
    assert.equal(style.highlight,'rgba(0, 0, 0, 0)');assert(style.width>=44&&style.height>=44&&style.press);
   }
   if(viewport.width===393){
    for(const id of ['card-minimap-expand','card-minimap-collapse','card-minimap-close']){
     const button=page.locator('#'+id),r=await button.boundingBox();
     await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();await page.waitForTimeout(120);
     assert((await button.evaluate(n=>getComputedStyle(n).transform)).includes('0.94'));
     await page.mouse.up();
     if(id==='card-minimap-close')await open();
    }
   }
   await page.locator('#card-minimap-expand').tap();assert.equal(await page.locator('#card-minimap details:not([open])').count(),0);
   await page.locator('#card-minimap-expand').tap();assert.equal(await page.locator('#card-minimap details:not([open])').count(),0);
   await page.locator('#card-minimap-collapse').tap();assert.equal(await page.locator('#card-minimap details[open]').count(),0);
   await page.locator('#card-minimap summary').first().tap();await page.locator('#card-minimap-collapse').tap();assert.equal(await page.locator('#card-minimap details[open]').count(),0);
   // Keyboard focus wraps within the dialog; image cancel remains usable.
   await page.locator('#card-minimap-close').focus();await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.tagName),'SUMMARY');
   await page.locator('#card-minimap-close').tap();
   await page.locator('.page-title-card').tap();await page.locator('.detail-sheet').evaluate(n=>Promise.all(n.getAnimations().map(a=>a.finished)));
   assert.deepEqual(await rect(page.locator('.detail-sheet')),popupRect);
   await page.evaluate(()=>closeDetailSheet());
   await page.evaluate(()=>{groupCardDblClick('race',2,CARD_DATA.race.groups[2].cards.findIndex(c=>!isSectionItem(c)));openStatusOverlay()});await page.locator('.status-panel').evaluate(n=>Promise.all(n.getAnimations().map(a=>a.finished)));
   assert.deepEqual(await rect(page.locator('.status-panel')),popupRect);
   await page.locator('.status-share-btn').tap();assert(await page.locator('#app-dialog-overlay').evaluate(n=>n.classList.contains('active')));
   assert.deepEqual(await page.locator('#app-dialog-actions button').allTextContents(),['이미지로 저장','PDF로 저장','취소']);
   await page.getByRole('button',{name:'취소',exact:true}).tap();assert(await page.locator('#status-overlay').evaluate(n=>n.classList.contains('active')));
   if(viewport.width===393){
    // The baseline also hits Chromium's tainted-canvas restriction for SVG foreignObject.
    // Check the real export menu and either generated files or its existing error recovery.
    await page.evaluate(()=>{deliverExportFiles=async files=>{window.pngExportFiles=files.map(f=>({name:f.name,size:f.blob.size,type:f.blob.type}));};});
    await page.locator('.status-share-btn').tap();await page.getByRole('button',{name:'이미지로 저장',exact:true}).tap();
    await page.waitForFunction(()=>window.pngExportFiles||document.getElementById('app-dialog-msg').textContent.includes('이미지 저장에 실패'));
    const files=await page.evaluate(()=>window.pngExportFiles);
    if(files)assert(files.every(f=>f.name.endsWith('.png')&&f.size>0&&f.type==='image/png'));
    else{
     assert(exportErrors.some(e=>e.includes('Tainted canvases')));
     await page.evaluate(()=>closeAppDialog(true));
     assert.equal(await page.locator('.status-share-btn').isEnabled(),true);
     console.log('KNOWN BASELINE LIMIT: actual PNG export is blocked by Chromium canvas security; existing error recovery preserved');
    }
   }
   // PDF still builds an unclipped print clone; intercept only the native print dialog.
   await page.evaluate(()=>{window.print=()=>{window.printVerified=Boolean(document.querySelector('#status-print-export .status-export-panel'));};exportStatusAsPdf()});
   await page.waitForFunction(()=>window.printVerified);
   await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
   await page.locator('.status-close').tap();
   // Mixed sections: blank section boundaries represent unnamed runs in the existing renderer.
   await page.evaluate(()=>{
    const make=n=>Array.from({length:n},(_,i)=>({name:'카드 '+i,icon:'✦'}));
    const group=CARD_DATA.race.groups[2];group.label='팝업 테스트';group.cards=[...make(10),{type:'section',label:'섹션 1 — 설명'},...make(2),{type:'section',label:'섹션 2'},...make(3),{type:'section',label:''},...make(5),{type:'section',label:'섹션 3'},...make(1)];
    window.listSourceSnapshot=JSON.stringify(group.cards);showGroupCards('race',2);
   });
   await open();assert.equal(await page.locator('#card-minimap-title').textContent(),'팝업 테스트 — 21');
   assert.deepEqual(await page.locator('#card-minimap summary').allTextContents(),['미분류 — 10','섹션 1 — 2','섹션 2 — 3','미분류 — 5','섹션 3 — 1']);
   assert.equal(await page.evaluate(()=>JSON.stringify(CARD_DATA.race.groups[2].cards)),await page.evaluate(()=>window.listSourceSnapshot));
   // A dismissal consumes underlay events even if another code path dispatches them directly.
   const before=await page.evaluate(()=>JSON.stringify({s:[...selectedCards.race],l:[...lockedCards.race||[]]}));
   await page.evaluate(()=>{const card=document.querySelector('.center-page.active[data-chrome-view="cards"] .data-card');card.dispatchEvent(new MouseEvent('mousedown',{bubbles:true,cancelable:true}));card.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));});
   assert.equal(await panel.isVisible(),false);assert.equal(await page.evaluate(()=>JSON.stringify({s:[...selectedCards.race],l:[...lockedCards.race||[]]})),before);assert.equal(await page.locator('.card-info-popover').count(),0);
   // Real touch gestures: vertical scrolling, small horizontal movement, left and right dismissal.
   await page.evaluate(()=>{CARD_DATA.race.groups[2].cards=[{type:'section',label:'많은 카드'},...Array.from({length:500},(_,i)=>({name:'카드 이름 '+i,icon:'✦'}))];showGroupCards('race',2);document.querySelector('.center-page.active[data-chrome-view="cards"]').scrollTop=100;});
   const saved=await page.locator('.center-page.active[data-chrome-view="cards"]').evaluate(n=>n.scrollTop);
   const cdp=await page.context().newCDPSession(page);
   const gesture=async(points)=>{
    const [x,y]=points[0];await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
    for(const [x,y] of points.slice(1)){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y}]});await page.waitForTimeout(25);}
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(260);
   };
   await open();await page.locator('#card-minimap-expand').tap();
   const content=await rect(page.locator('#card-minimap-content'));const x=content.x+content.width/2,y=content.y+Math.min(content.height-30,170);
   await gesture([[x,y],[x+1,y-30],[x+2,y-90],[x+3,y-140]]);
   assert(await panel.isVisible());assert(await page.locator('#card-minimap-content').evaluate(n=>n.scrollTop>0));
   await gesture([[x,y],[x+20,y],[x+30,y]]);assert(await panel.isVisible());
   await gesture([[x,y],[x+35,y],[x+85,y],[x+110,y]]);assert.equal(await panel.isVisible(),false);
   await open();await gesture([[x,y],[x-35,y],[x-85,y],[x-110,y]]);assert.equal(await panel.isVisible(),false);
   assert.equal(await page.locator('.center-page.active[data-chrome-view="cards"]').evaluate(n=>n.scrollTop),saved);
   assert.deepEqual(errors,[]);
   console.log(`PASS list popup ${viewport.width}x${viewport.height}: group/count, cancel, independent bulk controls, matching 3-popup bounds, ordered unnamed runs, scroll/direction/left-right swipe, underlay blocking, status cancel/PDF`);
   await page.close();
  }
  const page=await browser.newPage({viewport:{width:393,height:852},serviceWorkers:'block'});
  await page.route('**/images/core/buttons/cancel.webp',r=>r.abort());
  await page.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
  await page.goto(process.env.PERF_TEST_URL);await page.waitForTimeout(1600);await page.evaluate(()=>{goToCreate();switchNav('character',true);showGroupCards('race',2)});await page.locator('#card-minimap-toggle').click();
  assert(await page.locator('.card-minimap-close-fallback').isVisible());await page.locator('#card-minimap-close').click();assert.equal(await page.locator('#card-minimap').isVisible(),false);
  console.log('PASS cancel image network failure: visible fallback and working close');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
