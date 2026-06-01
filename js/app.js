
import {DATA} from './data.js';

const state=JSON.parse(localStorage.getItem('ne-state')||'{}');

function save(){localStorage.setItem('ne-state',JSON.stringify(state));}

function renderHome(){
document.getElementById('app').innerHTML=`
<div class="header"><h1>Narrative Engine</h1></div>
<div class="home-grid">
<div class="card" data-page="character">캐릭터 모집</div>
<div class="card" data-page="story">서사 조립</div>
<div class="card" data-page="world">세계 구축</div>
<div class="card" data-page="compass">작품 나침반</div>
<div class="card" data-page="overview">현재 상태 보기</div>
</div>
<div class="mini">${renderMini()}</div>`;

document.querySelectorAll('[data-page]').forEach(el=>{
el.onclick=()=>renderSection(el.dataset.page);
});
}

function renderMini(){
let out='';
for(const k in state){ out+=`<span class="tag">${k}:${state[k]}</span>`;}
return out||'선택된 항목 없음';
}

function renderSection(section){
if(section==='overview'){
document.getElementById('app').innerHTML=`<div class="page">
<h2>전체 설계도</h2>
<pre>${JSON.stringify(state,null,2)}</pre>
<button class="btn" id="home">홈</button>
<button class="btn" id="reset">전체 초기화</button>
</div>`;
document.getElementById('home').onclick=renderHome;
document.getElementById('reset').onclick=()=>{localStorage.clear();location.reload();};
return;
}
const items=DATA[section]||[];
document.getElementById('app').innerHTML=`
<div class="page">
<h2>${section}</h2>
<button class="btn" id="home">홈</button>
<button class="btn" id="resetSection">이 영역 초기화</button>
<div class="grid">
${items.map(i=>`<div class="card" data-item="${i}">${i}</div>`).join('')}
</div>
</div>`;

document.getElementById('home').onclick=renderHome;
document.getElementById('resetSection').onclick=()=>{
items.forEach(i=>delete state[i]); save(); renderSection(section);
};
document.querySelectorAll('[data-item]').forEach(el=>{
el.onclick=()=>{
state[el.dataset.item]='선택됨';
save();
alert(el.dataset.item+' 선택');
};
});
}

renderHome();
