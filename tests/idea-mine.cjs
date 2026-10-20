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
    assert.deepEqual(await slots.locator('.slotname').allTextContents(),['주체','대상','행동']);
    const rects=await slots.evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width}}));
    assert(rects.every(r=>Math.abs(r.y-rects[0].y)<1),'three slots share one row');
    assert(rects[0].x<rects[1].x&&rects[1].x<rects[2].x);
    const press=slots.first().locator('.browse').first();
    const tap=await press.evaluate(n=>getComputedStyle(n).webkitTapHighlightColor);
    assert.equal(tap,'rgba(0, 0, 0, 0)');
    await press.scrollIntoViewIfNeeded();const r=await press.boundingBox();
    await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();await page.waitForTimeout(130);
    assert(await press.evaluate(n=>new DOMMatrixReadOnly(getComputedStyle(n).transform).a<1));
    await page.mouse.up();await page.waitForTimeout(130);
    assert.equal(await press.evaluate(n=>n.classList.contains('is-pressing')),false);
    await page.locator('#mine-closeLibrary').click();
    if(engine===chromium&&width===393){
     const target=page.locator('#mine-modes button').first();await target.scrollIntoViewIfNeeded();const r=await target.boundingBox();
     const cdp=await page.context().newCDPSession(page);
     await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+r.width/2,y:r.y+r.height/2}]});
     await page.waitForTimeout(130);
     assert(await target.evaluate(n=>n.classList.contains('is-pressing')));
     assert(await target.evaluate(n=>new DOMMatrixReadOnly(getComputedStyle(n).transform).a<1));
     await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
     assert.equal(await target.evaluate(n=>n.classList.contains('is-pressing')),false,'cancel releases touch paint');
     await cdp.detach();
    }
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
    await slots.nth(1).locator('textarea').fill('구름');
    await slots.nth(2).locator('textarea').fill('기른다');
    assert.equal(await page.locator('#mine-result').textContent(),custom+'이 구름을 기른다');
    await page.locator('#mine-expand').click();
    assert.equal(await page.locator('#mine-expGrid .exp').count(),6);
    const questions=await page.locator('#mine-expGrid .exp').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,height:r.height,overflow:n.scrollHeight>n.clientHeight}}));
    assert(Math.abs(questions[0].y-questions[1].y)<1,'questions use two columns');
    assert(questions.every(q=>!q.overflow),'question text is not clipped');
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
    if(width===393){
     const legacy=[
      {mode:0,values:{subject:'나무',object:'구름을',verb:'삼킨다'},text:'나무가 구름을 삼킨다'},
      {mode:0,values:{subject:'나무',object:'노을',verb:'삼킨다'},text:'나무가 노을 삼킨다'},
      {mode:0,values:{subject:'작은 용',object:'유리 고래를',verb:'기른다'},text:'작은 용이 유리 고래를 기른다'},
      {mode:1,values:{subject:'나무',quality:'살아 움직이는'},text:'살아 움직이는 나무'},
      {mode:0,values:{subject:'',object:'구름을',verb:'삼킨다'},text:'이(가) 구름을 삼킨다'},
      {mode:3,values:{subject:'왕',object:'AI',relation:'기르는'},text:'AI를 기르는 왕'},
      {mode:2,values:{trigger:'비가 내리면',effect:'시간이 거꾸로 흐른다'},text:'비가 내리면 시간이 거꾸로 흐른다'},
      {mode:3,values:{subject:'용',object:'인간',relation:'기르는'},text:'인간을 기르는 용'},
      {mode:4,values:{problem:'밤이 사라진 마을',solution:'어둠을 재배하는 농부'},text:'밤이 사라진 마을에서 활동하는 어둠을 재배하는 농부'},
      {mode:5,values:{outcome:'도시 전체가 잠들었다',cause:'오래된 약속이 깨졌기 때문이다'},text:'도시 전체가 잠들었다 왜냐하면 오래된 약속이 깨졌기 때문이다'}
     ].map((x,i)=>({...x,id:'legacy-'+i,time:'이전 기록'}));
     await page.evaluate(items=>localStorage.setItem('narrative_idea_mine_saves_v1',JSON.stringify(items)),legacy);
     await page.reload();await page.waitForTimeout(1600);await page.evaluate(()=>switchScreen('screen-idea-mine',null,{type:'instant'}));
     assert.deepEqual(await page.locator('#mine-saved .savedtext').allTextContents(),legacy.map(x=>x.text));
     for(let i=0;i<legacy.length;i++){
      await page.locator('#mine-saved .saveditem').nth(i).locator('button').first().click();
      assert.equal(await page.locator('#mine-result').textContent(),legacy[i].text,'v1 record loads without changing its sentence');
      await page.locator('#mine-reroll').click();
      assert.equal(await page.locator('#mine-result').textContent(),legacy[i].text,'loaded materials remain locked');
     }
     await page.locator('#mine-saved .saveditem').nth(1).locator('button').first().click();
     await page.locator('#mine-save').click();
     await page.reload();await page.waitForTimeout(1600);await page.evaluate(()=>switchScreen('screen-idea-mine',null,{type:'instant'}));
     await page.locator('#mine-saved .saveditem').first().locator('button').first().click();
     assert.equal(await page.locator('#mine-result').textContent(),legacy[1].text,'v1 custom object survives save/reload as v2');
     // Once that old custom object is edited, the new base-form particle rule applies.
     await page.locator('#mine-slots .slot').nth(1).locator('textarea').fill('노을');
     assert.equal(await page.locator('#mine-result').textContent(),'나무가 노을을 삼킨다');
    }
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
