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
   CREATIVE PAGE BACKGROUNDS
   아래 세 배열/객체의 이미지 주소를 바꾸면 화면 배경을 직접 교체할 수 있습니다.
   - main: 하단의 메인 카테고리를 선택하고 세부 카테고리를 고르기 전의 배경
   - sub: 원형/종족/성격 같은 세부 카테고리 화면의 배경 (선택 입력)
   - group: 종족 안의 인간/엘프 같은 그룹 배경 (선택 입력)

   sub/group에 주소를 적지 않은 항목도 palette의 이미지가 순서대로 적용됩니다.
   데이터 객체에 background: 'images/...'를 직접 추가하면 이 설정보다 우선하며,
   그룹 배경은 그 안의 서브그룹과 카드 화면까지 자동으로 이어집니다.
════════════════════════════════════════════════ */
const CREATIVE_BACKGROUNDS = {
  palette: [
    'images/core/home/bg_map.jpg',
    'images/core/home/bg_explorer.jpg',
  ],
  main: {
    character:  'images/core/home/bg_dinosaur.jpg',
    narrative2: 'images/core/home/bg_wood.jpg',
    world:      'images/core/home/bg_map.jpg',
    compass:    'images/core/home/bg_explorer.jpg',
  },
  sub: {
     archetype: 'images/core/home/bg_wood.jpg',
     race: 'images/core/home/bg_monster.jpg',
     type:  'images/core/home/bg_explorer.jpg',
     
  },
  group: {
     race: { race_fantasy: 'images/core/home/bg_monster.jpg', 
             race_human: 'images/core/home/bg_modern.jpg',
           },
     
    // 예: race: { race_human: 'images/core/home/bg_modern.jpg' },
  },
};

function getCreativeBackground({ navId = currentNav, subId, groupIdx } = {}) {
  const palette = CREATIVE_BACKGROUNDS.palette;
  const nav = NAV_DATA[navId];
  if (!subId) return nav?.background || CREATIVE_BACKGROUNDS.main[navId] || palette[0];

  const subIndex = nav?.subs.findIndex(sub => sub.id === subId) ?? -1;
  const sub = subIndex >= 0 ? nav.subs[subIndex] : getSubInfo(subId);
  const subBackground = sub?.background
    || CREATIVE_BACKGROUNDS.sub[subId]
    || palette[(Math.max(subIndex, 0) + Object.keys(NAV_DATA).indexOf(navId)) % palette.length];

  if (!Number.isInteger(groupIdx)) return subBackground;

  const group = CARD_DATA[subId]?.groups?.[groupIdx];
  return group?.background
    || CREATIVE_BACKGROUNDS.group[subId]?.[group?.id]
    || palette[(groupIdx + Math.max(subIndex, 0)) % palette.length]
    || subBackground;
}

function applyCreativeBackground(location) {
  const area = document.getElementById('center-area');
  if (!area) return;
  const path = getCreativeBackground(location);
  /*
   * 이 값은 css/style.css 안에서 실제 background-image로 사용됩니다. 상대 경로를
   * 그대로 넘기면 브라우저가 CSS 파일 위치(css/)를 기준으로 해석하여
   * css/images/...를 찾게 되고, 이미지 대신 배경색만 보일 수 있습니다.
   * 현재 문서 주소를 기준으로 절대 URL을 만든 뒤 넘겨 어느 배포 경로에서도
   * 올바른 이미지 파일을 가리키게 합니다.
   */
  const imageUrl = new URL(path, document.baseURI).href;
  area.style.setProperty('--creative-background-image', `url(${JSON.stringify(imageUrl)})`);
}


/* ════════════════════════════════════════════════
   STATE  
════════════════════════════════════════════════ */
let currentNav   = 'character';
let currentSubId = null;
let selectedCards = {};   // { subId: Set<idx> }
let selectedDetails = {}; // { "subId__globalIdx": Set<detailItemIdx> }
let selectedSubImages = {}; // { "subId__globalIdx": true }
let focusedCard  = null;  // { subId, idx, name, icon }
let addressTrail = [];

const MAIN_CATEGORY_INFO = {
  character:  { icon: '🛡️', description: '인물의 원형, 종족, 직업, 성격과 관계를 설계합니다.' },
  narrative2: { icon: '📜', description: '이야기의 목표, 갈등, 사건과 흐름을 구성합니다.' },
  world:      { icon: '🌍', description: '작품의 배경이 되는 세계와 사회, 환경을 만듭니다.' },
  compass:    { icon: '🧭', description: '창작의 방향을 점검하고 이야기의 가능성을 탐색합니다.' }
};




function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getCardLocationInfo(subId, globalIdx) {
  const sub = getSubInfo(subId);
  const data = CARD_DATA[subId];
  const info = {
    categoryLabel: sub?.label || subId,
    categoryIcon: sub?.icon,
    categoryImg: sub?.img,
    pathLabels: []
  };

  if (!data || Array.isArray(data) || !data.groups) return info;

  for (let groupIdx = 0; groupIdx < data.groups.length; groupIdx++) {
    const grp = data.groups[groupIdx];
    if (!grp) continue;

    if (grp.subgroups) {
      for (let sgIdx = 0; sgIdx < grp.subgroups.length; sgIdx++) {
        const sg = grp.subgroups[sgIdx];
        const cardIdx = globalIdx - ((groupIdx + 1) * 1000000) - (sgIdx * 1000);
        if (Number.isInteger(cardIdx) && cardIdx >= 0 && cardIdx < (sg?.cards?.length || 0)) {
          info.pathLabels = [grp.label, sg.label].filter(Boolean);
          return info;
        }
      }
      continue;
    }

    const cardIdx = globalIdx - (groupIdx * 1000);
    if (Number.isInteger(cardIdx) && cardIdx >= 0 && cardIdx < (grp.cards?.length || 0)) {
      info.pathLabels = [grp.label].filter(Boolean);
      return info;
    }
  }

  return info;
}

function renderStatusCategoryMeta(subId, globalIdx) {
  const info = getCardLocationInfo(subId, globalIdx);
  const categoryIcon = info.categoryImg
    ? `<img class="status-category-img" src="${escapeHtml(info.categoryImg)}" alt="" draggable="false">`
    : `<span class="status-category-icon-text">${escapeHtml(info.categoryIcon || '◆')}</span>`;
  const pathHtml = info.pathLabels.length > 0
    ? `<span class="status-card-path">${info.pathLabels.map(label => `<span>${escapeHtml(label)}</span>`).join('')}</span>`
    : '';

  return `<div class="status-card-meta">
    <span class="status-category-mark">${categoryIcon}</span>
    <span class="status-category-name">${escapeHtml(info.categoryLabel)}</span>
    ${pathHtml}
  </div>`;
}


const CARD_GRID_LAYOUT_CLASS_BY_COLUMNS = {
  5: 'a',
  4: 'b',
  3: 'c',
  2: 'd',
};

const LEGACY_CARD_GRID_COLUMNS = {
  A: '5',
  B: '4',
  C: '3',
  D: '2',
};

function getCardGridLayoutType(group) {
  const layoutType = String(group?.layoutType ?? '3').toUpperCase();
  const columns = LEGACY_CARD_GRID_COLUMNS[layoutType] || layoutType;
  return CARD_GRID_LAYOUT_CLASS_BY_COLUMNS[columns] ? columns : '3';
}

function getCardGridLayoutClass(group) {
  return `card-grid-layout-${CARD_GRID_LAYOUT_CLASS_BY_COLUMNS[getCardGridLayoutType(group)]}`;
}

function getCardGridOpenTag(group) {
  return `<div class="card-grid ${getCardGridLayoutClass(group)}">`;
}

function markFirstCardRow(page) {
  const firstGrid = page.querySelector('.card-grid');
  const cards = firstGrid ? Array.from(firstGrid.querySelectorAll('.data-card')) : [];
  if (cards.length === 0) return;

  const firstRowTop = cards[0].offsetTop;
  cards.forEach(card => {
    card.classList.toggle('first-row-card', card.offsetTop === firstRowTop);
  });
}

function isSectionItem(item) {
  return item && item.type === 'section';
}

function getGroupCardGlobalIdx(groupIdx, cardIdx) {
  return groupIdx * 1000 + cardIdx;
}

function getSubgroupCardGlobalIdx(groupIdx, subgroupIdx, cardIdx) {
  return (groupIdx + 1) * 1000000 + subgroupIdx * 1000 + cardIdx;
}

function getCardByGlobalIdx(subId, globalIdx) {
  const data = CARD_DATA[subId];
  if (!data) return null;

  if (Array.isArray(data)) {
    const card = data[globalIdx];
    return isSectionItem(card) ? null : card;
  }

  if (!data.groups) return null;

  for (let groupIdx = 0; groupIdx < data.groups.length; groupIdx++) {
    const grp = data.groups[groupIdx];
    if (!grp) continue;

    if (grp.subgroups) {
      for (let sgIdx = 0; sgIdx < grp.subgroups.length; sgIdx++) {
        const sg = grp.subgroups[sgIdx];
        if (!sg?.cards) continue;
        const cardIdx = globalIdx - ((groupIdx + 1) * 1000000) - (sgIdx * 1000);
        if (Number.isInteger(cardIdx) && cardIdx >= 0 && cardIdx < sg.cards.length) {
          const card = sg.cards[cardIdx];
          if (!isSectionItem(card)) {
            return card;
          }
        }
      }
      continue;
    }

    if (grp.cards) {
      const cardIdx = globalIdx - (groupIdx * 1000);
      if (Number.isInteger(cardIdx) && cardIdx >= 0 && cardIdx < grp.cards.length) {
        const card = grp.cards[cardIdx];
        if (!isSectionItem(card)) {
          return card;
        }
      }

    }
  }
  return null;
}

function getGroupCardElement(subId, groupIdx, cardIdx) {
  const grp = CARD_DATA[subId]?.groups?.[groupIdx];
  const globalIdx = getGroupCardGlobalIdx(groupIdx, cardIdx);
  return document.querySelector(`#page-${subId}_${grp?.id} .data-card[data-global-idx="${globalIdx}"]`);
}

function getSubgroupCardElement(subId, groupIdx, sgIdx, cardIdx) {
  const grp = CARD_DATA[subId]?.groups?.[groupIdx];
  const sg = grp?.subgroups?.[sgIdx];
  const globalIdx = getSubgroupCardGlobalIdx(groupIdx, sgIdx, cardIdx);
  return document.querySelector(`#page-${subId}_sgc_${grp?.id}_${sg?.id} .data-card[data-global-idx="${globalIdx}"]`);
}

function getCardDescription(name) {
  const card = focusedCard ? getCardByGlobalIdx(focusedCard.subId, focusedCard.idx) : null;
  return card?.desc || `${name} — 설명&서사적 활용 예시 준비중`;
}

function getSubDescription(subId) {
  const navInfo = Object.values(NAV_DATA).find(n => n.subs.find(s => s.id === subId));
  const sub = navInfo ? navInfo.subs.find(s => s.id === subId) : null;
  const label = sub ? sub.label : subId;
  return `[${label}] 카테고리에 대한 설명이 여기에 표시됩니다. 추후 카테고리별 가이드와 활용 예시가 추가될 예정입니다.`;
}

function getSubInfo(subId) {
  for (const nav of Object.values(NAV_DATA)) {
    const sub = nav.subs.find(s => s.id === subId);
    if (sub) return sub;
  }
  return null;
}

function setAddressTrail(trail) {
  addressTrail = trail.filter(item => item && item.label);
  renderAddressTrail();
}

function renderAddressTrail() {
  const address = document.getElementById('ctrl-address');
  if (!address) return;

  address.innerHTML = '';
  addressTrail.forEach((item, index) => {
    const tag = document.createElement('button');
    tag.type = 'button';
    tag.className = 'address-tag';
    tag.textContent = item.label;
    tag.title = item.label;
    tag.setAttribute('aria-label', `${item.label} 위치로 이동`);
    tag.addEventListener('click', () => navigateAddressTag(index));
    address.appendChild(tag);
  });

  requestAnimationFrame(() => {
    address.scrollLeft = address.scrollWidth;
  });
}


function canNavigateBackInTrail() {
  return addressTrail.length > 1;
}

function navigateAddressBack() {
  if (!canNavigateBackInTrail()) return false;
  navigateAddressTag(addressTrail.length - 2);
  return true;
}

function initCenterBackSwipe() {
  const area = document.getElementById('center-area');
  if (!area) return;

  // 짧지만 의도가 분명한 동작과 빠른 플릭도 뒤로가기로 인식한다.
  // 고정된 90px 판정만 사용하던 때보다 손의 크기/숙련도 차이에 덜 민감하다.
  const DIRECTION_LOCK_DISTANCE = 6;
  const HORIZONTAL_BIAS = 1.05;
  const MIN_BACK_DISTANCE = 52;
  const BACK_DISTANCE_RATIO = 0.14;
  const FLICK_MIN_DISTANCE = 28;
  const FLICK_VELOCITY = 0.35;
  let startX = null;
  let startY = null;
  let startTime = 0;
  let lastX = null;
  let lastY = null;
  let furthestX = 0;
  let isDragging = false;
  let isVerticalGesture = false;

  function resetDragStyles() {
    area.classList.remove('is-back-swiping');
    area.style.removeProperty('--back-swipe-x');
  }

  function onTouchStart(e) {
    if (e.touches.length !== 1 || !canNavigateBackInTrail()) return;
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    lastX = startX;
    lastY = startY;
    startTime = performance.now();
    furthestX = 0;
    isDragging = false;
    isVerticalGesture = false;
  }

  function onTouchMove(e) {
    if (startX === null || isVerticalGesture || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    lastX = touch.clientX;
    lastY = touch.clientY;
    furthestX = Math.max(furthestX, dx);

    if (!isDragging) {
      if (Math.hypot(dx, dy) < DIRECTION_LOCK_DISTANCE) return;

      if (Math.abs(dy) > Math.abs(dx)) {
        isVerticalGesture = true;
        return;
      }

      if (dx > 0 && dx > Math.abs(dy) * HORIZONTAL_BIAS) {
        isDragging = true;
        area.classList.add('is-back-swiping');
      }
    }

    if (isDragging) {
      e.preventDefault();
      area.style.setProperty('--back-swipe-x', `${Math.min(dx * 0.35, 42)}px`);
    }
  }

  function onTouchEnd(e) {
    if (startX === null || isVerticalGesture) {
      resetDragStyles();
      startX = null;
      startY = null;
      isVerticalGesture = false;
      return;
    }

    const endTouch = e.changedTouches?.[0];
    const endX = endTouch?.clientX ?? lastX ?? startX;
    const endY = endTouch?.clientY ?? lastY ?? startY;
    const dy = endY - startY;
    const elapsed = Math.max(performance.now() - startTime, 1);
    const distanceThreshold = Math.max(
      MIN_BACK_DISTANCE,
      Math.min(80, area.clientWidth * BACK_DISTANCE_RATIO)
    );
    const isFastFlick = furthestX >= FLICK_MIN_DISTANCE && furthestX / elapsed >= FLICK_VELOCITY;
    // 끝에서 손가락이 조금 되돌아와도 사용자가 도달한 최대 이동 거리를 인정한다.
    const shouldGoBack = isDragging && Math.abs(dy) < furthestX * 1.5 &&
      (furthestX >= distanceThreshold || isFastFlick);

    resetDragStyles();
    startX = null;
    startY = null;
    lastX = null;
    lastY = null;
    furthestX = 0;
    isDragging = false;
    isVerticalGesture = false;

    if (shouldGoBack) navigateAddressBack();
  }

  function onTouchCancel() {
    resetDragStyles();
    startX = null;
    startY = null;
    lastX = null;
    lastY = null;
    furthestX = 0;
    isDragging = false;
    isVerticalGesture = false;
  }

  area.addEventListener('touchstart', onTouchStart, { passive: true });
  area.addEventListener('touchmove', onTouchMove, { passive: false });
  area.addEventListener('touchend', onTouchEnd, { passive: true });
  area.addEventListener('touchcancel', onTouchCancel, { passive: true });
}

function navigateAddressTag(index) {
  const item = addressTrail[index];
  if (!item) return;

  if (item.type === 'nav') {
    switchNav(item.navId, false, { force: true });
    return;
  }

  if (item.type === 'sub') {
    selectSub(item.subId, item.navId);
    return;
  }

  if (item.type === 'group') {
    showSubgroupPage(item.subId, item.groupIdx);
    return;
  }

  if (item.type === 'groupCards') {
    showGroupCards(item.subId, item.groupIdx);
    return;
  }

  if (item.type === 'subgroup') {
    showSubgroupCards(item.subId, item.groupIdx, item.sgIdx);
  }
}

function buildBaseTrail(navId, subId) {
  const nav = NAV_DATA[navId];
  const trail = [];
  if (nav) trail.push({ type: 'nav', navId, label: nav.label });

  if (subId) {
    const sub = nav?.subs.find(s => s.id === subId) || getSubInfo(subId);
    trail.push({ type: 'sub', navId, subId, label: sub?.label || subId });
  }
  return trail;
}

function setNavAddress(navId) {
  setAddressTrail(buildBaseTrail(navId));
}

function setSubAddress(subId, navId) {
  setAddressTrail(buildBaseTrail(navId, subId));
}

function setGroupAddress(subId, groupIdx, includeCards = false) {
  const data = CARD_DATA[subId];
  const grp = data?.groups?.[groupIdx];
  if (!grp) return;

  const trail = buildBaseTrail(currentNav, subId);
  trail.push({
    type: includeCards ? 'groupCards' : 'group',
    subId,
    groupIdx,
    label: grp.label
  });
  setAddressTrail(trail);
}

function setSubgroupAddress(subId, groupIdx, sgIdx) {
  const data = CARD_DATA[subId];
  const grp = data?.groups?.[groupIdx];
  const sg = grp?.subgroups?.[sgIdx];
  if (!grp || !sg) return;

  const trail = buildBaseTrail(currentNav, subId);
  trail.push({ type: 'group', subId, groupIdx, label: grp.label });
  trail.push({ type: 'subgroup', subId, groupIdx, sgIdx, label: sg.label });
  setAddressTrail(trail);
}

/* ════════════════════════════════════════════════
   OPENING ANIMATION   오프닝
════════════════════════════════════════════════ */
const FADE_MS_LAUNCH = 1400;       // 앱 시작: 흰 바탕에서 홈이 느긋하게 페이드인
const FADE_MS_FORWARD_WHITE = 280; // 홈 → 다음 화면: 흰빛이 빠르게 스쳐 지나가는 시간
const FADE_MS_FORWARD_SCREEN = 950;// 홈 → 다음 화면: 다음 화면이 부드럽게 완성되는 시간
const FADE_MS_BACK = 1100;         // 뒤로 → 홈: 흰 화면 없이 직접 디졸브
const FADE_MS = 300;               // 그 외 기본값
const WHITE_FADE_CLASS = 'route-fade-white';
const HOME_ANIMATE_CLASS = 'home-animate';
const TRANSITION_SOURCE_CLASS = 'transition-source';
const TRANSITION_TARGET_CLASS = 'transition-target';
let screenTransitionToken = 0;
const screenTransitionTimers = new Set();

function scheduleScreenTransitionTask(callback, delay) {
  const timerId = setTimeout(() => {
    screenTransitionTimers.delete(timerId);
    callback();
  }, delay);
  screenTransitionTimers.add(timerId);
  return timerId;
}

function cancelPendingScreenTransitionTasks() {
  screenTransitionTimers.forEach(timerId => clearTimeout(timerId));
  screenTransitionTimers.clear();
}

/* 개발 중 오프닝 비활성화 를 위해 주석 처리
window.addEventListener('load', () => {
  const content = document.getElementById('opening-content');
  const divider = document.getElementById('opening-divider');

  setTimeout(() => {
    content.classList.add('visible');
    divider.classList.add('expand');
  }, 130);

  setTimeout(() => content.classList.add('fade-out'), 1100);

  setTimeout(() => {
    switchScreen('screen-home', null, { type: 'launch', duration: FADE_MS_LAUNCH });
  }, 1300);
});
*/

// 앱 시작: 첫 프레임은 흰색으로 유지하고, 기다림 없이 홈 화면이 부드럽게 떠오르게 한다.
window.addEventListener('load', () => {
  setTimeout(() => {
     switchScreen('screen-home', null, { type: 'launch', duration: FADE_MS_LAUNCH });
  }, 10);
});



initCenterBackSwipe();
initScrollResponsiveChrome();
initInfoTextAutoFit();

/* ════════════════════════════════════════════════
   CARD TITLE AUTO-FIT
   CSS supplies one standard size for each layout. Auto-fit is deliberately
   only an overflow safety net: it never enlarges an individual short title.
════════════════════════════════════════════════ */
const CARD_TITLE_SIZE_STEP_PX = 0.5;
const CARD_TITLE_MIN_SCALE = 0.72;
const CARD_TITLE_COMPACT_LINE_HEIGHT_SCALE = 0.92;
let cardTitleFitFrame = 0;

function getCardTitleAvailableSize(container) {
  const style = getComputedStyle(container);
  const width = container.clientWidth
    - parseFloat(style.paddingLeft)
    - parseFloat(style.paddingRight);
  const height = container.clientHeight
    - parseFloat(style.paddingTop)
    - parseFloat(style.paddingBottom);

  return { width, height };
}

function getCardTitleCandidates(standardSize) {
  const minimumSize = standardSize * CARD_TITLE_MIN_SCALE;
  const candidates = [];
  for (let size = standardSize; size >= minimumSize; size -= CARD_TITLE_SIZE_STEP_PX) {
    candidates.push(size);
  }
  if (candidates[candidates.length - 1] > minimumSize) {
    candidates.push(minimumSize);
  }
  return candidates;
}

function cardTitleFits(text, availableHeight) {
  return text.scrollWidth <= text.clientWidth + 0.5
    && text.scrollHeight <= availableHeight + 0.5;
}

function applyCardTitleSize(text, fontSize, lineHeight) {
  text.style.fontSize = `${fontSize}px`;
  text.style.lineHeight = String(lineHeight);
}

function fitCardTitle(container) {
  const text = container.querySelector('.card-name-text');
  if (!text || container.clientWidth <= 0 || container.clientHeight <= 0) return;

  text.style.removeProperty('font-size');
  text.style.removeProperty('line-height');

  const { height } = getCardTitleAvailableSize(container);
  const standardStyle = getComputedStyle(container);
  const standardSize = parseFloat(standardStyle.fontSize);
  const standardLineHeightPx = parseFloat(standardStyle.lineHeight);
  if (!standardSize || !standardLineHeightPx) return;

  // Keep a modest vertical safety zone instead of accepting text right up to
  // the parchment boundary. The text layer's CSS width supplies the matching
  // horizontal safety zone.
  const availableHeight = height - Math.max(3, height * 0.1);
  const standardLineHeight = standardLineHeightPx / standardSize;
  const candidates = getCardTitleCandidates(standardSize);

  for (const size of candidates) {
    applyCardTitleSize(text, size, standardLineHeight);
    if (cardTitleFits(text, availableHeight)) return;
  }

  // Only an extreme title that still overflows at the minimum size receives
  // slightly tighter leading. Normal one- and multi-line cards share the same
  // comfortable layout-specific rhythm.
  const minimumSize = candidates[candidates.length - 1];
  const compactLineHeight = standardLineHeight * CARD_TITLE_COMPACT_LINE_HEIGHT_SCALE;
  applyCardTitleSize(text, minimumSize, compactLineHeight);
  if (cardTitleFits(text, availableHeight)) return;

  // Extreme titles stay clipped by .card-name rather than escaping the parchment.
  applyCardTitleSize(text, minimumSize, compactLineHeight);
}

function fitAllCardTitles() {
  document.querySelectorAll('.card-name').forEach(fitCardTitle);
}

function requestCardTitleAutoFit() {
  if (cardTitleFitFrame) cancelAnimationFrame(cardTitleFitFrame);
  cardTitleFitFrame = requestAnimationFrame(() => {
    cardTitleFitFrame = 0;
    fitAllCardTitles();
  });
}

function initCardTitleAutoFit() {
  window.addEventListener('resize', requestCardTitleAutoFit, { passive: true });
  new MutationObserver(requestCardTitleAutoFit).observe(document.body, {
    childList: true,
    subtree: true
  });
  if (document.fonts?.ready) document.fonts.ready.then(requestCardTitleAutoFit);
  requestCardTitleAutoFit();
}

// The fitter reads the state declared above immediately, so initialize it only
// after that state has left the temporal dead zone.
initCardTitleAutoFit();

/* ════════════════════════════════════════════════
   INFO PANEL TEXT AUTO-FIT
   패널 높이는 그대로 둔 채 실제 렌더링 영역을 넘는 텍스트만 단계적으로 축소한다.
════════════════════════════════════════════════ */
const INFO_TEXT_MIN_SCALE = 0.75;
const INFO_TEXT_STEP_PX = 0.5;
let infoTextFitFrame = 0;

function elementHasVerticalOverflow(element) {
  return element.scrollHeight > element.clientHeight + 0.5;
}

function fitInfoTextElement(element) {
  if (!element) return;

  // 이전 카드에서 적용된 축소를 먼저 지워 짧은 텍스트가 항상 기본 크기로 돌아오게 한다.
  element.style.removeProperty('font-size');
  const baseSize = parseFloat(getComputedStyle(element).fontSize);
  if (!baseSize || !elementHasVerticalOverflow(element)) return;

  const minimumSize = baseSize * INFO_TEXT_MIN_SCALE;
  let nextSize = baseSize;
  while (elementHasVerticalOverflow(element) && nextSize > minimumSize) {
    nextSize = Math.max(minimumSize, nextSize - INFO_TEXT_STEP_PX);
    element.style.fontSize = `${nextSize}px`;
  }
}

function fitInfoPanelText() {
  document.querySelectorAll('.info-slide').forEach(slide => {
    // 제목과 설명은 각자의 실제 clientHeight/scrollHeight를 별도로 비교한다.
    fitInfoTextElement(slide.querySelector('.info-name'));
    fitInfoTextElement(slide.querySelector('.info-desc'));

    // 제목 축소로 설명 영역이 달라질 수 있으므로 최종 레이아웃에서 한 번 더 확인한다.
    fitInfoTextElement(slide.querySelector('.info-desc'));
  });
}

function requestInfoTextAutoFit() {
  if (infoTextFitFrame) cancelAnimationFrame(infoTextFitFrame);
  infoTextFitFrame = requestAnimationFrame(() => {
    infoTextFitFrame = 0;
    fitInfoPanelText();
  });
}

function initInfoTextAutoFit() {
  window.addEventListener('resize', requestInfoTextAutoFit, { passive: true });
  if (document.fonts?.ready) document.fonts.ready.then(requestInfoTextAutoFit);
}

/* ════════════════════════════════════════════════
   SCROLL-RESPONSIVE CREATIVE CHROME
   빠르고 분명한 탐색 제스처만 받아 패널을 일정한 시간으로 끝까지 움직인다.
   wheel/touch를 직접 추적하므로 콘텐츠가 짧아도 같은 방식으로 동작한다.
   중앙 스크롤 영역의 크기와 위치는 절대 변경하지 않아 카드가 튀거나 늘어나지 않는다.
════════════════════════════════════════════════ */
function initScrollResponsiveChrome() {
  const screen = document.getElementById('screen-create');
  const area = document.getElementById('center-area');
  const infoPanel = document.getElementById('info-panel');
  const bottomChrome = document.getElementById('create-chrome-bottom');
  if (!screen || !area || !infoPanel || !bottomChrome) return;

  const INTENT_DISTANCE = 18;
  const INTENT_VELOCITY = 0.32;
  const GESTURE_GAP = 140;
  const ANIMATION_DURATION = 220;
  const scrollPositions = new WeakMap();
  let gestureDirection = 0;
  let gestureDistance = 0;
  let gestureStartedAt = 0;
  let lastGestureAt = 0;
  let lastTouchX = null;
  let lastTouchY = null;
  let touchDirection = null;
  let targetTopProgress = 0;
  let targetBottomProgress = 0;
  let renderedTopProgress = 0;
  let renderedBottomProgress = 0;
  let animationFrame = 0;
  let animationStartedAt = 0;
  let animationStartTopProgress = 0;
  let animationStartBottomProgress = 0;
  let lastDirectInputAt = -Infinity;

  area.querySelectorAll('.center-page').forEach(page => {
    scrollPositions.set(page, page.scrollTop);
  });

  function resetGesture() {
    gestureDirection = 0;
    gestureDistance = 0;
    gestureStartedAt = 0;
    lastGestureAt = 0;
  }

  function renderChrome(timestamp) {
    const elapsed = timestamp - animationStartedAt;
    const travelDistance = Math.max(
      Math.abs(targetTopProgress - animationStartTopProgress),
      Math.abs(targetBottomProgress - animationStartBottomProgress)
    );
    const duration = ANIMATION_DURATION * travelDistance;
    const timeProgress = duration ? Math.min(1, elapsed / duration) : 1;
    const easedProgress = 1 - Math.pow(1 - timeProgress, 3);
    renderedTopProgress = animationStartTopProgress
      + (targetTopProgress - animationStartTopProgress) * easedProgress;
    renderedBottomProgress = animationStartBottomProgress
      + (targetBottomProgress - animationStartBottomProgress) * easedProgress;
    screen.style.setProperty('--chrome-progress', renderedBottomProgress.toFixed(4));
    screen.style.setProperty('--top-chrome-offset', `${renderedTopProgress * -100}%`);
    screen.style.setProperty('--bottom-chrome-offset', `${renderedBottomProgress * 100}%`);
    screen.classList.toggle('top-chrome-hidden', renderedTopProgress > 0.98);
    screen.classList.toggle('bottom-chrome-hidden', renderedBottomProgress > 0.98);
    if (timeProgress < 1) {
      animationFrame = requestAnimationFrame(renderChrome);
    } else {
      renderedTopProgress = targetTopProgress;
      renderedBottomProgress = targetBottomProgress;
      animationFrame = 0;
    }
  }

  function animateChrome(topProgress, bottomProgress) {
    const nextTopProgress = Math.max(0, Math.min(1, topProgress));
    const nextBottomProgress = Math.max(0, Math.min(1, bottomProgress));
    if (nextTopProgress === targetTopProgress
        && nextBottomProgress === targetBottomProgress
        && animationFrame) return;
    if (nextTopProgress === renderedTopProgress
        && nextBottomProgress === renderedBottomProgress
        && !animationFrame) return;
    targetTopProgress = nextTopProgress;
    targetBottomProgress = nextBottomProgress;
    animationStartTopProgress = renderedTopProgress;
    animationStartBottomProgress = renderedBottomProgress;
    animationStartedAt = performance.now();
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = requestAnimationFrame(renderChrome);
  }

  function setProgress(progress) {
    // 하단 크롬이 숨기 시작하면 열린 유틸리티 메뉴도 함께 닫는다.
    // 메뉴를 단순히 아래로 끌고 가지 않아 다음 표시 때 닫힌 상태가 유지된다.
    if (progress > 0 && extraMenuOpen) closeExtraMenu({ instant: true });
    animateChrome(progress, progress);
  }

  function trackGesture(delta, timestamp = performance.now()) {
    if (Math.abs(delta) < 0.5) return;
    const direction = Math.sign(delta);
    // 잠시 멈춘 뒤의 움직임은 이전의 느린 이동과 합산하지 않는다.
    if (direction !== gestureDirection || (lastGestureAt && timestamp - lastGestureAt > GESTURE_GAP)) {
      gestureDirection = direction;
      gestureDistance = 0;
      gestureStartedAt = timestamp;
    }
    lastGestureAt = timestamp;
    gestureDistance += Math.abs(delta);

    const elapsed = Math.max(16, timestamp - gestureStartedAt);
    const velocity = gestureDistance / elapsed;
    if (gestureDistance >= INTENT_DISTANCE && velocity >= INTENT_VELOCITY) {
      // 빠른 제스처는 중간 위치를 만들지 않고 항상 한쪽 끝까지 같은 속도로 안착한다.
      setProgress(direction > 0 ? 1 : 0);
      resetGesture();
    }
  }

  function onScroll(event) {
    const page = event.target;
    if (!(page instanceof Element) || !page.classList.contains('center-page')) return;
    const currentTop = Math.max(0, page.scrollTop);
    const previousTop = scrollPositions.get(page) ?? currentTop;
    scrollPositions.set(page, currentTop);
    // wheel/touch와 그 결과로 발생한 scroll 이벤트를 중복 계산하지 않는다.
    if (performance.now() - lastDirectInputAt < 100) return;
    if (currentTop <= 0) setProgress(0);
    else trackGesture(currentTop - previousTop, event.timeStamp);
  }

  area.addEventListener('scroll', onScroll, { capture: true, passive: true });
  area.addEventListener('wheel', event => {
    lastDirectInputAt = performance.now();
    trackGesture(event.deltaY);
  }, { passive: true });
  function onChromeTouchStart(event) {
    const touch = event.touches.length === 1 ? event.touches[0] : null;
    lastTouchX = touch?.clientX ?? null;
    lastTouchY = touch?.clientY ?? null;
    touchDirection = null;
    resetGesture();
  }

  function onChromeTouchMove(event) {
    if (lastTouchY === null || event.touches.length !== 1) return;
    const touch = event.touches[0];
    const currentX = touch.clientX;
    const currentY = touch.clientY;
    const dx = currentX - lastTouchX;
    const dy = currentY - lastTouchY;

    // 설명 패널의 좌우 정보 전환과 상하 패널 제스처가 서로 간섭하지 않도록
    // 첫 방향을 잠근 뒤 세로 입력만 크롬 표시 상태에 전달한다.
    if (!touchDirection && Math.hypot(dx, dy) >= 6) {
      touchDirection = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
    }
    if (touchDirection === 'horizontal') return;
    lastTouchX = currentX;
    lastDirectInputAt = performance.now();
    trackGesture(lastTouchY - currentY);
    lastTouchY = currentY;
  }

  function onChromeTouchEnd() {
    lastTouchX = null;
    lastTouchY = null;
    touchDirection = null;
    resetGesture();
  }

  area.addEventListener('touchstart', onChromeTouchStart, { passive: true });
  area.addEventListener('touchmove', onChromeTouchMove, { passive: true });
  // 위쪽 설명 패널에서 시작한 수직 스와이프도 동일하게 숨김 동작을 수행한다.
  infoPanel.addEventListener('touchstart', onChromeTouchStart, { passive: true });
  infoPanel.addEventListener('touchmove', onChromeTouchMove, { passive: true });

  const chromeResizeObserver = new ResizeObserver(() => {
    const topHeight = infoPanel.getBoundingClientRect().height;
    const bottomHeight = bottomChrome.getBoundingClientRect().height;
    screen.style.setProperty('--top-chrome-height', `${topHeight}px`);
    screen.style.setProperty('--bottom-chrome-height', `${bottomHeight}px`);
  });
  chromeResizeObserver.observe(infoPanel);
  chromeResizeObserver.observe(bottomChrome);
  area.addEventListener('touchend', onChromeTouchEnd, { passive: true });
  area.addEventListener('touchcancel', onChromeTouchEnd, { passive: true });
  infoPanel.addEventListener('touchend', onChromeTouchEnd, { passive: true });
  infoPanel.addEventListener('touchcancel', onChromeTouchEnd, { passive: true });

  // 새 카테고리/그룹 페이지는 항상 최상단에서 시작하므로 기본 패널 상태도 복원한다.
  const pageObserver = new MutationObserver(() => {
    const activePage = area.querySelector('.center-page.active');
    if (activePage) scrollPositions.set(activePage, activePage.scrollTop);
    setProgress(0);
    resetGesture();
  });
  pageObserver.observe(area, { childList: true });
}

/* ════════════════════════════════════════════════
   SCREEN TRANSITION
════════════════════════════════════════════════ */
function restartHomeIntro() {
  const home = document.getElementById('screen-home');
  if (!home) return;

  home.classList.remove(HOME_ANIMATE_CLASS);
  void home.offsetWidth;
  home.classList.add(HOME_ANIMATE_CLASS);
}

function restartCreateIntro() {
  const createScreen = document.getElementById('screen-create');
  if (!createScreen) return;

  createScreen.classList.remove('entering');
  void createScreen.offsetWidth;
  createScreen.classList.add('entering');
}

function clearScreenTransitionState(screens) {
  document.body.classList.remove(WHITE_FADE_CLASS);
  document.body.style.removeProperty('--route-fade-ms');
  document.body.style.removeProperty('--route-fade-ease');
  document.body.style.removeProperty('--route-fade-opacity');
  document.body.style.removeProperty('--screen-fade-ms');
  document.body.style.removeProperty('--screen-fade-ease');
  screens.forEach(screen => {
    screen.classList.remove('no-transition', TRANSITION_SOURCE_CLASS, TRANSITION_TARGET_CLASS);
  });
}

 function setActiveScreen(target, screens) {
  screens.forEach(screen => {
    if (screen === target) screen.classList.add('active');
    else screen.classList.remove('active');
  });
}

function switchScreen(targetId, callback, options = {}) {
  const transitionToken = ++screenTransitionToken;
  cancelPendingScreenTransitionTasks();
  // 이전 호출부 호환: switchScreen(id, cb, true, 'white', 280)
  if (typeof options === 'boolean') {
    const useFade = options;
    const fadeColor = arguments[3] || 'white';
    const fadeMs = arguments[4] || FADE_MS;
    options = useFade
      ? { type: fadeColor === 'white' ? 'whiteDissolve' : 'dissolve', whiteDuration: fadeMs, duration: fadeMs }
      : { type: 'instant' };
  }

    const screens = Array.from(document.querySelectorAll('.screen'));
  const target = document.getElementById(targetId);
  if (!target) return;

  clearScreenTransitionState(screens);

  const current = document.querySelector('.screen.active');
  const type = options.type || 'dissolve';
  const duration = options.duration ?? FADE_MS;
  const easing = options.easing || 'cubic-bezier(0.16, 1, 0.3, 1)';

  if (type === 'instant' || !current || current === target) {
    screens.forEach(screen => screen.classList.add('no-transition'));
    setActiveScreen(target, screens);
    if (targetId === 'screen-home') restartHomeIntro();
    if (callback) callback();
    requestAnimationFrame(() => {
      if (transitionToken === screenTransitionToken) clearScreenTransitionState(screens);
    });
    return;
  }

    document.body.style.setProperty('--screen-fade-ms', `${duration}ms`);
  document.body.style.setProperty('--screen-fade-ease', easing);

  current.classList.add(TRANSITION_SOURCE_CLASS);
  target.classList.add(TRANSITION_TARGET_CLASS);
  target.classList.add('active');
  if (targetId === 'screen-home') restartHomeIntro();
  if (callback) callback();

  requestAnimationFrame(() => {
    if (transitionToken !== screenTransitionToken) return;
    current.classList.remove('active');
  });

  if (type === 'whiteDissolve') {
    const whiteDuration = options.whiteDuration ?? FADE_MS_FORWARD_WHITE;
    document.body.style.setProperty('--route-fade-ms', `${whiteDuration}ms`);
    document.body.style.setProperty('--route-fade-ease', 'cubic-bezier(0.4, 0, 0.2, 1)');
    document.body.style.setProperty('--route-fade-opacity', String(options.whiteOpacity ?? 0.82));
    document.body.classList.add(WHITE_FADE_CLASS);
    scheduleScreenTransitionTask(() => {
    if (transitionToken !== screenTransitionToken) return;
      document.body.classList.remove(WHITE_FADE_CLASS);
    }, Math.max(16, whiteDuration * 0.72));
  }

  scheduleScreenTransitionTask(() => {
    if (transitionToken !== screenTransitionToken) return;
    setActiveScreen(target, screens);
    clearScreenTransitionState(screens);
  }, duration + 40);
}

/* ════════════════════════════════════════════════
   NAVIGATION
════════════════════════════════════════════════ */
function goHome() {
  closeCardInfo();
  closeDetailSheet();
  closeStatusOverlay();
  closeExtraMenu({ instant: true });
  
  const createScreen = document.getElementById('screen-create');
  if (createScreen) createScreen.classList.remove('entering');

  switchScreen('screen-home', null, {
    type: 'dissolve',
    duration: FADE_MS_BACK,
    easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)'
  });
}
function goToNarrative() {
  switchScreen('screen-narrative', null, { type: 'instant' });
}
function goToCreate() {
  // 이전 방문에서 열린 메뉴가 닫히는 애니메이션이 첫 프레임에 보이지 않도록 즉시 초기화
  closeExtraMenu({ instant: true });

  switchScreen('screen-create', () => {
    switchNav('character', true, { silentAddress: true });
    setAddressTrail([]);
    restartCreateIntro();
  }, { type: 'instant' });
}

function setBottomNavState(navId) {
  const bottomNav = document.getElementById('bottom-nav');
  if (bottomNav) bottomNav.dataset.activeNav = navId;

  const activeButtonMap = {
    character: 'nav-character',
    narrative2: 'nav-narrative2',
    idea: 'nav-idea',
    world: 'nav-world',
    compass: 'nav-compass'
  };
  document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
  const activeButton = document.getElementById(activeButtonMap[navId]);
  if (activeButton) activeButton.classList.add('active');
}

/* ════════════════════════════════════════════════
   MAIN NAV SWITCH
════════════════════════════════════════════════ */
function switchNav(navId, skipAnimation, options = {}) {
  if (navId === currentNav && !skipAnimation && addressTrail.length > 0 && !options.force) return;

  const prev = currentNav;
  currentNav = navId;
  currentSubId = null;

    // 버튼 상태 (인스타그램식 선택 배경 이동 — CSS transition)
  setBottomNavState(navId);

  // 부분 초기화 버튼은 이미지로만 표시합니다.  텍스트 표기 하려면 NAV부분 추가해야함 →　if → .textContent = NAV_DATA[navId].resetLabel;
  const partialResetLabel = document.querySelector('#btn-partial-reset .extra-btn-label');
  if (partialResetLabel) partialResetLabel.textContent = '';

  // 서브 메뉴 렌더
  renderSubnav(navId, !skipAnimation && prev !== navId);

  // 중앙 기본 상태로
  closeCardInfo();
  showDefaultCenter();
  updateInfoPanel();
   if (!options.silentAddress) setNavAddress(navId);
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
  closeCardInfo();
  // 이전 active 제거
  document.querySelectorAll('.subnav-item').forEach(el => el.classList.remove('active'));
  // 현재 active
  const el = document.querySelector(`[data-sub-id="${subId}"]`);
  if (el) el.classList.add('active');

  const same = currentSubId === subId;
  currentSubId = subId;
  showCardPage(subId, !same);
  updateInfoPanel();
    setSubAddress(subId, navId || currentNav);
}

/* ════════════════════════════════════════════════
   CENTER DISPLAY
════════════════════════════════════════════════ */
function showDefaultCenter() {
  closeCardInfo();
  const area = document.getElementById('center-area');

  // 기존 동적 페이지 제거
  area.querySelectorAll('.center-page:not(#page-default)').forEach(p => p.remove());

  const def = document.getElementById('page-default');
  def.classList.add('active');
  applyCreativeBackground({ navId: currentNav });
}




function getGroupLayoutClass(count) {
  if (count === 2) return 'group-layout-two';
  if (count === 4) return 'group-layout-four';
  if (count === 6) return 'group-layout-six';
  if (count >= 6) return 'group-layout-grid';
  return 'group-layout-list';
}

/*
 * Keep the first cards clearly separated, then compress the remaining reveal
 * into a fixed time window. The exponential tail approaches (but never grows
 * beyond) CARD_REVEAL_MAX_DELAY_MS, even for very large card collections.
 */
const CARD_REVEAL_MAX_DELAY_MS = 1500;

function getCardRevealDelayMs(index) {
  const cardIndex = Math.max(0, Number(index) || 0);

  // Cards 1-8: a deliberate, easy-to-follow cadence.
  if (cardIndex < 8) return cardIndex * 100;

  // Cards 9-20: progressively shorten the gap from the preceding card.
  if (cardIndex < 20) {
    const acceleratedIndex = cardIndex - 7;
    const progress = acceleratedIndex / 12;
    return 700 + 520 * (1 - Math.pow(1 - progress, 1.7));
  }

  // Card 21 onward: a very fast, asymptotic sweep with a hard upper bound.
  const tailIndex = cardIndex - 19;
  return 1220 + (CARD_REVEAL_MAX_DELAY_MS - 1220) * (1 - Math.exp(-tailIndex / 36));
}

function getCardRevealDelayStyle(index) {
  return `animation-delay:${Math.round(getCardRevealDelayMs(index))}ms`;
}

function setupCardRevealAnimations(page) {
  page.querySelectorAll('.card-deal').forEach(card => {
    // A card becomes usable when its own reveal begins, independently of all
    // cards that are still waiting later in the stagger.
    card.addEventListener('animationstart', () => card.classList.add('card-interactive'), { once: true });
    card.addEventListener('animationend', () => card.classList.remove('card-deal', 'card-interactive'), { once: true });
    card.addEventListener('animationcancel', () => card.classList.remove('card-deal', 'card-interactive'), { once: true });
  });
}

/* ════════════════════════════════════════════════
   그룹 선택 화면 렌더
   ─ type:'group' 인 카테고리를 클릭했을 때 열리는 화면
   ─ groups 배열에 항목 추가만 하면 버튼 자동 생성
   ─ 그룹 안에 subgroups 배열이 있으면 → 2단계(서브그룹) 구조로 동작
════════════════════════════════════════════════ */
function showGroupPage(subId, animate = true) {
  closeCardInfo();
  const area = document.getElementById('center-area');

  document.querySelectorAll('.center-page:not(#page-default)').forEach(p => p.remove());

  const data = CARD_DATA[subId];
  if (!data || !data.groups) return;
  applyCreativeBackground({ navId: currentNav, subId });

  const page = document.createElement('div');
  page.className = 'center-page active';
  page.id = 'page-' + subId;

  const groupLayoutClass = getGroupLayoutClass(data.groups.length);
  let html = `<div class="group-select-wrap ${groupLayoutClass}">`;
  data.groups.forEach((grp, i) => {
    const delay = animate ? `style="animation-delay:${i * 0.08}s"` : '';

    // 배지 카운트 — subgroups 있으면 하위 모든 카드, 없으면 직속 카드
    let grpCount = 0;
    if (grp.subgroups) {
      grp.subgroups.forEach((sg, sgIdx) => {
sg.cards.forEach((card, cIdx) => {
          if (isSectionItem(card)) return;
          const globalIdx = getSubgroupCardGlobalIdx(i, sgIdx, cIdx);
          if (selectedCards[subId]?.has(globalIdx)) grpCount++;
        });
      });
    } else if (grp.cards) {
    grp.cards.forEach((card, cIdx) => {
        if (isSectionItem(card)) return;
        if (selectedCards[subId]?.has(getGroupCardGlobalIdx(i, cIdx))) grpCount++;
      });
    }

   html += `
      <button
      type="button"
        class="group-select-btn pressable"
        ${delay}
        data-group-action="${grp.subgroups ? 'subgroups' : 'cards'}"
        data-sub-id="${subId}"
        data-group-idx="${i}"
      >
        <span class="group-btn-icon">${renderIcon(grp.icon, grp.img, 'group-btn-img')}</span>
        ${grp.img ? '' : `<span class="group-btn-label">${grp.label}</span>`}
        ${grpCount > 0 ? `<div class="group-badge">${grpCount}</div>` : ''}
      </button>
    `;
  });
  html += '</div>';

  page.innerHTML = html;
  area.appendChild(page);

 setupGroupButtonActions(page);
}

/* ════════════════════════════════════════════════
   서브그룹 선택 화면 렌더 (2단계)
   ─ 그룹 안에 subgroups 배열이 있을 때 그룹 버튼 클릭 시 열림
════════════════════════════════════════════════ */
function showSubgroupPage(subId, groupIdx) {
  closeCardInfo();
  const area = document.getElementById('center-area');
  const data = CARD_DATA[subId];
  if (!data || !data.groups) return;

  const grp = data.groups[groupIdx];
  if (!grp || !grp.subgroups) return;
  applyCreativeBackground({ navId: currentNav, subId, groupIdx });

  document.querySelectorAll('.center-page:not(#page-default)').forEach(p => p.remove());

  const page = document.createElement('div');
  page.className = 'center-page active';
  page.id = 'page-' + subId + '_sg_' + grp.id;

   const subgroupLayoutClass = getGroupLayoutClass(grp.subgroups.length);
  let html = `<div class="section-label">${formatLabel(grp.label, grp.icon)}</div>`;
  html += `<div class="group-select-wrap ${subgroupLayoutClass}">`;

  grp.subgroups.forEach((sg, sgIdx) => {
  // 서브그룹 배지: globalIdx = (groupIdx + 1) * 1000000 + sgIdx * 1000 + cIdx
    let sgCount = 0;
   sg.cards.forEach((card, cIdx) => {
      if (isSectionItem(card)) return;
      if (selectedCards[subId]?.has(getSubgroupCardGlobalIdx(groupIdx, sgIdx, cIdx))) sgCount++;
    });

     const delay = `style="animation-delay:${sgIdx * 0.08}s"`;
     
    html += `
      <button
      type="button"
        class="group-select-btn pressable"
        ${delay}
        data-group-action="subgroup-cards"
        data-sub-id="${subId}"
        data-group-idx="${groupIdx}"
        data-subgroup-idx="${sgIdx}"
      >
        <span class="group-btn-icon">${renderIcon(sg.icon, sg.img, 'group-btn-img')}</span>
        ${sg.img ? '' : `<span class="group-btn-label">${sg.label}</span>`}
        ${sgCount > 0 ? `<div class="group-badge">${sgCount}</div>` : ''}
      </button>
    `;
  });
  html += '</div>';

  page.innerHTML = html;
  area.appendChild(page);

  setupGroupButtonActions(page);
   setGroupAddress(subId, groupIdx);
}

/* ════════════════════════════════════════════════
   서브그룹 카드 목록 렌더 (2단계 → 카드)
════════════════════════════════════════════════ */
function showSubgroupCards(subId, groupIdx, sgIdx) {
  closeCardInfo();
  const area = document.getElementById('center-area');
  const data = CARD_DATA[subId];
  if (!data || !data.groups) return;

  const grp = data.groups[groupIdx];
  if (!grp || !grp.subgroups) return;
  applyCreativeBackground({ navId: currentNav, subId, groupIdx });

  const sg = grp.subgroups[sgIdx];
  if (!sg) return;

  document.querySelectorAll('.center-page:not(#page-default)').forEach(p => p.remove());

  const page = document.createElement('div');
  page.className = 'center-page active';
  page.id = `page-${subId}_sgc_${grp.id}_${sg.id}`;

  if (!selectedCards[subId]) selectedCards[subId] = new Set();

 let html = getCardGridOpenTag(grp);

  let sgCardRealIdx = 0;
  sg.cards.forEach((card, rawIdx) => {
    if (card.type === 'section') {
      html += `</div><div class="card-section-header">${formatSectionHeaderLabel(card.label)}</div>${getCardGridOpenTag(grp)}`;
      return;
    }
    const idx = rawIdx;
    const animIdx = sgCardRealIdx++;
   // globalIdx = (groupIdx + 1) * 1000000 + sgIdx * 1000 + idx
    const globalIdx = getSubgroupCardGlobalIdx(groupIdx, sgIdx, idx);
    const sel = selectedCards[subId].has(globalIdx) ? ' selected' : '';
    html += `
      <div class="data-card pressable card-deal${sel}"
        style="${getCardRevealDelayStyle(animIdx)}"
         data-global-idx="${globalIdx}"
        onclick="subgroupCardClick('${subId}', ${groupIdx}, ${sgIdx}, ${idx})"
        ondblclick="openSubgroupCardDetail('${subId}', ${groupIdx}, ${sgIdx}, ${idx})"
        onmousedown="startLongPress(event,this,'subgroup','${subId}',${groupIdx},${sgIdx},${idx})"
        ontouchstart="startLongPress(event,this,'subgroup','${subId}',${groupIdx},${sgIdx},${idx})"
        onmouseup="cancelLongPress()" ontouchend="handleCardTouchEnd(event,'subgroup','${subId}',${groupIdx},${sgIdx},${idx})"
        onmouseleave="cancelLongPress()" ontouchcancel="cancelLongPress()">
        <div class="card-img-frame ${card.img ? 'has-image' : 'has-icon'}">${renderIcon(card.icon, card.img, 'card-img')}</div>
        <div class="card-name"><span class="card-name-text">${card.name}</span></div>
      </div>
    `;
  });
  html += '</div>';

  page.innerHTML = html;
  area.appendChild(page);

  markFirstCardRow(page);
  setupCardRevealAnimations(page);
   setSubgroupAddress(subId, groupIdx, sgIdx);
}

/* 서브그룹 카드 클릭 — info 패널 */
function subgroupCardClick(subId, groupIdx, sgIdx, idx) {
  const sg = CARD_DATA[subId].groups[groupIdx].subgroups[sgIdx];
  const card = sg.cards[idx];
  const globalIdx = getSubgroupCardGlobalIdx(groupIdx, sgIdx, idx);
  toggleCardInfo({ subId, idx: globalIdx, path: { type: 'subgroup', groupIdx, sgIdx, cardIdx: idx }, name: card.name, icon: card.icon, img: card.img, desc: card.desc });
}

/* 서브그룹 카드 선택/해제 */
function subgroupCardDblClick(subId, groupIdx, sgIdx, idx) {
  const globalIdx = getSubgroupCardGlobalIdx(groupIdx, sgIdx, idx);
  if (!selectedCards[subId]) selectedCards[subId] = new Set();

  if (selectedCards[subId].has(globalIdx)) {
    selectedCards[subId].delete(globalIdx);
  } else {
    selectedCards[subId].add(globalIdx);
  }

  const grp = CARD_DATA[subId].groups[groupIdx];
  const sg  = grp.subgroups[sgIdx];
  const pageEl = document.getElementById(`page-${subId}_sgc_${grp.id}_${sg.id}`);
  if (pageEl) {
    const cardEl = getSubgroupCardElement(subId, groupIdx, sgIdx, idx);
    if (cardEl) {
      cardEl.classList.remove('card-deal');
      cardEl.classList.toggle('selected', selectedCards[subId].has(globalIdx));
    }
  }

  // 서브그룹 페이지 배지 갱신
  const sgPageEl = document.getElementById('page-' + subId + '_sg_' + grp.id);
  if (sgPageEl) updateSubgroupBadges(subId, groupIdx);

  // 그룹 페이지 배지 갱신
  const groupPageEl = document.getElementById('page-' + subId);
  if (groupPageEl) updateGroupBadges(subId);

  refreshCardInfo();

  renderSubnav(currentNav, false);
  const el = document.querySelector(`[data-sub-id="${subId}"]`);
  if (el) el.classList.add('active');
  updateNavBadges();
  refreshStatusIfOpen();
}

/* 서브그룹 카드 더블클릭 — 상세 정보 열기 */
function openSubgroupCardDetail(subId, groupIdx, sgIdx, idx) {
  const card = CARD_DATA[subId].groups[groupIdx].subgroups[sgIdx].cards[idx];
  focusedCard = { subId, idx: getSubgroupCardGlobalIdx(groupIdx, sgIdx, idx), path: { type: 'subgroup', groupIdx, sgIdx, cardIdx: idx }, ...card };
  renderCardInfo();
  openDetailSheet('card');
}

/* 서브그룹 페이지 배지 갱신 */
function updateSubgroupBadges(subId, groupIdx) {
  const grp = CARD_DATA[subId]?.groups[groupIdx];
  if (!grp || !grp.subgroups) return;

  const pageEl = document.getElementById('page-' + subId + '_sg_' + grp.id);
  if (!pageEl) return;

  grp.subgroups.forEach((sg, sgIdx) => {
    const btn = pageEl.querySelectorAll('.group-select-btn')[sgIdx];
    if (!btn) return;
    let count = 0;
    sg.cards.forEach((card, cIdx) => {
      if (isSectionItem(card)) return;
      if (selectedCards[subId]?.has(getSubgroupCardGlobalIdx(groupIdx, sgIdx, cIdx))) count++;
    });
    let badge = btn.querySelector('.group-badge');
    if (count > 0) {
      if (!badge) { badge = document.createElement('div'); badge.className = 'group-badge'; btn.appendChild(badge); }
      badge.textContent = count;
    } else {
      if (badge) badge.remove();
    }
  });
}

/* ════════════════════════════════════════════════
   그룹 버튼 클릭 → 해당 그룹의 카드 목록 열기 (1단계 그룹용)
════════════════════════════════════════════════ */
function showGroupCards(subId, groupIdx) {
  closeCardInfo();
  const area = document.getElementById('center-area');
  const data = CARD_DATA[subId];
  if (!data || !data.groups) return;

  const grp = data.groups[groupIdx];
  if (!grp) return;
  applyCreativeBackground({ navId: currentNav, subId, groupIdx });

  document.querySelectorAll('.center-page:not(#page-default)').forEach(p => p.remove());

  const page = document.createElement('div');
  page.className = 'center-page active';
  page.id = 'page-' + subId + '_' + grp.id;

  if (!selectedCards[subId]) selectedCards[subId] = new Set();

  // 카드 idx = groupIdx * 1000 + cardIdx
  const offset = groupIdx * 1000;

  let html = getCardGridOpenTag(grp);
  let grpCardRealIdx = 0;
  grp.cards.forEach((card, rawIdx) => {
    if (card.type === 'section') {
      html += `</div><div class="card-section-header">${formatSectionHeaderLabel(card.label)}</div>${getCardGridOpenTag(grp)}`;
      return;
    }
    const idx = rawIdx;
    const animIdx = grpCardRealIdx++;
    const globalIdx = getGroupCardGlobalIdx(groupIdx, idx);
    const sel = selectedCards[subId].has(globalIdx) ? ' selected' : '';
    html += `
  <div class="data-card pressable card-deal${sel}"
    style="${getCardRevealDelayStyle(animIdx)}"
    data-global-idx="${globalIdx}"
    onclick="groupCardClick('${subId}', ${groupIdx}, ${idx})"
    ondblclick="openGroupCardDetail('${subId}', ${groupIdx}, ${idx})"
    onmousedown="startLongPress(event,this,'group','${subId}',${groupIdx},${idx})"
    ontouchstart="startLongPress(event,this,'group','${subId}',${groupIdx},${idx})"
    onmouseup="cancelLongPress()" ontouchend="handleCardTouchEnd(event,'group','${subId}',${groupIdx},${idx})"
    onmouseleave="cancelLongPress()" ontouchcancel="cancelLongPress()">
        <div class="card-img-frame ${card.img ? 'has-image' : 'has-icon'}">${renderIcon(card.icon, card.img, 'card-img')}</div>
        <div class="card-name"><span class="card-name-text">${card.name}</span></div>
      </div>
    `;
  });
  html += '</div>';
  page.innerHTML = html;
  area.appendChild(page);

  markFirstCardRow(page);
  setupCardRevealAnimations(page);
   setGroupAddress(subId, groupIdx, true);
}

/* 그룹 카드 클릭 — info 패널 업데이트 */
function groupCardClick(subId, groupIdx, idx) {
  const grp = CARD_DATA[subId].groups[groupIdx];
  const card = grp.cards[idx];
  const globalIdx = getGroupCardGlobalIdx(groupIdx, idx);
  toggleCardInfo({ subId, idx: globalIdx, path: { type: 'group', groupIdx, cardIdx: idx }, name: card.name, icon: card.icon, img: card.img, desc: card.desc });
}

/* 그룹 카드 선택/해제 */
function groupCardDblClick(subId, groupIdx, idx) {
  const globalIdx = getGroupCardGlobalIdx(groupIdx, idx);
  if (!selectedCards[subId]) selectedCards[subId] = new Set();
  if (selectedCards[subId].has(globalIdx)) {
    selectedCards[subId].delete(globalIdx);
  } else {
    selectedCards[subId].add(globalIdx);
  }

  const page = document.getElementById('page-' + subId + '_' + CARD_DATA[subId].groups[groupIdx].id);
  if (page) {
    const cardEl = getGroupCardElement(subId, groupIdx, idx);
    if (cardEl) {
      cardEl.classList.remove('card-deal');
      cardEl.classList.toggle('selected', selectedCards[subId].has(globalIdx));
    }
  }

  const groupPageEl = document.getElementById('page-' + subId);
  if (groupPageEl) updateGroupBadges(subId);

  refreshCardInfo();

  renderSubnav(currentNav, false);
  const el = document.querySelector(`[data-sub-id="${subId}"]`);
  if (el) el.classList.add('active');
  updateNavBadges();
  refreshStatusIfOpen();
}

/* 그룹 카드 더블클릭 — 상세 정보 열기 */
function openGroupCardDetail(subId, groupIdx, idx) {
  const card = CARD_DATA[subId].groups[groupIdx].cards[idx];
  focusedCard = { subId, idx: getGroupCardGlobalIdx(groupIdx, idx), path: { type: 'group', groupIdx, cardIdx: idx }, ...card };
  renderCardInfo();
  openDetailSheet('card');
}

function updateGroupBadges(subId) {
  const data = CARD_DATA[subId];
  if (!data || !data.groups) return;
  data.groups.forEach((grp, gIdx) => {
    const btn = document.querySelector(`#page-${subId} .group-select-btn:nth-child(${gIdx + 1})`);
    if (!btn) return;

    let count = 0;
    if (grp.subgroups) {
      // 서브그룹 구조: globalIdx = (gIdx + 1) * 1000000 + sgIdx * 1000 + cIdx
      grp.subgroups.forEach((sg, sgIdx) => {
        sg.cards.forEach((card, cIdx) => {
          if (isSectionItem(card)) return;
          if (selectedCards[subId]?.has(getSubgroupCardGlobalIdx(gIdx, sgIdx, cIdx))) count++;
        });
      });
    } else if (grp.cards) {
      // 일반 그룹: globalIdx = gIdx * 1000 + cIdx
       grp.cards.forEach((card, cIdx) => {
        if (isSectionItem(card)) return;
        if (selectedCards[subId]?.has(getGroupCardGlobalIdx(gIdx, cIdx))) count++;
      });
    }

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
  closeCardInfo();

  // type:'group' 인 경우 그룹 선택 화면을 열고 종료
  const navInfo2 = Object.values(NAV_DATA).find(n => n.subs.find(s => s.id === subId));
  const subCheck = navInfo2 ? navInfo2.subs.find(s => s.id === subId) : null;
  if (subCheck && subCheck.type === 'group') {
    showGroupPage(subId, animate);
    return;
  }

  const area = document.getElementById('center-area');
  applyCreativeBackground({ navId: currentNav, subId });

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

  let html = getCardGridOpenTag();

  if (!selectedCards[subId]) selectedCards[subId] = new Set();

  let cardRealIdx = 0;
  cards.forEach((card, rawIdx) => {
    if (card.type === 'section') {
      html += `</div><div class="card-section-header">${formatSectionHeaderLabel(card.label)}</div>${getCardGridOpenTag()}`;
      return;
    }
    const idx = rawIdx;       // ← 배열 원본 인덱스
    const animIdx = cardRealIdx++;  // 애니메이션 딜레이용
    const sel = selectedCards[subId].has(idx) ? ' selected' : '';
    const deal = animate ? ' card-deal' : '';
    const delay = animate ? ` style="${getCardRevealDelayStyle(animIdx)}"` : '';
   html += `
  <div class="data-card pressable${sel}${deal}"${delay}
    data-global-idx="${idx}"
    onclick="cardClick('${subId}', ${idx})"
    ondblclick="openCardDetail('${subId}', ${idx})"
    onmousedown="startLongPress(event,this,'card','${subId}',${idx})"
    ontouchstart="startLongPress(event,this,'card','${subId}',${idx})"
    onmouseup="cancelLongPress()"  ontouchend="handleCardTouchEnd(event,'card','${subId}',${idx})"
    onmouseleave="cancelLongPress()" ontouchcancel="cancelLongPress()">
    
        <div class="card-img-frame ${card.img ? 'has-image' : 'has-icon'}">${renderIcon(card.icon, card.img, 'card-img')}</div>
        <div class="card-name"><span class="card-name-text">${card.name}</span></div>
      </div>
    `;
  });

  html += '</div>';
  page.innerHTML = html;
  area.appendChild(page);

  markFirstCardRow(page);
  // card-deal 애니메이션 끝난 뒤 클래스 제거 → pressable 눌림효과 항상 작동
  setupCardRevealAnimations(page);
}



/* ════════════════════════════════════════════════
════════════════════════════════════════════════ */
function cardClick(subId, idx) {
  const card = CARD_DATA[subId][idx];
  toggleCardInfo({ subId, idx, name: card.name, icon: card.icon, img: card.img, desc: card.desc });
}

/* 일반 카드 더블클릭 — 상세 정보 열기 */
function openCardDetail(subId, idx) {
  const card = CARD_DATA[subId][idx];
  focusedCard = { subId, idx, name: card.name, icon: card.icon, img: card.img, desc: card.desc };
  renderCardInfo();
  openDetailSheet('card');
}

function closeCardInfo() {
  document.querySelectorAll('.card-info-popover').forEach(panel => panel.remove());
  document.querySelectorAll('.data-card.card-info-active').forEach(card => card.classList.remove('card-info-active'));
  focusedCard = null;
}

function getFocusedCardElement() {
  if (!focusedCard) return null;
  return document.querySelector(`.center-page.active .data-card[data-global-idx="${focusedCard.idx}"]`);
}

function positionCardInfo(panel, cardEl) {
  const page = cardEl.closest('.center-page');
  if (!page) return;

  const pageRect = page.getBoundingClientRect();
  const cardRect = cardEl.getBoundingClientRect();
  const isFirstRow = cardEl.classList.contains('first-row-card');
  const panelWidth = Math.min(440, page.clientWidth - 24);
  panel.style.width = `${panelWidth}px`;

  const centeredLeft = cardRect.left - pageRect.left + page.scrollLeft
    + (cardRect.width - panelWidth) / 2;
  const left = Math.max(12, Math.min(centeredLeft, page.scrollWidth - panelWidth - 12));
  const top = isFirstRow
    ? cardRect.bottom - pageRect.top + page.scrollTop + 10
    : cardRect.top - pageRect.top + page.scrollTop - panel.offsetHeight - 10;
  panel.classList.toggle('is-below-card', isFirstRow);
  panel.style.left = `${left}px`;
  panel.style.top = `${Math.max(4, top)}px`;
  panel.style.setProperty('--card-anchor-x', `${Math.max(18, Math.min(panelWidth - 18, cardRect.left - pageRect.left + page.scrollLeft + cardRect.width / 2 - left))}px`);
}

function renderCardInfo() {
  document.querySelectorAll('.card-info-popover').forEach(panel => panel.remove());
  document.querySelectorAll('.data-card.card-info-active').forEach(card => card.classList.remove('card-info-active'));
  if (!focusedCard) return;

  const cardEl = getFocusedCardElement();
  const page = cardEl?.closest('.center-page');
  if (!cardEl || !page) {
    focusedCard = null;
    return;
  }

  cardEl.classList.add('card-info-active');
  const selected = Boolean(selectedCards[focusedCard.subId]?.has(focusedCard.idx));
  const panel = document.createElement('section');
  panel.className = 'card-info-popover';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', `${focusedCard.name} 카드 정보`);
  panel.innerHTML = `
    <button type="button" class="card-info-close pressable" aria-label="카드 정보 닫기">×</button>
    <div class="card-info-copy">
      <h3 class="card-info-title">${escapeHtml(focusedCard.name)}</h3>
      <p class="card-info-desc">${escapeHtml(focusedCard.desc || '설명 없음')}</p>
    </div>
    <div class="card-info-actions">
      <button type="button" class="card-info-detail pressable">상세 정보</button>
      <button type="button" class="card-info-select pressable${selected ? ' is-selected' : ''}">${selected ? '선택 취소' : '선택'}</button>
    </div>`;
  page.appendChild(panel);
  panel.querySelector('.card-info-close').addEventListener('click', closeCardInfo);
  panel.querySelector('.card-info-detail').addEventListener('click', () => openDetailSheet('card'));
  panel.querySelector('.card-info-select').addEventListener('click', selectCurrentCard);
  positionCardInfo(panel, cardEl);
}

function toggleCardInfo(card) {
  if (focusedCard?.subId === card.subId && focusedCard.idx === card.idx) {
    closeCardInfo();
    return;
  }
  focusedCard = card;
  renderCardInfo();
}

function refreshCardInfo() {
  if (focusedCard) renderCardInfo();
}

function updateInfoPanel() {
  const nav = NAV_DATA[currentNav];
  const info = MAIN_CATEGORY_INFO[currentNav] || {};
  setInfoVisual(document.getElementById('info-cat-icon'), null, info.icon || '◆');
  document.getElementById('info-cat-name').textContent = nav?.label || '';
  document.getElementById('info-cat-desc').textContent = info.description || '';
  requestInfoTextAutoFit();
}

function selectCurrentCard() {
  if (!focusedCard) return;
  const data = CARD_DATA[focusedCard.subId];
  if (data && data.groups) {
    const path = focusedCard.path;
    if (path?.type === 'subgroup') {
      subgroupCardDblClick(focusedCard.subId, path.groupIdx, path.sgIdx, path.cardIdx);
    } else if (path?.type === 'group') {
      groupCardDblClick(focusedCard.subId, path.groupIdx, path.cardIdx);
    } else if (focusedCard.idx >= 1000000) {
      const groupIdx = Math.floor(focusedCard.idx / 1000000) - 1;
      const sgIdx    = Math.floor((focusedCard.idx % 1000000) / 1000);
      const cardIdx  = focusedCard.idx % 1000;
      subgroupCardDblClick(focusedCard.subId, groupIdx, sgIdx, cardIdx);
    } else {
      const groupIdx = Math.floor(focusedCard.idx / 1000);
      const cardIdx = focusedCard.idx % 1000;
      groupCardDblClick(focusedCard.subId, groupIdx, cardIdx);
    }
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
    const cardEl = page.querySelector(`.data-card[onclick*="cardClick('${subId}', ${idx})"]`);
    if (cardEl) {
      cardEl.classList.toggle('selected', selectedCards[subId].has(idx));
    }
  }

  // 서브메뉴 배지 업데이트
  renderSubnav(currentNav, false);
  if (currentSubId) {
    const el = document.querySelector(`[data-sub-id="${currentSubId}"]`);
    if (el) el.classList.add('active');
  }

  // 설명창 선택 버튼 업데이트
  if (focusedCard && focusedCard.subId === subId && focusedCard.idx === idx) {
    refreshCardInfo();
  }
  refreshStatusIfOpen();
   updateNavBadges();  /* ← 여기 추가, 선택한 카드 총량 표시 추가*/
}


function parseDetailItems(detail) {
  if (!detail) return [];
  return String(detail)
    .replace(/\r\n?/g, '\n')
    .split(/\n{2,}/)
    .map(item => item.trim())
    .filter(Boolean);
}

function getDetailDisplayMode(card) {
  const mode = String(card?.detailLayout || card?.detailMode || '').toUpperCase();
  const hasRightColumn = Boolean(card?.detailB || card?.detailRight);
  return (mode === 'AB' || mode === 'A/B' || hasRightColumn) ? 'AB' : 'C';
}

function getCardDetailColumns(card) {
  const mode = getDetailDisplayMode(card);
  if (mode !== 'AB') {
    return [{ key: 'c', label: 'C', items: parseDetailItems(card?.detail) }];
  }

  const leftDetail = card?.detailA ?? card?.detailLeft ?? card?.detail ?? '';
  const rightDetail = card?.detailB ?? card?.detailRight ?? '';
  return [
    { key: 'a', label: 'A', items: parseDetailItems(leftDetail) },
    { key: 'b', label: 'B', items: parseDetailItems(rightDetail) }
  ];
}

function getCardDetailItems(card) {
  return getCardDetailColumns(card).flatMap(column => column.items);
}

function renderDetailIdeaBlock(subId, globalIdx, itemIdx, item, isChecked) {
  return `
    <button
      type="button"
      class="detail-idea-block pressable${isChecked ? ' checked' : ''}"
      onclick="toggleDetailCheck('${subId}', ${globalIdx}, ${itemIdx})"
      aria-pressed="${isChecked ? 'true' : 'false'}"
    >${escapeHtml(item)}</button>`;
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
    const card = getCardByGlobalIdx(focusedCard.subId, focusedCard.idx);
    // 아이콘 / 이미지 렌더링
    if (focusedCard.img) {
      iconEl.innerHTML = `<img class="detail-card-img" src="${focusedCard.img}" alt="${focusedCard.name}">`;
    } else {
      iconEl.innerHTML = `<div style="font-size:2.4rem;text-align:center;">${focusedCard.icon || '✦'}</div>`;
    }
    nameEl.textContent = focusedCard.name;
    descEl.textContent = card?.desc || '';

    // 세부정보(detail) 파싱 및 선택 블록 렌더
    const detailKey = `${focusedCard.subId}__${focusedCard.idx}`;
    const detailColumns = getCardDetailColumns(card);
    const hasDetailItems = detailColumns.some(column => column.items.length > 0);
    const hasSubImage = Boolean(card?.subImg);

    if (hasDetailItems || hasSubImage) {
      divEl.style.display = '';
      const checkedSet = selectedDetails[detailKey] || new Set();

      let bodyHtml = '';
let globalItemIdx = 0;

      if (hasDetailItems) {
        if (getDetailDisplayMode(card) === 'AB') {
          const columnHtml = detailColumns.map(column => {
            const itemsHtml = column.items.map(item => {
              const itemIdx = globalItemIdx;
              globalItemIdx += 1;
              return renderDetailIdeaBlock(focusedCard.subId, focusedCard.idx, itemIdx, item, checkedSet.has(itemIdx));
            }).join('');

            return `<div class="detail-column detail-column-${column.key}" aria-label="${column.label} 열">${itemsHtml}</div>`;
          }).join('');
          bodyHtml += `<div class="detail-columns detail-columns-ab">${columnHtml}</div>`;
        } else {
          const itemsHtml = detailColumns[0].items.map(item => {
            const itemIdx = globalItemIdx;
            globalItemIdx += 1;
            return renderDetailIdeaBlock(focusedCard.subId, focusedCard.idx, itemIdx, item, checkedSet.has(itemIdx));
          }).join('');
          bodyHtml += `<div class="detail-column detail-column-c">${itemsHtml}</div>`;
        }
      }

      if (hasSubImage) {
        const subImageChecked = !!selectedSubImages[detailKey];
        bodyHtml += `
          <button
            type="button"
            class="detail-sub-image-row pressable${subImageChecked ? ' checked' : ''}"
            onclick="toggleSubImageCheck('${focusedCard.subId}', ${focusedCard.idx})"
            aria-pressed="${subImageChecked ? 'true' : 'false'}"
          >
            <img
              class="detail-sub-img"
              src="${card.subImg}"
              alt="${focusedCard.name} 서브 이미지"
              draggable="false"
            >
          </button>`;
      }
      bodyEl.innerHTML = bodyHtml;
    } else {
divEl.style.display = 'none';
      bodyEl.innerHTML = '';
    }

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

function toggleDetailCheck(subId, globalIdx, lineIdx) {
  const detailKey = `${subId}__${globalIdx}`;

  // selectedDetails 초기화
  if (!selectedDetails[detailKey]) selectedDetails[detailKey] = new Set();
  const set = selectedDetails[detailKey];

  if (set.has(lineIdx)) {
    set.delete(lineIdx);
  } else {
    set.add(lineIdx);
    // 카드도 자동 선택 상태로
    if (!selectedCards[subId]) selectedCards[subId] = new Set();
    selectedCards[subId].add(globalIdx);
    // DOM 카드 selected 상태 반영
    _syncCardSelectedDOM(subId, globalIdx);
    renderSubnav(currentNav, false);
    const el = document.querySelector(`[data-sub-id="${subId}"]`);
    if (el) el.classList.add('active');
    updateNavBadges();
  }

 // 선택 블록 UI 토글
  const block = document.querySelector(
    `.detail-idea-block[onclick*="toggleDetailCheck('${subId}', ${globalIdx}, ${lineIdx})"]`
  );
  if (block) {
    const isChecked = set.has(lineIdx);
    block.classList.toggle('checked', isChecked);
    block.setAttribute('aria-pressed', isChecked ? 'true' : 'false');
  }

  // 세부정보가 하나도 없으면 selectedDetails 키 삭제
  if (set.size === 0) delete selectedDetails[detailKey];

  // 아이디어 통합 창 갱신
  refreshStatusIfOpen();
}


function toggleSubImageCheck(subId, globalIdx) {
  const detailKey = `${subId}__${globalIdx}`;

  if (selectedSubImages[detailKey]) {
    delete selectedSubImages[detailKey];
  } else {
    selectedSubImages[detailKey] = true;
    if (!selectedCards[subId]) selectedCards[subId] = new Set();
    selectedCards[subId].add(globalIdx);
    _syncCardSelectedDOM(subId, globalIdx);
    renderSubnav(currentNav, false);
    const el = document.querySelector(`[data-sub-id="${subId}"]`);
    if (el) el.classList.add('active');
    updateNavBadges();
  }

  document
    .querySelectorAll(`.detail-sub-image-row[onclick*="toggleSubImageCheck('${subId}', ${globalIdx})"]`)
    .forEach(block => {
      const isChecked = !!selectedSubImages[detailKey];
      block.classList.toggle('checked', isChecked);
      block.setAttribute('aria-pressed', isChecked ? 'true' : 'false');
    });

  refreshStatusIfOpen();
}

function _syncCardSelectedDOM(subId, globalIdx) {
   const cardEl = document.querySelector(`.data-card[data-global-idx="${globalIdx}"]`);
  if (cardEl) {
    cardEl.classList.remove('card-deal');
    cardEl.classList.add('selected');
  }
   
  if (focusedCard && focusedCard.subId === subId && focusedCard.idx === globalIdx) {
    updateInfoPanel();
  }
}

function closeDetailSheet(e) {
  if (e && e.target !== document.getElementById('detail-overlay')) return;
  document.getElementById('detail-overlay').classList.remove('active');
}


/* ════════════════════════════════════════════════
   STATUS OVERLAY
════════════════════════════════════════════════ */
function openStatusOverlay() {
  setBottomNavState('idea');
  renderStatusContent();
  document.getElementById('status-overlay').classList.add('active');
  attachSwipeToClose(
    document.querySelector('.status-panel'),
     () => closeStatusOverlay()
  );
}

function closeStatusOverlay(e) {
  if (e && e.target !== document.getElementById('status-overlay')) return;
  document.getElementById('status-overlay').classList.remove('active');
    setBottomNavState(currentNav);
}

function renderStatusContent() {
  const body = document.getElementById('status-body');

  // 제목 변경
  const titleEl = document.getElementById('status-title');
  if (titleEl) titleEl.textContent = '선택된 아이디어';

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
       const card = getCardByGlobalIdx(sub.id, globalIdx);
        if (card) {
          // 선택된 세부정보 줄 수집
          const detailKey = `${sub.id}__${globalIdx}`;
          const checkedLines = selectedDetails[detailKey];
          let detailHtml = '';
          if (checkedLines && checkedLines.size > 0) {
            const detailItems = getCardDetailItems(card);
            const picked = [];
            checkedLines.forEach(itemIdx => {
              if (detailItems[itemIdx]) picked.push(detailItems[itemIdx]);
            });
            if (picked.length > 0) {
              detailHtml = `<div class="status-chip-details">${picked.map(item => `<span class="status-chip-detail-line">${escapeHtml(item)}</span>`).join('')}</div>`;
            }
          }
          const chipImgHtml = card.img
            ? `<img class="status-chip-img" src="${card.img}" alt="" draggable="false">`
            : '';
                  const subImageHtml = card.subImg && selectedSubImages[detailKey]
            ? `<img class="status-chip-sub-img" src="${card.subImg}" alt="" draggable="false">`
            : '';
          const metaHtml = renderStatusCategoryMeta(sub.id, globalIdx);
          const chipDescHtml = card.desc
            ? `<span class="status-chip-desc">${card.desc}</span>`
            : '';
          const extraHtml = (detailHtml || subImageHtml)
            ? `<div class="status-chip-extra">${detailHtml}${subImageHtml}</div>`
            : '';
          itemsHtml += `<div class="status-chip-wrap">
               ${metaHtml}
            <div class="status-chip">
              ${chipImgHtml}
              <div class="status-chip-text">
                <span class="status-chip-name">${formatLabel(card.name, card.icon)}</span>
                ${chipDescHtml}
              </div>
               ${extraHtml}
            </div>
          </div>`;
        }
      });

      itemsHtml += '</div></div>';
    });

    const content = hasAny ? itemsHtml : '<div class="status-empty">  </div>';  /* 선택 없음 */
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
  subs.forEach(sub => {
    delete selectedCards[sub.id];
    // 해당 서브의 세부정보와 서브 이미지 선택도 초기화
    Object.keys(selectedDetails).forEach(key => {
      if (key.startsWith(sub.id + '__')) delete selectedDetails[key];
    });
     Object.keys(selectedSubImages).forEach(key => {
      if (key.startsWith(sub.id + '__')) delete selectedSubImages[key];
    });
  });
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
  selectedDetails = {};
   selectedSubImages = {};
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

/* 상단 패널에서 이미지를 우선하고, 이미지가 없거나 로드에 실패하면 카드 아이콘을 표시한다. */
function setInfoVisual(container, img, icon) {
  if (!container) return;
  container.replaceChildren();
  container.classList.remove('has-image', 'has-icon');

  const showIcon = () => {
    container.replaceChildren();
    container.classList.remove('has-image');
    if (!icon) return;

    const iconElement = document.createElement('span');
    iconElement.className = 'info-icon-text';
    iconElement.textContent = icon;
    container.appendChild(iconElement);
    container.classList.add('has-icon');
  };

  if (!img) {
    showIcon();
    return;
  }

  const image = new Image();
  image.className = 'info-icon-img';
  image.alt = '';
  image.draggable = false;
  image.addEventListener('load', () => {
    if (image.parentElement === container) container.classList.add('has-image');
  }, { once: true });
  image.addEventListener('error', () => {
    if (image.parentElement !== container) return;
    showIcon();
  }, { once: true });
  image.src = img;
  container.appendChild(image);
}

function formatLabel(label, icon) {
  return [icon, label].filter(value => value !== undefined && value !== null && value !== '').join(' ');
}


function formatSectionHeaderLabel(label) {
  const text = String(label ?? '').trim();
  if (!text) return '';

  const separatorMatch = text.match(/\s*(—|\|)\s*/);
  if (!separatorMatch) {
    return `<span class="card-section-title">${escapeHtml(text)}</span>`;
  }

  const separatorIndex = separatorMatch.index;
  const title = text.slice(0, separatorIndex).trim();
  const detail = text.slice(separatorIndex).trim();

  if (!title) {
    return `<span class="card-section-detail">${escapeHtml(detail)}</span>`;
  }
  if (!detail) {
    return `<span class="card-section-title">${escapeHtml(title)}</span>`;
  }

  return `<span class="card-section-title">${escapeHtml(title)}</span><span class="card-section-detail">${escapeHtml(detail)}</span>`;
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

function closeExtraMenu(options = {}) {
  extraMenuOpen = false;
  const panel = document.getElementById('extra-menu-panel');
  const btn   = document.getElementById('btn-extra-menu');
  const icon  = document.getElementById('extra-menu-icon');

  if (options.instant && panel) panel.classList.add('menu-resetting');

  if (panel) panel.classList.remove('open');
  if (btn)   btn.classList.remove('open');
  if (icon)  icon.textContent = '☰';

  if (options.instant && panel) {
    requestAnimationFrame(() => panel.classList.remove('menu-resetting'));
  }
}

function toggleExtraMenu() {
  extraMenuOpen = !extraMenuOpen;
  const panel = document.getElementById('extra-menu-panel');
  const btn   = document.getElementById('btn-extra-menu');
  const icon  = document.getElementById('extra-menu-icon');

  if (panel) panel.classList.toggle('open', extraMenuOpen);
  if (btn)   btn.classList.toggle('open', extraMenuOpen);

  // 닫혀있을때 ☰, 열려있을때 삼각형 ▲
  if (icon) icon.textContent = extraMenuOpen ? '▼' : '☰';
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
  let allCards = [];
  if (data && data.groups) {
    data.groups.forEach((grp, gIdx) => {
      if (grp.subgroups) {
        grp.subgroups.forEach((sg, sgIdx) => {
          sg.cards.forEach((card, cIdx) => {
           if (isSectionItem(card)) return;
            allCards.push({ globalIdx: getSubgroupCardGlobalIdx(gIdx, sgIdx, cIdx), path: { type: 'subgroup', groupIdx: gIdx, sgIdx, cardIdx: cIdx }, ...card });
          });
        });
      } else if (grp.cards) {
        grp.cards.forEach((card, cIdx) => {
          if (isSectionItem(card)) return;
          allCards.push({ globalIdx: getGroupCardGlobalIdx(gIdx, cIdx), path: { type: 'group', groupIdx: gIdx, cardIdx: cIdx }, ...card });
        });
      }
    });
  } else if (Array.isArray(data)) {
    allCards = data.map((card, idx) => isSectionItem(card) ? null : ({ globalIdx: idx, ...card })).filter(Boolean);
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
  focusedCard = { subId: currentSubId, idx: pick.globalIdx, path: pick.path, name: pick.name, icon: pick.icon, img: pick.img };
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
      if (grp.subgroups) {
        grp.subgroups.forEach((sg, sgIdx) => {
          sg.cards.forEach((card, cIdx) => {
            if (isSectionItem(card)) return;
            allCards.push({ globalIdx: getSubgroupCardGlobalIdx(gIdx, sgIdx, cIdx) });
          });
        });
      } else if (grp.cards) {
        grp.cards.forEach((card, cIdx) => {
          if (isSectionItem(card)) return;
          allCards.push({ globalIdx: getGroupCardGlobalIdx(gIdx, cIdx) });
        });
      }
    });
  } else if (Array.isArray(data)) {
    allCards = data.map((card, idx) => isSectionItem(card) ? null : ({ globalIdx: idx })).filter(Boolean);
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
   그룹/서브그룹 버튼 동작
   ─ 눌림 효과는 다른 버튼과 동일하게 .pressable 공통 처리에 맡긴다.
   ─ 클릭 동작만 연결해서 손을 뗀 뒤 별도 팝/스프링 애니메이션이 끼어들지 않도록 한다.
════════════════════════════════════════════════ */

function setupGroupButtonActions(containerEl) {
  containerEl.querySelectorAll('.group-select-btn').forEach(btn => {
     btn.addEventListener('animationend', () => {
      btn.classList.add('group-appear-done');
    }, { once: true });

    if (btn._groupActionAttached) return;
    btn._groupActionAttached = true;

     btn.addEventListener('click', (e) => {
      e.preventDefault();
    runGroupButtonAction(btn);
    });
  });
}

function runGroupButtonAction(btn) {
  const subId = btn.dataset.subId;
  const groupIdx = Number(btn.dataset.groupIdx);
  const subgroupIdx = Number(btn.dataset.subgroupIdx);

  if (btn.dataset.groupAction === 'subgroups') {
    showSubgroupPage(subId, groupIdx);
    return;
  }

  if (btn.dataset.groupAction === 'subgroup-cards') {
    showSubgroupCards(subId, groupIdx, subgroupIdx);
    return;
  }

  showGroupCards(subId, groupIdx);
}


/* ════════════════════════════════════════════════
   LONG PRESS → 카드 선택/취소
════════════════════════════════════════════════ */
let _lpTimer = null;
let _lpStartX = 0;
let _lpStartY = 0;
let _lpDidFire = false;
let _lastCardTap = null;
const LONG_PRESS_MS = 480; // 꾹 누르는 시간 (ms)
const DOUBLE_TAP_MS = 320; // 모바일 더블터치 인식 시간 (ms)

function startLongPress(evt, el, type, subId, a, b, c) {
  cancelLongPress();
  _lpDidFire = false;
  const point = evt.touches ? evt.touches[0] : evt;
  _lpStartX = point.clientX;
  _lpStartY = point.clientY;
   
  _lpTimer = setTimeout(() => {
    _lpTimer = null;
    _lpDidFire = true;
     if (type === 'subgroup') subgroupCardDblClick(subId, a, b, c);
    else if (type === 'group') groupCardDblClick(subId, a, b);
    else {
      cardClick(subId, a);
      toggleCardSelect(subId, a);
    }
  }, LONG_PRESS_MS);
}

function cancelLongPress() {
  if (_lpTimer) { clearTimeout(_lpTimer); _lpTimer = null; }
}

function handleCardTouchEnd(evt, type, subId, a, b, c) {
  cancelLongPress();
  if (_lpDidFire) {
    _lastCardTap = null;
    return;
  }

  const key = [type, subId, a, b, c].filter(value => value !== undefined).join(':');
  const now = Date.now();
  const isDoubleTap = _lastCardTap
    && _lastCardTap.key === key
    && now - _lastCardTap.time <= DOUBLE_TAP_MS;

  if (isDoubleTap) {
    evt.preventDefault();
    _lastCardTap = null;
    if (type === 'subgroup') openSubgroupCardDetail(subId, a, b, c);
    else if (type === 'group') openGroupCardDetail(subId, a, b);
    else openCardDetail(subId, a);
    return;
  }

  _lastCardTap = { key, time: now };
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

   const overlayEl = panelEl.parentElement;
  const CLOSE_THRESHOLD = 80;
  const FADE_DISTANCE = 220;
  const CLOSE_DURATION = 220;
  let startX = null;
  let startY = null;
  let isDragging = false;

   function setOverlayDragOpacity(progress) {
    if (!overlayEl) return;
    overlayEl.style.transition = 'none';
    overlayEl.style.opacity = String(Math.max(0, 1 - progress));
  }

  function resetInlineStyles() {
    panelEl.style.transition = '';
    panelEl.style.transform = '';
    panelEl.style.opacity = '';
    if (overlayEl) {
      overlayEl.style.transition = '';
      overlayEl.style.opacity = '';
    }
  }

  function onTouchStart(e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isDragging = false;
    panelEl.style.transition = 'none';
     if (overlayEl) overlayEl.style.transition = 'none';
  }

  function onTouchMove(e) {
    if (startX === null) return;
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;

    // 수평 스와이프 판정 (세로 스크롤과 구분)
    if (!isDragging && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
      isDragging = true;
    }
    if (isDragging) {
      const distance = Math.abs(dx);
      const progress = Math.min(1, distance / FADE_DISTANCE);
      panelEl.style.transform = `translateX(${dx}px)`;
      panelEl.style.opacity = String(Math.max(0, 1 - progress));
      setOverlayDragOpacity(progress);
    }
  }

  function onTouchEnd(e) {
    if (!isDragging) {
      resetInlineStyles();
      startX = null;
      return;
    }
     
    const dx = e.changedTouches[0].clientX - startX;
    const shouldClose = Math.abs(dx) > CLOSE_THRESHOLD;
    const closeDirection = dx < 0 ? -1 : 1;

    if (shouldClose) {
      // 충분히 밀었으면 스와이프 방향 그대로 닫기
      panelEl.style.transition = `transform ${CLOSE_DURATION}ms ease, opacity ${CLOSE_DURATION}ms ease`;
      panelEl.style.transform = `translateX(${closeDirection * 110}%)`;
      panelEl.style.opacity = '0';
       if (overlayEl) {
        overlayEl.style.transition = `opacity ${CLOSE_DURATION}ms ease`;
        overlayEl.style.opacity = '0';
      }
      setTimeout(() => {
        closeFn();
        // 닫힌 상태에서 inline 값을 지워 다음 열림 때 잔상이 되돌아오지 않게 함
        requestAnimationFrame(resetInlineStyles);
      }, CLOSE_DURATION);
    } else {
      // 복원
      panelEl.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
      panelEl.style.transform = '';
      panelEl.style.opacity = '';
       if (overlayEl) {
        overlayEl.style.transition = 'opacity 0.2s ease';
        overlayEl.style.opacity = '';
      }
      setTimeout(resetInlineStyles, 200);
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
