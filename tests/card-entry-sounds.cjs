const assert=require('node:assert/strict'),fs=require('node:fs'),{chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const page=await browser.newPage({viewport:{width:393,height:852},hasTouch:true,serviceWorkers:'block'});const errors=[],audio=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().endsWith('.mp3'))audio.push({url:r.url(),status:r.status()});});
 await page.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
 await page.goto(process.env.PERF_TEST_URL || 'http://127.0.0.1:8000');await page.waitForTimeout(1800);
 await page.evaluate(()=>{goToCreate();switchNav('character',true);window.soundsPlayed=[];window.realPlay=UI_SOUND.play;UI_SOUND.play=name=>{soundsPlayed.push(name);realPlay(name);};});
 const run=async(kind,random)=>page.evaluate(({kind,random})=>{soundsPlayed.length=0;const original=Math.random;Math.random=()=>random;try{if(kind==='normal'){CARD_DATA.soundFixture=[{name:'카드',icon:'◆'}];showCardPage('soundFixture',false,true);}else if(kind==='group')showGroupCards('race',2,true);else if(kind==='subgroup')showSubgroupCards('race',0,0,true);else showCardPage('race',false,true);}finally{Math.random=original;}return soundsPlayed.slice();},{kind,random});
 for(const kind of ['normal','group','subgroup']){assert.deepEqual(await run(kind,.1),['cardOpen1']);assert.deepEqual(await run(kind,.9),['cardOpen2']);assert.deepEqual(await run(kind,.9),['cardOpen2']);console.log('PASS '+kind+': one entry sound; both random branches; repeated same choice allowed');}
 assert.deepEqual(await run('selection',.1),[]);
 await page.evaluate(()=>{soundsPlayed.length=0;document.querySelector('.group-select-btn').click();});await page.waitForTimeout(1000);
 const played=await page.evaluate(()=>soundsPlayed);assert(played.includes('click'));assert.equal(played.filter(s=>s==='cardOpen1'||s==='cardOpen2').length,0,'first race group opens subgroup selection');
 await page.evaluate(()=>{soundsPlayed.length=0;showGroupCards('race',2);});await page.waitForFunction(()=>soundsPlayed.some(s=>s==='cardOpen1'||s==='cardOpen2'));await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>soundsPlayed.filter(s=>s==='cardOpen1'||s==='cardOpen2').length),1);
 assert(audio.length>=24);assert(audio.every(a=>a.status===200),JSON.stringify(audio));assert(audio.some(a=>a.url.endsWith('/sounds/click_1.mp3')));assert(audio.some(a=>a.url.endsWith('/sounds/card_open_1.mp3')));assert(audio.some(a=>a.url.endsWith('/sounds/card_open_2.mp3')));assert(!audio.some(a=>/\/sounds\/se_[^/]+$/.test(a.url)));
 assert.deepEqual(errors,[]);console.log('PASS '+audio.length+' audio URLs load (200), click replacement, group-selection silence, no page errors');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
