const assert=require('node:assert/strict');
const {chromium,webkit}=require('playwright');
const fs=require('node:fs/promises');
const path=require('node:path');
(async()=>{
 for(const engine of [chromium,webkit]){
  let browser;
  try{browser=await engine.launch(engine===chromium?{executablePath:'/usr/bin/chromium',args:['--no-sandbox']}:{});}
  catch(e){if(engine===webkit){console.log('SKIP WebKit runtime unavailable');continue;}throw e;}
  try{
   for(const [width,height] of [[320,568],[393,750],[393,852],[430,932],[852,393]]){
    const page=await browser.newPage({viewport:{width,height},hasTouch:true,serviceWorkers:'block'}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/*',async route=>{
     const u=new URL(route.request().url());if(u.hostname!=='home.test')return route.abort();
     const file=path.join(__dirname,'..',u.pathname==='/'?'index.html':decodeURIComponent(u.pathname));
     const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};
     try{await route.fulfill({body:await fs.readFile(file),contentType:types[path.extname(file)]||'application/octet-stream'});}catch{await route.fulfill({status:404,body:''});}
    });
    await page.goto('https://home.test/');await page.waitForTimeout(1600);
    const home=page.locator('#screen-home');
    await page.evaluate(()=>switchScreen('screen-home',null,{type:'instant'}));await page.waitForTimeout(1450);
    assert.deepEqual(await home.locator('button').allTextContents(),['스토리 구조','캐릭터 상점','아이디어 광산','창작 여행']);
    assert.equal(await home.locator('.home-menu-divider').count(),3);
    assert(await home.locator('.home-menu-divider').evaluateAll(ns=>ns.every(n=>n.naturalWidth===461&&n.naturalHeight===135&&n.getAttribute('src')==='images/core/home/main_home_section.png'&&n.alt==='')));
    assert(await home.evaluate(n=>getComputedStyle(n).backgroundImage.includes('forestglow.jpg')));
    assert(await home.evaluate(n=>getComputedStyle(n,'::before').backgroundImage.includes('royal-banner.webp')));
    const rects=()=>home.locator('.home-container > *').evaluateAll(ns=>ns.map(n=>{const r=n.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height};}));
    const geometry=await rects();
    assert(geometry.every((r,i)=>r.y>=0&&r.y+r.h<=height&&(!i||r.y>=geometry[i-1].y+geometry[i-1].h)),'menus and ornaments fit without overlap');
    assert(await home.evaluate(n=>n.scrollHeight<=n.clientHeight),'home has no vertical overflow');
    assert(await home.locator('.home-link').evaluateAll(ns=>ns.every(n=>{const s=getComputedStyle(n),r=n.getBoundingClientRect();return s.backgroundImage==='none'&&s.boxShadow==='none'&&n.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));})),'text buttons have no panels and are reachable');
    assert(await home.locator('.home-menu-label').evaluateAll(ns=>ns.every(n=>getComputedStyle(n).backgroundImage.includes('linear-gradient')&&getComputedStyle(n).fontWeight==='600')),'all four use CSS metallic text');
    if(engine===chromium){
     const cdp=await page.context().newCDPSession(page);
     for(const button of await home.locator('.home-link').all()){
      const r=await button.boundingBox();
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+r.width/2,y:r.y+r.height/2}]});
      assert(await button.evaluate(n=>n.classList.contains('is-pressing')),'feedback begins before touch ends');
      assert(await button.evaluate(n=>new DOMMatrixReadOnly(getComputedStyle(n).transform).a<=.961));
      assert(await button.locator('span').evaluate(n=>getComputedStyle(n).filter.includes('brightness(1.22)')),'gold glow is active during touch');
      assert.equal(await button.evaluate(n=>getComputedStyle(n).boxShadow),'none','press never adds black button shadow');
      const during=await rects();
      for(const index of [1,3,5])assert.deepEqual(during[index],geometry[index],'ornaments never move while pressing');
      await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await page.waitForTimeout(180);
      assert.equal(await button.evaluate(n=>n.classList.contains('is-pressing')),false);
      assert.equal(await button.locator('span').evaluate(n=>getComputedStyle(n).filter.includes('brightness(1.22)')),false);
     }
     await cdp.detach();
    }
    await page.locator('#btn-character-shop').click();
    assert(await home.evaluate(n=>n.classList.contains('active')));
    assert.equal(await page.locator('#app-dialog-msg').textContent(),'캐릭터 상점은 준비 중입니다.');
    await page.locator('#app-dialog-actions button').click();
    assert.equal(await page.evaluate(()=>document.activeElement.id),'btn-character-shop');
    for(const [button,target] of [['btn-narrative','screen-narrative'],['btn-idea-mine','screen-idea-mine'],['btn-create','screen-create']]){
     await page.locator('#'+button).click();await page.waitForTimeout(450);
     assert(await page.locator('#'+target).evaluate(n=>n.classList.contains('active')),'original navigation remains');
     await page.evaluate(()=>switchScreen('screen-home',null,{type:'instant',skipHomeIntro:true}));
    }
    assert.deepEqual(errors,[]);
    console.log(`PASS ${engine.name()} ${width}x${height}: four menus, ornaments, metallic text, live touch/cancel, stable layout, placeholder and original routes`);
    await page.close();
   }
  }finally{await browser.close();}
 }
})().catch(e=>{console.error(e);process.exitCode=1});
