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
     const screen=document.getElementById('screen-idea-mine'),style=getComputedStyle(n),background=getComputedStyle(screen);
     return{background:background.backgroundImage,size:background.backgroundSize,border:style.borderTopWidth,shadow:style.boxShadow,panel:style.backgroundColor};
    });
    assert(appearance.background.endsWith('/images/core/mine/mining_bg-1.jpg")'));
    assert.equal(appearance.size,'cover');assert.equal(appearance.border,'0px');assert.equal(appearance.shadow,'none');assert.equal(appearance.panel,'rgba(0, 0, 0, 0)');
    const checkViewport=async()=>{
     await page.waitForTimeout(120);
     const geometry=await page.evaluate(()=>{
      const ids=['screen-idea-mine','mine-page-mining','mine-content'];
      const containers=ids.map(id=>{const n=document.getElementById(id),r=n.getBoundingClientRect();return{id,scroll:n.scrollHeight-n.clientHeight,top:r.top,bottom:r.bottom};});
      for(const n of document.querySelectorAll('#mine-page-mining .mining-scene, #mine-page-mining .mine-dock'))containers.push({id:n.className,scroll:n.scrollHeight-n.clientHeight,top:n.getBoundingClientRect().top,bottom:n.getBoundingClientRect().bottom});
      const buttons=[...document.querySelectorAll('#mine-page-mining button')].filter(n=>!n.closest('[hidden]')&&!n.closest('.modes'));
      return{height:innerHeight,containers,buttons:buttons.map(n=>{const r=n.getBoundingClientRect();return{id:n.id||n.className,top:r.top,bottom:r.bottom,hit:n.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))};})};
     });
     for(const n of geometry.containers){assert(n.scroll<=1,`${n.id} has no vertical overflow`);assert(n.top>=-1&&n.bottom<=geometry.height+1,`${n.id} fits viewport`);}
     for(const n of geometry.buttons){assert(n.top>=0&&n.bottom<=geometry.height,`${n.id} is fully on screen`);assert(n.hit,`${n.id} is reachable, not clipped`);}
     await page.locator('#mine-page-mining').evaluate(n=>n.scrollTop=100);
     assert.equal(await page.locator('#mine-page-mining').evaluate(n=>n.scrollTop),0,'page cannot scroll');
    };
    await checkViewport();
    if(width===393&&height===750){
     const safeArea=await page.addStyleTag({content:'#screen-idea-mine .mine-workbench { padding-top:53px!important; padding-bottom:40px!important; }'});
     await checkViewport();
     await safeArea.evaluate(n=>n.remove());await checkViewport();
    }
    await page.locator('#mine-modes').evaluate(n=>n.scrollLeft=n.scrollWidth);
    assert(await page.locator('#mine-modes').evaluate(n=>n.scrollWidth<=n.clientWidth||n.scrollLeft>0),'mode horizontal scrolling works');
    await page.locator('#mine-modes').evaluate(n=>n.scrollLeft=0);
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
    await page.setViewportSize({width,height:Math.max(393,height-90)});
    await checkViewport();
    await page.setViewportSize({width,height});
    await checkViewport();
    await page.locator('#mine-back').click();
    assert(await page.locator('#mine-page-main').isVisible());assert.deepEqual(errors,[]);
    console.log(`PASS ${engine.name()} ${width}x${height}: cover background, no scrolling, all controls reachable, viewport resize, long text, navigation`);
    await page.close();
   }
  }finally{await browser.close();}
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
