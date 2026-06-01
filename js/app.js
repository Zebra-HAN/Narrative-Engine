
const state=JSON.parse(localStorage.getItem('ne-v2')||'{}');

function save(){localStorage.setItem('ne-v2',JSON.stringify(state));}

const sections={
character:['원형','종족','직업','속성','목표','욕망'],
story:['메시지','갈등','감정엔진','장면도구','결말'],
world:['시대','국가','문화','종교','역사'],
compass:['원형사전','욕망사전','장르분석','체크리스트']
};

function mini(){
 const tags=Object.keys(state).map(k=>`<span class="tag">${k}</span>`).join('');
 return `<div class="mini"><b>현재 프로젝트</b><br>${tags||'아직 선택 없음'} 
 <button class="btn" onclick="window.overview()">현재 상태 보기</button></div>`;
}

function home(){
 app.innerHTML=`
 <div class="header">
  <div>
   <div class="brand">NARRATIVE ENGINE</div>
   <div class="title">창작 운영체제</div>
  </div>
  <button class="btn" onclick="window.resetAll()">전체 초기화</button>
 </div>

 <div class="grid">
  <div class="card" onclick="window.openPage('character')"><h3>캐릭터 모집</h3><p>인물 설계</p></div>
  <div class="card" onclick="window.openPage('story')"><h3>서사 조립</h3><p>사건 / 플롯</p></div>
  <div class="card" onclick="window.openPage('world')"><h3>세계 구축</h3><p>배경 / 환경</p></div>
  <div class="card" onclick="window.openPage('compass')"><h3>작품 나침반</h3><p>창작 가이드</p></div>
 </div>
 ${mini()}`;
}

window.openPage=(name)=>{
 const items=sections[name];
 app.innerHTML=`<div class="page">
 <button class="btn" onclick="home()">← 홈</button>
 <button class="btn" onclick="resetSection('${name}')">${name} 초기화</button>
 <h2>${name}</h2>
 <div class="grid">
 ${items.map(x=>`<div class='card' onclick="pick('${x}')"><h3>${x}</h3><p>선택 페이지(예정)</p></div>`).join('')}
 </div>
 ${mini()}
 </div>`;
}

window.pick=(x)=>{state[x]=true;save();alert(x+' 선택');home();}

window.overview=()=>{
 app.innerHTML=`<div class="page">
 <button class="btn" onclick="home()">← 홈</button>
 <h2>전체 설계도</h2>
 <pre>${JSON.stringify(state,null,2)}</pre>
 </div>`;
}

window.resetAll=()=>{
 localStorage.removeItem('ne-v2');
 location.reload();
}

window.resetSection=(name)=>{
 (sections[name]||[]).forEach(v=>delete state[v]);
 save();
 openPage(name);
}

window.home=home;
home();
