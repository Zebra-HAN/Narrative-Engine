const assert = require('node:assert/strict');
const fs = require('node:fs');
const {execFileSync} = require('node:child_process');
const {chromium} = require('playwright');
const base = Object.fromEntries(['js/app.js','css/style.css','css/deep-blue-gold-theme.css'].map(p=>[p,execFileSync('git',['show',`${process.env.BASELINE_COMMIT || '4e6ba1f'}:${p}`],{encoding:'utf8'})]));
const near=(a,b,msg)=>assert(Math.abs(a-b)<.15,`${msg}: ${a} / ${b}`);
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const snapshots=new Map();
 try {
 for(const width of [320,393,430,852]) for(const mode of ['before','after']) {
  const page=await browser.newPage({viewport:{width,height:852},hasTouch:true,serviceWorkers:'block'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
  if(mode==='before')for(const [path,body] of Object.entries(base)) await page.route(`**/${path}`,r=>r.fulfill({body,contentType:path.endsWith('.js')?'text/javascript':'text/css'}));
  await page.goto(process.env.PERF_TEST_URL || 'http://127.0.0.1:8000');await page.waitForTimeout(1600);
  await page.addStyleTag({content:'.group-select-btn,.data-card {animation:none!important;transition:none!important;opacity:1!important;transform:none!important;}'});
  await page.evaluate(()=>{goToCreate();switchNav('character',true);});
  for(const count of [1,2,3,4,5,6,7,13]) {
   const m=await page.evaluate(count=>{
    CARD_DATA.race.groups=Array.from({length:count},(_,i)=>({id:'test'+i,label:'그룹 '+i,icon:'◆',cards:[{name:'카드'}]}));
    showGroupPage('race',false,true);
    const nodes=[...document.querySelectorAll('.center-page.active .group-select-btn')];
    return nodes.map((n,i)=>{const r=n.getBoundingClientRect(),s=getComputedStyle(n);return {width:r.width,height:r.height,gap:i? r.top-nodes[i-1].getBoundingClientRect().bottom:0,font:s.fontSize};});
   },count);
   const key=`${width}-groups-${count}`;
   if(mode==='before')snapshots.set(key,m);else m.forEach((n,i)=>{const old=snapshots.get(key)[i];near(n.width,old.width,'button width');near(n.height,old.height*(count===3?1.3:1),'button height');near(n.gap,old.gap,'button gap');assert.equal(n.font,old.font);});
  }
  for(const count of [2,3,5,6])for(const size of [[600,600],[600,1000],[800,600],[1200,400],[900,500]]) {
   const m=await page.evaluate(async ({count,size})=>{
    const image=new Image();image.src='data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${size[0]}" height="${size[1]}"><rect width="100%" height="100%" fill="tan"/></svg>`);await image.decode();image.className='page-title-image';
    const plate=new Image();plate.src='images/core/sub-nav/title_card.webp';await plate.decode();plate.className='page-title-plate';
    CARD_DATA.race.groups=Array.from({length:count},(_,i)=>({id:'test'+i,label:'그룹 제목',description:'그룹 설명입니다.',detail:'상세 정보',cards:[{type:'section',label:'첫 섹션'},{name:'첫 카드'},{type:'section',label:'둘째 섹션'},{name:'둘째 카드'}]}));
    showGroupCards('race',0,true,{image,plate});
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    const frame=image.closest('.page-title-card');updateTitleImageClip(image);
    const rect=n=>{const r=n.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
    const s=getComputedStyle(image),w=parseFloat(s.width),h=parseFloat(s.height),scale=Math.min(w/image.naturalWidth,h/image.naturalHeight),x=(w-image.naturalWidth*scale)/2,y=(h-image.naturalHeight*scale)/2,r=rect(image),sx=r.width/w,sy=r.height/h;
    return {frame:rect(frame),copy:rect(frame.querySelector('.page-title-copy')),heading:rect(frame.querySelector('.page-title-heading')),description:rect(frame.querySelector('.page-title-description')),hint:rect(frame.querySelector('.page-title-hint')),card:rect(document.querySelector('.center-page.active .data-card')),art:{left:r.left+x*sx,right:r.right-x*sx,top:r.top+y*sy,bottom:r.bottom-y*sy,width:(w-2*x)*sx,height:(h-2*y)*sy},layout:frame.dataset.imageLayout,clip:s.clipPath,fit:s.objectFit};
   },{count,size});
   const key=`${width}-title-${count}-${size}`;
   if(mode==='before')snapshots.set(key,m);else {
    const old=snapshots.get(key),expand=[3,5].includes(count)&&m.layout==='wide';
    for(const name of ['frame','copy','heading','description','card'])for(const prop of ['left','top','width','height'])near(m[name][prop],old[name][prop],`${key} ${name}.${prop}`);
    near(m.art.bottom,old.art.bottom,'art bottom');
    near(m.art.width,old.art.width*(expand?1.16:1),'art width');near(m.art.height,old.art.height*(expand?1.16:1),'art height');
    if(expand){assert(m.art.top<old.art.top);assert(m.art.left<old.art.left);assert(m.art.bottom<=m.copy.top+.15);assert(m.art.left>=m.frame.left);assert(m.art.right<=m.frame.right);near(m.hint.left,old.hint.left+4,'hint right');near(m.hint.top,old.hint.top-4,'hint up');assert.equal(m.fit,'contain');}
    else assert.deepEqual(m.hint,old.hint);
   }
  }
  if(mode==='after') {
   await page.evaluate(()=>switchScreen('screen-create',null,{type:'instant'}));
   await page.locator('#card-minimap-toggle').click();await page.waitForTimeout(300);
   assert.deepEqual(await page.locator('#card-minimap summary .card-minimap-label').allTextContents(),['1. 첫 섹션','2. 둘째 섹션']);
   const centers=await page.locator('#card-minimap summary').evaluateAll(nodes=>nodes.map(n=>{const range=document.createRange();range.setStart(n,0);range.setEnd(n,n.childNodes.length-1);const r=range.getBoundingClientRect(),box=n.getBoundingClientRect();return [(r.left+r.right)/2,(box.left+box.right)/2];}));centers.forEach(([a,b])=>near(a,b,'section center'));
   const first=page.locator('#card-minimap details').first(),open=await first.evaluate(n=>n.open);await first.locator('summary').click();assert.equal(await first.evaluate(n=>n.open),!open);
   await page.locator('#card-minimap').press('Escape');await page.waitForTimeout(300);
   await page.evaluate(()=>{CARD_DATA.race.groups[0].cards=[{type:'section',label:'새 섹션'},{name:'새 카드'},{type:'section',label:'첫 섹션'},{name:'첫 카드'}];showGroupCards('race',0,true);});
   await page.locator('#card-minimap-toggle').click();await page.waitForTimeout(300);
   assert.deepEqual(await page.locator('#card-minimap summary .card-minimap-label').allTextContents(),['1. 새 섹션','2. 첫 섹션']);
   assert.equal(await page.evaluate(()=>CARD_DATA.race.groups[0].cards[0].label),'새 섹션');
  }
  assert.deepEqual(errors,[]);console.log(`PASS ${width}px ${mode}: group counts 1/2/3/4/5/6/7/13; title layout/scope/bottom/copy; outline numbering/center/toggle`);await page.close();
 }
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
