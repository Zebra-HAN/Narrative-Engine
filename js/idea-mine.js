/* Isolated workbench: no existing creative data is read or written. */
(()=> {
  'use strict';
  const core = window.IdeaMineCore;
  let legacyObject = null;
  let loadedResult = null;
  let hasMined = false;
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
  const artwork=window.IdeaMineAppearance||{};
  const iconPaths={
    "lock": "<rect x=\"5\" y=\"10\" width=\"14\" height=\"12\" rx=\"2\"/><path d=\"M8 10V6a4 4 0 0 1 8 0v4M12 15v3\"/>",
    "unlock": "<rect x=\"5\" y=\"10\" width=\"14\" height=\"12\" rx=\"2\"/><path d=\"M8 10V6a4 4 0 0 1 8 0M12 15v3\"/>",
    "search": "<circle cx=\"10\" cy=\"10\" r=\"6.5\"/><path d=\"m15 15 7 7\"/>",
    "refresh": "<path d=\"M21 7v5h-5M20.49 17a9 9 0 1 1-2.12-9.36L21 12\"/>",
    "gem": "<path d=\"m12 2 8 8-3 11H7L4 10z\" fill=\"currentColor\" stroke=\"none\"/><path d=\"m12 2-3 8 3 11 3-11z\" fill=\"#fff\" opacity=\".35\" stroke=\"none\"/><path d=\"M4 10h16\" stroke=\"#fff\" opacity=\".4\"/>"
  };
  const uiIcon=name=>'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+iconPaths[name]+'</svg>';
  function visual(name,source) {
    const node=document.createElement('span');node.className=name;
    node.setAttribute('aria-hidden','true');
    if(source) {const img=document.createElement('img');img.src=source;img.alt='';node.append(img);}
    else node.innerHTML=uiIcon('gem');
    return node;
  }

  // Keep catalog records alongside name pools: identical names can belong to different source categories.
  modes.forEach(m=>m.fields.forEach(f=> {
    const records=window.IdeaMineCatalog.materials.filter(x=>x.roles.includes(f[0])&&(!x.modes||x.modes.includes(m.id)));
    f.push(records.map(x=>x.name),records);
  }));
  let mode=0,values= {}
  ,locks= {}
  ,rollCount=0,expandOffset=0,activeField=null,activeCategory='전체';
  const modeStates=new Map();
  function rememberMode() {
    modeStates.set(mode,{values:{...values},locks:{...locks},legacyObject,hasMined,
      loadedResult:loadedResult?{text:loadedResult.text,values:{...loadedResult.values}}:null});
  }
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
  const content=$('content');
  const modePanel=document.querySelector('#screen-idea-mine .mode-panel');
  const miningPage=$('page-mining');
  function resetLibraryLayout() {
    miningPage.classList.remove('is-selecting');
    $('discovery').hidden=false;
    modePanel.hidden=false;
    $('miningActions').hidden=false;
    content.scrollTop=0;
  }
  let currentPage='main', refineryIdea=null, refineryOrigin='main', storageOrigin='main';
  function showPage(page) {
    currentPage=page;
    document.querySelectorAll('#screen-idea-mine .mine-page').forEach(n=>n.hidden=n.id!=='mine-page-'+page);
    $('notice').textContent='';
    $('miningNotice').textContent='';
    switchScreen('screen-idea-mine',null,{type:'instant'});
    document.getElementById('screen-idea-mine').scrollTop=0;
    if(page==='mining' && $('library').hidden) { resetLibraryLayout(); miningPage.scrollTop=0; }
  }
  function openRefinery(fromMining) {
    refineryOrigin=fromMining?'mining':'main';
    refineryIdea=fromMining?{text:$('result').textContent,mode,values:{...values},legacyObject}:null;
    $('refineryResult').textContent=refineryIdea?.text||'전달된 아이디어가 없습니다.';
    $('refineryType').textContent=refineryIdea?modes[refineryIdea.mode].name:'';
    $('refinerySave').disabled=$('refineryExpand').disabled=!refineryIdea;
    $('expPanel').hidden=true;
    showPage('refinery');
    if(refineryIdea) { expandOffset=0; expand(); }
  }
  let dialogPending=false;
  async function mineDialog(message, confirm=true, cancelLabel='아니오') {
    if(dialogPending)return false;
    dialogPending=true;
    const trigger=document.activeElement;
    const overlay=document.getElementById('app-dialog-overlay');
    const dialog=overlay.querySelector('.app-dialog');
    const result=confirm?showAppConfirm(message):showAppNotice(message);
    dialog.setAttribute('role','dialog');
    dialog.setAttribute('aria-modal','true');
    dialog.setAttribute('aria-describedby','app-dialog-msg');
    dialog.setAttribute('aria-label',confirm?'확인':'설명 보기');
    const buttons=[...overlay.querySelectorAll('button')];
    if(confirm)overlay.querySelector('.app-dialog-btn-cancel').textContent=cancelLabel;
    function keydown(e) {
      if(e.key==='Escape') { e.preventDefault(); e.stopImmediatePropagation(); closeAppDialog(false); }
      if(e.key==='Tab') {
        e.preventDefault();
        const i=buttons.indexOf(document.activeElement);
        buttons[(i+(e.shiftKey?-1:1)+buttons.length)%buttons.length].focus();
      }
    }
    document.addEventListener('keydown',keydown,true);
    buttons[0]?.focus({preventScroll:true});
    try { return await result; }
    finally {
      document.removeEventListener('keydown',keydown,true);
      for(const name of ['role','aria-modal','aria-describedby','aria-label'])dialog.removeAttribute(name);
      dialogPending=false;
      if(trigger?.isConnected)trigger.focus({preventScroll:true});
    }
  }
  function sample(arr,prev) {
    const alternatives=arr.filter(x=>x!==prev);
    const pool=alternatives.length?alternatives:arr;
    return pool.length?pool[Math.floor(Math.random()*pool.length)]:''
  }
  function notice(s) {
    const completion=currentPage==='mining'&&['복사되었습니다.','저장되었습니다.'].includes(s);
    const target=completion?$('miningNotice'):$('notice');
    $('notice').textContent='';
    $('miningNotice').textContent='';
    target.textContent=s;
    clearTimeout(notice.timer);
    notice.timer=setTimeout(()=>target.textContent='',2400)
  }
  function drawModes() {
    miningPage.dataset.mode=modes[mode].id;
    const background=artwork.backgrounds?.[modes[mode].id];
    miningPage.style.setProperty('--mine-mode-art',background?'url('+JSON.stringify(background)+')':'none');
    $('modes').innerHTML='';
    modes.forEach((m,i)=> {
      let b=document.createElement('button');
      b.setAttribute('aria-pressed',String(i===mode));
      b.className='mode'+(i===mode?' active':'');
      b.dataset.mode=m.id;
      b.dataset.sound='card';
      const label=document.createElement('span');label.className='mode-label';label.textContent=m.name;
      b.append(visual('mode-art',artwork.modeIcons?.[m.id]),label);
      b.onclick=()=>switchMode(i);
      $('modes').appendChild(b)
    }
    )
  }
  function switchMode(i) {
    rememberMode();
    mode=i;
    const state=modeStates.get(mode);
    legacyObject=state?.legacyObject??null;
    loadedResult=state?.loadedResult??null;
    hasMined=state?.hasMined??false;
    values=state?{...state.values}:Object.fromEntries(modes[mode].fields.map(([key])=>[key,'']));
    locks=state?{...state.locks}:{};
    activeField=null;
    $('library').hidden=true;
    resetLibraryLayout();
    expandOffset=0;
    $('expPanel').hidden=true;
    drawModes();
    drawSlots();
    renderResult()
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
      const nameText=document.createElement('span');nameText.textContent=label;
      name.append(nameText);
      let lock=document.createElement('button');
      lock.className='lock'+(locks[key]?' on':'');
      lock.innerHTML=uiIcon(locks[key]?'lock':'unlock');
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
      input.placeholder='재료 선택';
      input.value=values[key]||'';
      input.setAttribute('aria-label',label);
      input.oninput=()=> {
        loadedResult=null;
        values[key]=input.value;
        if(key==='object')legacyObject=null;
        locks[key]=true;
        d.classList.add('locked');
        lock.classList.add('on');
        lock.innerHTML=uiIcon('lock');
        lock.setAttribute('aria-label',label+' 잠금 해제');
        lock.title='잠금 해제';
        lock.setAttribute('aria-pressed','true');
        single.disabled=true;
        renderResult()
      }
      ;
      let browse=document.createElement('button');
      browse.className='browse';
      browse.dataset.sound='nav';
      browse.innerHTML=uiIcon('search');
      browse.setAttribute('aria-label','목록 선택');
      browse.title=label+' 목록 선택';
      browse.onclick=()=>openLibrary(key);
      let single=document.createElement('button');
      single.className='browse';
      single.dataset.sound='mining3';
      single.innerHTML=uiIcon('refresh');
      single.setAttribute('aria-label','재추첨');
      single.title=label+' 재추첨';
      single.disabled=!!locks[key];
      single.onclick=()=> {
        if(locks[key])return;
        const pool=modes[mode].fields.find(f=>f[0]===key)[2];
        if(!pool.length)return;
        if(activeField!==null)closeLibrary();
        loadedResult=null;
        values[key]=sample(pool,values[key]);
        hasMined=true;
        rollCount++;
        if(key==='object')legacyObject=null;
        drawSlots();
        renderResult()
      }
      ;
      lock.setAttribute('aria-pressed',String(!!locks[key]));
      const tools=document.createElement('div');
      tools.className='slot-tools';
      tools.append(browse,single);
      d.append(head,input,tools);
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
    miningPage.scrollTop=0;
    miningPage.classList.add('is-selecting');
    $('discovery').hidden=true;
    modePanel.hidden=true;
    $('miningActions').hidden=true;
    content.scrollTop=0;
    $('libGrid').scrollTop=0;
    $('closeLibrary').focus({preventScroll:true});

  }
  function closeLibrary() {
    const previous=activeField;
    activeField=null;
    $('library').hidden=true;
    resetLibraryLayout();
    drawSlots();
    if(previous) {
      const i=modes[mode].fields.findIndex(f=>f[0]===previous);
      $('slots').children[i]?.querySelector('.browse')?.focus( {
        preventScroll:true
      }
      );
    }
  }
  function drawLibrary() {
    if(activeField===null)return;
    const field=modes[mode].fields.find(f=>f[0]===activeField);
    if(!field)return;
    const [key,label,pool,records]=field;
    $('libTitle').textContent=label+' · 재료 목록';
    let cats=['전체',...new Set(records.map(x=>x.category))];
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
    let filtered=records.filter(x=>(activeCategory==='전체'||x.category===activeCategory)&&
      [x.name,x.category,x.subcategory||'',x.subcategoryId||''].some(v=>v.toLowerCase().includes(query)));
    let grid=$('libGrid');
    grid.replaceChildren();
    filtered.forEach(material=> {
      const word=material.name;
      let b=document.createElement('button');
      b.className='libitem'+(values[key]===word?' selected':'');
      b.textContent=word;
      if(material.subcategory) {
        const detail=document.createElement('small');
        detail.textContent=`${material.categoryId} ${material.category} / ${material.subcategoryId} ${material.subcategory}`;
        b.appendChild(detail);
        b.title=detail.textContent;
      }
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
  function reroll() {
    if(activeField!==null)closeLibrary();
    let count=0;
    modes[mode].fields.forEach(([key,,pool])=> {
      if(!locks[key]&&pool.length) {
        loadedResult=null;
        values[key]=sample(pool,values[key]);
        if(key==='object')legacyObject=null;
        count++
      }
    }
    );
    if(!count) {
      hasMined=true;
      renderResult();
      notice('모든 재료가 잠금 상태입니다.');
      return
    }
    hasMined=true;
    rollCount++;
    drawSlots();
    renderResult();
    $('expPanel').hidden=true
  }
  function renderResult() {
    let m=modes[mode];
    // Preserve saved wording exactly while its restored materials are unchanged.
    const unchanged=loadedResult&&m.fields.every(([key])=>values[key]===loadedResult.values[key]);
    const hasIdea=Boolean(unchanged||hasMined&&m.fields.some(([key])=>values[key]?.trim()));
    $('result').textContent=unchanged?loadedResult.text:hasIdea?m.build(values):'';
    $('resultType').textContent=hasIdea?m.name:'';
    for(const id of ['save','copy','refineShortcut'])$(id).disabled=!hasIdea;
    $('expPanel').hidden=true;
    $('count').textContent=`채굴 ${rollCount}회`
  }
  async function save() {
    const idea=currentPage==='refinery'?refineryIdea:{text:$('result').textContent,mode,values:{...values},legacyObject};
    if(!idea)return;
    let text=idea.text;
    if(!text||text==='채굴을 시작해 주세요.')return;
    if(!await mineDialog('이 아이디어를 저장하시겠습니까?'))return;
    let entry= {
      version:2,legacyObject:idea.legacyObject,
      id:Date.now()+'_'+Math.random().toString(36).slice(2,6),text,mode:idea.mode,values: {
        ...idea.values
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
    if(stored)notice(currentPage==='mining'?'저장되었습니다.':'아이디어가 저장되었습니다.')
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
        rememberMode();
        mode=restored.mode;
        legacyObject=restored.legacyObject;
        values={...restored.values};
        loadedResult={text:entry.text,values:{...values}};
        hasMined=true;
        locks=Object.fromEntries(modes[mode].fields.map(([k])=>[k,true]));
        activeField=null;
        $('library').hidden=true;
        resetLibraryLayout();
        drawModes();
        drawSlots();
        renderResult();
        $('expPanel').hidden=true;
        showPage('mining');
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
      del.onclick=async()=> {
        if(!await mineDialog('정말 삭제하시겠습니까?'))return;
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
    // Keep the idea at the start of the refinery reading area on entry.
  }
  $('roll').dataset.sound='mining4';
  ['back','home','refineryBack','refineShortcut'].forEach(id=>$(id).dataset.sound='card');
  document.querySelectorAll('[data-mine-main]').forEach(b=>b.dataset.sound='card');
  $('roll').onclick=()=>reroll();
  $('save').onclick=save;
  $('copy').onclick=async()=> {
    const text=$('result').textContent;
    if(await mineDialog('문장을 복사하시겠습니까?',true,'아니요'))await copyText(text);
  };
  $('refineShortcut').onclick=()=>openRefinery(true);
  $('refinerySave').onclick=save;
  $('refineryExpand').onclick=()=> { if(refineryIdea)expand(); };
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
  if(artwork.resultDecoration) {
    const img=document.createElement('img');img.src=artwork.resultDecoration;img.alt='';img.className='result-decoration';
    document.querySelector('#mine-discovery .idea-display').append(img);
  }
  if(artwork.buttonDecoration) {
    const node=document.querySelector('#mine-roll .mine-button-decoration');node.replaceChildren();
    const img=document.createElement('img');img.src=artwork.buttonDecoration;img.alt='';node.append(img);
  }
  drawSaved();
  switchMode(0);
  document.getElementById('btn-idea-mine').onclick=()=>showPage('main');
  $('home').onclick=()=>goHome();
  $('open-mining').onclick=()=>showPage('mining');
  $('back').onclick=()=>showPage('main');
  $('open-guide').onclick=()=>mineDialog('설명 보기\n\n설명은 추후 추가될 예정입니다.',false);
  $('open-storage').onclick=()=> { storageOrigin=currentPage; drawSaved(); showPage('storage'); };
  $('refineryBack').onclick=()=>showPage(refineryOrigin);
  // Match each internal gesture to the page that its existing entry came from.
  window.IdeaMineBackRoute=()=> {
    if(currentPage==='mining'&&!$('library').hidden)return null;
    const target={mining:'main',storage:storageOrigin,refinery:refineryOrigin}[currentPage];
    return target?{target,kind:currentPage==='mining'?'arrow':'screen',commit:()=>showPage(target)}:null;
  };
  document.querySelectorAll('[data-mine-main]').forEach(b=>b.onclick=()=>showPage('main'));
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

// Presentation only: fit long results to the supplied rock without changing ideas.
(()=>{
  const result=document.getElementById('mine-result');
  const surface=result.closest('.idea-display');
  let frame=0;
  function fit() {
    cancelAnimationFrame(frame);
    frame=requestAnimationFrame(()=>{
      if(!surface.clientWidth||!surface.clientHeight)return;
      result.style.fontSize='';
      let size=parseFloat(getComputedStyle(result).fontSize);
      while(size>10&&result.scrollHeight>surface.clientHeight) {
        size=Math.max(10,size-1);
        result.style.fontSize=size+'px';
      }
      result.scrollTop=0;
    });
  }
  new MutationObserver(fit).observe(result,{childList:true,characterData:true,subtree:true});
  new ResizeObserver(fit).observe(surface);
})();

// Map the visible cover image to the rock, independently of the dock's height.
(()=>{
  const screen=document.getElementById('screen-idea-mine');
  const page=document.getElementById('mine-page-mining');
  const content=document.getElementById('mine-content');
  const surface=page.querySelector('.idea-display');
  let frame=0;
  function layout() {
    cancelAnimationFrame(frame);
    frame=requestAnimationFrame(()=>{
      if(page.hidden||page.classList.contains('is-selecting'))return;
      const viewport=screen.getBoundingClientRect(),area=content.getBoundingClientRect();
      if(!viewport.width||!area.height)return;
      const scale=Math.max(viewport.width/1179,viewport.height/2556);
      const imageWidth=1179*scale,imageHeight=2556*scale;
      const offset=Math.max(viewport.height-imageHeight,
        Math.min(0,area.top-viewport.top+area.height*.55-imageHeight*.485));
      screen.style.setProperty('--mine-background-y',offset+'px');
      const imageLeft=(viewport.width-imageWidth)/2;
      const left=Math.max(area.left+6,viewport.left+imageLeft+imageWidth*.20);
      const right=Math.min(area.right-6,viewport.left+imageLeft+imageWidth*.80);
      const top=Math.max(area.top+4,viewport.top+offset+imageHeight*.425);
      const bottom=Math.min(area.bottom-56,viewport.top+offset+imageHeight*.55);
      surface.style.setProperty('--mine-rock-left',left-area.left+'px');
      surface.style.setProperty('--mine-rock-width',Math.max(0,right-left)+'px');
      surface.style.setProperty('--mine-rock-top',top-area.top+'px');
      surface.style.setProperty('--mine-rock-height',Math.max(0,bottom-top)+'px');
    });
  }
  const observer=new ResizeObserver(layout);
  observer.observe(screen);observer.observe(content);
  new MutationObserver(layout).observe(page,{attributes:true,attributeFilter:['hidden','class']});
  window.visualViewport?.addEventListener('resize',layout);
})();
