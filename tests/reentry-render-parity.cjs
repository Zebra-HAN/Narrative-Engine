const assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const p=await b.newPage({viewport:{width:393,height:852},hasTouch:true,serviceWorkers:'block'}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());await p.goto(process.env.PERF_TEST_URL);await p.waitForTimeout(1600);await p.evaluate(()=>{goToCreate();switchNav('character',true);selectSub('race');});await p.waitForFunction(()=>document.querySelector('#page-race.active[data-chrome-view=group]'));
 const metrics=[];
 for(const kind of ['many','few','subgroup']){
  // Warm the same route/background/title assets and restore the same scroll in both paths.
  await p.evaluate(async kind=>{
   await selectSub('race');
   if(kind==='many'){await showGroupCards('race',2);document.querySelector('.center-page.active[data-chrome-view]').scrollTop=600;}
   else{await showSubgroupPage('race',0);await showSubgroupCards('race',0,0);}
  },kind);await p.waitForTimeout(600);
  await p.evaluate(()=>navigateAddressBack());await p.waitForTimeout(300);
  if(kind==='subgroup'){await p.evaluate(()=>navigateAddressBack());await p.waitForTimeout(300);}
  for(const swipe of [false,true]){
   const result=await p.evaluate(async({kind,swipe})=>{
    const area=document.getElementById('center-area'),old=area.querySelector('.center-page.active[data-chrome-view]');
    const start=performance.now();const frames=[];let incoming=null,flip=null,parentCalls=0,mounted=0,ended=false;
    const original=Element.prototype.animate;Element.prototype.animate=function(...args){if(this.classList.contains('center-page'))parentCalls++;return original.apply(this,args)};
    const observer=new MutationObserver(()=>{const active=area.querySelector('.center-page.active[data-chrome-view]');if(active!==old&&!incoming){incoming=active;mounted=performance.now()-start;incoming.addEventListener('animationend',event=>{if(event.target===flip?.effect.target)ended=true;},true);}});observer.observe(area,{childList:true});
    let done=false;const sample=()=>{if(incoming){if(!flip){const animations=incoming.getAnimations({subtree:true}).filter(a=>a.animationName===(kind==='subgroup'?'groupBtnFadeIn':'cardFlip'));flip=animations.sort((a,b)=>Number(a.effect.getTiming().delay)-Number(b.effect.getTiming().delay))[0];}
      const progress=flip?.effect.getComputedTiming().progress;
      frames.push({t:performance.now()-start,progress:progress??null,parent:incoming.getAnimations().length});
    }if(!done)requestAnimationFrame(sample)};requestAnimationFrame(sample);
    if(swipe){for(const [type,dx] of [['touchstart',0],['touchmove',-100],['touchend',-100]]){const t=new Touch({identifier:1,target:old,clientX:250+dx,clientY:300});old.dispatchEvent(new TouchEvent(type,{bubbles:true,cancelable:true,touches:type==='touchend'?[]:[t],changedTouches:[t]}));}}
    else{const selector=kind==='many'?'[data-group-action=cards][data-group-idx="2"]':kind==='few'?'[data-group-action=subgroup-cards][data-subgroup-idx="0"]':'[data-group-action=subgroups][data-group-idx="0"]';old.querySelector(selector).click();}
    await new Promise(r=>setTimeout(r,1400));done=true;observer.disconnect();Element.prototype.animate=original;
    return {kind,swipe,mounted,ended,first:frames[0],samples:frames,parentCalls,scroll:incoming?.scrollTop,cardCount:incoming?.querySelectorAll('.data-card').length,bg:visibleBackgroundUrl,owner:activeBackgroundScreen};
   },{kind,swipe});
   assert(result.first,'incoming first frame observed');assert.equal(result.parentCalls,0,'entry adds no scroll-page transform animation');assert(result.samples.every(f=>f.parent===0),'incoming page never competes with child flips');
   const progress=result.samples.filter(f=>f.progress!==null);assert(progress.length>3,'child animation spans multiple visible frames');assert(progress[0].progress<.15,JSON.stringify(result.first));assert(progress.some(f=>f.progress>.15&&f.progress<.85),'middle of reveal is visible');assert(result.ended||progress.at(-1).progress>.99,'reveal completes (animationend may remove its CSS class before the final RAF sample)');
   metrics.push({kind,swipe,mountedMs:result.mounted,firstFrameMs:result.first.t,firstProgress:progress[0].progress,cardCount:result.cardCount});
   if(!swipe){await p.evaluate(()=>navigateAddressBack());await p.waitForTimeout(300);p.previous=result;}
   else{assert.equal(result.scroll,p.previous.scroll);assert.equal(result.bg,p.previous.bg);assert.equal(result.owner,p.previous.owner);assert.equal(result.cardCount,p.previous.cardCount);}
  }
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify(metrics));console.log('PASS 139-card, small-card and subgroup entries: common renderer, no incoming ancestor animation, reveal visible from start through finish, restored position/background parity');await p.close();
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
