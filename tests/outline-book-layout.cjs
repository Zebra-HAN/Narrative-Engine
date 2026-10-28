const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  try {
    for (const viewport of [{width:320,height:568}, {width:393,height:852}, {width:852,height:393}]) {
      const page = await browser.newPage({viewport, hasTouch:true, serviceWorkers:'block'});
      const errors=[]; page.on('pageerror', e=>errors.push(e.message));
      await page.route(/fonts\.(googleapis|gstatic)\.com/, r=>r.abort());
      await page.goto(process.env.PERF_TEST_URL); await page.waitForTimeout(1600);
      await page.evaluate(()=>{goToCreate();switchNav('character',true);selectSub('race');});
      await page.waitForFunction(()=>document.querySelector('#page-race.active[data-chrome-view=group]'));
      await page.evaluate(()=>showGroupCards('race',2));
      await page.waitForTimeout(400);
      const open=async()=>{await page.locator('#card-minimap-toggle').click();await page.waitForTimeout(300);};
      await open(); await page.locator('#card-minimap-expand').click();
      const inspect=()=>page.evaluate(()=>{
        const panel=document.querySelector('#card-minimap'),content=document.querySelector('#card-minimap-content');
        const r=n=>{const b=n.getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height};};
        const s=getComputedStyle(panel),art=getComputedStyle(panel,'::before'),header=getComputedStyle(document.querySelector('.card-minimap-header'));
        return {panel:r(panel),content:r(content),group:r(panel.querySelector('.card-minimap-group')),summary:r(panel.querySelector('summary')),buttons:[...panel.querySelectorAll('.card-minimap-actions button')].map(r),border:s.borderTopWidth,shadow:s.boxShadow,bg:s.backgroundColor,art:art.backgroundImage,artW:parseFloat(art.width),artH:parseFloat(art.height),artX:art.left,artY:art.top,headerLine:header.borderBottomWidth,divider:parseFloat(getComputedStyle(panel.querySelector('details'),'::before').width),scroll:content.scrollTop};
      });
      const a=await inspect();
      assert.equal(await page.locator('#card-minimap-content').evaluate(n=>getComputedStyle(n).scrollbarWidth),'none','only the list scrollbar is hidden');
      assert.equal(a.border,'0px');assert.equal(a.shadow,'none');assert.equal(a.bg,'rgba(0, 0, 0, 0)');assert.equal(a.headerLine,'0px');
      assert(a.art.includes('/images/core/sub-nav/list_page_new2.webp'));assert(Math.abs(a.artW/a.artH-1179/2556)<.001);
      assert(a.artW>=a.panel.w);assert(Math.abs(a.group.x+a.group.w/2-a.summary.x-a.summary.w/2)<1);
      assert(Math.abs(a.divider/a.content.w-.6)<.01);
      for(const r of a.buttons){assert(r.w>=44&&r.h>=44);assert(r.x>=a.content.x&&r.x+r.w<=viewport.width);assert(r.y+r.h<=a.content.y+1);}
      const last=page.locator('.card-minimap-tag').last();await last.scrollIntoViewIfNeeded();
      const b=await inspect();assert(b.scroll>0);assert.equal(b.artX,a.artX);assert.equal(b.artY,a.artY);assert.equal(b.artH,a.artH);
      const lastBox=await last.boundingBox();assert(lastBox.y+lastBox.height<=b.content.y+b.content.h+1);
      await page.locator('#card-minimap-collapse').click();assert.equal(await page.locator('#card-minimap details[open]').count(),0);
      await page.locator('#card-minimap-expand').click();await last.scrollIntoViewIfNeeded();await last.click();
      await page.waitForTimeout(3100);assert(await page.locator('#card-minimap-overlay').isHidden());
      await open();assert.equal((await inspect()).shadow,'none');
      const cdp=await page.context().newCDPSession(page);
      const x=a.content.x+15,y=a.buttons[0].y+20;
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+60,y}]});
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      await page.waitForTimeout(350);assert(await page.locator('#card-minimap-overlay').isHidden());
      assert.deepEqual(errors,[]);console.log(`PASS ${viewport.width}x${viewport.height}: book ratio/crop, shared paper axis, toolbar, divider, fixed background, final item, expand/collapse, navigation, reentry, touch close`);
      await page.close();
    }
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
