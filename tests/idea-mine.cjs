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
    const page=await browser.newPage({viewport:{width,height:width===320?568:width===852?393:852},hasTouch:true,serviceWorkers:'block'}),errors=[];
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
    assert(await page.locator('#mine-page-main').isVisible());
    assert.deepEqual(await page.locator('.mine-menu button').allTextContents(),['되돌아가기','설명','저장 창고','아이디어 채굴하기']);
    const menu=await page.locator('.mine-menu').boundingBox();
    const height=width===320?568:width===852?393:852;
    assert(menu.y+menu.height<=height,'landing menu fits viewport');
    const canvas=await page.locator('#screen-idea-mine').boundingBox();
    assert(menu.width/canvas.width>.66 && menu.width/canvas.width<.72,'menu uses approximately 70 percent width');
    const firstRow=await page.locator('.mine-menu-row button').evaluateAll(ns=>ns.map(n=>n.getBoundingClientRect().y));
    assert.equal(firstRow[0],firstRow[1]);
    assert(menu.y+menu.height>height-55,'menu group is at the bottom');
    if(height>600)assert(menu.y>height/2,'upper and middle illustration space remains clear');
    await page.locator('#mine-open-guide').click();
    assert(await page.locator('#app-dialog-overlay').evaluate(n=>n.classList.contains('active')));
    assert(await page.locator('#mine-page-main').isVisible());
    await page.locator('#app-dialog-actions button').click();
    assert.equal(await page.locator('#mine-page-guide').count(),0);
    const confirm=async(answer='예')=>page.locator('#app-dialog-actions').getByRole('button',{name:answer,exact:true}).click();
    assert.equal(await page.locator('#mine-open-refinery').count(),0,'only main refinery entry is removed');
    await page.locator('#mine-open-storage').click();
    const emptyStorage=await page.locator('#mine-page-storage .mine-balanced-content').boundingBox();
    assert(emptyStorage.y>height*.2 && emptyStorage.y<height*.65,'empty storage uses central reading area');
    assert((await page.locator('#mine-page-storage .mine-page-actions').boundingBox()).y>height/2,'storage actions sit below center');
    await page.locator('#mine-page-storage [data-mine-main]').click();
    await page.locator('#mine-open-mining').click();
    const storage=async()=>{await page.locator('#mine-back').click();await page.locator('#mine-open-storage').click()};
    const slots=page.locator('#mine-slots .slot');
    assert.equal(await slots.count(),3);
    const counter=async()=>Number((await page.locator('#mine-count').textContent()).match(/\d+/)[0]);
    assert.equal(await counter(),0);
    for(let i=0;i<6;i++) {
      await page.locator('#mine-modes button').nth(i).click();
      assert((await slots.locator('textarea').evaluateAll(ns=>ns.map(n=>n.value))).every(v=>v===''));
      assert.equal(await page.locator('#mine-result').textContent(),'채굴을 시작해 주세요.');
      assert.equal(await counter(),0,'mode changes do not mine');
    }
    await page.locator('#mine-modes button').first().click();
    await slots.first().locator('.browse').last().click();
    assert.equal(await counter(),1,'one slot redraw counts exactly once');
    assert((await slots.first().locator('textarea').inputValue()).length>0);
    assert.equal(await slots.nth(1).locator('textarea').inputValue(),'');
    await page.locator('#mine-modes button').first().click();
    assert.equal(await counter(),1);
    assert((await slots.locator('textarea').evaluateAll(ns=>ns.map(n=>n.value))).every(v=>v===''),'same mode clears without mining');
    await page.locator('#mine-roll').click();
    assert.equal(await counter(),2,'batch draw counts once across all slots');
    assert((await slots.locator('textarea').evaluateAll(ns=>ns.map(n=>n.value))).every(v=>v.length>0));
    assert.equal(await page.locator('#mine-modes').evaluate(n=>getComputedStyle(n).scrollbarWidth),'none');
    await page.locator('#mine-modes').evaluate(n=>n.scrollLeft=n.scrollWidth);
    assert(await page.locator('#mine-modes').evaluate(n=>n.scrollWidth<=n.clientWidth || n.scrollLeft>0),'hidden scrollbar retains horizontal scrolling');
    await page.locator('#mine-modes').evaluate(n=>n.scrollLeft=0);

    assert.equal(await page.locator('#mine-reroll').count(),0,'duplicate batch button removed');
    const position=async()=>page.locator('.mining-workbench').boundingBox();
    const closed=await position();
    assert(closed.y+closed.height<=height && closed.y+closed.height>height-50,'workbench is the lowest dock panel');
    const modeBox=await page.locator('.mode-panel').boundingBox();
    const actionBox=await page.locator('.mining-actions').boundingBox();
    assert(modeBox.y+modeBox.height<=actionBox.y && actionBox.y+actionBox.height<=closed.y,'dock order is modes, actions, workbench');
    await slots.first().locator('.browse').first().click();
    await page.waitForTimeout(60);
    const opened=await position();
    assert(Math.abs(closed.y-opened.y)<1,'library does not move the bottom workbench');
    assert(await page.locator('.mode-panel').isHidden(),'modes hide while browsing');
    assert(await page.locator('#mine-discovery').isHidden(),'result is replaced by material selection');
    assert(await page.locator('#mine-miningActions').isHidden(),'mining controls hide during selection');
    const libraryBox=await page.locator('#mine-library').boundingBox();
    const viewportBox=await page.locator('#mine-content').boundingBox();
    assert(Math.abs(libraryBox.height-viewportBox.height)<2,'library fills the entire space above workbench');
    const gridBox=await page.locator('#mine-libGrid').boundingBox();
    assert(gridBox.height>=(height<500?75:140),'several material rows are visible');
    assert(await page.locator('#mine-content').evaluate(n=>n.scrollHeight<=n.clientHeight+1),'outer content does not scroll in selection state');
    const closeBefore=await page.locator('#mine-closeLibrary').boundingBox();
    const tabsBefore=await page.locator('#mine-libTabs').boundingBox();
    assert(tabsBefore.x+tabsBefore.width<closeBefore.x,'close is separate from category strip');
    await page.locator('#mine-libTabs').evaluate(n=>n.scrollLeft=n.scrollWidth);
    const closeAfter=await page.locator('#mine-closeLibrary').boundingBox();
    assert.equal(closeAfter.x,closeBefore.x,'category scrolling leaves close fixed');
    await page.locator('#mine-libTabs').evaluate(n=>n.scrollLeft=0);
    const inner=await page.locator('#mine-library').evaluate(()=>['mine-libGrid','mine-libSearch','mine-libTabs'].map(id=>document.getElementById(id).getBoundingClientRect().y));
    assert(inner[0]<inner[1] && inner[1]<inner[2],'categories and close sit below list and search');
    await page.locator('#mine-libTabs button').filter({hasText:'자연'}).click();
    assert(await page.locator('#mine-libGrid button').count()>0);
    await slots.nth(1).locator('.browse').first().click();
    assert((await page.locator('#mine-libTitle').textContent()).includes('대상'));
    await page.locator('#mine-closeLibrary').click();
    assert(await page.locator('.mode-panel').isVisible());
    assert(await page.locator('#mine-discovery').isVisible());
    assert(await page.locator('#mine-miningActions').isVisible());
    assert.equal(await page.locator('#mine-content').evaluate(n=>n.scrollTop),0,'close restores result at the top');
    assert.equal(await counter(),2,'browse, categories and closing do not count');
    // All cancellation paths leave persistent data untouched.
    const savedData=()=>page.evaluate(()=>localStorage.getItem('narrative_idea_mine_saves_v1'));
    const initial=await savedData();
    for(const cancel of ['아니오','escape','outside']) {
      await page.locator('#mine-save').click();
      assert.equal(await page.locator('#app-dialog-msg').textContent(),'이 아이디어를 저장하시겠습니까?');
      if(cancel==='escape')await page.keyboard.press('Escape');
      else if(cancel==='outside')await page.locator('#app-dialog-overlay').click({position:{x:2,y:2}});
      else await confirm(cancel);
      assert.equal(await savedData(),initial);
    }
    const slotPaint=()=>slots.first().evaluate(n=>({background:getComputedStyle(n).backgroundImage,border:getComputedStyle(n).borderColor}));
    const unlockedPaint=await slotPaint();
    await slots.first().locator('.lock').click();
    assert.equal(await counter(),2,'locking does not count');
    assert(await slots.first().evaluate(n=>n.classList.contains('locked')),'manual lock marks the complete slot');
    assert.notDeepEqual(await slotPaint(),unlockedPaint);
    await slots.first().locator('.browse').first().click();
    assert(await slots.first().evaluate(n=>n.matches('.locked.open')));
    assert.equal(await slots.first().evaluate(n=>getComputedStyle(n).outlineStyle),'solid','browse outline coexists with locked background');
    await page.locator('#mine-closeLibrary').click();
    await slots.first().locator('.lock').click();
    assert.equal(await slots.first().evaluate(n=>n.classList.contains('locked')),false);
    assert.deepEqual(await slotPaint(),unlockedPaint);
    assert.deepEqual(await slots.locator('.slotname').allTextContents(),['주체','대상','행동']);
    const tools=await slots.first().locator('.browse').evaluateAll(ns=>ns.map(n=>{const r=n.getBoundingClientRect();return {y:r.y,width:r.width,height:r.height}}));
    assert.equal(tools[0].y,tools[1].y);assert(tools.every(r=>r.height>=40));
    assert.equal(await slots.first().locator('.browse').first().getAttribute('aria-label'),'목록 선택');
    assert.equal(await slots.first().locator('.browse').last().getAttribute('aria-label'),'재추첨');
    const paints=await slots.first().locator('.browse').evaluateAll(ns=>ns.map(n=>getComputedStyle(n).backgroundColor));
    assert.notEqual(paints[0],paints[1],'browse and reroll use distinct colors');
    assert.equal(await slots.first().locator('textarea').evaluate(n=>getComputedStyle(n).borderTopWidth),'0px');
    assert(await slots.first().locator('.slotname').evaluate(n=>parseFloat(getComputedStyle(n).paddingLeft)>=6));
    assert(await page.locator('#mine-result').evaluate(n=>parseFloat(getComputedStyle(n).fontSize)>=22),'idea is the dominant text');
    const order=await page.locator('#mine-page-mining h2').allTextContents();
    assert.deepEqual(order,['발견한 아이디어','채굴 방식','조합 작업대']);
    assert(await page.locator('#mine-modes').evaluate(n=>getComputedStyle(n).flexWrap==='nowrap'));
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
    const countBeforeSelection=await counter();
    await page.locator('#mine-libSearch').fill('나무');
    await page.locator('#mine-libGrid button').click();
    assert.equal(await slots.first().locator('textarea').inputValue(),'나무');
    assert.equal(await counter(),countBeforeSelection,'manual material selection does not count');
    assert.equal(await slots.first().locator('.lock').getAttribute('aria-pressed'),'true');
    assert(await slots.first().evaluate(n=>n.classList.contains('locked')),'library selection marks full slot');
    assert.equal(await page.locator('#mine-notice').textContent(),'선택한 재료가 잠금 처리되었습니다.');
    await page.locator('#mine-roll').click();
    assert.equal(await slots.first().locator('textarea').inputValue(),'나무');
    assert(await slots.first().locator('.browse').last().isDisabled());
    await slots.first().locator('.lock').click();
    await slots.first().locator('.browse').last().click();
    assert.notEqual(await slots.first().locator('textarea').inputValue(),'나무');
    assert.equal(await counter(),countBeforeSelection+2,'one batch and one single draw count separately');
    const custom='아주 긴 재료 이름을 직접 수정한 작은 용';
    await slots.first().locator('textarea').fill(custom);
    assert((await page.locator('#mine-result').textContent()).includes(custom));
    await slots.nth(1).locator('textarea').fill('구름');
    await slots.nth(2).locator('textarea').fill('기른다');
    assert.equal(await page.locator('#mine-result').textContent(),custom+'이 구름을 기른다');
    assert.equal(await page.locator('#mine-slots .slot.locked').count(),3,'direct editing locks all slot surfaces');
    const countWhileLocked=await counter();
    await page.locator('#mine-roll').click();
    assert.equal(await counter(),countWhileLocked,'locked batch is not an execution');
    assert.equal(await page.locator('#mine-notice').textContent(),'모든 재료가 잠금 상태입니다.');
    assert.equal(await page.locator('#mine-result').textContent(),custom+'이 구름을 기른다');
    assert.equal(await page.locator('#mine-unlock').count(),0);
    for(let i=0;i<3;i++)await slots.nth(i).locator('.lock').click();
    assert.equal(await page.locator('#mine-slots .slot.locked').count(),0);
    await slots.first().locator('.lock').click();
    const beforeRefinery=await slots.locator('textarea').evaluateAll(ns=>ns.map(n=>n.value));
    const beforeResult=await page.locator('#mine-result').textContent();
    await page.locator('#mine-expand').click();
    assert.equal(await page.locator('#mine-refineryResult').textContent(),beforeResult);
    const firstQuestions=await page.locator('#mine-expGrid').textContent();
    await page.locator('#mine-refreshExpand').click();
    assert.notEqual(await page.locator('#mine-expGrid').textContent(),firstQuestions);
    assert.equal(await page.locator('#mine-expGrid .exp').count(),6);
    const questions=await page.locator('#mine-expGrid .exp').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,height:r.height,overflow:n.scrollHeight>n.clientHeight}}));
    assert(Math.abs(questions[0].y-questions[1].y)<1,'questions use two columns');
    assert(questions.every(q=>!q.overflow),'question text is not clipped');
    await page.locator('#mine-refinerySave').click();
    await confirm();
    assert.equal(await page.locator('#mine-notice').textContent(),'아이디어가 저장되었습니다.');
    await page.locator('#mine-refineryBack').click();
    assert.deepEqual(await slots.locator('textarea').evaluateAll(ns=>ns.map(n=>n.value)),beforeRefinery);
    assert.equal(await slots.first().locator('.lock').getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('#mine-result').textContent(),beforeResult);
    const text=await page.locator('#mine-result').textContent();
    assert.equal(await page.locator('#mine-saved .saveditem').count(),1);
    await page.locator('#mine-save').click();
    await confirm();
    await storage();
    assert.deepEqual(await page.locator('#mine-saved .savedtext').allTextContents(),[text,text]);
    await page.locator('#mine-saved .saveditem').first().getByText('삭제',{exact:true}).click();
    await confirm();
    const beforeDelete=await savedData();
    for(const cancel of ['아니오','escape','outside']) {
      await page.locator('#mine-saved .saveditem').first().getByText('삭제',{exact:true}).click();
      assert.equal(await page.locator('#app-dialog-msg').textContent(),'정말 삭제하시겠습니까?');
      if(cancel==='escape')await page.keyboard.press('Escape');
      else if(cancel==='outside')await page.locator('#app-dialog-overlay').click({position:{x:2,y:2}});
      else await confirm(cancel);
      assert.equal(await savedData(),beforeDelete);
    }
    const dl=page.waitForEvent('download');await page.locator('#mine-export').click();assert((await dl).suggestedFilename().endsWith('.txt'));
    await page.reload();await page.waitForTimeout(1600);await page.locator('#btn-idea-mine').click();await page.locator('#mine-open-storage').click();
    await page.locator('#mine-saved button').first().click();
    assert.equal(await page.locator('#mine-result').textContent(),text);
    assert.equal(await page.locator('#mine-slots .slot.locked').count(),3,'restored records paint all locks');
    await page.locator('#mine-roll').click();assert.equal(await page.locator('#mine-result').textContent(),text);
    assert.equal(await page.locator('#mine-notice').textContent(),'모든 재료가 잠금 상태입니다.');
    for(let i=0;i<6;i++){
     await page.locator('#mine-modes button').nth(i).click();
     assert(!(await page.locator('#mine-result').textContent()).includes('undefined'));
     assert(await page.evaluate(()=>{const s=document.getElementById('screen-idea-mine');return s.scrollWidth<=s.clientWidth}));
    }
    await storage();
    await page.locator('#mine-saved button').last().click();await confirm();assert.equal(await page.locator('#mine-saved .saveditem').count(),0);
    assert.equal(await page.locator('#mine-saved').textContent(),'저장된 아이디어가 없습니다.');
    await page.locator('#mine-export').click();
    assert.equal(await page.locator('#mine-notice').textContent(),'저장된 아이디어가 없습니다.');
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
     await page.reload();await page.waitForTimeout(1600);await page.locator('#btn-idea-mine').click();await page.locator('#mine-open-storage').click();
     assert.deepEqual(await page.locator('#mine-saved .savedtext').allTextContents(),legacy.map(x=>x.text));
     assert(await page.locator('#mine-page-storage').evaluate(n=>n.scrollHeight>n.clientHeight),'long storage remains scrollable');
     for(let i=0;i<legacy.length;i++){
      if(i)await storage();
      await page.locator('#mine-saved .saveditem').nth(i).locator('button').first().click();
      assert.equal(await page.locator('#mine-result').textContent(),legacy[i].text,'v1 record loads without changing its sentence');
      await page.locator('#mine-roll').click();
      assert.equal(await page.locator('#mine-result').textContent(),legacy[i].text,'loaded materials remain locked');
     }
     await storage();
     await page.locator('#mine-saved .saveditem').nth(1).locator('button').first().click();
     await page.locator('#mine-save').click();
    await confirm();
     await page.reload();await page.waitForTimeout(1600);await page.locator('#btn-idea-mine').click();await page.locator('#mine-open-storage').click();
     await page.locator('#mine-saved .saveditem').first().locator('button').first().click();
     assert.equal(await page.locator('#mine-result').textContent(),legacy[1].text,'v1 custom object survives save/reload as v2');
     // Once that old custom object is edited, the new base-form particle rule applies.
     await page.locator('#mine-slots .slot').nth(1).locator('textarea').fill('노을');
     assert.equal(await page.locator('#mine-result').textContent(),'나무가 노을을 삼킨다');
    }
    if(await page.locator('#mine-page-mining').isVisible())await page.locator('#mine-back').click();
    else await page.locator('#mine-page-storage [data-mine-main]').click();
    await page.locator('#mine-home').click();await page.waitForTimeout(500);
    await page.evaluate(()=>goToNarrative());assert(await page.locator('#screen-narrative').evaluate(n=>n.classList.contains('active')));
    await page.evaluate(()=>goToCreate());assert(await page.locator('#screen-create').evaluate(n=>n.classList.contains('active')));
    assert.deepEqual(errors,[]);
    console.log(`PASS ${engine.name()} ${width}: navigation, search/select/lock, single/batch random, edit, questions, persistence/load/delete/export, full-slot lock paint/neutral notices, overflow`);
    await page.close();
   }
  } finally {await browser.close()}
 }
})().catch(e=>{console.error(e);process.exitCode=1});
