const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');
function load(file){const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);return JSON.parse(JSON.stringify(ctx.window.IdeaMineCatalog));}
const catalog=load('data/idea-mine-materials.js'),before=load('data/idea-mine-source/catalog-before-noun-import.js');
const expected=[],taxonomy=[];let major,sub;
for(let i=1;i<=2;i++)for(const raw of fs.readFileSync(path.join(root,`data/idea-mine-source/nouns-part-${i}.txt`),'utf8').split(/\r?\n/)){
 const line=raw.trim();if(!line)continue;let m;
 if(m=line.match(/^(\d+) (.+)$/)){major={id:m[1],name:m[2],subcategories:[]};taxonomy.push(major);}
 else if(m=line.match(/^(\d+\.\d+) (.+)$/)){sub={id:m[1],name:m[2]};major.subcategories.push(sub);}
 else for(const name of line.split(',').map(x=>x.trim()))expected.push({name,category:major.name,categoryId:major.id,subcategory:sub.name,subcategoryId:sub.id});
}
const imported=catalog.materials.filter(x=>x.id.startsWith('noun-'));
assert.equal(imported.length,6837);assert.deepEqual(catalog.nounTaxonomy,taxonomy);
assert.deepEqual(imported.map(({name,category,categoryId,subcategory,subcategoryId})=>({name,category,categoryId,subcategory,subcategoryId})),expected);
assert.equal(expected.length-new Set(expected.map(x=>x.name)).size,243);
assert.deepEqual(catalog.materials.filter(x=>x.kind!=='명사'),before.materials.filter(x=>x.kind!=='명사'));
for(const x of imported){assert.deepEqual(x.roles,['subject','object']);assert.deepEqual(x.modes,['action','quality','relation']);}
for(const x of before.materials){const found=catalog.materials.find(y=>y.id===x.id||y.legacyIds?.includes(x.id));assert(found);assert.equal(found.name,x.name);}
console.log('PASS: all 6837 source occurrences and 15/181 taxonomy entries match exactly; 243 repeated names preserved; 105 non-nouns unchanged; all legacy entries retained.');
