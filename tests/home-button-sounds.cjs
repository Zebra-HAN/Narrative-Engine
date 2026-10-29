const assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
const page=await browser.newPage({viewport:{width:393,height:852},hasTouch:true,serviceWorkers:'block'}),errors=[],audio=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().endsWith('.mp3'))audio.push([r.url(),r.status()]);});await page.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());await page.goto('http://127.0.0.1:8000');await page.waitForTimeout(1600);
await page.evaluate(()=>{window.homeSounds=[];const original=UI_SOUND.play;UI_SOUND.play=name=>{homeSounds.push(name);original(name);};});
for(const [id,sound,screen]of [['btn-narrative','card','screen-narrative'],['btn-character-shop','card','screen-home'],['btn-idea-mine','walkClick','screen-idea-mine'],['btn-create','walkClick','screen-create']]){
 await page.evaluate(()=>{switchScreen('screen-home',null,{type:'instant'});homeSounds.length=0;});await page.locator('#'+id).click();await page.waitForTimeout(300);assert.deepEqual(await page.evaluate(()=>homeSounds),[sound],id);assert(await page.locator('#'+screen).evaluate(n=>n.classList.contains('active')),id+' navigation unchanged');
 if(id==='btn-character-shop'){assert(await page.locator('#app-dialog-overlay').evaluate(n=>n.classList.contains('active')));await page.locator('#app-dialog-actions button').click();}
}
for(const file of ['se_card.mp3','walk-click.mp3'])assert(audio.some(([url,status])=>url.endsWith('/sounds/se/'+file)&&status===200));assert(audio.every(([,s])=>s===200));assert.deepEqual(errors,[]);console.log('PASS: four home buttons each play the assigned sound once; navigation/shop notice unchanged; all audio loads; no page errors.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
