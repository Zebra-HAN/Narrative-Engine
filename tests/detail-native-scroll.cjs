const assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
for(const viewport of [{width:320,height:568},{width:393,height:852},{width:852,height:393}]){
 const p=await browser.newPage({viewport,hasTouch:true,isMobile:true,serviceWorkers:'block'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());await p.goto(process.env.PERF_TEST_URL);await p.waitForTimeout(1600);await p.evaluate(()=>{goToCreate();switchNav('character',true);selectSub('race');});await p.waitForFunction(()=>document.querySelector('#page-race.active[data-chrome-view=group]'));
 await p.evaluate(()=>{CARD_DATA.fixture=Array.from({length:3},(_,i)=>({name:`Scroll card ${i}`,desc:'Scroll description',detail:'[[section:Ideas]]\n\n'+Array.from({length:100},(_,i)=>`Idea ${i} with enough text to scroll`).join('\n\n')}));currentSubId='fixture';showCardPage('fixture',false,true);cardClick('fixture',0);});
 const cdp=await p.context().newCDPSession(p);
 // The detail listener must not make native vertical input wait for cancellable JS.
 await p.evaluate(()=>openDetailSheet('card'));
 const {result}=await cdp.send('Runtime.evaluate',{expression:"document.querySelector('.detail-overlay .popup-swipe-frame')"});const {listeners}=await cdp.send('DOMDebugger.getEventListeners',{objectId:result.objectId});assert(listeners.some(l=>l.type==='touchmove'&&l.passive));
 // Vertical start/end/cancel must not rebuild the scrolling ancestor's inline styles.
 const mutationCount=await p.evaluate(async()=>{const frame=document.querySelector('.detail-overlay .popup-swipe-frame'),overlay=document.getElementById('detail-overlay'),n=document.getElementById('detail-desc');let count=0;const o=new MutationObserver(ms=>count+=ms.length);for(const el of [frame,overlay])o.observe(el,{attributes:true,attributeFilter:['style']});const t=y=>new Touch({identifier:9,target:n,clientX:120,clientY:y});for(const finish of ['touchend','touchcancel']){n.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[t(200)]}));n.dispatchEvent(new TouchEvent('touchmove',{bubbles:true,cancelable:true,touches:[t(140)]}));n.dispatchEvent(new TouchEvent(finish,{bubbles:true,touches:[],changedTouches:[t(140)]}));}await Promise.resolve();o.disconnect();return count;});assert.equal(mutationCount,0);
 for(const [card,delay,slow] of [[0,0,false],[1,80,false],[2,0,true],[2,0,false]]){
  await p.evaluate(card=>{closeDetailSheet();closeCardInfo();cardClick('fixture',card);openDetailSheet('card');window.scrollSamples=[];const n=document.getElementById('detail-content');n.onscroll=()=>scrollSamples.push({t:performance.now(),top:n.scrollTop});},card);if(delay)await p.waitForTimeout(delay);
  const {x,y}=await p.locator('#detail-content').evaluate(n=>{const r=n.getBoundingClientRect();return{x:(r.left+r.right)/2,y:Math.min(r.bottom-35,r.top+450)}});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',timestamp:Date.now()/1000,touchPoints:[{x,y}]});
  for(const dy of [16,45,85,130,180]){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',timestamp:Date.now()/1000,touchPoints:[{x:x+2,y:y-dy}]});if(dy!==180)await p.waitForTimeout(slow?70:16);}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',timestamp:Date.now()/1000,touchPoints:[]});
  const during=await p.locator('#detail-content').evaluate(n=>n.scrollTop);assert(during>140,JSON.stringify({viewport,card,delay,slow,during}));
  // CDP fling synthesis varies with timing; record it without claiming iOS validation.
  await p.waitForTimeout(350);const after=await p.locator('#detail-content').evaluate(n=>n.scrollTop);assert(after>=during,'release must not reset position');console.log(JSON.stringify({width:viewport.width,card,delay,slow,atRelease:during,afterRelease:after,momentumObserved:after>during+5}));
  assert(await p.evaluate(()=>scrollSamples.length>2&&scrollSamples.every((s,i)=>i===0||s.top>=scrollSamples[i-1].top)),'continuous vertical progress');
  assert(await p.evaluate(()=>!Object.values(selectedDetails).some(s=>s.size)&&Object.values(selectedCards).every(s=>s.size===0)),'scroll must not select');
  assert(await p.locator('#detail-content').evaluate(n=>n.scrollLeft===0&&n.scrollWidth===n.clientWidth));await p.waitForTimeout(1200);
 }
 // Native horizontal input still dismisses the sheet, with no accidental selection.
 await p.evaluate(()=>{closeDetailSheet();openDetailSheet('card');});await p.waitForTimeout(400);const point=await p.locator('#detail-desc').evaluate(n=>{const r=n.getBoundingClientRect();return{x:(r.left+r.right)/2,y:(r.top+r.bottom)/2}});await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',timestamp:Date.now()/1000,touchPoints:[point]});for(const dx of [20,50,100,130]){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',timestamp:Date.now()/1000,touchPoints:[{x:point.x+dx,y:point.y+1}]});await p.waitForTimeout(16);
  assert.equal(await p.locator('[data-back-preview]').count(),0,'card details do not create a whole-screen back preview');
  assert.equal(await p.locator('#screen-create').evaluate(n=>new DOMMatrixReadOnly(getComputedStyle(n).transform).m41),0,'detail dismiss keeps creative screen stationary');
 }await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',timestamp:Date.now()/1000,touchPoints:[]});await p.waitForTimeout(300);assert.equal(await p.locator('#detail-overlay').evaluate(n=>n.classList.contains('active')),false);assert.deepEqual(errors,[]);
 console.log(`PASS ${viewport.width}: passive vertical input, no ancestor restyles, immediate/fast/slow/repeated native scroll across cards, release position, horizontal dismiss and unchanged selection`);await p.close();
}
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
