/* ════════════════════════════════════════════════
   DATA ASSEMBLY
   각 데이터 파일에서 NAV_DATA / CARD_DATA 조립
════════════════════════════════════════════════ */
const NAV_DATA = {
  character:  CHARACTER_NAV,
  narrative2: NARRATIVE_NAV,
  world:      WORLD_NAV,
  compass:    COMPASS_NAV,
};

const CARD_DATA = {
  ...CHARACTER_CARDS,
  ...NARRATIVE_CARDS,
  ...WORLD_CARDS,
  ...COMPASS_CARDS,
};


/* ════════════════════════════════════════════════
   STATE  
════════════════════════════════════════════════ */
let currentNav   = 'character';
let currentSubId = null;
let selectedCards = {};   // { subId: Set<idx> }
let focusedCard  = null;  // { subId, idx, name, icon }
let infoSlideCategory = false; // false=카드, true=카테고리


function getCardDescription(name) {
  if (focusedCard) {
    const data = CARD_DATA[focusedCard.subId];
    let card = null;
    if (data && data.groups) {
      const groupIdx = Math.floor(focusedCard.idx / 1000);
      const cardIdx  = focusedCard.idx % 1000;
      card = data.groups[groupIdx]?.cards[cardIdx];
    } else if (Array.isArray(data)) {
      card = data[focusedCard.idx];
    }
    if (card && card.desc) return card.desc;
  }
  return `${name} — 설명&서사적 활용 예시 준비중`;
}

function getSubDescription(subId) {
  const navInfo = Object.values(NAV_DATA).find(n => n.subs.find(s => s.id === subId));
  const sub = navInfo ? navInfo.subs.find(s => s.id === subId) : null;
  const label = sub ? sub.label : subId;
  return `[${label}] 카테고리에 대한 설명이 여기에 표시됩니다. 추후 카테고리별 가이드와 활용 예시가 추가될 예정입니다.`;
}

/* ════════════════════════════════════════════════
   OPENING ANIMATION   오프닝
════════════════════════════════════════════════ */
  // 검은 화면의 시간 300 에서 100으로 줄임 다시300
const FADE_MS = 150;

window.addEventListener('load', () => {
  const content = document.getElementById('opening-content');
  const divider = document.getElementById('opening-divider');

  // 페이드인 + 선 확장 (동시에, 약 0.5초 분량에서 수정함 100에서 130 )
  setTimeout(() => {
    content.classList.add('visible');
    divider.classList.add('expand');
  }, 130);

  // 짧은 정지 후 페이드 아웃 (페이드인+선확장의 시간과 여기 시간을 빼면 제목표시시간. 1500에서 1100로 수정)
  setTimeout(() => content.classList.add('fade-out'), 1100);

  // 디졸브로 홈 화면 전환 (전체 약 2.1초에서 1.2초 변경 1.9초) 
  setTimeout(() => {
    switchScreen('screen-home', null, true);
  }, 1300);
});

initInfoSliderSwipe();

/* ════════════════════════════════════════════════
   SCREEN TRANSITION
════════════════════════════════════════════════ */
function switchScreen(targetId, callback, useFade) {
  const screens = document.querySelectorAll('.screen');
  const target = document.getElementById(targetId);

  if (!useFade) {
    screens.forEach(s => {
      s.classList.add('no-transition');
      s.classList.remove('active');
    });
    target.classList.add('active');
    requestAnimationFrame(() => {
      screens.forEach(s => s.classList.remove('no-transition'));
    });
    if (callback) callback();
    return;
  }

  const current = document.querySelector('.screen.active');
  if (current && current.id !== targetId) {
    current.classList.remove('active');
  }

  setTimeout(() => {
    screens.forEach(s => s.classList.remove('active'));
    target.classList.add('active');
    if (callback) callback();
  }, FADE_MS);
}

/* ════════════════════════════════════════════════
   NAVIGATION
════════════════════════════════════════════════ */
function goHome() {
  closeDetailSheet();
  closeStatusOverlay();
  const create = document.getElementById('screen-create');
  if (create) create.classList.remove('entering');
  switchScreen('screen-home', null, true);
}
function goToNarrative() {
  switchScreen('screen-narrative', null, true);
}
function goToCreate() {
  // 메뉴 패널 상태 초기화
  extraMenuOpen = false;
  const panel = document.getElementById('extra-menu-panel');
  const btn   = document.getElementById('btn-extra-menu');
  const icon  = document.getElementById('extra-menu-icon');
  if (panel) panel.classList.remove('open');
  if (btn)   btn.classList.remove('open');
  if (icon)  icon.textContent = '☰';

  switchScreen('screen-create', () => {
    const create = document.getElementById('screen-create');
    create.classList.remove('entering');
    void create.offsetWidth;
    create.classList.add('entering');
    setTimeout(() => create.classList.remove('entering'), 600);
    switchNav('character', true);
  }, true);
}

/* ════════════════════════════════════════════════
   MAIN NAV SWITCH
════════════════════════════════════════════════ */
function switchNav(navId, skipAnimation) {
  if (navId === currentNav && !skipAnimation) return;

  const prev = currentNav;
  currentNav = navId;
  currentSubId = null;

  // 버튼 상태 (부드러운 전환 — CSS transition)
  document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
  const navMap = { character:'nav-character', narrative2:'nav-narrative2', world:'nav-world', compass:'nav-compass' };
  const nb = document.getElementById(navMap[navId]);
  if (nb) nb.classList.add('active');

  // 부분 초기화 버튼 텍스트
  document.getElementById('btn-partial-reset').textContent = NAV_DATA[navId].resetLabel;

  // 서브 메뉴 렌더
  renderSubnav(navId, !skipAnimation && prev !== navId);

  // 중앙 기본 상태로
  focusedCard = null;
  showDefaultCenter();
  updateInfoPanel();
}

function renderSubnav(navId, animate) {
  const scroll = document.getElementById('subnav-scroll');
  scroll.innerHTML = '';

  const subs = NAV_DATA[navId].subs;
  subs.forEach((sub, i) => {
    const item = document.createElement('div');
    item.className = 'subnav-item pressable' + (animate ? ' reveal' : '');
    item.style.animationDelay = animate ? (i * 0.08) + 's' : '0s';    /* 마름모 등장 속도 05빠름,높으면 느림 0.10 밑에 i0.0에도 적용해야함*/
    item.setAttribute('data-sub-id', sub.id);
    item.onclick = () => selectSub(sub.id, navId);

    const count = selectedCards[sub.id] ? selectedCards[sub.id].size : 0;

    item.innerHTML = `
      <div class="diamond-btn" style="animation-delay:${animate ? i*0.08 : 0}s">  
    <span class="diamond-btn-icon">${renderIcon(sub.icon, sub.img, 'diamond-img')}</span>
  </div>
  ${count > 0 ? `<div class="selection-badge">${count}</div>` : ''}
  <div class="subnav-label">${sub.label}</div>
    `;
    scroll.appendChild(item);
  });
}

/* ════════════════════════════════════════════════
   SUB MENU SELECT
════════════════════════════════════════════════ */
function selectSub(subId, navId) {
  // 이전 active 제거
  document.querySelectorAll('.subnav-item').forEach(el => el.classList.remove('active'));
  // 현재 active
  const el = document.querySelector(`[data-sub-id="${subId}"]`);
  if (el) el.classList.add('active');

  const same = currentSubId === subId;
  currentSubId = subId;
  if (!same) {
    focusedCard = null;
    setInfoSlide(false);
  }

  showCardPage(subId, !same);
  updateInfoPanel();
}

/* ════════════════════════════════════════════════
   CENTER DISPLAY
════════════════════════════════════════════════ */
function showDefaultCenter() {
  const area = document.getElementById('center-area');

  // 기존 동적 페이지 제거
  area.querySelectorAll('.center-page:not(#page-default)').forEach(p => p.remove());

  const def = document.getElementById('page-default');
  def.classList.add('active');
}



/* ════════════════════════════════════════════════
   그룹 선택 화면 렌더
   ─ type:'group' 인 카테고리를 클릭했을 때 열리는 화면
   ─ 버튼 수를 늘리려면 CARD_DATA 의 groups 배열에 항목 추가만 하면 됨
════════════════════════════════════════════════ */
function showGroupPage(subId, animate = true) {
  const area = document.getElementById('center-area');

  // 기존 페이지 제거
  document.querySelectorAll('.center-page:not(#page-default)').forEach(p => p.remove());

  const data = CARD_DATA[subId];
  if (!data || !data.groups) return;

  const page = document.createElement('div');
  page.className = 'center-page active';
  page.id = 'page-' + subId;

  // 그룹 버튼들을 세로로 나열 (3x1, 6x1 등 groups 배열 길이에 따라 자동)
  let html = '<div class="group-select-wrap">';
  data.groups.forEach((grp, i) => {
    const delay = animate ? `style="animation-delay:${i * 0.08}s"` : '';
const grpCount = grp.cards.reduce((sum, _, cIdx) => {
      return sum + (selectedCards[subId]?.has(i * 1000 + cIdx) ? 1 : 0);
    }, 0);
    html += `
      <button
        class="group-select-btn pressable group-deal"
        ${delay}
        onclick="showGroupCards('${subId}', ${i})"
      >
        <span class="group-btn-icon">${grp.icon}</span>
        <span class="group-btn-label">${grp.label}</span>
        ${grpCount > 0 ? `<div class="group-badge">${grpCount}</div>` : ''}
      </button>
    `;
    // ↑ 버튼 하나당 이 블록 하나.
    // groups 배열에 항목 추가하면 버튼 자동으로 늘어남
  });
  html += '</div>';

  page.innerHTML = html;
  area.appendChild(page);

  // group-deal 애니메이션 끝난 뒤 클래스 제거 → pressable 눌림효과 항상 작동
  page.querySelectorAll('.group-deal').forEach(btn => {
    btn.addEventListener('animationend', () => btn.classList.remove('group-deal'), { once: true });
  });
}

/* ════════════════════════════════════════════════
   그룹 버튼 클릭 → 해당 그룹의 카드 목록 열기
════════════════════════════════════════════════ */
function showGroupCards(subId, groupIdx) {
  const area = document.getElementById('center-area');
  const data = CARD_DATA[subId];
  if (!data || !data.groups) return;

  const grp = data.groups[groupIdx];
  if (!grp) return;

  // 기존 페이지 제거
  document.querySelectorAll('.center-page:not(#page-default)').forEach(p => p.remove());

  const page = document.createElement('div');
  page.className = 'center-page active';
  page.id = 'page-' + subId + '_' + grp.id;

  // storeKey = subId (종족 전체로 통합)
  if (!selectedCards[subId]) selectedCards[subId] = new Set();

  // 카드 idx = groupIdx * 1000 + cardIdx (그룹 구분용 오프셋)
  const offset = groupIdx * 1000;

  let html = `<div class="section-label">${grp.icon} ${grp.label}</div>`;
  html += '<div class="card-grid">';
  grp.cards.forEach((card, idx) => {
    const globalIdx = offset + idx;
    const sel = selectedCards[subId].has(globalIdx) ? ' selected' : '';
    html += `
  <div class="data-card pressable card-deal${sel}"
    style="animation-delay:${idx * 0.04}s"
    onclick="groupCardClick('${subId}', ${groupIdx}, ${idx})"
    ondblclick="groupCardDblClick('${subId}', ${groupIdx}, ${idx})"
    onmousedown="startLongPress(this,'group','${subId}',${groupIdx},${idx})"
    ontouchstart="startLongPress(this,'group','${subId}',${groupIdx},${idx})"
    onmouseup="cancelLongPress()" ontouchend="cancelLongPress()"
    onmouseleave="cancelLongPress()" ontouchcancel="cancelLongPress()">
        
        <div class="card-img-frame">${renderIcon(card.icon, card.img, 'card-img')}</div>
        <div class="card-name">${card.name}</div>
      </div>
    `;
  });
  html += '</div>';
  page.innerHTML = html;
  area.appendChild(page);

  // card-deal 애니메이션 끝난 뒤 클래스 제거 → pressable 눌림효과 항상 작동
  page.querySelectorAll('.card-deal').forEach(card => {
    card.addEventListener('animationend', () => card.classList.remove('card-deal'), { once: true });
  });
}

/* 그룹 카드 클릭 — info 패널 업데이트 */
function groupCardClick(subId, groupIdx, idx) {
  const grp = CARD_DATA[subId].groups[groupIdx];
  const card = grp.cards[idx];
  const globalIdx = groupIdx * 1000 + idx;
  focusedCard = { subId, idx: globalIdx, name: card.name, icon: card.icon, img: card.img };
  setInfoSlide(false);
  updateInfoPanel();
}

/* 그룹 카드 더블클릭 — 선택/해제 */
function groupCardDblClick(subId, groupIdx, idx) {
  const globalIdx = groupIdx * 1000 + idx;
  if (!selectedCards[subId]) selectedCards[subId] = new Set();
  if (selectedCards[subId].has(globalIdx)) {
    selectedCards[subId].delete(globalIdx);
  } else {
    selectedCards[subId].add(globalIdx);
  }

  // 카드 DOM 토글 (애니메이션 재발생 없음, 더블클릭 후 카드 뒤집는 모션 오류 수정한듯)
  const page = document.getElementById('page-' + subId + '_' + CARD_DATA[subId].groups[groupIdx].id);
  if (page) {
    const cards = page.querySelectorAll('.data-card');
    if (cards[idx]) {
      cards[idx].classList.remove('card-deal');
      cards[idx].classList.toggle('selected', selectedCards[subId].has(globalIdx));
    }
  }

// 그룹 페이지가 현재 열려있으면 배지 갱신, 없으면 패스 (showGroupPage 호출 시 자동 반영)
  const groupPageEl = document.getElementById('page-' + subId);
  if (groupPageEl) updateGroupBadges(subId);

  // focusedCard 동기화
  groupCardClick(subId, groupIdx, idx);

  // 배지 & 상태 갱신
  renderSubnav(currentNav, false);
  const el = document.querySelector(`[data-sub-id="${subId}"]`);
  if (el) el.classList.add('active');
  updateNavBadges();
  refreshStatusIfOpen();
}

function updateGroupBadges(subId) {
  const data = CARD_DATA[subId];
  if (!data || !data.groups) return;
  data.groups.forEach((grp, gIdx) => {
    const btn = document.querySelector(`#page-${subId} .group-select-btn:nth-child(${gIdx + 1})`);
    if (!btn) return;
    const count = grp.cards.reduce((sum, _, cIdx) => {
      return sum + (selectedCards[subId]?.has(gIdx * 1000 + cIdx) ? 1 : 0);
    }, 0);
    let badge = btn.querySelector('.group-badge');
    if (count > 0) {
      if (!badge) {
        badge = document.createElement('div');
        badge.className = 'group-badge';
        btn.appendChild(badge);
      }
      badge.textContent = count;
    } else {
      if (badge) badge.remove();
    }
  });
}


function showCardPage(subId, animate = true) {

  // type:'group' 인 경우 그룹 선택 화면을 열고 종료
  const navInfo2 = Object.values(NAV_DATA).find(n => n.subs.find(s => s.id === subId));
  const subCheck = navInfo2 ? navInfo2.subs.find(s => s.id === subId) : null;
  if (subCheck && subCheck.type === 'group') {
    showGroupPage(subId, animate);
    return;
  }

  const area = document.getElementById('center-area');

  // default 숨기기
  document.getElementById('page-default').classList.remove('active');

  // 기존 페이지 제거
  area.querySelectorAll('.center-page:not(#page-default)').forEach(p => p.remove());

  const page = document.createElement('div');
  page.className = 'center-page active';
  page.id = 'page-' + subId;

  const cards = CARD_DATA[subId] || [];
  const navInfo = Object.values(NAV_DATA).find(n => n.subs.find(s => s.id === subId));
  const subInfo = navInfo ? navInfo.subs.find(s => s.id === subId) : null;
  const label = subInfo ? subInfo.label : subId;

  let html = `<div class="section-label">${label}</div><div class="card-grid">`;

  if (!selectedCards[subId]) selectedCards[subId] = new Set();

  cards.forEach((card, idx) => {
    const sel = selectedCards[subId].has(idx) ? ' selected' : '';
    const deal = animate ? ' card-deal' : '';
    const delay = animate ? ` style="animation-delay:${idx * 0.04}s"` : '';
   html += `
  <div class="data-card pressable${sel}${deal}"${delay}
    onclick="cardClick('${subId}', ${idx})"
    ondblclick="toggleCardSelect('${subId}', ${idx})"
    onmousedown="startLongPress(this,'card','${subId}',${idx})"
    ontouchstart="startLongPress(this,'card','${subId}',${idx})"
    onmouseup="cancelLongPress()"  ontouchend="cancelLongPress()"
    onmouseleave="cancelLongPress()" ontouchcancel="cancelLongPress()">
    
        <div class="card-img-frame">${renderIcon(card.icon, card.img, 'card-img')}</div>
        <div class="card-name">${card.name}</div>
      </div>
    `;
  });

  html += '</div>';
  page.innerHTML = html;
  area.appendChild(page);

  // card-deal 애니메이션 끝난 뒤 클래스 제거 → pressable 눌림효과 항상 작동
  page.querySelectorAll('.card-deal').forEach(card => {
    card.addEventListener('animationend', () => card.classList.remove('card-deal'), { once: true });
  });
}



/* ════════════════════════════════════════════════
════════════════════════════════════════════════ */
function cardClick(subId, idx) {
  const card = CARD_DATA[subId][idx];
  focusedCard = { subId, idx, name: card.name, icon: card.icon, img: card.img };
  setInfoSlide(false);
  updateInfoPanel();
}

function setInfoSlide(showCategory) {
  infoSlideCategory = showCategory;
  const track    = document.getElementById('info-slider-track');
  const viewport = document.getElementById('info-slider-viewport');
  if (!track || !viewport) return;
  // classList 방식 제거 → transform 방식으로 직접 이동
  const w = viewport.offsetWidth;
  const offset = showCategory ? -w : 0;
  track.style.transition = 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)';
  track.style.transform  = `translateX(${offset}px)`;
  // dot 갱신
  const dot0 = document.getElementById('dot-0');
  const dot1 = document.getElementById('dot-1');
  if (dot0 && dot1) {
    dot0.style.transform = showCategory ? 'scale(1)' : 'scale(1.55)';
    dot1.style.transform = showCategory ? 'scale(1.55)' : 'scale(1)';
    dot0.style.opacity   = showCategory ? '0.45' : '1';
    dot1.style.opacity   = showCategory ? '1' : '0.45';
  }
  const hint = document.getElementById('info-swipe-hint');
  if (hint) hint.classList.add('hidden');
}

function initInfoSliderSwipe() {
  const viewport = document.getElementById('info-slider-viewport');
  const track    = document.getElementById('info-slider-track');
  if (!viewport || !track) return;

  let startX   = 0;
  let curX     = 0;
  let dragging = false;
  let baseOffset = 0; // 현재 슬라이드의 시작 오프셋 (0 or -50%)

  function getSlideWidth() {
    return viewport.offsetWidth;
  }

  function applyTransform(offsetPx, animate) {
    track.style.transition = animate
      ? 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)'
      : 'none';
    track.style.transform = `translateX(${offsetPx}px)`;
    updateDots(offsetPx);
  }

  function updateDots(offsetPx) {
    const w = getSlideWidth();
    // 0px = 카드(왼쪽), -w = 카테고리(오른쪽)
    // ratio: 0(카드) ~ 1(카테고리)
    const ratio = Math.min(1, Math.max(0, -offsetPx / w));
    const dot0 = document.getElementById('dot-0');
    const dot1 = document.getElementById('dot-1');
    if (!dot0 || !dot1) return;
    // 큰 점이 ratio에 따라 오른쪽으로 이동
    // dot0: ratio=0일때 크게, dot1: ratio=1일때 크게
    const s0 = 1 + (1 - ratio) * 0.55; // 1 ~ 1.55
    const s1 = 1 + ratio * 0.55;
    dot0.style.transform = `scale(${s0})`;
    dot1.style.transform = `scale(${s1})`;
    dot0.style.opacity = 0.45 + (1 - ratio) * 0.55;
    dot1.style.opacity = 0.45 + ratio * 0.55;
  }

  function snapToSlide(targetCategory) {
    infoSlideCategory = targetCategory;
    baseOffset = targetCategory ? -getSlideWidth() : 0;
    applyTransform(baseOffset, true);
    updateDots(baseOffset);
    // hint 숨기기
    const hint = document.getElementById('info-swipe-hint');
    if (hint) hint.classList.add('hidden');
  }

  function onStart(clientX) {
    if (!currentSubId) return;
    startX = clientX;
    curX   = clientX;
    dragging = true;
    baseOffset = infoSlideCategory ? -getSlideWidth() : 0;
    track.style.transition = 'none';
  }

  function onMove(clientX) {
    if (!dragging || !currentSubId) return;
    curX = clientX;
    const dx = curX - startX;
    // 경계에서 저항감 (rubber band)
    let offset = baseOffset + dx;
    const w = getSlideWidth();
    if (offset > 0)        offset = offset * 0.25;
    if (offset < -w)       offset = -w + (offset + w) * 0.25;
    applyTransform(offset, false);
  }

  function onEnd() {
    if (!dragging || !currentSubId) return;
    dragging = false;
    const dx = curX - startX;
    const w  = getSlideWidth();
    const THRESHOLD = w * 0.2; // 20%만 넘어도 전환
    if (dx < -THRESHOLD && !infoSlideCategory) {
      snapToSlide(true);
    } else if (dx > THRESHOLD && infoSlideCategory) {
      snapToSlide(false);
    } else {
      // 원래 위치로 복귀
      applyTransform(baseOffset, true);
      updateDots(baseOffset);
    }
  }

  // Touch
  viewport.addEventListener('touchstart', (e) => onStart(e.touches[0].clientX), { passive: true });
  viewport.addEventListener('touchmove',  (e) => onMove(e.touches[0].clientX),  { passive: true });
  viewport.addEventListener('touchend',   (e) => onEnd(), { passive: true });

  // Mouse
  viewport.addEventListener('mousedown', (e) => { e.preventDefault(); onStart(e.clientX); });
  window.addEventListener('mousemove',   (e) => onMove(e.clientX));
  window.addEventListener('mouseup',     ()  => onEnd());
}

function updateInfoPanel() {
  const emptyEl = document.getElementById('info-empty');
  const sliderWrap = document.getElementById('info-slider-wrap');
  const selectBtn = document.getElementById('info-select-btn');

  if (!currentSubId) {
    emptyEl.classList.remove('hidden');
    sliderWrap.classList.add('hidden');
    return;
  }

  emptyEl.classList.add('hidden');
  sliderWrap.classList.remove('hidden');

  const navInfo = Object.values(NAV_DATA).find(n => n.subs.find(s => s.id === currentSubId));
  const subInfo = navInfo ? navInfo.subs.find(s => s.id === currentSubId) : null;

  document.getElementById('info-cat-icon').innerHTML = subInfo ? renderIcon(subInfo.icon, subInfo.img, 'info-icon-img') : '✦';
  document.getElementById('info-cat-name').textContent = subInfo ? subInfo.label : currentSubId;
  document.getElementById('info-cat-desc').textContent = getSubDescription(currentSubId);

  if (focusedCard && focusedCard.subId === currentSubId) {
    document.getElementById('info-card-icon').innerHTML = renderIcon(focusedCard.icon, focusedCard.img, 'info-icon-img');
    document.getElementById('info-card-name').textContent = focusedCard.name;
    document.getElementById('info-card-desc').textContent = getCardDescription(focusedCard.name);
    const isSelected = selectedCards[focusedCard.subId] && selectedCards[focusedCard.subId].has(focusedCard.idx);
    selectBtn.textContent = isSelected ? '취소' : '선택';
    selectBtn.classList.toggle('is-selected', isSelected);
    // 카드 선택 시 버튼 다시 표시
    const cardActions = document.querySelector('.info-slide-card .info-actions');
    if (cardActions) cardActions.classList.remove('info-actions-hidden');
    setInfoSlide(false);
  } else {
    document.getElementById('info-card-icon').innerHTML = '?';
    document.getElementById('info-card-name').textContent = '카드 미선택';
    document.getElementById('info-card-desc').textContent = '카드를 탭하면 이곳에 항목 설명이 표시됩니다.';
    selectBtn.textContent = '선택';
    selectBtn.classList.remove('is-selected');
    // 카드 미선택 시 버튼 숨김
    const cardActions = document.querySelector('.info-slide-card .info-actions');
    if (cardActions) cardActions.classList.add('info-actions-hidden');
    setInfoSlide(true);
  }

  const hint = document.getElementById('info-swipe-hint');
  if (hint) hint.classList.remove('hidden');
}

function selectCurrentCard() {
  if (!focusedCard) return;
  // 그룹 타입 카드인지 판별 (globalIdx >= 0, subId에 groups가 있으면)
  const data = CARD_DATA[focusedCard.subId];
  if (data && data.groups) {
    // globalIdx에서 groupIdx, cardIdx 역산
    const groupIdx = Math.floor(focusedCard.idx / 1000);
    const cardIdx = focusedCard.idx % 1000;
    groupCardDblClick(focusedCard.subId, groupIdx, cardIdx);
  } else {
    toggleCardSelect(focusedCard.subId, focusedCard.idx);
  }
}

function toggleCardSelect(subId, idx) {
  if (!selectedCards[subId]) selectedCards[subId] = new Set();
  if (selectedCards[subId].has(idx)) {
    selectedCards[subId].delete(idx);
  } else {
    selectedCards[subId].add(idx);
  }

  // 카드 UI 업데이트
  const page = document.getElementById('page-' + subId);
  if (page) {
    const cards = page.querySelectorAll('.data-card');
    cards.forEach((card, i) => {
      if (i === idx) {
        card.classList.toggle('selected', selectedCards[subId].has(idx));
      }
    });
  }

  // 서브메뉴 배지 업데이트
  renderSubnav(currentNav, false);
  if (currentSubId) {
    const el = document.querySelector(`[data-sub-id="${currentSubId}"]`);
    if (el) el.classList.add('active');
  }

  // 설명창 선택 버튼 업데이트
  if (focusedCard && focusedCard.subId === subId && focusedCard.idx === idx) {
    updateInfoPanel();
  }
  refreshStatusIfOpen();
   updateNavBadges();  /* ← 여기 추가, 선택한 카드 총량 표시 추가*/
}

function openDetailSheet(mode) {
  if (mode === 'card' && !focusedCard) return;
  if (mode === 'category' && !currentSubId) return;

  const iconEl   = document.getElementById('detail-icon');
  const nameEl   = document.getElementById('detail-name');
  const descEl   = document.getElementById('detail-desc');
  const divEl    = document.getElementById('detail-divider');
  const bodyEl   = document.getElementById('detail-body');

  if (mode === 'card' && focusedCard) {
    // 카드 데이터 꺼내기
    const data = CARD_DATA[focusedCard.subId];
    let card = null;
    if (data && data.groups) {
      const groupIdx = Math.floor(focusedCard.idx / 1000);
      const cardIdx  = focusedCard.idx % 1000;
      card = data.groups[groupIdx]?.cards[cardIdx];
    } else if (Array.isArray(data)) {
      card = data[focusedCard.idx];
    }

    iconEl.innerHTML  = renderIcon(focusedCard.icon, focusedCard.img, 'detail-card-img');
    nameEl.textContent = focusedCard.name;
    descEl.textContent = card?.desc || '';
    divEl.style.display = card?.detail ? '' : 'none';
    bodyEl.textContent  = card?.detail || '';

  } else if (mode === 'category') {
    const navInfo = Object.values(NAV_DATA).find(n => n.subs.find(s => s.id === currentSubId));
    const sub = navInfo ? navInfo.subs.find(s => s.id === currentSubId) : null;
    iconEl.innerHTML   = sub ? renderIcon(sub.icon, sub.img, 'detail-card-img') : '✦';
    nameEl.textContent = sub ? sub.label : currentSubId;
    descEl.textContent = getSubDescription(currentSubId);
    divEl.style.display = 'none';
    bodyEl.textContent  = '';
  }

  document.getElementById('detail-overlay').classList.add('active');
  attachSwipeToClose(
    document.querySelector('.detail-sheet'),
    () => document.getElementById('detail-overlay').classList.remove('active')
  );
}

function closeDetailSheet(e) {
  if (e && e.target !== document.getElementById('detail-overlay')) return;
  document.getElementById('detail-overlay').classList.remove('active');
}

/* ════════════════════════════════════════════════
   STATUS OVERLAY
════════════════════════════════════════════════ */
function openStatusOverlay() {
  renderStatusContent();
  document.getElementById('status-overlay').classList.add('active');
  attachSwipeToClose(
    document.querySelector('.status-panel'),
    () => document.getElementById('status-overlay').classList.remove('active')
  );
}

function closeStatusOverlay(e) {
  if (e && e.target !== document.getElementById('status-overlay')) return;
  document.getElementById('status-overlay').classList.remove('active');
}

function renderStatusContent() {
  const body = document.getElementById('status-body');

  // 제목 변경
  const titleEl = document.getElementById('status-title');
  if (titleEl) titleEl.textContent = '아이디어 통합';

  // 각 nav 섹션 렌더링 헬퍼
  function renderSection(navKey) {
    const nav = NAV_DATA[navKey];
    if (!nav) return '';
    let itemsHtml = '';
    let hasAny = false;

    nav.subs.forEach(sub => {
      const set = selectedCards[sub.id];
      if (!set || set.size === 0) return;
      hasAny = true;
      itemsHtml += `<div class="status-sub"><div class="status-sub-label">${sub.label}</div><div class="status-chips">`;

      const data = CARD_DATA[sub.id];
      set.forEach(globalIdx => {
        let card = null;
        if (data && data.groups) {
          const groupIdx = Math.floor(globalIdx / 1000);
          const cardIdx = globalIdx % 1000;
          card = data.groups[groupIdx]?.cards[cardIdx];
        } else if (Array.isArray(data)) {
          card = data[globalIdx];
        }
        if (card) {
          itemsHtml += `<span class="status-chip">${card.icon} ${card.name}</span>`;
        }
      });

      itemsHtml += '</div></div>';
    });

    const content = hasAny ? itemsHtml : '<div class="status-empty">선택 없음</div>';
    return `<div class="status-section"><div class="status-section-title">${nav.label}</div>${content}</div>`;
  }

  // 2컬럼: 왼쪽 = 캐릭터 + 세계관 / 오른쪽 = 스토리 + 나침반
  body.innerHTML = `
    <div class="status-two-col">
      <div class="status-col status-col-left">
        ${renderSection('character')}
        ${renderSection('world')}
      </div>
      <div class="status-col status-col-right">
        ${renderSection('narrative2')}
        ${renderSection('compass')}
      </div>
    </div>
  `;
}

function shareStatus() {
  showAppNotice('공유 기능은 다음 업데이트 예정입니다.');
}

/* ════════════════════════════════════════════════
   APP DIALOG (confirm / notice)
════════════════════════════════════════════════ */
let appDialogResolve = null;

function showAppDialog(msg, buttons) {
  return new Promise((resolve) => {
    appDialogResolve = resolve;
    const overlay = document.getElementById('app-dialog-overlay');
    const actions = document.getElementById('app-dialog-actions');
    document.getElementById('app-dialog-msg').textContent = msg;
    actions.innerHTML = '';
    buttons.forEach((b) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'app-dialog-btn pressable ' + b.className;
      btn.textContent = b.label;
      btn.onclick = () => closeAppDialog(b.value);
      actions.appendChild(btn);
    });
    overlay.classList.add('active');

    // 외부(오버레이 배경) 클릭시 취소(false)로 닫기
    function onOverlayClick(e) {
      if (e.target === overlay) {
        overlay.removeEventListener('click', onOverlayClick);
        closeAppDialog(false);
      }
    }
    overlay.addEventListener('click', onOverlayClick);
  });
}

function closeAppDialog(value) {
  document.getElementById('app-dialog-overlay').classList.remove('active');
  if (appDialogResolve) {
    const r = appDialogResolve;
    appDialogResolve = null;
    r(value);
  }
}

function showAppNotice(msg) {
  return showAppDialog(msg, [
    { label: '확인', className: 'app-dialog-btn-single', value: true }
  ]);
}

function showAppConfirm(msg) {
  return showAppDialog(msg, [
    { label: '아니오', className: 'app-dialog-btn-cancel', value: false },
    { label: '예', className: 'app-dialog-btn-confirm', value: true }
  ]);
}

function refreshStatusIfOpen() {
  const overlay = document.getElementById('status-overlay');
  if (overlay && overlay.classList.contains('active')) {
    renderStatusContent();
  }
}

/* ════════════════════════════════════════════════
   RESET
════════════════════════════════════════════════ */
async function partialReset() {
  const label = NAV_DATA[currentNav].label;
  const ok = await showAppConfirm(`${label} 탭의 선택을 모두 초기화할까요?`);
  if (!ok) return;
  const subs = NAV_DATA[currentNav].subs;
  subs.forEach(sub => { delete selectedCards[sub.id]; });
  if (currentSubId) showCardPage(currentSubId, false);
  renderSubnav(currentNav, false);
  if (currentSubId) {
    const el = document.querySelector(`[data-sub-id="${currentSubId}"]`);
    if (el) el.classList.add('active');
  }
  updateInfoPanel();
   updateNavBadges();  // ← 여기 추가,  선택한 총량 표시 배지 추가
  refreshStatusIfOpen();
}

async function fullReset() {
  const ok = await showAppConfirm('모든 선택을 초기화할까요?');
  if (!ok) return;
  selectedCards = {};
  if (currentSubId) showCardPage(currentSubId, false);
  renderSubnav(currentNav, false);
  if (currentSubId) {
    const el = document.querySelector(`[data-sub-id="${currentSubId}"]`);
    if (el) el.classList.add('active');
  }
  updateInfoPanel();
   updateNavBadges();  // ← 여기 추가,  선택한 총량 표시 배지 추가
  refreshStatusIfOpen();
}


    // 해당 탭 전체 선택 수 합산 하단 탭 배지 렌더 함수
function updateNavBadges() {
  Object.keys(NAV_DATA).forEach(navId => {
    const navMap = {
      character: 'nav-character',
      narrative2: 'nav-narrative2',
      world: 'nav-world',
      compass: 'nav-compass'
    };
    const btn = document.getElementById(navMap[navId]);
    if (!btn) return;

    // 해당 탭 전체 선택 수 합산 
    const total = NAV_DATA[navId].subs.reduce((sum, sub) => {
      return sum + (selectedCards[sub.id] ? selectedCards[sub.id].size : 0);
    }, 0);

    // 기존 배지 제거 후 다시 렌더
    const existing = btn.querySelector('.nav-badge');
    if (existing) existing.remove();
    if (total > 0) {
      const badge = document.createElement('div');
      badge.className = 'nav-badge';
      badge.textContent = total;
      btn.appendChild(badge);
    }
  });
}

/* ════════════════════════════════════════════════
   RENDER ICON (이모지 or 이미지 자동 분기)
════════════════════════════════════════════════ */
function renderIcon(icon, img, className) {
  if (img) {
    return `<img src="${img}" class="${className}" alt="">`;
  }
  return icon || '';
}

/* ════════════════════════════════════════════════
   UTIL
════════════════════════════════════════════════ */
function escHtml(s) {
  return s.replace(/'/g, "\\'");
}

/* ════════════════════════════════════════════════
   EXTRA MENU TOGGLE
════════════════════════════════════════════════ */
let extraMenuOpen = false;

function toggleExtraMenu() {
  extraMenuOpen = !extraMenuOpen;
  const panel = document.getElementById('extra-menu-panel');
  const btn   = document.getElementById('btn-extra-menu');
  const icon  = document.getElementById('extra-menu-icon');

  panel.classList.toggle('open', extraMenuOpen);
  btn.classList.toggle('open', extraMenuOpen);

  // 닫혀있을때 ☰, 열려있을때 삼각형 ▲
  icon.textContent = extraMenuOpen ? '▼' : '☰';
}

/* ════════════════════════════════════════════════
   RANDOM SELECT
════════════════════════════════════════════════ */

// 현재 탭의 현재 서브(마름모) 카드 1개 랜덤 선택
async function randomSelectCurrent() {
  if (!currentSubId) {
    showAppNotice('먼저 카테고리를 선택해주세요.');
    return;
  }
  const navLabel = NAV_DATA[currentNav].label;
  const subLabel = NAV_DATA[currentNav].subs.find(s => s.id === currentSubId)?.label || currentSubId;
  const ok = await showAppConfirm(`[${navLabel} — ${subLabel}]\n랜덤 선택을 하시겠습니까?`);
  if (!ok) return;

   
const data = CARD_DATA[currentSubId];
  // group 타입 처리
  let allCards = [];
  if (data && data.groups) {
    data.groups.forEach((grp, gIdx) => {
      grp.cards.forEach((card, cIdx) => {
        allCards.push({ globalIdx: gIdx * 1000 + cIdx, ...card });
      });
    });
  } else if (Array.isArray(data)) {
    allCards = data.map((card, idx) => ({ globalIdx: idx, ...card }));
  }
  if (allCards.length === 0) return;

  const pick = allCards[Math.floor(Math.random() * allCards.length)];
  selectedCards[currentSubId] = new Set([pick.globalIdx]);
   

  // UI 갱신
  showCardPage(currentSubId, false);
  renderSubnav(currentNav, false);
  const el = document.querySelector(`[data-sub-id="${currentSubId}"]`);
  if (el) el.classList.add('active');

  // 설명창 갱신
  focusedCard = { subId: currentSubId, idx: pick.globalIdx, name: pick.name, icon: pick.icon, img: pick.img };
  updateInfoPanel();
  refreshStatusIfOpen();
   updateNavBadges();  // ← 여기 추가,  선택한 총량 표시 배지 추가
}

// 현재 탭의 모든 서브(마름모) 각 1개씩 랜덤 선택
async function randomSelectAll() {
  const navLabel = NAV_DATA[currentNav].label;
  const ok = await showAppConfirm(`[${navLabel}]\n모든 카테고리에서 각 1개씩\n랜덤 선택을 하시겠습니까?`);
  if (!ok) return;

  const subs = NAV_DATA[currentNav].subs;
subs.forEach(sub => {
  const data = CARD_DATA[sub.id];
  let allCards = [];
  if (data && data.groups) {
    data.groups.forEach((grp, gIdx) => {
      grp.cards.forEach((card, cIdx) => {
        allCards.push({ globalIdx: gIdx * 1000 + cIdx });
      });
    });
  } else if (Array.isArray(data)) {
    allCards = data.map((_, idx) => ({ globalIdx: idx }));
  }
  if (allCards.length === 0) return;
  const pick = allCards[Math.floor(Math.random() * allCards.length)];
  selectedCards[sub.id] = new Set([pick.globalIdx]);
});
   

  // UI 갱신
  if (currentSubId) showCardPage(currentSubId, false);
  renderSubnav(currentNav, false);
  if (currentSubId) {
    const el = document.querySelector(`[data-sub-id="${currentSubId}"]`);
    if (el) el.classList.add('active');
  }
  updateInfoPanel();
  refreshStatusIfOpen();
   updateNavBadges();  // ← 여기 추가,  선택한 총량 표시 배지 추가
}


/* ════════════════════════════════════════════════
   MOBILE TOUCH — pressable 눌림 효과
   iOS Safari는 :active가 터치에서 작동 안 함
   → touchstart/touchend로 직접 클래스 제어
════════════════════════════════════════════════ */
(function () {
  function onTouchStart(e) {
    const el = e.target.closest('.pressable');
    if (!el) return;
    el.classList.add('is-pressing');
  }

  function onTouchEnd(e) {
    // 현재 누르고 있는 모든 pressable에서 클래스 제거
    document.querySelectorAll('.is-pressing').forEach(el => {
      el.classList.remove('is-pressing');
    });
  }

  document.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('touchend',   onTouchEnd,   { passive: true });
  document.addEventListener('touchcancel',onTouchEnd,   { passive: true });
})();


/* ════════════════════════════════════════════════
   LONG PRESS → 상세 정보 열기
════════════════════════════════════════════════ */
let _lpTimer = null;
let _lpStartX = 0;
let _lpStartY = 0;
const LONG_PRESS_MS = 480; // 꾹 누르는 시간 (ms)

function startLongPress(el, type, subId, a, b) {
  cancelLongPress();
  _lpStartX = event.touches ? event.touches[0].clientX : event.clientX;
  _lpStartY = event.touches ? event.touches[0].clientY : event.clientY;

  _lpTimer = setTimeout(() => {
    _lpTimer = null;
    if (type === 'group') groupCardClick(subId, a, b);
    else cardClick(subId, a);
    openDetailSheet('card');
  }, LONG_PRESS_MS);
}

function cancelLongPress() {
  if (_lpTimer) { clearTimeout(_lpTimer); _lpTimer = null; }
}

/* ════════════════════════════════════════════════
   컨텍스트 메뉴 / 텍스트 선택 차단 (앱처럼)  꾸욱 눌렀을때 전체선택되며뜨는거 차단
════════════════════════════════════════════════ */
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('selectstart', (e) => e.preventDefault());

// 스크롤 중 long press 취소
document.addEventListener('touchmove', (e) => {
  if (_lpTimer) {
    const dx = e.touches[0].clientX - _lpStartX;
    const dy = e.touches[0].clientY - _lpStartY;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) cancelLongPress();
  }
}, { passive: true });

/* ════════════════════════════════════════════════
   SWIPE TO CLOSE (왼쪽 스와이프로 패널 닫기)
════════════════════════════════════════════════ */
function attachSwipeToClose(panelEl, closeFn) {
  if (!panelEl) return;

  // 이전에 붙인 리스너 제거 (중복 방지)
  if (panelEl._swipeCleanup) panelEl._swipeCleanup();

  let startX = null;
  let startY = null;
  let isDragging = false;

  function onTouchStart(e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isDragging = false;
    panelEl.style.transition = 'none';
  }

  function onTouchMove(e) {
    if (startX === null) return;
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;

    // 수평 스와이프 판정 (세로 스크롤과 구분)
    if (!isDragging && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
      isDragging = true;
    }
    if (isDragging && dx < 0) {
      // 왼쪽으로만 이동 (오른쪽은 무시)
      panelEl.style.transform = `translateX(${dx}px)`;
      panelEl.style.opacity = String(Math.max(0, 1 + dx / 200));
    }
  }

  function onTouchEnd(e) {
    if (!isDragging) {
      panelEl.style.transition = '';
      panelEl.style.transform = '';
      panelEl.style.opacity = '';
      startX = null;
      return;
    }
    const dx = e.changedTouches[0].clientX - startX;
    if (dx < -80) {
      // 80px 이상 왼쪽으로 밀었으면 닫기
      panelEl.style.transition = 'transform 0.22s ease, opacity 0.22s ease';
      panelEl.style.transform = 'translateX(-110%)';
      panelEl.style.opacity = '0';
      setTimeout(() => {
        closeFn();
        panelEl.style.transition = '';
        panelEl.style.transform = '';
        panelEl.style.opacity = '';
      }, 220);
    } else {
      // 복원
      panelEl.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
      panelEl.style.transform = '';
      panelEl.style.opacity = '';
      setTimeout(() => { panelEl.style.transition = ''; }, 200);
    }
    startX = null;
    isDragging = false;
  }

  panelEl.addEventListener('touchstart', onTouchStart, { passive: true });
  panelEl.addEventListener('touchmove',  onTouchMove,  { passive: true });
  panelEl.addEventListener('touchend',   onTouchEnd,   { passive: true });

  panelEl._swipeCleanup = () => {
    panelEl.removeEventListener('touchstart', onTouchStart);
    panelEl.removeEventListener('touchmove',  onTouchMove);
    panelEl.removeEventListener('touchend',   onTouchEnd);
  };
}
