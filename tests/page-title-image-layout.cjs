const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const {chromium}=require('playwright');
(async()=>{
 const baseline={js:execFileSync('git',['show','250f206:js/app.js'],{encoding:'utf8'}),css:execFileSync('git',['show','250f206:css/style.css'],{encoding:'utf8'})};
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const measurements=new Map();
 try{
  for(const width of [320,393,1280])for(const mode of ['before','after']){
   const page=await browser.newPage({viewport:{width,height:852},serviceWorkers:'block'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
   if(mode==='before'){
    await page.route('**/js/app.js',r=>r.fulfill({contentType:'text/javascript',body:baseline.js}));
    await page.route('**/css/style.css',r=>r.fulfill({contentType:'text/css',body:baseline.css}));
   }
   await page.route('**/layout-image-*',r=>{const [,w,h]=r.request().url().match(/layout-image-(\d+)-(\d+)/);return r.fulfill({contentType:'image/svg+xml',body:`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="tan"/></svg>`});});
   await page.goto(process.env.PERF_TEST_URL);await page.waitForTimeout(1600);
   // Include the actual portrait proportions and a less panoramic wide image.
   for(const [index,size] of [[600,600],[800,600],[1200,400],[941,1672],[882,1783],[900,500]].entries()){
    await page.evaluate(({size})=>{
     goToCreate();switchNav('character',true);selectSub('race');
     CARD_DATA.race.groups=[{id:'layout',label:'그룹 제목',description:'그룹 설명입니다.',detail:'기존 상세 정보',img:`layout-image-${size[0]}-${size[1]}`,cards:[{type:'section',label:'첫 섹션'},{name:'카드'},{name:'둘째 카드'}]}];showGroupCards('race',0);
    },{size});
    await page.locator('.page-title-media img').waitFor();
    const m=await page.locator('.page-title-card').evaluate(n=>{
     const rect=el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
     const image=n.querySelector('.page-title-image'),heading=n.querySelector('.page-title-heading'),desc=n.querySelector('.page-title-description'),path=n.querySelector('.page-title-path'),count=n.querySelector('.page-title-count');
     return {frame:rect(n),image:rect(image),copy:rect(n.querySelector('.page-title-copy')),heading:rect(heading),desc:rect(desc),path:rect(path),count:rect(count),layout:n.dataset.imageLayout,titleFont:parseFloat(getComputedStyle(heading).fontSize),descFont:parseFloat(getComputedStyle(desc).fontSize),pathFont:getComputedStyle(path).fontSize,copyAlign:getComputedStyle(desc).textAlign,fit:getComputedStyle(image).objectFit,position:getComputedStyle(image).objectPosition,natural:image.naturalWidth/image.naturalHeight,countText:count.textContent,overflow:n.scrollWidth>n.clientWidth};
    });
    const key=`${width}-${index}`;
    if(mode==='before')measurements.set(key,m);
    else{
     const old=measurements.get(key);assert(Math.abs(m.titleFont/old.titleFont-.85)<.01);assert(m.descFont/old.descFont>=.75&&m.descFont/old.descFont<=.8);assert.equal(m.pathFont,old.pathFont);assert.equal(m.countText,'2');
     assert(!m.overflow);assert(Math.abs((m.heading.left+m.heading.right-m.copy.left-m.copy.right)/2)<1);assert.equal(m.copyAlign,'center');
     assert(m.frame.right-m.count.right>=8&&m.frame.right-m.count.right<=20);assert(m.frame.bottom-m.count.bottom>=5&&m.frame.bottom-m.count.bottom<=12);
     const nodes=[m.image,m.heading,m.desc,m.path,m.count];
     assert(nodes.every(r=>r.left>=m.frame.left&&r.right<=m.frame.right&&r.top>=m.frame.top&&r.bottom<=m.frame.bottom));
     assert(!nodes.some((a,i)=>nodes.slice(i+1).some(b=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top)));
     if(m.layout==='wide'){
      assert(Math.abs(m.image.width/m.frame.width-.85)<.01);assert(m.image.bottom<=m.copy.top);assert.equal(m.fit,'contain');assert(Math.abs(m.image.width/m.image.height-m.natural)<.01);
      assert(m.frame.height-old.frame.height<=Math.max(0,m.image.height-old.image.height)+2,'only original image aspect can require added height');
     }else{
      assert(m.image.right<=m.copy.left);assert(m.frame.height<=old.frame.height+4,'side layouts stay compressed');
      if(m.layout==='portrait'){assert(Math.abs(m.image.width/m.image.height-.6)<.01);assert.equal(m.fit,'cover');assert.equal(m.position,'50% 50%');assert(m.natural/.6>.8,'existing portraits retain over 80% of height');}
      else{assert.equal(m.fit,'contain');assert(Math.abs(m.image.width/m.image.height-m.natural)<.01);}
     }
     console.log(`PASS ${width}px ${m.layout}: ${old.frame.height.toFixed(1)} -> ${m.frame.height.toFixed(1)}px, image placement/aspect, copy center, font reduction, unchanged path, bottom-right numeric count`);
    }
   }
   assert.deepEqual(errors,[]);await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
