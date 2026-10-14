const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const baseline=execFileSync('git',['show','9920a5f:js/app.js'],{encoding:'utf8'});
 try{
  const results=[];
  for(const old of [true,false]){
   const page=await browser.newPage({viewport:{width:393,height:852},hasTouch:true,serviceWorkers:'block'});
   await page.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
   if(old)await page.route('**/js/app.js',r=>r.fulfill({body:baseline,contentType:'application/javascript'}));
   await page.goto(process.env.PERF_TEST_URL);await page.waitForTimeout(1600);
   await page.evaluate(()=>{goToCreate();switchNav('character',true);selectSub('race');});
   await page.waitForFunction(()=>document.querySelector('#page-race.active[data-chrome-view=group]'));
   await page.evaluate(()=>{showGroupCards('race',2,true);window.source=document.querySelector('.center-page.active[data-chrome-view=cards]');source.querySelectorAll('.data-card').forEach(c=>c.classList.remove('card-deal'));});
   await page.waitForTimeout(500);assert.equal(await page.locator('.center-page.active .data-card').count(),139);
   const trips=[];
   for(const short of [false,true]){
    await page.evaluate(short=>{source.scrollTop=short?120:0;},short);
    await page.locator('#card-minimap-toggle').click();await page.waitForTimeout(250);await page.locator('#card-minimap-expand').click();
    const tag=page.locator('.card-minimap-tag').nth(short?2:138);await tag.scrollIntoViewIfNeeded();
    if(!old&&!short){
     const space=await page.evaluate(()=>{const content=document.querySelector('.card-minimap-content'),last=[...content.querySelectorAll('.card-minimap-tag')].at(-1);content.scrollTop=content.scrollHeight;return {top:content.scrollTop,lastBottom:last.getBoundingClientRect().bottom,center:content.getBoundingClientRect().top+content.clientHeight/2};});
     assert(Math.abs(space.lastBottom-space.center)<35,'last card can rest at viewport center');await page.waitForTimeout(300);
     const bounds=await page.locator('.card-minimap-content').boundingBox(),touch=await page.context().newCDPSession(page);
     const x=bounds.x+bounds.width/2,y=bounds.y+bounds.height*.8;
     await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
     await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-80}]});
     await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
     await page.waitForTimeout(300);
     assert.equal(await page.locator('.card-minimap-content').evaluate(n=>n.scrollTop),space.top,'real bottom padding retains its scroll position after finger release');
    }
    await page.evaluate(()=>{window.samples=[];window.sampling=true;const frame=()=>{if(!sampling)return;samples.push({t:performance.now(),y:source.scrollTop});requestAnimationFrame(frame)};requestAnimationFrame(frame);});
    await tag.click();await page.waitForTimeout(3300);
    const trip=await page.evaluate(()=>{sampling=false;const from=samples[0].y,to=source.scrollTop,d=Math.abs(to-from),first=samples.find(p=>Math.abs(p.y-from)>1),end=samples.find(p=>Math.abs(p.y-to)<=1&&p.t>first.t);return {distance:d,duration:end.t-first.t,from,to,samples:samples.filter(p=>p.t>=first.t&&p.t<=end.t).map(p=>({t:p.t-first.t,y:p.y}))};});
    assert(trip.distance>0);for(let i=1;i<trip.samples.length;i++)assert((trip.samples[i].y-trip.samples[i-1].y)*Math.sign(trip.to-trip.from)>=-1,'monotonic exact landing');
    await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>source.scrollTop),trip.to);trips.push(trip);
   }
   results.push(trips);await page.close();
  }

  const ratio=results[1][0].duration/results[0][0].duration;
  assert(ratio>.4&&ratio<.6,`139 cards duration ratio ${ratio}`);
  assert(Math.abs(results[1][1].duration-results[0][1].duration)<100,'short trip timing preserved');
  assert.equal(results[0][0].to,results[1][0].to,'same section-start destination');
  // The final glide retains its old trajectory when aligned by arrival, within frame/rounding tolerance.
  for(const remaining of [150,250,350]){
   const offsets=results.map(r=>{const trip=r[0],time=trip.duration-remaining,p=trip.samples.reduce((a,b)=>Math.abs(b.t-time)<Math.abs(a.t-time)?b:a);return Math.abs(p.y-trip.to);});
   assert(Math.abs(offsets[0]-offsets[1])<8,JSON.stringify({remaining,offsets,results:results.map(r=>({distance:r[0].distance,duration:r[0].duration}))}));
  }
  console.log(JSON.stringify({cards:139,baselineMs:results[0][0].duration,newMs:results[1][0].duration,ratio,shortBaselineMs:results[0][1].duration,shortNewMs:results[1][1].duration}));
  console.log('PASS actual 139-card timing, short timing, original tail, exact stable destination and real bottom space');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
