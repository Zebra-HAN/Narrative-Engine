const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');
const priorCSS = execFileSync('git', ['show', 'e541138:css/deep-blue-gold-theme.css'], {encoding:'utf8'});
const compressedCSS = execFileSync('git', ['show', 'ab1f6b9:css/deep-blue-gold-theme.css'], {encoding:'utf8'});
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try {
  for(const viewport of [{width:320,height:568},{width:393,height:852},{width:852,height:393}]){
   for(const mode of ['AB','C']){
    const results={};
    for(const variant of ['prior','compressed','fixed']){
     const page=await browser.newPage({viewport,hasTouch:true,serviceWorkers:'block'}),errors=[];
     page.on('pageerror',e=>errors.push(e.message));
     await page.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
     if(variant!=='fixed')await page.route('**/css/deep-blue-gold-theme.css',r=>r.fulfill({body:variant==='prior'?priorCSS:compressedCSS,contentType:'text/css'}));
     await page.goto(process.env.PERF_TEST_URL);await page.waitForTimeout(1600);
     await page.evaluate(()=>{goToCreate();switchNav('character',true);selectSub('race');});
     await page.waitForFunction(()=>document.querySelector('#page-race.active[data-chrome-view=group]'));
     await page.evaluate(mode=>{
      const detail='[[section:활용법]]\n\n《스포츠물》\n승리의 정의를 상대를 꺾는 것에서 내 한계를 넘는 것으로 전환시키는 서브플롯을 통해 캐릭터의 깊이를 더할 수 있음\n\n두 번째 아이디어\n\n[[section:바로 써먹는 씨앗]]\n\n새로운 아이디어';
      CARD_DATA.spacing=[{name:'너비 복구',desc:'설명',detailLayout:mode,detail,detailA:detail,detailB:detail}];
      currentSubId='spacing';showCardPage('spacing',false,true);cardClick('spacing',0);openDetailSheet('card');toggleDetailCheck('spacing',0,0);
     },mode);await page.waitForFunction(()=>{const s=getComputedStyle(document.querySelector('.detail-sheet'));return Number(s.opacity)===1&&new DOMMatrixReadOnly(s.transform).a===1;});
     results[variant]=await page.evaluate(()=>{
      const rect=n=>{const r=n.getBoundingClientRect();return {width:r.width,x:r.x}};
      return {grid:[...document.querySelectorAll('.detail-column')].map(rect),gap:getComputedStyle(document.querySelector('.detail-columns')||document.querySelector('.detail-column')).columnGap,
       sections:[...document.querySelectorAll('.detail-section')].map(n=>{
        const heading=n.querySelector('.detail-section-title'),items=[...n.querySelectorAll('.detail-idea-block')],first=items[0];
        return {width:n.getBoundingClientRect().width,gap:first.getBoundingClientRect().top-heading.getBoundingClientRect().bottom,plates:items.map(b=>{const r=b.getBoundingClientRect(),s=getComputedStyle(b);return {width:r.width,height:r.height,font:s.font,fontSize:s.fontSize,lineHeight:s.lineHeight,padding:s.padding,left:r.left-n.getBoundingClientRect().left,right:n.getBoundingClientRect().right-r.right}})};
       })};
     });
     if(variant==='fixed'){
      const check=await page.locator('.detail-idea-block.checked').evaluate(n=>{const s=getComputedStyle(n,'::after');return {width:s.width,height:s.height,top:s.top,right:s.right,transform:s.transform,pointer:s.pointerEvents}});
      assert.deepEqual(check,{width:'32px',height:'32px',top:'0px',right:'0px',transform:'matrix(1, 0, 0, 1, 8, -16)',pointer:'none'});
      await page.evaluate(()=>{toggleDetailCheck('spacing',0,1);toggleCurrentCardLock();toggleDetailCheck('spacing',0,1);});
      assert(await page.evaluate(()=>selectedDetails.spacing__0.has(1)&&document.querySelectorAll('.detail-idea-block:disabled').length>0));
      await page.evaluate(()=>{toggleCurrentCardLock();toggleDetailCheck('spacing',0,1);document.getElementById('detail-content').scrollTop=100;});
      assert(await page.evaluate(()=>!selectedDetails.spacing__0.has(1)));
      if(process.env.PREVIEW_DIR)await page.screenshot({path:`${process.env.PREVIEW_DIR}/plates-${mode}-${viewport.width}.png`});
     }
     assert.deepEqual(errors,[]);await page.close();
    }
    assert.deepEqual(results.fixed,results.prior,'original columns, plate widths, text metrics and title-to-plate gap restored');
    for(let i=0;i<results.fixed.sections.length;i++){
     const fixed=results.fixed.sections[i],compressed=results.compressed.sections[i];
     assert.equal(fixed.plates[0].width-compressed.plates[0].width,16);
     assert.equal(compressed.gap-fixed.gap,16);
     assert(fixed.plates[0].height<=compressed.plates[0].height,'text uses restored width');
     assert(fixed.plates.every(p=>p.width===fixed.plates[0].width),'selected and unselected plates share width');
    }
    console.log(`PASS ${viewport.width}x${viewport.height} ${mode}: pre-check geometry and text restored, +16px plate width, -16px heading gap, 32px overlay check, lock/unlock`);
   }
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
