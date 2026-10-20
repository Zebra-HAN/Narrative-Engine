/* Isolated workbench: no existing creative data is read or written. */
(()=> {
  'use strict';
  const core = window.IdeaMineCore;
  let legacyObject = null;
  let loadedResult = null;
  const modes=[
  {
    id:'action',name:'자유 조합',fields:[['subject','주체'],['object','대상'],['verb','행동']],build:v=>`${core.withParticle(v.subject,'subject')} ${v.object===legacyObject?v.object:core.withParticle(v.object,'object')} ${v.verb}`
  },
  {
    id:'quality',name:'특성 변형',fields:[['subject','대상'],['quality','특성']],build:v=>`${v.quality} ${v.subject}`
  },
  {
    id:'rule',name:'기묘한 규칙',fields:[['trigger','조건'],['effect','결과']],build:v=>`${v.trigger} ${v.effect}`
  },
  {
    id:'relation',name:'관계 뒤집기',fields:[['subject','주체'],['object','대상'],['relation','관계']],build:v=>`${core.withParticle(v.object,'object')} ${v.relation} ${v.subject}`
  },
  {
    id:'problem',name:'문제 · 해결',fields:[['problem','문제'],['solution','해결 방식']],build:v=>`${v.problem}에서 활동하는 ${v.solution}`
  },
  {
    id:'why',name:'원인 역산',fields:[['outcome','기묘한 결과'],['cause','숨겨진 원인']],build:v=>`${v.outcome} 왜냐하면 ${v.cause}`
  }
  ];
  const $=id=>document.getElementById('mine-'+id);
  modes.forEach(m=>m.fields.forEach(f=>f.push(window.IdeaMineCatalog.materials.filter(x=>x.roles.includes(f[0])&&(!x.modes||x.modes.includes(m.id))).map(x=>x.name))));
  let mode=0,values= {}
  ,locks= {}
  ,rollCount=0,expandOffset=0,activeField=null,activeCategory='전체';
  const storeKey='narrative_idea_mine_saves_v1';
  let saves=[];
  try {
    saves=JSON.parse(localStorage.getItem(storeKey)||'[]');
    if(!Array.isArray(saves))saves=[];
    saves=saves.filter(x=>x&&typeof x.id==='string'&&typeof x.text==='string'&&modes[x.mode]&&x.values&&modes[x.mode].fields.every(([k])=>typeof x.values[k]==='string'))
  }
  catch(e) {
    saves=[]
  }
  function sample(arr,prev) {
    const alternatives=arr.filter(x=>x!==prev);
    const pool=alternatives.length?alternatives:arr;
    return pool.length?pool[Math.floor(Math.random()*pool.length)]:''
  }
  function notice(s) {
    $('notice').textContent=s;
    clearTimeout(notice.timer);
    notice.timer=setTimeout(()=>$('notice').textContent='',2400)
  }
  function drawModes() {
    $('modes').innerHTML='';
    modes.forEach((m,i)=> {
      let b=document.createElement('button');
      b.setAttribute('aria-pressed',String(i===mode));
      b.className='mode'+(i===mode?' active':'');
      b.textContent=m.name;
      b.onclick=()=>switchMode(i);
      $('modes').appendChild(b)
    }
    )
  }
  function switchMode(i) {
    mode=i;
    legacyObject=null;
    loadedResult=null;
    values= {}
    ;
    locks= {}
    ;
    activeField=null;
    $('library').hidden=true;
    expandOffset=0;
    $('expPanel').hidden=true;
    drawModes();
    reroll(true)
  }
  function catalogCategory(key,word) {
    return window.IdeaMineCatalog.materials.find(x=>x.name===word&&x.roles.includes(key)&&(!x.modes||x.modes.includes(modes[mode].id)))?.category||'기타'
  }
  function drawSlots() {
    let parent=$('slots');
    parent.innerHTML='';
    parent.style.setProperty('--mine-slot-count', modes[mode].fields.length);
    modes[mode].fields.forEach(([key,label])=> {
      let d=document.createElement('div');
      d.className='slot'+(locks[key]?' locked':'')+(activeField===key?' open':'');
      let head=document.createElement('div');
      head.className='slothead';
      let name=document.createElement('span');
      name.className='slotname';
      name.textContent=label;
      let lock=document.createElement('button');
      lock.className='lock'+(locks[key]?' on':'');
      lock.textContent=locks[key]?'🔒':'🔓';
      lock.setAttribute('aria-label',label+' '+(locks[key]?'잠금 해제':'잠금'));
      lock.title=locks[key]?'잠금 해제':'잠금';
      lock.onclick=()=> {
        locks[key]=!locks[key];
        drawSlots()
      }
      ;
      head.append(name,lock);
      let input=document.createElement('textarea');
      input.rows=2;
      input.value=values[key]||'';
      input.setAttribute('aria-label',label);
      input.oninput=()=> {
        loadedResult=null;
        values[key]=input.value;
        if(key==='object')legacyObject=null;
        locks[key]=true;
        d.classList.add('locked');
        lock.classList.add('on');
        lock.textContent='🔒';
        lock.setAttribute('aria-label',label+' 잠금 해제');
        lock.title='잠금 해제';
        lock.setAttribute('aria-pressed','true');
        single.disabled=true;
        renderResult()
      }
      ;
      let browse=document.createElement('button');
      browse.className='browse';
      browse.textContent='▦ 목록 선택';
      browse.setAttribute('aria-label',label+' 목록 열기');
      browse.onclick=()=>openLibrary(key);
      let single=document.createElement('button');
      single.className='browse';
      single.textContent='↻ 재추첨';
      single.setAttribute('aria-label',label+' 재추첨');
      single.disabled=!!locks[key];
      single.onclick=()=> {
        if(locks[key])return;
        loadedResult=null;
        values[key]=sample(modes[mode].fields.find(f=>f[0]===key)[2],values[key]);
        if(key==='object')legacyObject=null;
        drawSlots();
        renderResult()
      }
      ;
      lock.setAttribute('aria-pressed',String(!!locks[key]));
      d.append(head,input,browse,single);
      parent.appendChild(d)
    }
    )
  }
  function openLibrary(key) {
    if(activeField===key&&!$('library').hidden) {
      closeLibrary();
      return
    }
    activeField=key;
    activeCategory='전체';
    $('libSearch').value='';
    $('library').hidden=false;
    drawSlots();
    drawLibrary();
    $('library').scrollIntoView( {
      behavior:'smooth',block:'nearest'
    }
    )
  }
  function closeLibrary() {
    const previous=activeField;
    activeField=null;
    $('library').hidden=true;
    drawSlots();
    if(previous) {
      const i=modes[mode].fields.findIndex(f=>f[0]===previous);
      $('slots').children[i]?.querySelector('.browse')?.focus( {
        preventScroll:true
      }
      );
      $('slots').children[i]?.scrollIntoView( {
        block:'nearest'
      }
      )
    }
  }
  function drawLibrary() {
    if(activeField===null)return;
    const field=modes[mode].fields.find(f=>f[0]===activeField);
    if(!field)return;
    const [key,label,pool]=field;
    $('libTitle').textContent=label+' · 재료 목록';
    let cats=['전체',...new Set(pool.map(w=>catalogCategory(key,w)))];
    if(!cats.includes(activeCategory))activeCategory='전체';
    let tabs=$('libTabs');
    tabs.replaceChildren();
    cats.forEach(cat=> {
      let b=document.createElement('button');
      b.className='libtab'+(cat===activeCategory?' active':'');
      b.textContent=cat;
      b.onclick=()=> {
        activeCategory=cat;
        drawLibrary()
      }
      ;
      tabs.appendChild(b)
    }
    );
    let query=$('libSearch').value.trim().toLowerCase();
    let filtered=pool.filter(w=>(activeCategory==='전체'||catalogCategory(key,w)===activeCategory)&&w.toLowerCase().includes(query));
    let grid=$('libGrid');
    grid.replaceChildren();
    filtered.forEach(word=> {
      let b=document.createElement('button');
      b.className='libitem'+(values[key]===word?' selected':'');
      b.textContent=word;
      b.onclick=()=> {
        loadedResult=null;
        values[key]=word;
        if(key==='object')legacyObject=null;
        locks[key]=true;
        renderResult();
        closeLibrary();
        notice('선택한 재료가 잠금 처리되었습니다.')
      }
      ;
      grid.appendChild(b)
    }
    );
    if(!filtered.length) {
      let p=document.createElement('p');
      p.className='libempty';
      p.textContent='검색 결과가 없습니다. 재료를 직접 입력할 수 있습니다.';
      grid.appendChild(p)
    }
    $('libMeta').textContent=`${filtered.length}개 표시 / 전체 ${pool.length}개 · 선택하면 자동 잠금`
  }
  $('closeLibrary').onclick=closeLibrary;
  $('libSearch').oninput=drawLibrary;
  function reroll(force=false) {
    if(activeField!==null)closeLibrary();
    let count=0;
    modes[mode].fields.forEach(([key,,pool])=> {
      if(force||!locks[key]) {
        loadedResult=null;
        values[key]=sample(pool,values[key]);
        if(key==='object')legacyObject=null;
        count++
      }
    }
    );
    if(!count) {
      notice('모든 재료가 잠금 상태입니다.');
      return
    }
    rollCount++;
    drawSlots();
    renderResult();
    $('expPanel').hidden=true
  }
  function renderResult() {
    let m=modes[mode];
    $('resultType').textContent=m.name;
    // Preserve saved wording exactly while its restored materials are unchanged.
    const unchanged=loadedResult&&m.fields.every(([key])=>values[key]===loadedResult.values[key]);
    $('result').textContent=unchanged?loadedResult.text:m.build(values);
    $('expPanel').hidden=true;
    $('count').textContent=`채굴 ${rollCount}회`
  }
  function save() {
    let text=$('result').textContent;
    if(!text||text==='채굴을 시작해 주세요.')return;
    let entry= {
      version:2,legacyObject,
      id:Date.now()+'_'+Math.random().toString(36).slice(2,6),text,mode:mode,values: {
        ...values
      }
      ,time:new Date().toLocaleString('ko-KR', {
        timeZone:'Asia/Tokyo'
      }
      )
    }
    ;
    saves.unshift(entry);
    const stored=persist();
    drawSaved();
    if(stored)notice('아이디어가 저장되었습니다.')
  }
  function persist() {
    try {
      localStorage.setItem(storeKey,JSON.stringify(saves));
      return true
    }
    catch(e) {
      notice('브라우저 저장에 실패했습니다. 텍스트 내보내기를 이용해 주세요.')
    }
  }
  function drawSaved() {
    let box=$('saved');
    box.innerHTML='';
    $('saveCount').textContent=`${saves.length}개 저장`;
    if(!saves.length) {
      let p=document.createElement('p');
      p.className='hint';
      p.textContent='저장된 아이디어가 없습니다.';
      box.appendChild(p);
      return
    }
    saves.forEach(entry=> {
      let item=document.createElement('div');
      item.className='saveditem';
      let t=document.createElement('div');
      t.className='savedtext';
      t.textContent=entry.text;
      let small=document.createElement('small');
      small.textContent=(modes[entry.mode]?.name||'조합')+' · '+entry.time;
      let actions=document.createElement('div');
      actions.className='savedbuttons';
      let load=document.createElement('button');
      load.className='mini';
      load.textContent='작업대에서 열기';
      load.onclick=()=> {
        const restored=core.restore(entry,window.IdeaMineCatalog);
        mode=restored.mode;
        legacyObject=restored.legacyObject;
        values={...restored.values};
        loadedResult={text:entry.text,values:{...values}};
        locks=Object.fromEntries(modes[mode].fields.map(([k])=>[k,true]));
        activeField=null;
        $('library').hidden=true;
        drawModes();
        drawSlots();
        renderResult();
        $('expPanel').hidden=true;
        document.getElementById('screen-idea-mine').scrollTo( {
          top:0,behavior:'smooth'
        }
        )
      }
      ;
      let copy=document.createElement('button');
      copy.className='mini';
      copy.textContent='복사';
      copy.onclick=()=>copyText(entry.text);
      let del=document.createElement('button');
      del.className='mini';
      del.textContent='삭제';
      del.onclick=()=> {
        saves=saves.filter(x=>x.id!==entry.id);
        persist();
        drawSaved()
      }
      ;
      actions.append(load,copy,del);
      item.append(t,small,actions);
      box.appendChild(item)
    }
    )
  }
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      notice('복사되었습니다.')
    }
    catch(e) {
      let area=document.createElement('textarea');
      area.value=text;
      document.body.appendChild(area);
      area.select();
      try {
        if(!document.execCommand('copy'))throw Error('copy');
        notice('복사되었습니다.')
      }
      catch(e2) {
        notice('복사에 실패했습니다. 텍스트를 직접 선택해 주세요.')
      }
      area.remove()
    }
  }
  const questions=[['원인','이 현상이 처음 시작된 이유는 무엇입니까?'],['규칙','이 일이 발생하는 조건은 무엇입니까?'],['대가','이것을 이용할 때 잃게 되는 것은 무엇입니까?'],['사건','이로 인해 누가 어떤 문제에 휘말리게 됩니까?'],['직업','이 현상을 관리하거나 이용하는 직업은 무엇입니까?'],['세계관','이것이 일상인 세계의 생활은 어떻게 달라집니까?'],['예외','이 규칙이 적용되지 않는 대상은 무엇입니까?'],['캐릭터','이 현상을 가장 싫어하는 사람은 누구입니까?'],['역이용','누군가 이 현상을 악용하면 어떤 일이 발생합니까?'],['도구','이 현상을 다루는 도구는 무엇입니까?'],['관계','누가 누구와 협력하거나 충돌하게 됩니까?'],['결과','이 일이 100년 동안 지속되면 어떤 변화가 생깁니까?'],['반전','잘못 알려진 사실은 무엇입니까?'],['약점','가장 사소한 약점은 무엇입니까?'],['발견','어떤 아이가 우연히 이 현상을 발견하면 어떤 일이 발생합니까?'],['규모','이 현상이 마을 전체에서 발생하면 어떤 일이 생깁니까?']];
  function expand() {
    let box=$('expGrid');
    box.innerHTML='';
    for(let i=0;
    i<6;
    i++) {
      let x=questions[(expandOffset+i*3)%questions.length];
      let d=document.createElement('div');
      d.className='exp';
      let b=document.createElement('b');
      b.textContent=x[0];
      let s=document.createElement('span');
      s.textContent=x[1];
      d.append(b,s);
      box.appendChild(d)
    }
    $('expPanel').hidden=false;
    $('expPanel').scrollIntoView( {
      behavior:'smooth',block:'nearest'
    }
    )
  }
  $('roll').onclick=()=>reroll();
  $('unlock').onclick=()=> {
    locks= {}
    ;
    drawSlots();
    notice('모든 잠금이 해제되었습니다.')
  }
  ;
  $('save').onclick=save;
  $('copy').onclick=()=>copyText($('result').textContent);
  $('expand').onclick=()=> {
    expandOffset=0;
    expand()
  }
  ;
  $('refreshExpand').onclick=()=> {
    expandOffset=(expandOffset+5)%questions.length;
    expand()
  }
  ;
  $('export').onclick=()=> {
    if(!saves.length) {
      notice('저장된 아이디어가 없습니다.');
      return
    }
    let content='아이디어 광산 · 발견 기록\n\n'+saves.map((x,i)=>`${i+1}. ${x.text}\n   ${modes[x.mode]?.name||'조합'} · ${x.time}`).join('\n\n');
    let blob=new Blob(['\ufeff'+content], {
      type:'text/plain;charset=utf-8'
    }
    );
    let url=URL.createObjectURL(blob);
    let a=document.createElement('a');
    a.href=url;
    a.download='아이디어_광산_발견기록.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500)
  }
  ;
  drawSaved();
  switchMode(0);
  document.getElementById('btn-idea-mine').onclick=()=>switchScreen('screen-idea-mine',null, {
    type:'instant'
  }
  );
  document.getElementById('mine-home').onclick=()=>goHome();
  $('library').addEventListener('keydown',e=> {
    if(e.key==='Escape')closeLibrary()
  }
  );
}
)();

// Scoped pointer feedback also covers Safari touch presses and generated buttons.
(()=>{
  const screen = document.getElementById('screen-idea-mine');
  let pressed = null;
  const release = () => { pressed?.classList.remove('is-pressing'); pressed = null; };
  screen.addEventListener('pointerdown', event => {
    release();
    const button = event.target.closest('button');
    if (button && !button.disabled && event.isPrimary && event.button === 0) {
      pressed = button;
      pressed.classList.add('is-pressing');
    }
  }, {passive:true});
  for (const event of ['pointerup', 'pointercancel']) document.addEventListener(event, release, {passive:true});
  screen.addEventListener('scroll', release, {capture:true, passive:true});
  window.addEventListener('blur', release);
})();
