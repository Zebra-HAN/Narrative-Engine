const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  for(const viewport of [{width:320,height:568},{width:393,height:852},{width:852,height:393}]){
   const page=await browser.newPage({viewport,hasTouch:true,serviceWorkers:'block'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());await page.goto(process.env.PERF_TEST_URL);await page.waitForTimeout(1600);
   await page.evaluate(()=>{goToCreate();switchNav('character',true);selectSub('race');});await page.waitForFunction(()=>document.querySelector('#page-race.active[data-chrome-view=group]'));
   const toggle=page.locator('#card-minimap-toggle'),close=page.locator('#card-minimap-close');
   const active=async()=>{assert.equal(await page.locator('#card-minimap details.is-current-section').count(),1);return page.locator('#card-minimap details.is-current-section summary').textContent();};
   for(const count of [1,2,3,4]){
    await page.evaluate(count=>{
     const cards=n=>Array.from({length:n},(_,i)=>({name:'Card '+i,icon:'✦'}));
     CARD_DATA.race.groups[2].layoutType='4';CARD_DATA.race.groups[2].cards=[{type:'section',label:'First'},...cards(4+count),{type:'section',label:'Second'},...cards(4+count),{type:'section',label:'Last'},...cards(60)];
     selectedCards.race=new Set([2001]);lockedCards.race=new Set([2001]);showGroupCards('race',2,true);
     window.rowPage=document.querySelector('.center-page.active[data-chrome-view="cards"]');
     rowPage.querySelectorAll('.data-card').forEach(c=>c.classList.remove('card-deal'));window.firstCount=4+count;
    },count);
    await page.waitForTimeout(350);await page.evaluate(()=>{rowPage.scrollTop=0;});await toggle.click();await page.waitForTimeout(250);assert((await active()).startsWith('First'));
    const boundary=await page.evaluate(()=>{
     const cards=[...rowPage.querySelectorAll('.data-card')].slice(0,firstCount),tops=cards.map(c=>c.getBoundingClientRect().top),last=Math.max(...tops);
     return {at:rowPage.scrollTop+last-rowPage.getBoundingClientRect().top,rowCount:tops.filter(t=>Math.abs(t-last)<1).length};
    });assert.equal(boundary.rowCount,count,'real final row occupancy');
    await rowPageSet(boundary.at-1);assert((await active()).startsWith('First'));
    await rowPageSet(boundary.at);assert((await active()).startsWith('Second'),'changes at the clipping edge, not halfway');
    for(const delta of [-1,0,1,-1]){await rowPageSet(boundary.at+delta);assert((await active()).startsWith('Second'),'small jitter does not flash');}
    await rowPageSet(boundary.at-3);assert((await active()).startsWith('First'),'reverse crossing returns to the previous section');
    await rowPageSet(boundary.at+1);await close.click();await page.waitForTimeout(250);await toggle.click();await page.waitForTimeout(250);assert((await active()).startsWith('Second'),'reopen uses the new boundary');
    await close.click();await page.waitForTimeout(250);assert(await page.evaluate(()=>selectedCards.race.has(2001)&&lockedCards.race.has(2001)));
    console.log(`PASS ${viewport.width} final row ${count}: measured row, exact onset, reverse, jitter, reopen, single marker and protected selection/lock`);
   }
   assert.deepEqual(errors,[]);await page.close();
   async function rowPageSet(top){await page.evaluate(top=>{rowPage.scrollTop=top;},top);await page.waitForTimeout(40);}
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
