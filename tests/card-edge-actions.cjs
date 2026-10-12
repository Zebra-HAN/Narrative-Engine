const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try {
  for(const viewport of [{width:320,height:568},{width:393,height:695},{width:852,height:393},{width:1280,height:800}]){
   const page=await browser.newPage({viewport,hasTouch:true,serviceWorkers:'block'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
   await page.goto(process.env.PERF_TEST_URL);await page.waitForTimeout(1600);
   await page.evaluate(()=>{goToCreate();switchNav('character',true);selectSub('race')});
   const group=page.locator('.card-edge-actions'),select=page.locator('.card-info-select'),lock=page.locator('.card-info-lock');
   const source=page.locator('.center-page.active[data-chrome-view="cards"]');
   const card=page.locator('.center-page.active[data-chrome-view="cards"] .data-card');
   const wait=async()=>{
    await page.waitForFunction(()=>{
     const row=document.querySelector('.card-edge-actions'),card=getFocusedCardElement();
     return row&&[...row.getAnimations(),...(card?.getAnimations()||[])].every(a=>a.playState!=='running');
    });
   };
   const geometry=()=>page.evaluate(()=>{
    const card=getFocusedCardElement(),group=document.querySelector('.card-edge-actions');
    const rect=n=>{const r=n.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
    return {cardClass:card.className,cardTransform:getComputedStyle(card).transform,active:card.matches(':active'),card:rect(card),group:rect(group),buttons:[...group.children].map(rect),page:rect(card.closest('.center-page')),screen:rect(document.getElementById('screen-create'))};
   });
   const assertPosition=async()=>{
    await wait();await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));const g=await geometry();
    assert(g.buttons[0].left<g.buttons[1].left);
    assert(Math.abs((g.group.left+g.group.right-g.card.left-g.card.right)/2)<1,JSON.stringify(g));
    assert(g.group.left>=g.card.left-.1&&g.group.right<=g.card.right+.1,JSON.stringify(g));
    assert(Math.abs(g.group.top-g.card.bottom-6)<1,'row is immediately below its card: '+JSON.stringify(g));
    assert(g.group.bottom<=viewport.height-8+.1&&g.group.top>=g.page.top);
    for(const b of g.buttons)assert(b.width<=110&&Math.abs(b.width-b.height)<.1);
   };
   for(const columns of ['5','4','3','2']){
    await page.evaluate(columns=>{closeCardInfo();selectedCards.race=new Set();lockedCards.race=new Set();CARD_DATA.race.groups[2].layoutType=columns;showGroupCards('race',2)},columns);
    await page.waitForTimeout(1200);
    assert.equal(await page.locator('.card-info-detail').count(),0);
    assert.equal(await page.locator('.card-edge-actions.is-visible').count(),0);
    await card.first().scrollIntoViewIfNeeded();
    const before=await source.evaluate(p=>({width:p.clientWidth,height:p.scrollHeight,cards:[...p.querySelectorAll('.data-card')].map(c=>({width:c.offsetWidth,height:c.offsetHeight,left:c.offsetLeft,top:c.offsetTop})),headers:[...p.querySelectorAll('.card-section-header')].map(c=>({top:c.offsetTop,height:c.offsetHeight}))}));
    await card.first().tap();await assertPosition();
    assert.equal(await group.locator('button').count(),2);
    assert.deepEqual(await group.locator('button').evaluateAll(nodes=>nodes.map(n=>n.classList.contains('card-info-lock')?'lock':'select')),['lock','select']);
    assert(await lock.isVisible());assert(await lock.isDisabled());assert.equal(await select.getAttribute('aria-label'),'선택');
    assert.equal(await select.locator('img').getAttribute('src'),'images/core/buttons/check.webp');
    await page.waitForFunction(()=>[...document.querySelectorAll('.card-edge-button img')].every(n=>n.complete&&n.naturalWidth));
    // The info body retains the existing detailed sheet entry point.
    await page.locator('.card-info-popover:not(.is-closing) .card-info-copy').tap();
    assert(await page.locator('#detail-overlay').evaluate(n=>n.classList.contains('active')));
    await page.evaluate(()=>closeDetailSheet());await assertPosition();
    await select.tap();assert.equal(await select.getAttribute('aria-label'),'선택 취소');assert.equal(await select.locator('img').getAttribute('src'),'images/core/buttons/cancel.webp');
    assert(await lock.isEnabled());assert(await page.evaluate(()=>selectedCards.race.has(focusedCard.idx)));assert(await card.first().evaluate(n=>n.classList.contains('selected')));
    await lock.tap();assert(await select.isDisabled());assert.equal(await lock.getAttribute('aria-label'),'잠금 해제');assert.equal(await lock.locator('img').getAttribute('src'),'images/core/buttons/lock-on.webp');
    assert(await page.evaluate(()=>isCardLocked('race',focusedCard.idx)));assert(await card.first().evaluate(n=>n.classList.contains('locked')));
    await lock.tap();await select.tap();assert.equal(await select.getAttribute('aria-label'),'선택');assert(await lock.isDisabled());assert(await group.isVisible());
    const after=await source.evaluate(p=>({width:p.clientWidth,height:p.scrollHeight,cards:[...p.querySelectorAll('.data-card')].map(c=>({width:c.offsetWidth,height:c.offsetHeight,left:c.offsetLeft,top:c.offsetTop})),headers:[...p.querySelectorAll('.card-section-header')].map(c=>({top:c.offsetTop,height:c.offsetHeight}))}));
    assert.deepEqual(after,before,'card/grid/section dimensions and scroll height are unchanged');
    await page.evaluate(()=>window.originalActions=document.querySelector('.card-edge-actions'));
    await card.nth(Number(columns)-1).tap();await assertPosition();assert(await page.evaluate(()=>originalActions===document.querySelector('.card-edge-actions')));
    assert.equal(await card.locator('.card-info-detail').count(),0);
    assert.equal(await page.locator('.data-card.card-info-active').count(),1);
    // Force a visible bottom-edge card: only minimal scroll is allowed to reveal the row.
    await page.evaluate(()=>{closeCardInfo();const p=document.querySelector('.center-page.active[data-chrome-view="cards"]');const c=p.querySelectorAll('.data-card')[138];p.scrollTop+=c.getBoundingClientRect().bottom-(p.getBoundingClientRect().bottom-10);});
    await card.last().tap();await assertPosition();
    await select.tap();await lock.tap();await lock.tap();await select.tap();await assertPosition();
    const saved=await source.evaluate(p=>p.scrollTop);
    await page.evaluate(()=>navigateAddressBack());
    const flashes=await page.evaluate(async()=>{let count=0;for(let i=0;i<8;i++){await new Promise(requestAnimationFrame);if([...document.querySelectorAll('.card-edge-actions')].some(n=>getComputedStyle(n).visibility!=='hidden'))count++}return count});
    assert.equal(flashes,0,'navigation suppresses the action row before the destination paints');
    await page.evaluate(()=>showGroupCards('race',2));await page.waitForTimeout(100);
    assert.equal(await source.evaluate(p=>p.scrollTop),saved);
    console.log(`PASS card actions ${viewport.width}x${viewport.height}, ${columns} columns: 2 buttons/order, local geometry, selection/lock/images, preserved detail and grid, bottom edge, focus switch and scroll return`);
   }
   await card.first().tap();await wait();
   const r=await select.boundingBox();await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();await page.waitForTimeout(120);assert((await select.evaluate(n=>getComputedStyle(n).transform)).includes('0.94'));await page.mouse.up();
   for(const button of [lock,select])assert.equal(await button.evaluate(n=>getComputedStyle(n).webkitTapHighlightColor),'rgba(0, 0, 0, 0)');
   // Scroll follows the focused card and suppresses the row when its anchor leaves view.
   await page.evaluate(()=>{const p=document.querySelector('.center-page.active[data-chrome-view="cards"]');p.scrollTop=p.scrollHeight;});await page.waitForTimeout(80);assert.equal(await group.isVisible(),false);
   await page.evaluate(()=>closeCardInfo());await page.waitForTimeout(320);assert(await group.evaluate(n=>n.inert&&getComputedStyle(n).willChange==='auto'));
   assert.deepEqual(errors,[]);await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
