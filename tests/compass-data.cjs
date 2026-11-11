const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {execFileSync} = require('node:child_process');
const sourceCode=fs.readFileSync('data/compass.js','utf8');
const load=s=>JSON.parse(vm.runInNewContext(s+'\nJSON.stringify({nav:COMPASS_NAV,cards:COMPASS_CARDS})'));
const data=load(sourceCode);
const baseline=load(execFileSync('git',['show','9d9ddb7:data/compass.js'],{encoding:'utf8',maxBuffer:8*1024*1024}));
assert.deepEqual(data.nav.subs.map(s=>s.id),['type','genre','destination','reader','value_direction',...baseline.nav.subs.slice(4).filter(s=>s.id!=='reader').map(s=>s.id)]);
for(const sub of baseline.nav.subs)assert.deepEqual(data.nav.subs.find(s=>s.id===sub.id),sub);
for(const [id,cards] of Object.entries(baseline.cards))if(!['reader','destination'].includes(id))assert.deepEqual(data.cards[id],cards);
assert.deepEqual(data.cards.destination.groups.map(g=>g.id),baseline.cards.destination.groups.map(g=>g.id));
const counts={destination:[85,64,65,32,43],reader:[370,329,336,251,187,258,79,84,50]};
for(const [id,file,sections,total] of [['destination','dramatic-destination-source',19,289],['reader','core-reader-source',51,1944]]) {
 const groups=data.cards[id].groups;
 const raw=fs.readFileSync(`docs/${file}.md`,'utf8');
 const expected=[];let group;
 for(const line of raw.split(/\r?\n/)) {
  const section=line.match(/^(?:\*\*|#{1,3} )([A-I])(\d+)\. (.+?)(?:\*\*)?$/);
  if(section){
   const gi=section[1].charCodeAt(0)-65;
   group=expected[gi] ||= [];
   group.push({type:'section',label:section[3].split(' —')[0]});continue;
  }
  const card=line.match(/^\d+\. \*\*(.+?)\*\*\s*—\s*(.+)$/);
  if(card){assert(group);group.push({name:card[1],desc:card[2]});}
  else assert(!/^\d+\. /.test(line),'unparsed numbered card');
 }
 assert.equal(groups.length,counts[id].length);
 assert.deepEqual(groups.map(g=>g.cards),expected,'source order, section placement, titles and descriptions');
 assert.deepEqual(groups.map(g=>g.cards.filter(c=>c.type!=='section').length),counts[id]);
 const entries=groups.flatMap(g=>g.cards),cards=entries.filter(c=>c.type!=='section');
 assert.equal(entries.length-cards.length,sections);assert.equal(cards.length,total);
 assert.equal(new Set(cards.map(c=>c.name)).size,total,'duplicate titles');
 for(const g of groups){
  assert.equal(g.layoutType,'2');assert(!/^[A-I]\.|—|\d+개/.test(g.label));
  for(const c of g.cards){
   if(c.type==='section')assert(!/^[A-I]\d+\.|—|\d+개/.test(c.label));
   else {assert(c.name.trim()&&c.desc.trim());assert.deepEqual(Object.keys(c),['name','desc']);}
  }
 }
 const block=sourceCode.slice(sourceCode.indexOf(`  ${id}: {`)).split(id==='destination'?'/* 가치 연출':'  mood: {')[0];
 assert.equal(block.split('\n').filter(l=>/^\s*\{"(?:name|type)":/.test(l)).length,entries.length,'one line per card/section');
 console.log(`PASS ${id}: ${groups.length} groups / ${sections} sections / ${total} cards, source parity, formatting, IDs and layout`);
}
assert.deepEqual(data.cards.destination.groups.flatMap(g=>g.cards.filter(c=>c.name)),baseline.cards.destination.groups.flatMap(g=>g.cards.filter(c=>c.name)));
module.exports=data;
