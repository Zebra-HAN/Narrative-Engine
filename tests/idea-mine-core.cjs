const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const context = {window: {}};
for (const file of ['data/idea-mine-materials.js', 'js/idea-mine-core.js']) {
  vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), context);
}
const {IdeaMineCatalog: catalog, IdeaMineCore: core} = context.window;
const nouns = catalog.materials.filter(x => x.kind === '명사');
assert.equal(catalog.schemaVersion, 2);
assert.equal(catalog.materials.length, 148);
assert.equal(nouns.length, 43);
const allIds = catalog.materials.flatMap(x => [x.id, ...(x.legacyIds || [])]);
assert.equal(new Set(allIds).size, allIds.length);
assert.equal(allIds.length, 190);
// Compare every original record with the new shared catalog, not just counts.
const oldContext = {window: {}};
vm.runInNewContext(execFileSync('git', ['show', '94c52ff:data/idea-mine-materials.js'], {cwd: root, encoding: 'utf8'}), oldContext);
const old = oldContext.window.IdeaMineCatalog.materials;
for (const before of old) {
  const after = catalog.materials.find(x => x.id === before.id || x.legacyIds?.includes(before.id));
  assert(after, `missing legacy ID ${before.id}`);
  if (before.kind !== '명사') {
    assert.equal(JSON.stringify(after), JSON.stringify(before), 'non-noun samples unchanged');
    continue;
  }
  const base = before.modes.includes('action') && before.roles.includes('object')
    ? before.name.replace(/[을를]$/, '') : before.name;
  assert.equal(after.name, base);
  assert(before.roles.every(r => after.roles.includes(r)));
  assert(before.modes.every(m => after.modes.includes(m)));
  assert(['subject', 'object'].every(r => after.roles.includes(r)));
  assert(['action', 'quality', 'relation'].every(m => after.modes.includes(m)));
  if (base !== before.name) {
    assert(after.legacyNames.includes(before.name));
    const saved = core.restore({mode: 0, values: {subject: '나무', object: before.name, verb: '삼킨다'}}, catalog);
    assert.equal(saved.values.object, base);
    assert.equal(core.withParticle(saved.values.object, 'object'), before.name);
  }
}
for (const [word,subject,object] of [
  ['구름','구름이','구름을'], ['거인','거인이','거인을'], ['나무','나무가','나무를'],
  ['유리 고래','유리 고래가','유리 고래를'], ['노을','노을이','노을을'],
  ['을','을이','을을'], ['','', '']
]) {
  assert.equal(core.withParticle(word,'subject'), subject);
  assert.equal(core.withParticle(word,'object'), object);
}
for (const custom of ['유리 고래를', '노을', '구름', '아주 긴 사용자 입력을']) {
  const restored = core.restore({mode: 0, values: {subject:'나무',object:custom,verb:'삼킨다'}},catalog);
  assert.equal(restored.values.object, custom);
  assert.equal(restored.legacyObject, custom);
  const again = core.restore({version:2,...restored},catalog);
  assert.equal(again.legacyObject, custom, 'legacy custom phrase survives a v2 save');
}
assert.equal(core.restore({version:2,mode:0,values:{object:'노을'}},catalog).legacyObject,null);
assert.equal(core.restore({mode:3,values:{object:'인간'}},catalog).values.object,'인간');
console.log('PASS: all 190 legacy records/IDs accounted for; 43 shared nouns + 105 unchanged non-nouns; particles; v1/v2 custom save compatibility');
