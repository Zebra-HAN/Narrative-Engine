const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const {chromium}=require('playwright');
const baseline=execFileSync('git',['show','77cebe4:css/fantasy-top-panel.css'],{encoding:'utf8',maxBuffer:4*1024*1024});
const near=(a,b,label)=>assert(Math.abs(a-b)<.6,`${label}: ${a} / ${b}`);
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
 for(const width of [320,393,852]){
  const before=new Map();
  for(const mode of ['before','after']){
   const page=await browser.newPage({viewport:{width,height:852},serviceWorkers:'block'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   if(mode==='before')await page.route('**/css/fantasy-top-panel.css',r=>r.fulfill({body:baseline,contentType:'text/css'}));
   await page.goto(process.env.PERF_TEST_URL||'http://127.0.0.1:8001');await page.waitForTimeout(1600);
   await page.evaluate(()=>{goToCreate();switchNav('character',true);selectSub('race');});
   await page.waitForSelector('#page-race.active[data-chrome-view=group]');
   await page.addStyleTag({content:'.group-select-btn {animation:none!important;opacity:1!important;transform:none!important;}'});
   for(const count of [1,2,3,4,5,6,7,9,13,31]){
    const s=await page.evaluate(count=>{
     CARD_DATA.race.groups=Array.from({length:count},(_,i)=>({id:'grid_test_'+i,label:'Group '+i,icon:'◆',cards:[{name:'Card'}]}));
     showGroupPage('race',false,true);
     const page=document.querySelector('.center-page.active[data-chrome-view=group]'),nodes=[...page.querySelectorAll('.group-select-btn')],r=nodes.map(n=>n.getBoundingClientRect()),p=page.getBoundingClientRect();
     const columns=count>=7?3:count===2||count===4||count===6?2:1;
     const style=getComputedStyle(nodes[0]);
     return {width:r[0].width,height:r[0].height,left:r[0].left-p.left,right:p.right-r[Math.min(columns-1,count-1)].right,colGap:columns>1?r[1].left-r[0].right:0,rowGap:count>columns?r[columns].top-r[0].bottom:0,scrollbar:getComputedStyle(page).scrollbarWidth,webkit:getComputedStyle(page,'::-webkit-scrollbar').display,overflow:page.scrollWidth>page.clientWidth,rects:r.map(n=>({x:n.x,y:n.y,width:n.width,height:n.height})),font:style.fontSize};
    },count);
    if(mode==='before'){before.set(count,s);continue;}
    const old=before.get(count);
    assert.equal(s.scrollbar,'none');assert.equal(s.webkit,'none');assert.equal(s.overflow,false);
    if(count<7){assert.deepEqual(s.rects,old.rects,`${count} group geometry unchanged`);assert.equal(s.font,old.font);}
    else{
     near(s.height/s.width,1,'square ratio');near(s.colGap,old.colGap,'horizontal gap');near(s.rowGap,old.rowGap*2,'vertical gap');near(s.left,s.colGap,'left edge');near(s.right,s.colGap,'right edge');near(s.width,old.width,'button width');
    }
   }
   if(mode==='after'){
    const p=page.locator('.center-page.active[data-chrome-view=group]');await p.hover();await page.mouse.wheel(0,450);await page.waitForTimeout(250);
    assert(await p.evaluate(n=>n.scrollTop)>0,'hidden scrollbar retains wheel scrolling');
    await p.evaluate(n=>{n.scrollTop=n.scrollHeight;});
    const end=await p.evaluate(n=>{const last=n.querySelector('.group-select-btn:last-child').getBoundingClientRect(),r=n.getBoundingClientRect();return last.bottom<=r.bottom;});
    assert(end,'last button remains reachable');
    await p.evaluate(n=>{n.scrollTop=0;});
    await p.locator('[data-group-action=cards]').first().click();
    await page.waitForSelector('.center-page.active[data-chrome-view=cards]');
    await page.evaluate(()=>navigateAddressBack());
    await page.waitForSelector('#page-race.active[data-chrome-view=group]');
    assert.equal(await page.locator('#page-race .group-select-btn').count(),31);
   }
   assert.deepEqual(errors,[]);await page.close();
  }
  console.log(`PASS ${width}: 1–6 unchanged; 7+ square 3-column grids, preserved horizontal gaps, doubled vertical gaps, matching edge spacing, no scrollbar, scroll to last row`);
 }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
