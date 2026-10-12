const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const {chromium}=require('playwright');
(async()=>{
 const baseline={js:execFileSync('git',['show','575c9a2:js/app.js'],{encoding:'utf8'}),css:execFileSync('git',['show','575c9a2:css/style.css'],{encoding:'utf8'})};
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const heights=new Map();
 try{
  for(const width of [320,393,1280])for(const mode of ['before','after']){
   const page=await browser.newPage({viewport:{width,height:852},serviceWorkers:'block'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
   if(mode==='before'){
    await page.route('**/js/app.js',r=>r.fulfill({contentType:'text/javascript',body:baseline.js}));
    await page.route('**/css/style.css',r=>r.fulfill({contentType:'text/css',body:baseline.css}));
   }
   await page.route('**/compression-image-*',r=>{const [,w,h]=r.request().url().match(/compression-image-(\d+)-(\d+)/);return r.fulfill({contentType:'image/svg+xml',body:`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="tan"/></svg>`});});
   await page.goto(process.env.PERF_TEST_URL);await page.waitForTimeout(1600);
   for(const [index,size] of [[600,600],[800,600],[1200,400],[400,1000]].entries()){
    await page.evaluate(({index,size})=>{
     goToCreate();switchNav('character',true);selectSub('race');
     CARD_DATA.race.groups=[{id:'compressed',label:'테스트 그룹',description:'짧은 그룹 설명입니다.',detail:'상세 정보',img:`compression-image-${size[0]}-${size[1]}`,icon:'🌿',cards:[{name:'카드',icon:'✦'}]}];
     showGroupCards('race',0);
    },{index,size});
    await page.locator('.page-title-media img').waitFor();await page.waitForTimeout(80);
    const metrics=await page.locator('.page-title-card').evaluate(n=>{
     const r=n.getBoundingClientRect(),heading=n.querySelector('.page-title-heading'),h=heading.getBoundingClientRect(),path=n.querySelector('.page-title-path'),p=path?.getBoundingClientRect(),img=n.querySelector('.page-title-image'),ir=img.getBoundingClientRect();
     const copy=n.querySelector('.page-title-copy').getBoundingClientRect();
     return {copyCenter:(h.left+h.right-copy.left-copy.right)/2,height:r.height,font:getComputedStyle(heading).fontSize,center:(h.left+h.right-r.left-r.right)/2,path:path?.textContent,pathFont:path?getComputedStyle(path).fontSize:null,pathRight:p?.right,frameRight:r.right,overlap:p&&[h,ir].some(x=>p.left<x.right&&p.right>x.left&&p.top<x.bottom&&p.bottom>x.top),ratio:ir.width/ir.height,natural:img.naturalWidth/img.naturalHeight,overflow:n.scrollWidth>n.clientWidth};
    });
    const key=`${width}-${index}`;
    if(mode==='before')heights.set(key,metrics);
    else{
     const before=heights.get(key);assert(metrics.height/before.height<=(index===2 ? 0.66 : 0.62),`${key}: ${metrics.height}/${before.height}`);
     assert(Math.abs(parseFloat(metrics.font)/parseFloat(before.font)-.85)<.01);assert(Math.abs(metrics.copyCenter)<1);assert.equal(metrics.path,'캐릭터|종족');assert(parseFloat(metrics.pathFont)<parseFloat(metrics.font));assert(metrics.pathRight<metrics.frameRight&&!metrics.overlap&&!metrics.overflow);if(index===3)assert(Math.abs(metrics.ratio-.6)<.01);else assert(Math.abs(metrics.ratio-metrics.natural)<0.01);
     console.log(`PASS ${width}px ratio ${index}: ${before.height.toFixed(1)} -> ${metrics.height.toFixed(1)}px (${Math.round(100*metrics.height/before.height)}%), path preserved; requested font, layout and crop policy verified`);
    }
   }
   if(mode==='after'){
    // Resolve all four NAV owners from real category data, even if currentNav is different.
    const paths=await page.evaluate(async()=>{
     const results=[];
     for(const [navId,nav]of Object.entries(NAV_DATA)){
      const sub=nav.subs.find(s=>CARD_DATA[s.id]?.groups);
      const group={label:'그룹',description:'설명',cards:[]};
      const card=createPageTitleCard(group,sub.id);document.body.appendChild(card);
      const path=card.querySelector('.page-title-path');
      await new Promise((resolve,reject)=>{
       const deadline=performance.now()+5000;
       function ready(){
        if(path.querySelectorAll('img').length===2)resolve();
        else if(performance.now()>deadline)reject(new Error('Path images did not finish loading'));
        else requestAnimationFrame(ready);
       }ready();
      });
      results.push({labels:path.textContent,expected:nav.label+'|'+sub.label,navSrc:path.children[0].querySelector('img')?.getAttribute('src'),expectedNav:MAIN_CATEGORY_IMAGE[navId],catSrc:path.children[2].querySelector('img')?.getAttribute('src'),expectedCat:sub.img});
      card.remove();
     }
     return results;
    });
    for(const path of paths){assert.equal(path.labels,path.expected);assert.equal(path.navSrc,path.expectedNav);assert.equal(path.catSrc,path.expectedCat);}
    const fallback=await page.evaluate(()=>{
     const sub=NAV_DATA.character.subs.find(s=>s.id==='race');const original={img:sub.img,icon:sub.icon};
     sub.img=undefined;sub.icon='🌿';const card=createPageTitleCard({label:'그룹',cards:[]},'race');const text=card.querySelector('.page-title-path-item:last-child .info-icon-text').textContent;Object.assign(sub,original);return text;
    });assert.equal(fallback,'🌿');
   }
   if(mode==='after'){
    const longCopy=await page.evaluate(()=>{
     const parent=document.querySelector('.center-page.active[data-chrome-view="cards"]');parent.scrollTop=0;
     const card=createPageTitleCard({label:'긴 그룹 제목 '.repeat(8),description:'설명이 매우 길어져도 자연스럽게 줄바꿈되어야 합니다. '.repeat(20),cards:[],icon:'🌿'},'race');
     card.dataset.imageLayout='portrait';parent.replaceChildren(card);
     const r=card.getBoundingClientRect();const nodes=['.page-title-path','.page-title-heading','.page-title-media','.page-title-description','.page-title-footer'].map(s=>card.querySelector(s).getBoundingClientRect());
     return {overflow:card.scrollWidth>card.clientWidth,contained:nodes.every(x=>x.left>=r.left&&x.right<=r.right&&x.top>=r.top&&x.bottom<=r.bottom),overlap:nodes.some((x,i)=>nodes.slice(i+1).some(y=>x.left<y.right&&x.right>y.left&&x.top<y.bottom&&x.bottom>y.top))};
    });
    assert(!longCopy.overflow&&longCopy.contained&&!longCopy.overlap,'long copy grows naturally without clipping or overlap');
   }
   assert.deepEqual(errors,[]);await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
