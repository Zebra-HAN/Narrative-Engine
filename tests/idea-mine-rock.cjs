const assert=require('node:assert/strict');
const {chromium,webkit}=require('playwright');
const fs=require('node:fs/promises');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
(async()=>{
 for(const engine of [chromium,webkit]){
  let browser;
  try{browser=await engine.launch(engine===chromium?{executablePath:'/usr/bin/chromium',args:['--no-sandbox']}:{});}
  catch(e){if(engine===webkit){console.log('SKIP WebKit runtime unavailable');continue;}throw e;}
  try{
   for(const [width,height] of [[320,568],[393,750],[393,852],[430,932],[852,393]]){
    const page=await browser.newPage({viewport:{width,height},hasTouch:true,serviceWorkers:'block'});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/*',async route=>{
     const url=new URL(route.request().url());if(url.hostname!=='mine.test')return route.abort();
     const file=path.join(root,decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
     const ext=path.extname(file),types={'.html':'text/html','.css':'text/css','.js':'application/javascript','.jpg':'image/jpeg','.webp':'image/webp'};
     try{await route.fulfill({body:await fs.readFile(file),contentType:types[ext]||'application/octet-stream'});}catch{await route.fulfill({status:404,body:''});}
    });
    await page.goto('https://mine.test/');await page.waitForTimeout(1600);
    await page.locator('#btn-idea-mine').click();await page.locator('#mine-open-mining').click();
    const surface=page.locator('#mine-page-mining .idea-display');
    assert.equal(await page.locator('#mine-result').textContent(),'');
    const appearance=await surface.evaluate(n=>{
     const scene=n.closest('.mining-scene'),r=n.getBoundingClientRect(),s=scene.getBoundingClientRect(),style=getComputedStyle(n);
     return{background:getComputedStyle(scene).backgroundImage,size:getComputedStyle(scene).backgroundSize,border:style.borderTopWidth,shadow:style.boxShadow,panel:style.backgroundColor,x:(r.x-s.x)/s.width,y:(r.y-s.y)/s.width,width:r.width/s.width,height:r.height/s.width};
    });
    assert(appearance.background.endsWith('/images/core/mine/mining_bg-1.jpg")'));
    assert.equal(appearance.size,'100%');assert.equal(appearance.border,'0px');assert.equal(appearance.shadow,'none');assert.equal(appearance.panel,'rgba(0, 0, 0, 0)');
    assert(Math.abs(appearance.x-.2)<.01&&Math.abs(appearance.y-.91)<.01,'text anchors to rock image coordinates');
    assert(Math.abs(appearance.width-.6)<.01&&Math.abs(appearance.height-.28)<.01);
    assert(await page.locator('#mine-resultType').isHidden(),'no type banner on rock');
    await page.locator('#mine-roll').click();await page.waitForTimeout(80);
    assert((await page.locator('#mine-result').textContent()).length>0);
    const save=await page.locator('#mine-save').boundingBox(),copy=await page.locator('#mine-copy').boundingBox();
    assert.equal(save.width,40);assert.equal(copy.width,40);assert(Math.abs(save.y-copy.y)<1&&copy.x>save.x,'original buttons sit side by side at right');
    await page.locator('#mine-result').evaluate(n=>n.textContent='잊혀진 별을 찾아 떠나는 고래가 시간을 거슬러 오래된 약속을 지킨다. '.repeat(12));
    await page.waitForTimeout(100);
    const text=await page.locator('#mine-result').evaluate(n=>{
     const r=n.getBoundingClientRect(),s=n.parentElement.getBoundingClientRect();return{fits:r.left>=s.left-1&&r.right<=s.right+1&&r.top>=s.top-1&&r.bottom<=s.bottom+1,font:parseFloat(getComputedStyle(n).fontSize),width:n.scrollWidth<=n.clientWidth+1};
    });
    assert(text.fits&&text.width&&text.font>=10,'long text stays inside rock');
    assert(await page.locator('#mine-page-mining').evaluate(n=>n.scrollWidth<=n.clientWidth),'no horizontal page overflow');
    await page.locator('#mine-back').click();
    assert(await page.locator('#mine-page-main').isVisible());assert.deepEqual(errors,[]);
    console.log(`PASS ${engine.name()} ${width}x${height}: original background, rock bounds, long text, real buttons, navigation`);
    await page.close();
   }
  }finally{await browser.close();}
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
