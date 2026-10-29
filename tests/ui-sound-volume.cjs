const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const app=fs.readFileSync(path.join(__dirname,'../js/app.js'),'utf8');
let code=app.slice(app.indexOf('const UI_SOUND ='),app.indexOf('\nfunction playPaperSound'));
// Inactive legacy lock and a second alias must obey the same filename policy.
code=code.replace('const sources = {',"const sources = { legacyLock: 'sounds/select/lock.mp3', secondSelect: 'sounds/select/select-6.mp3', secondMining3: 'sounds/select/mining-3.mp3', secondMining4: 'sounds/select/mining-4.mp3',");
const entries=[...code.matchAll(/(\w+): '(sounds\/[^']+\.mp3)'/g)].map(m=>[m[1],m[2]]);
const reduced=new Set(['select-6.mp3','lock_1.mp3','lock_2.mp3','lock.mp3','se_select_ok.mp3','se_select_yes.mp3']);
(async()=>{for(const safariFallback of [false,true]){
 const played=[],gains=[];
 class Node {constructor(){this.next=null;this.gain={value:1};}connect(node){this.next=node;}disconnect(){this.next=null;}}
 class Context {constructor(){this.destination={};this.state='suspended';}createGain(){const n=new Node();gains.push(n);return n;}createBufferSource(){const n=new Node();n.addEventListener=(_,fn)=>n.ended=fn;n.start=()=>{let gain=1,at=n.next;while(at!==this.destination){assert(at,'connected to output');gain*=at.gain.value;at=at.next;}played.push({file:n.buffer.file,gain,node:n});};return n;}decodeAudioData(buffer,resolve){resolve(buffer);}resume(){this.state='running';return Promise.resolve();}}
 const sandbox={window:{[safariFallback?'webkitAudioContext':'AudioContext']:Context},navigator:{},console,fetch:async file=>({ok:true,arrayBuffer:async()=>({file})})};
 vm.runInNewContext(code+'\nglobalThis.sound = UI_SOUND;',sandbox);for(let i=0;i<20;i++)await Promise.resolve();
 for(const master of [.7,.8,1,0]){
  sandbox.sound.setVolume(master);
  for(const [name,file]of entries){const before=played.length;sandbox.sound.play(name);assert.equal(played.length,before+1,name);const last=played.at(-1),expected=master*(reduced.has(path.basename(file))?.7:path.basename(file)==='mining-3.mp3'?.8:path.basename(file)==='mining-4.mp3'?.9:1);assert(Math.abs(last.gain-expected)<1e-12,`${name}: ${last.gain} vs ${expected}`);last.node.ended();assert.equal(last.node.next,null,'playback cleaned up');}
 }
 sandbox.sound.setMuted(true);const count=played.length;sandbox.sound.play('select6');assert.equal(played.length,count,'mute still suppresses playback');
 console.log(`PASS ${safariFallback?'webkitAudioContext fallback':'AudioContext'}: six filenames at 70%, mining-3 at 80%, mining-4 at 90%, aliases consistent; other sounds unchanged; master 0.7/0.8/1/0, mute and cleanup preserved.`);
}})().catch(e=>{console.error(e);process.exitCode=1;});
