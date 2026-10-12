const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  for(const width of [320,393,1280]){
   const page=await browser.newPage({viewport:{width,height:852},hasTouch:true,serviceWorkers:'block'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
   await page.route('**/title-fixture-*',r=>{
    const size=r.request().url().match(/title-fixture-(\d+)-(\d+)/);
    if(!size)return r.fulfill({status:404,body:''});
    return r.fulfill({contentType:'image/svg+xml',body:`<svg xmlns="http://www.w3.org/2000/svg" width="${size[1]}" height="${size[2]}"><rect width="100%" height="100%" fill="tan"/></svg>`});
   });
   await page.goto(process.env.PERF_TEST_URL);await page.waitForTimeout(1600);
   await page.evaluate(()=>{
    goToCreate();switchNav('character',true);selectSub('race');
    window.realRaceGroups=CARD_DATA.race.groups;
    CARD_DATA.race.groups=[[600,600],[800,600],[1200,400],[400,1000],null,'broken',[24,24]].map((size,i)=>({id:'title_'+i,label:'그룹 '+i,description:i===4?'':'짧은 설명',detail:'기존 그룹 상세 설명',icon:'🌿',img:size==='broken'?'title-fixture-broken':size?`title-fixture-${size[0]}-${size[1]}`:undefined,cards:[{type:'section',label:'섹션 — 설명'},...Array.from({length:120},(_,j)=>({name:'카드 '+j,icon:'✦'}))]}));
    showGroupPage('race',false);
   });
   assert.equal(await page.locator('.page-title-card').count(),0);
   for(const [i,layout] of ['square','landscape','wide','portrait','square','square','square'].entries()){
    await page.evaluate(i=>showGroupCards('race',i),i);
    const title=page.locator('.page-title-card');
    await page.waitForFunction(layout=>document.querySelector('.page-title-card').dataset.imageLayout===layout,layout);
    if(i!==4&&i!==5)await title.locator('img').waitFor();
    if(i===5)await page.waitForTimeout(150);
    assert.equal(await title.locator('.page-title-heading').textContent(),'그룹 '+i);
    assert.equal(await title.locator('.page-title-count').textContent(),'120개 카드');
    assert.equal(await title.locator('.page-title-description').count(),i===4?0:1);
    if(i===4||i===5)assert.equal(await title.locator('.page-title-icon').textContent(),'🌿');
    const geometry=await title.evaluate(n=>{const r=n.getBoundingClientRect();const img=n.querySelector('img');const ir=img?.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,first:n===n.parentElement.firstElementChild,ratio:ir?ir.width/ir.height:null,natural:img?img.naturalWidth/img.naturalHeight:null,notUpscaled:!img||ir.width<=img.naturalWidth,contained:!ir||(ir.left>=r.left&&ir.right<=r.right&&ir.top>=r.top&&ir.bottom<=r.bottom),highlight:getComputedStyle(n).webkitTapHighlightColor};});
    assert(geometry.first&&geometry.left>=0&&geometry.right<=width&&geometry.top>=52&&geometry.contained&&geometry.notUpscaled);
    if(geometry.ratio)assert(Math.abs(geometry.ratio-geometry.natural)<0.01);
    assert.equal(geometry.highlight,'rgba(0, 0, 0, 0)');
    const state=()=>page.evaluate(()=>JSON.stringify({selected:[...selectedCards.race||[]],locked:[...lockedCards.race||[]],path:addressTrail}));
    const before=await state();await title.tap();
    assert(await page.locator('#detail-overlay').evaluate(n=>n.classList.contains('active')));
    assert.equal(await page.locator('#detail-name').textContent(),'그룹 '+i);
    assert.equal(await page.locator('.location-info-detail').textContent(),'기존 그룹 상세 설명');
    assert.equal(await state(),before);await page.evaluate(()=>closeDetailSheet());
    // Fixed chrome shows the category; group details belong to the scrolling title.
    assert.equal(await page.locator('#info-cat-name').textContent(),await page.evaluate(()=>getSubInfo('race').label));
    await page.locator('#card-minimap-toggle').tap();assert.equal(await page.locator('.card-minimap-tag').count(),120);assert.equal(await page.locator('#card-minimap summary').textContent(),'섹션 — 120');
    await page.locator('#card-minimap-close').tap();
    const saved=await page.evaluate(()=>{const p=document.querySelector('.center-page.active[data-chrome-view="cards"]');p.scrollTop=650;p.dispatchEvent(new Event('scroll'));return p.scrollTop;});
    assert((await title.boundingBox()).y+(await title.boundingBox()).height<52, 'title scrolls out with cards');
    await page.evaluate(()=>navigateAddressBack());await page.evaluate(i=>showGroupCards('race',i),i);await page.waitForTimeout(250);
    assert.equal(await page.locator('.center-page.active[data-chrome-view="cards"]').evaluate(n=>n.scrollTop),saved);
   }
   await page.evaluate(()=>{CARD_DATA.race.groups=window.realRaceGroups;showSubgroupCards('race',1,0)});
   assert.equal(await page.locator('.page-title-card').count(),1);
   assert.equal(await page.locator('.page-title-count').textContent(),await page.evaluate(()=>CARD_DATA.race.groups[1].subgroups[0].cards.filter(c=>!isSectionItem(c)).length+'개 카드'));
   await page.evaluate(()=>{showGroupPage('race',false);showCardPage('outlineFlatFixture',false)});
   assert.equal(await page.locator('.page-title-card').count(),0);
   assert.deepEqual(errors,[]);
   console.log(`PASS title ${width}px: 4 ratios, original aspect/no upscaling, icon/error fallback, missing description, counts, existing detail, scroll/restore, group changes, minimap, subgroup and flat-page scope`);
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
