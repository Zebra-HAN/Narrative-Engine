const assert = require('node:assert/strict');
const {chromium, webkit} = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
(async()=>{
 for(const engine of [chromium,webkit]){
  let browser;
  try { browser=await engine.launch(engine===chromium?{executablePath:'/usr/bin/chromium',args:['--no-sandbox']}:{}); }
  catch(e){if(engine===webkit){console.log('SKIP WebKit runtime unavailable');continue}throw e}
  try {
   for(const width of [320,393,852]){
    const page=await browser.newPage({viewport:{width,height:width===852?393:852},hasTouch:true,serviceWorkers:'block'}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/*',async route=>{
     const u=new URL(route.request().url());
     if(u.hostname!=='mine.test')return route.abort();
     const file=path.join(root,decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname));
     try {await route.fulfill({body:await fs.readFile(file),contentType: file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'image/webp'});}catch{await route.fulfill({status:404,body:''})}
    });
    await page.goto('https://mine.test/');await page.waitForTimeout(1600);
    await page.evaluate(()=>switchScreen('screen-home',null,{type:'instant'}));
    assert.deepEqual(await page.locator('#screen-home button').allTextContents(),['스토리 구조','아이디어 광산','창작 시작']);
    await page.locator('#btn-idea-mine').click();
    const slots=page.locator('#mine-slots .slot');
    assert.equal(await slots.count(),3);
    await slots.first().locator('.browse').first().click();
    await page.locator('#mine-libSearch').fill('나무');
    await page.locator('#mine-libGrid button').click();
    assert.equal(await slots.first().locator('textarea').inputValue(),'나무');
    assert.equal(await slots.first().locator('.lock').getAttribute('aria-pressed'),'true');
    await page.locator('#mine-reroll').click();
    assert.equal(await slots.first().locator('textarea').inputValue(),'나무');
    assert(await slots.first().locator('.browse').last().isDisabled());
    await slots.first().locator('.lock').click();
    await slots.first().locator('.browse').last().click();
    assert.notEqual(await slots.first().locator('textarea').inputValue(),'나무');
    const custom='아주 긴 재료 이름을 직접 수정한 작은 용';
    await slots.first().locator('textarea').fill(custom);
    assert((await page.locator('#mine-result').textContent()).includes(custom));
    await page.locator('#mine-expand').click();
    assert.equal(await page.locator('#mine-expGrid .exp').count(),6);
    await page.locator('#mine-save').click();
    const text=await page.locator('#mine-result').textContent();
    assert.equal(await page.locator('#mine-saved .saveditem').count(),1);
    const dl=page.waitForEvent('download');await page.locator('#mine-export').click();assert((await dl).suggestedFilename().endsWith('.txt'));
    await page.reload();await page.waitForTimeout(1600);await page.evaluate(()=>switchScreen('screen-idea-mine',null,{type:'instant'}));
    await page.locator('#mine-saved button').first().click();
    assert.equal(await page.locator('#mine-result').textContent(),text);
    await page.locator('#mine-reroll').click();assert.equal(await page.locator('#mine-result').textContent(),text);
    for(let i=0;i<6;i++){
     await page.locator('#mine-modes button').nth(i).click();
     assert(!(await page.locator('#mine-result').textContent()).includes('undefined'));
     assert(await page.evaluate(()=>{const s=document.getElementById('screen-idea-mine');return s.scrollWidth<=s.clientWidth}));
    }
    await page.locator('#mine-saved button').last().click();assert.equal(await page.locator('#mine-saved .saveditem').count(),0);
    await page.locator('#mine-home').click();await page.waitForTimeout(500);
    await page.evaluate(()=>goToNarrative());assert(await page.locator('#screen-narrative').evaluate(n=>n.classList.contains('active')));
    await page.evaluate(()=>goToCreate());assert(await page.locator('#screen-create').evaluate(n=>n.classList.contains('active')));
    assert.deepEqual(errors,[]);
    console.log(`PASS ${engine.name()} ${width}: navigation, search/select/lock, single/batch random, edit, questions, persistence/load/delete/export, overflow`);
    await page.close();
   }
  } finally {await browser.close()}
 }
})().catch(e=>{console.error(e);process.exitCode=1});
