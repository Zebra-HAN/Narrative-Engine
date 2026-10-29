const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),{chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
const page=await browser.newPage({serviceWorkers:'block'}),errors=[],audio=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().endsWith('.mp3'))audio.push([r.url(),r.status()]);});
await page.route('**/*',async route=>{const u=new URL(route.request().url());if(u.hostname!=='sounds.test')return route.abort();const file=path.join(__dirname,'..',u.pathname==='/'?'index.html':decodeURIComponent(u.pathname));try{await route.fulfill({body:await fs.readFile(file),contentType:file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.mp3')?'audio/mpeg':'text/html'});}catch{await route.fulfill({status:404,body:''});}});
await page.goto('http://sounds.test/');await page.waitForTimeout(1400);
await page.evaluate(()=>{window.played=[];const real=UI_SOUND.play;UI_SOUND.play=name=>{played.push(name);real(name);};goToCreate();switchNav('character',true);currentSubId='race';showGroupCards('race',2);});await page.waitForTimeout(700);
const click=async(selector,expected)=>{const sounds=await page.evaluate(selector=>{played.length=0;document.querySelector(selector).click();return played.slice();},selector);assert.deepEqual(sounds,expected,selector);if(selector.includes('.extra-btn-random'))await page.waitForSelector('.app-dialog-btn-confirm',{state:'attached'});else if(selector.startsWith('.app-dialog'))await page.waitForTimeout(300);};
for(const scope of ['#extra-menu-panel','#card-extra-menu-panel']){
 await click(scope+' .extra-btn-random',['click']);
 await click('.app-dialog-btn-cancel',['cancel']);
 await click(scope+' .extra-btn-random-all',['click']);
 await click('.app-dialog-btn-cancel',['cancel']);
}
await click('#card-extra-menu-panel .extra-btn-random-all',['click']);await click('.app-dialog-btn-confirm',['selectOk']);
await click('#card-extra-menu-panel .extra-btn-random',['click']);await click('.app-dialog-btn-confirm',['selectYes']);await page.waitForTimeout(700);
assert.equal(await page.evaluate(()=>selectedCards.race.size),1,'current random still selects one card');
await page.evaluate(()=>{CARD_DATA.soundFixture=[{name:'선택 테스트',icon:'◆',desc:'설명'}];selectedCards.soundFixture=new Set();showCardPage('soundFixture',false,true);});await page.waitForTimeout(700);
await page.evaluate(()=>{played.length=0;document.querySelector('.center-page.active .data-card').click();});assert((await page.evaluate(()=>played.slice())).every(s=>/^pong(?:[1-5]|New[1-3])$/.test(s)));
for(const [index,name] of ['pong1','pong2','pong3','pong4','pong5','pongNew1','pongNew2','pongNew3'].entries()){
 const sounds=await page.evaluate(index=>{played.length=0;const original=Math.random;Math.random=()=>(index+.5)/8;try{document.querySelector('.center-page.active .data-card').click();}finally{Math.random=original;}return played.slice();},index);assert.deepEqual(sounds,[name],'each equal-width random interval plays one sound');
}
await click('.card-info-select',['select6']);assert.equal(await page.evaluate(()=>selectedCards.soundFixture.has(0)),true);
await click('.card-info-select',['cancel1']);assert.equal(await page.evaluate(()=>selectedCards.soundFixture.has(0)),false);
await click('.card-info-select',['select6']);await click('.card-info-lock',['lockOn']);assert.equal(await page.evaluate(()=>isCardLocked('soundFixture',0)),true);
assert.equal(await page.locator('.card-info-select').isDisabled(),true,'locked card selection remains disabled');await click('.card-info-lock',['lockOff']);assert.equal(await page.evaluate(()=>isCardLocked('soundFixture',0)),false);await click('.card-info-select',['cancel1']);
assert(audio.some(([u,status])=>u.endsWith('/sounds/select/select-3.mp3')&&status===200));assert(audio.every(([,s])=>s===200));assert.deepEqual(errors,[]);
console.log('PASS: both random button copies use click; current/all confirmations use selectYes/selectOk; cancel unchanged; random selects one; card check uses select6 and deselection cancel1; lock behavior preserved; all eight equal-width Pong intervals each play one sound; audio loads and no page errors.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
