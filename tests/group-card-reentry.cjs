const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{for(const viewport of [{width:320,height:568},{width:393,height:852},{width:852,height:393}]){
  const page=await browser.newPage({viewport,hasTouch:true,serviceWorkers:'block'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
  await page.goto(process.env.PERF_TEST_URL);await page.waitForTimeout(1600);
  await page.evaluate(()=>{goToCreate();switchNav('character',true);CARD_DATA.race.groups.push({...CARD_DATA.race.groups[2],id:'reentry_second',label:'Second cards',cards:CARD_DATA.race.groups[2].cards.slice(0,24)});selectSub('race');});
  await page.waitForFunction(()=>document.querySelector('#page-race.active[data-chrome-view=group]'));
  const state=()=>page.evaluate(()=>{const p=document.querySelector('.center-page.active[data-chrome-view]');return {id:p.id,view:p.dataset.chromeView,top:p.scrollTop,trail:addressTrail.map(x=>x.type),bg:visibleBackgroundUrl,owner:activeBackgroundScreen,selected:[...(selectedCards.race||[])],locked:[...(lockedCards.race||[])]};});
  const send=async(type,dx=0,dy=0)=>page.evaluate(({type,dx,dy})=>{const p=document.querySelector('.center-page.active[data-chrome-view]'),r=p.getBoundingClientRect(),x=r.left+r.width*.65,y=r.top+r.height*.45,t=new Touch({identifier:1,target:p,clientX:x+dx,clientY:y+dy});p.dispatchEvent(new TouchEvent(type,{bubbles:true,cancelable:true,touches:type==='touchend'||type==='touchcancel'?[]:[t],changedTouches:[t]}));},{type,dx,dy});
  const swipe=async(dx,dy=0)=>{await send('touchstart');await send('touchmove',dx,dy);
   assert.equal(await page.locator('[data-back-preview]').count(),0,'creative descendants never create whole-screen previews');
   assert.equal(await page.locator('#screen-create').evaluate(n=>new DOMMatrixReadOnly(getComputedStyle(n).transform).m41),0,'creative descendant screen stays stationary');
   await send('touchend',dx,dy);await page.waitForTimeout(280);};
  const first=await state();await swipe(-100);assert.deepEqual(await state(),first,'unvisited groups never reenter');
  assert.equal(await page.locator('#center-area').evaluate(n=>getComputedStyle(n,'::after').opacity),'0');
  await page.locator('.center-page.active [data-group-action=cards][data-group-idx="2"]').click();
  await page.waitForFunction(()=>document.querySelector('.center-page.active[data-chrome-view=cards]'));await page.waitForTimeout(400);
  await page.evaluate(()=>{const p=document.querySelector('.center-page.active[data-chrome-view]');p.scrollTop=600;selectedCards.race=new Set([2001]);lockedCards.race=new Set([2001]);});await page.waitForTimeout(50);
  const cards=await state();assert.equal(cards.view,'cards');
  await swipe(100);assert.equal((await state()).view,'group');const group=await state();
  // A cancelled/vertical/tiny gesture must leave navigation and memories intact.
  await swipe(-4);assert.deepEqual(await state(),group);await swipe(-10,-70);assert.equal((await state()).id,group.id);
  await send('touchstart');await send('touchmove',-20);await page.waitForTimeout(180);
  const plate=await page.locator('#center-area').evaluate(n=>{const props=['width','height','border','backgroundColor','backgroundSize','boxShadow','transition','pointerEvents','opacity'];return {left:Object.fromEntries(props.map(p=>[p,getComputedStyle(n,'::before')[p]])),right:Object.fromEntries(props.map(p=>[p,getComputedStyle(n,'::after')[p]])),rightEdge:getComputedStyle(n,'::after').right,image:getComputedStyle(n,'::after').backgroundImage,transform:getComputedStyle(n.querySelector('.center-page.active[data-chrome-view]')).transform};});
  assert.equal(plate.right.opacity,'1');assert.equal(plate.left.opacity,'0');assert.equal(plate.rightEdge,'12px');assert(decodeURIComponent(plate.image).includes('m6 7 5 5-5 5m7-10 5 5-5 5'));assert(DOMMatrixString(plate.transform)<0);
  for(const key of Object.keys(plate.left).filter(p=>p!=='opacity'))assert.equal(plate.right[key],plate.left[key],`matching plate ${key}`);
  await send('touchcancel',-20);await page.waitForTimeout(250);assert.equal((await state()).id,group.id);assert.equal(await page.locator('#center-area').evaluate(n=>getComputedStyle(n,'::after').opacity),'0');
  for(let i=0;i<3;i++){
   await swipe(-100);const restored=await state();assert.equal(restored.id,cards.id);assert.equal(restored.top,cards.top);assert.equal(restored.bg,cards.bg);assert.equal(restored.owner,cards.owner);assert.deepEqual(restored.trail,cards.trail);assert.deepEqual(restored.selected,cards.selected);assert.deepEqual(restored.locked,cards.locked);
   await swipe(100);const back=await state();assert.equal(back.id,group.id);assert.equal(back.bg,group.bg);assert.deepEqual(back.trail,group.trail);
  }
  // A native touch swipe starting on a button navigates once without activating that button.
  const cdp=await page.context().newCDPSession(page),button=page.locator('.center-page.active [data-group-idx="2"]');await button.scrollIntoViewIfNeeded();
  const bounds=await button.boundingBox(),x=bounds.x+bounds.width*.8,y=bounds.y+bounds.height/2;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  for(const d of [25,50,90])await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-d,y}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(400);assert.equal((await state()).id,cards.id);assert.deepEqual((await state()).trail,cards.trail);
  await swipe(100);
  // Most recent direct-card group wins; subgroup screens are independently scoped.
  await page.locator('.center-page.active [data-group-action=cards][data-group-idx="3"]').click();await page.waitForFunction(()=>document.querySelector('.center-page.active[data-chrome-view=cards]'));const second=await state();await swipe(100);await swipe(-100);assert.equal((await state()).id,second.id);await swipe(100);
  await page.locator('.center-page.active [data-group-action=subgroups][data-group-idx="0"]').click();await page.waitForFunction(()=>document.querySelector('.center-page.active[data-chrome-view=subgroup]'));
  const subgroup=await state();await swipe(-100);assert.equal((await state()).id,subgroup.id,'unvisited subgroup does not borrow root history');
  await swipe(100);await swipe(-100);assert.equal((await state()).id,subgroup.id,'root remembers the visited subgroup even before a card visit');
  await page.locator('.center-page.active [data-group-action=subgroup-cards]').first().click();await page.waitForFunction(()=>document.querySelector('.center-page.active[data-chrome-view=cards]'));const nested=await state();await swipe(100);await swipe(-100);assert.equal((await state()).id,nested.id);assert.equal((await state()).bg,nested.bg);
  await swipe(100);await swipe(100);assert.equal((await state()).view,'group');await swipe(-100);assert.equal((await state()).id,subgroup.id,'root reenters the immediate subgroup, not its card');await swipe(-100);assert.equal((await state()).id,nested.id);await swipe(100);
  await swipe(100);
  await page.locator('.center-page.active [data-group-action=subgroups][data-group-idx="1"]').click();await page.waitForFunction(()=>document.querySelector('.center-page.active[data-chrome-view=subgroup]'));const animal=await state();
  await swipe(-100);assert.equal((await state()).id,animal.id,'different subgroup has no inherited card history');
  await page.locator('.center-page.active [data-group-action=subgroup-cards]').nth(1).click();await page.waitForFunction(()=>document.querySelector('.center-page.active[data-chrome-view=cards]'));const sea=await state();
  await swipe(100);await swipe(100);await swipe(-100);assert.equal((await state()).id,animal.id,'latest subgroup wins');await swipe(-100);assert.equal((await state()).id,sea.id);await swipe(100);await swipe(100);
  await page.locator('.center-page.active [data-group-action=subgroups][data-group-idx="0"]').click();await page.waitForFunction(()=>document.querySelector('.center-page.active[data-chrome-view=subgroup]'));await swipe(-100);assert.equal((await state()).id,nested.id,'first subgroup retains its independent card history');await swipe(100);
  // Explicit category entry clears reentry without changing existing card selection.
  await page.evaluate(()=>selectSub('archetype'));await page.waitForFunction(()=>document.querySelector('.center-page.active[data-chrome-view]').id.startsWith('page-archetype'));const other=await state();await swipe(-100);assert.equal((await state()).id,other.id);assert.notEqual((await state()).id,nested.id);
  await page.evaluate(()=>selectSub('race'));await page.waitForFunction(()=>document.querySelector('#page-race.active[data-chrome-view=group]'));const fresh=await state();await swipe(-100);assert.equal((await state()).id,fresh.id);assert.equal(await page.evaluate(()=>groupCardReentries.size),0);assert.deepEqual((await state()).selected,cards.selected);
  assert.deepEqual(errors,[]);console.log(`PASS ${viewport.width}: fresh/category isolation, latest/root/subgroup routes, repeat back/reentry, matching right plate/cancel, native button swipe, scroll/background/selection/lock/trail preservation`);await page.close();
 }}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
function DOMMatrixString(value){return Number(value.slice(7,-1).split(',')[4]);}
