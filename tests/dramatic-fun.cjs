const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{execFileSync}=require('node:child_process'),{chromium}=require('playwright');
const code=fs.readFileSync('data/narrative.js','utf8');
const load=s=>JSON.parse(vm.runInNewContext(s+'\nJSON.stringify({nav:NARRATIVE_NAV,cards:NARRATIVE_CARDS})'));
const data=load(code),baseline=load(execFileSync('git',['show','70235b4:data/narrative.js'],{encoding:'utf8',maxBuffer:8*1024*1024}));
assert.equal(data.nav.subs[0].id,'dramatic_fun');assert.equal(data.nav.subs[0].img,data.nav.subs.find(s=>s.id==='event').img);
assert.deepEqual({...data.nav,subs:data.nav.subs.slice(1)},baseline.nav);
const {dramatic_fun,...existing}=data.cards;assert.deepEqual(existing,baseline.cards);
const groups=dramatic_fun.groups;
assert.deepEqual(groups.map(g=>g.label),['인물 · 설정 · 조건','갈등 · 행동 · 해결','사건 · 구조 · 전개','발견 · 변화 · 감정']);
assert.deepEqual(groups.map(g=>g.cards.filter(c=>c.name).length),[61,74,58,63]);
const decode=s=>s.replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/&amp;/g,'&');
const lines=fs.readFileSync('docs/dramatic-fun-source.md','utf8').split(/\r?\n/).map(l=>decode(l).trim().replace(/\\\./g,'.').replace(/^\*\*(.*)\*\*$/,'$1').trim()).filter(Boolean);
const expected=[],cardNames=[],sections=[];
for(let i=0;i<lines.length;i++){
 const m=lines[i].match(/^\d+\. (.+)$/);
 if(m){if(m[1].includes('×')){assert(lines[i+2].startsWith('예시:'));expected.push({title:m[1],desc:lines[i+1],example:lines[i+2]});}else cardNames.push(m[1]);}
 const s=lines[i].match(/^[A-D]\d+\. (.+)$/);if(s)sections.push(s[1].split(' — ')[0].trim());
}
assert.equal(expected.length,1084);assert.equal(cardNames.length,256);assert.equal(sections.length,24);
assert.deepEqual(groups.flatMap(g=>g.cards.filter(c=>c.name).map(c=>c.name)),cardNames);
assert.deepEqual(groups.flatMap(g=>g.cards.filter(c=>c.type==='section').map(c=>c.label)),sections);
const actual=groups.flatMap(g=>g.cards.filter(c=>c.name).flatMap(c=>c.detail.split('\n\n').map(block=>{const [head,desc,example]=block.split('\n');return {title:head.slice(1,-1),desc,example};})));
assert.deepEqual(actual,expected,'all source formula titles, descriptions, examples and order');
for(const g of groups){assert(!g.img&&!g.icon);for(const c of g.cards){assert(!c.img&&!c.icon);if(c.name)assert(c.desc.trim());}}
console.log('PASS data: 4 groups / 24 sections / 256 cards / 1084 complete source formulas, unchanged existing story data');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
for(const width of [393,1280]){
const p=await b.newPage({viewport:{width,height:852},serviceWorkers:'block'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto(process.env.PERF_TEST_URL||'http://127.0.0.1:8003');await p.waitForTimeout(1600);
await p.evaluate(()=>{goToCreate();switchNav('narrative2',true);selectSub('dramatic_fun');});await p.waitForSelector('#page-dramatic_fun.active[data-chrome-view=group]');
assert.equal(await p.locator('#page-dramatic_fun .group-select-btn').count(),4);
assert.equal(await p.locator('#page-dramatic_fun .group-btn-img').count(),0);
for(let gi=0;gi<4;gi++){
 await p.locator(`#page-dramatic_fun [data-group-idx="${gi}"]`).click();await p.waitForSelector('.center-page.active[data-chrome-view=cards]');
 assert.deepEqual(await p.locator('.center-page.active[data-chrome-view=cards] .card-name-text').allTextContents(),groups[gi].cards.filter(c=>c.name).map(c=>c.name));
 const results=await p.evaluate(gi=>{
  const page=document.querySelector('.center-page.active[data-chrome-view=cards]');
  if([...page.querySelectorAll('.card-img-frame, .page-title-media')].some(n=>getComputedStyle(n).display!=='none'))throw Error('empty visual frame');
  return CARD_DATA.dramatic_fun.groups[gi].cards.flatMap((c,i)=>{
   if(c.type==='section')return [];
   groupCardClick('dramatic_fun',gi,i);openDetailSheet('card');
   if(getComputedStyle(document.querySelector('#detail-icon')).display!=='none')throw Error('detail placeholder');
   const result={name:document.querySelector('#detail-name').textContent,desc:document.querySelector('#detail-desc').textContent,titles:[...document.querySelectorAll('#detail-body .detail-section-title')].map(n=>n.textContent),items:[...document.querySelectorAll('#detail-body .detail-idea-block')].map(n=>n.textContent.trim())};
   closeDetailSheet();closeCardInfo();return [result];
  });
 },gi);
 assert.deepEqual(results,groups[gi].cards.filter(c=>c.name).map(c=>({name:c.name,desc:c.desc,titles:c.detail.split('\n\n').map(b=>b.split('\n')[0].slice(1,-1)),items:c.detail.split('\n\n').map(b=>b.split('\n').slice(1).join('\n'))})));
 await p.evaluate(()=>navigateAddressBack());await p.waitForSelector('#page-dramatic_fun.active[data-chrome-view=group]');
}
const selection=await p.evaluate(async()=>{
 showAppConfirm=async()=>true;showGroupCards('dramatic_fun',0,true);groupCardClick('dramatic_fun',0,1);openDetailSheet('card');
 toggleDetailCheck('dramatic_fun',1,0);const automatic=selectedCards.dramatic_fun.has(1);toggleCurrentCardLock();toggleDetailCheck('dramatic_fun',1,0);const locked=selectedDetails.dramatic_fun__1.has(0);closeDetailSheet();
 await randomSelectCurrent();const preserved=selectedCards.dramatic_fun.has(1)&&selectedCards.dramatic_fun.size===2;
 return {automatic,locked,preserved,count:getRandomCandidates('dramatic_fun').length};
});assert.deepEqual(selection,{automatic:true,locked:true,preserved:true,count:256});
assert.deepEqual(errors,[]);console.log(`PASS ${width}: all card details/formula units, text-only UI, group navigation, automatic/random selection and lock preservation`);await p.close();
}
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
