/* ════════════════════════════════════════════════
   데이터 조립
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
   단계적 이미지 준비
   동일 URL의 요청/디코드를 한 Promise로 합쳐 재방문 때 재사용하고, 짧은 유휴 시간에
   다음 화면만 준비한다. 전체 이미지 디렉터리를 한꺼번에 읽지는 않는다.
════════════════════════════════════════════════ */
const IMAGE_LOADER = (() => {
  const jobs = new Map();
  const ready = new Set();
  const idle = window.requestIdleCallback
    ? callback => window.requestIdleCallback(callback, { timeout: 1200 })
    : callback => setTimeout(callback, 80);

  function normalize(src) {
    if (!src) return null;
    try { return new URL(src, document.baseURI).href; } catch (_) { return null; }
  }

  function load(src) {
    const url = normalize(src);
    if (!url) return Promise.resolve(false);
    if (jobs.has(url)) return jobs.get(url);

    const job = new Promise(resolve => {
      const image = new Image();
      image.decoding = 'async';
      let settled = false;
      const finish = async loaded => {
        if (settled) return;
        settled = true;
        if (!loaded) return resolve(false);
        try { if (image.decode) await image.decode(); } catch (_) { /* decoded by load fallback */ }
        ready.add(url);
        resolve(true);
      };
      image.addEventListener('load', () => finish(true), { once: true });
      image.addEventListener('error', () => finish(false), { once: true });
      image.src = url;
      if (image.complete) finish(image.naturalWidth > 0);
    });
    jobs.set(url, job);
    // A temporary network/service-worker failure must not poison this URL for
    // the rest of the app session. The next render is allowed to try it again.
    job.then(loaded => {
      if (!loaded && jobs.get(url) === job) jobs.delete(url);
    });
    return job;
  }

  function preload(sources, { background = true, limit = 6 } = {}) {
    const queue = [...new Set(sources.filter(Boolean))];
    const run = async () => {
      for (let index = 0; index < queue.length; index += limit) {
        await Promise.all(queue.slice(index, index + limit).map(load));
      }
    };
    if (!background) return run();
    idle(run);
    return Promise.resolve();
  }

  async function reveal(element) {
    element.classList.add('managed-image');
    const url = normalize(element.currentSrc || element.src);
    if (!url) return;
    const loaded = ready.has(url) || await load(url);
    // On failure leave the native img rendering path visible. Keeping the
    // loader's opacity:0 class here turned one transient request failure into a
    // permanently blank card/group button.
    if (element.isConnected) {
      if (loaded) element.classList.add('image-ready');
      else element.classList.remove('managed-image');
    }
  }

  function watch(root = document) {
    root.querySelectorAll('img').forEach(reveal);
  }

  new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
    if (!(node instanceof Element)) return;
    if (node.matches('img')) reveal(node);
    watch(node);
  }))).observe(document.documentElement, { childList: true, subtree: true });

  return { load, preload, reveal, watch };
})();

const NAV_IMAGE_VERSION = '20261005-1';

const CORE_IMAGE_SOURCES = [
  'images/core/home/forestglow.jpg', 'images/core/home/royal-banner.webp',
  'images/core/buttons/top_panel.webp', 'images/core/buttons/top_icon.webp',
  'images/core/buttons/bottom_panel.jpg', 'images/core/buttons/check.webp',
  'images/core/buttons/lock.webp', 'images/core/buttons/cancel.webp',
  'images/core/buttons/select.webp', 'images/core/buttons/detail.webp',
  'images/core/buttons/close.webp', 'images/core/buttons/lock-on.webp',
  'images/core/buttons/lock-off.webp', 'images/core/buttons/menu-button-on.webp',
  'images/core/buttons/menu-button-off.webp',
  ...['character', 'story', 'idea', 'world', 'compass'].flatMap(name => [
    `images/core/buttons/nav_${name}-a.webp?v=${NAV_IMAGE_VERSION}`,
    `images/core/buttons/nav_${name}-b.webp?v=${NAV_IMAGE_VERSION}`
  ])
];

function imageSources(items) {
  return items.flatMap(item => item ? [item.img, item.subImg] : []).filter(Boolean);
}

function preloadNavImages(navId) {
  const subs = NAV_DATA[navId]?.subs || [];
  IMAGE_LOADER.preload(imageSources(subs));
  IMAGE_LOADER.preload(CREATIVE_BACKGROUNDS[navId]?.top?.map(file => `images/core/home/${file}`) || []);
}

function preloadGroupDestinations(subId) {
  const groups = CARD_DATA[subId]?.groups || [];
  IMAGE_LOADER.preload(imageSources(groups));
  // 각 그룹의 첫 화면에 보일 카드 일부만 준비하여 데이터/메모리 폭증을 막는다.
  const nearby = groups.flatMap(group => group.subgroups
    ? imageSources(group.subgroups).concat(imageSources(group.subgroups[0]?.cards?.slice(0, 12) || []))
    : imageSources(group.cards?.slice(0, 12) || []));
  IMAGE_LOADER.preload(nearby);
}

function preloadCards(cards) {
  IMAGE_LOADER.preload(imageSources((cards || []).filter(card => card?.type !== 'section').slice(0, 24)));
}

/* ════════════════════════════════════════════════
   효과음
   모든 UI 오디오는 이 작은 컨트롤러를 통과하므로 나중에 한 곳에서 음량 및 음소거
   제어를 추가할 수 있다. 시작할 때 파일을 가져와 디코딩하므로 클릭이 확정되면
   가벼운 버퍼 소스를 생성하고 시작하기만 하면 된다.
════════════════════════════════════════════════ */
const UI_SOUND = (() => {
  const sources = {
    touch: 'sounds/se_touch.mp3',
    page: 'sounds/se_page.mp3',
    nav: 'sounds/se_nav.mp3',
    click: 'sounds/se_click.mp3',
    card: 'sounds/se_card.mp3',
    card1: 'sounds/se_card1.mp3',
    card2: 'sounds/se_card2.mp3',
    category1: 'sounds/se_category1.mp3',
    category2: 'sounds/se_category2.mp3',
    category3: 'sounds/se_category3.mp3',
    category4: 'sounds/se_category4.mp3',
    category5: 'sounds/se_category5.mp3',
    delete: 'sounds/se_delete.mp3',
    delete2: 'sounds/se_delete2.mp3',
    cancel: 'sounds/se_cancel.mp3',
    selectYes: 'sounds/se_select_yes.mp3',
    selectNo: 'sounds/se_select_no.mp3',
    pong1: 'sounds/se_pong1.mp3',
    pong2: 'sounds/se_pong2.mp3',
    pong3: 'sounds/se_pong3.mp3',
    pong4: 'sounds/se_pong4.mp3',
    pong5: 'sounds/se_pong5.mp3'
  };
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const context = AudioContextClass ? new AudioContextClass({ latencyHint: 'interactive' }) : null;
  const output = context ? context.createGain() : null;
  const buffers = new Map();
  let muted = false;
  let volume = 0.7;
  let unlockHandled = false;

  if (output) {
    output.gain.value = volume;
    output.connect(context.destination);
  }

  // 이 스크립트가 실행되자마자 모든 효과음을 병렬로 디코딩한다. AudioBuffer만
  // 유지하면 재생 시 HTML 미디어 요소를 기다리거나 공유 음원의 위치를 찾지 않아도 된다.
  // decodeAudioData의 콜백은 이전 버전의 iOS Safari도 지원한다.
  if (context) {
    Object.entries(sources).forEach(([name, src]) => {
      fetch(src)
        .then(response => {
          if (!response.ok) throw new Error(`Unable to load sound: ${src}`);
          return response.arrayBuffer();
        })
        .then(arrayBuffer => new Promise((resolve, reject) => {
          context.decodeAudioData(arrayBuffer, resolve, reject);
        }))
        .then(buffer => buffers.set(name, buffer))
        .catch(error => console.warn(error));
    });
  }

  const unlockEvents = ['pointerdown', 'touchstart', 'mousedown', 'keydown', 'click'];

  function unlock() {
    if (unlockHandled) return;
    unlockHandled = true;
    unlockEvents.forEach(type => document.removeEventListener(type, unlock, true));

    // iOS Safari/PWA는 사용자 제스처 안에서만 이 상태 전환을 허용한다. 이후의 클릭 확정
    // 핸들러보다 앞서 첫 상호작용에서 한 번 수행한다.
    if (context && context.state === 'suspended') {
      context.resume().catch(error => console.warn(error));
    }
  }

  unlockEvents.forEach(type => document.addEventListener(type, unlock, {
    capture: true,
    passive: true
  }));

  function play(name) {
    const buffer = buffers.get(name);
    if (muted || !context || !buffer) return;

    // AudioBufferSourceNode는 의도적으로 한 번만 사용한다. 클릭마다 새 노드를 만들면
    // 즉시 시작되며 아무리 빠른 연속 입력도 겹쳐서 재생할 수 있다.
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(output);
    source.start();
    source.addEventListener('ended', () => source.disconnect(), { once: true });
  }

  return {
    play,
    setMuted(value) { muted = Boolean(value); },
    setVolume(value) {
      volume = Math.max(0, Math.min(1, Number(value) || 0));
      if (output) output.gain.value = volume;
    }
  };
})();

/* ════════════════════════════════════════════════
   단발성 상황음
   파일명과 관계없이 두 음원은 반복하거나 화면 사이에서 이어 재생하지 않는다.
════════════════════════════════════════════════ */
const SCENE_SOUND = (() => {
  const opening = new Audio('sounds/bgm_opening1.mp3');
  const start = new Audio('sounds/bgm_start.mp3');
  const retryEvents = ['pointerdown', 'touchstart', 'keydown'];
  let openingStarted = false;
  let openingRetryUsed = false;

  [opening, start].forEach(audio => {
    audio.preload = 'auto';
    audio.volume = 0.7;
  });

  function removeOpeningRetry() {
    retryEvents.forEach(type => document.removeEventListener(type, retryOpening, true));
  }

  function retryOpening() {
    if (openingStarted || openingRetryUsed) return;
    openingRetryUsed = true;
    removeOpeningRetry();
    opening.play()
      .then(() => { openingStarted = true; })
      .catch(() => {});
  }

  function playOpeningOnce() {
    if (openingStarted) return;
    opening.play()
      .then(() => {
        openingStarted = true;
        removeOpeningRetry();
      })
      .catch(() => {
        // 자동 재생이 차단된 경우에만 최초 사용자 입력에서 딱 한 번 다시 시도한다.
        retryEvents.forEach(type => document.addEventListener(type, retryOpening, {
          capture: true,
          once: true,
          passive: true
        }));
      });
  }

  function playStart() {
    start.pause();
    start.currentTime = 0;
    start.play().catch(() => {});
  }

  return { playOpeningOnce, playStart };
})();

function initUiSounds() {
  const cardSounds = ['pong1', 'pong2', 'pong3', 'pong4', 'pong5'];
  const categorySounds = ['card', 'card1', 'card2'];
  const cardClickCounts = new WeakMap();

  function playRandom(sounds) {
    UI_SOUND.play(sounds[Math.floor(Math.random() * sounds.length)]);
  }

  function playActivationSound(event) {
    const target = event.target.closest('button, [role="button"], [onclick], .pressable, .card-info-popover');
    if (!target || target.disabled) return;

    // 완료된 `click`에서만 피드백을 재생한다. 특히 pointerdown/touchstart는 손가락이
    // 닿는 즉시뿐 아니라 스크롤이나 길게 누르기를 시작할 때도 발생하므로 사용하지 않는다.
    if (target.matches('.data-card')) {
      // 브라우저의 더블클릭은 보통 click 두 번 뒤에 dblclick 한 번을 보낸다.
      // 각 click에 한 번만 재생하면 일반 클릭은 1회, 더블클릭은 정확히 2회가 된다.
      // 일부 환경이 click을 하나만 보낼 경우 아래 dblclick 보정기가 빠진 한 번만 채운다.
      playRandom(cardSounds);
      const now = performance.now();
      const count = event.detail >= 2 ? 2 : 1;
      cardClickCounts.set(target, { count, time: now });
    } else if (target.matches('#btn-extra-menu')) {
      UI_SOUND.play(extraMenuOpen ? 'category4' : 'category3');
    } else if (target.matches('.extra-btn-home')) {
      UI_SOUND.play('selectNo');
    } else if (target.matches('.extra-btn, .group-select-btn')) {
      UI_SOUND.play('click');
    } else if (target.matches('.subnav-item')) {
      playRandom(categorySounds);
    } else if (target.matches('.app-dialog-btn-cancel, .card-info-close, .status-close, .detail-close')) {
      UI_SOUND.play('cancel');
    } else if (target.matches('.app-dialog-btn-confirm, .card-info-select')) {
      // 확인 버튼에 지정된 효과음은 클릭이 확정되는 즉시 재생한다. 별도 효과음이 없는
      // 선택 버튼의 결과별 효과음은 실제 동작을 처리하는 핸들러에서 재생한다.
      if (target.dataset.sound) UI_SOUND.play(target.dataset.sound);
      return;
    } else if (target.matches('.card-info-lock')) {
      // 잠금 해제는 선택 취소와 같은 취소 피드백을 사용하고, 잠금 설정은
      // 기존의 일반 클릭 효과음을 그대로 유지한다.
      UI_SOUND.play(target.classList.contains('is-locked') ? 'cancel' : 'click');
    } else if (target.dataset.sound) {
      UI_SOUND.play(target.dataset.sound);
    } else if (target.matches('.card-info-detail, .card-info-popover, .detail-idea-block, .detail-sub-image-row')) {
      UI_SOUND.play('touch');
    } else if (target.closest('.bottom-nav')) {
      UI_SOUND.play('nav');
    } else {
      UI_SOUND.play('click');
    }
  }

  // 클릭은 같은 컨트롤 위에서 손을 뗀 뒤에만 전달되며, 일반적인 스크롤 및 드래그
  // 제스처에서는 브라우저가 취소한다. 대상 핸들러가 렌더링이나 이동을 수행하기 전에
  // 이를 캡처하여 UI 작업이 끝난 뒤가 아니라 입력이 확정되는 순간 재생을 시작한다.
  // 이것이 유일한 일반 활성화 경로이므로 touchend/pointerup에서 중복 실행되지 않는다.
  document.addEventListener('click', event => {
    const card = event.target.closest('.data-card');
    if (card && _lpDidFire) return;
    if (card && _suppressedTouchClick?.card === card
        && performance.now() - _suppressedTouchClick.time < 600) {
      _suppressedTouchClick = null;
      return;
    }
    playActivationSound(event);
  }, { capture: true });

  document.addEventListener('dblclick', event => {
    const card = event.target.closest('.data-card');
    if (!card) return;
    const recent = cardClickCounts.get(card);
    const count = recent && performance.now() - recent.time < 600 ? recent.count : 0;
    for (let i = count; i < 2; i++) {
      setTimeout(() => playRandom(cardSounds), i * 70);
    }
    cardClickCounts.delete(card);
  }, { capture: true });
}

/* ════════════════════════════════════════════════
   창작 페이지 배경
   nav 종류와 화면 단계(top/group/card)별 후보를 한 곳에서 관리합니다.
════════════════════════════════════════════════ */
const CREATIVE_BACKGROUNDS = {
  character: {
    top: ['top_character-1.jpg', 'top_character-2.jpg', 'top_character-3.jpg'],
    group: ['group_character-1.jpg', 'group_character-2.jpg'],
    card: ['card_character-1.jpg', 'card_character-2.jpg', 'card_character-3.jpg', 'bg_monster.jpg'],
  },
  narrative2: {
    top: ['top_story.jpg', 'top_story-1.jpg', 'top_story-2.jpg'],
    group: ['group_story.jpg', 'group_story-1.jpg', 'group_story-2.jpg', 'group_story-3.jpg', 'group_story-4.jpg'],
    card: ['card_story-1.jpg', 'card_story-2.jpg', 'card_story-3.jpg', 'card_story-4.jpg', 'card_story-5.jpg'],
  },
  world: {
    top: ['top_world-1.jpg', 'top_world-2.jpg', 'top_world-3.jpg'],
    group: ['group_world-1.jpg', 'group_world-2.jpg'],
    card: ['bg_map.jpg', 'card_world-1.jpg', 'card_world-2.jpg', 'card_world-3.jpg', 'card_world-4.jpg', 'card_world-5.jpg', 'card_world-6.jpg'],
  },
  compass: {
    top: ['top_comp.jpg'],
    group: ['group_comp-1.jpg', 'group_comp-2.jpg', 'group_comp-3.jpg'],
    card: ['card_comp-1.jpg', 'card_comp-2.jpg', 'card_comp-3.jpg', 'card_comp-4.jpg'],
  },
};

// 배경 후보의 단일 원본은 CREATIVE_BACKGROUNDS로 유지한다. 화면에서 어떤 배경을
// 선택할지는 기존 getCreativeBackground가 진입 시점에 결정하고, 이 목록은 파일을
// 미리 다운로드/디코드하는 데만 사용한다.
const CREATIVE_BACKGROUND_SOURCES = [...new Set(
  Object.values(CREATIVE_BACKGROUNDS).flatMap(stages =>
    Object.values(stages).flatMap(files =>
      files.map(file => `images/core/home/${file}`)))
)];

function preloadCreativeBackgrounds() {
  // 모바일에서 한꺼번에 수십 장을 디코드하지 않도록 작은 묶음으로 진행한다.
  // IMAGE_LOADER는 개별 실패를 false로 처리하고 실패한 작업을 캐시에서 제거하므로
  // 나중에 실제 화면이 요청할 때 같은 URL을 다시 시도할 수 있다.
  return IMAGE_LOADER.preload(CREATIVE_BACKGROUND_SOURCES, { limit: 4 });
}

let activeBackgroundScreen = null;
let backgroundSessionSubId = null;
const creativeBackgroundMemory = new Map();
let visibleBackgroundLayer = -1;
let visibleBackgroundUrl = null;
let backgroundRequestId = 0;
let runningBackgroundTransition = null;
let currentBackgroundDescriptor = null;

function backgroundCssValue(imageUrl) {
  return `url(${JSON.stringify(imageUrl)})`;
}

function layerHasBackground(layer) {
  return Boolean(layer?.style.backgroundImage && layer.style.backgroundImage !== 'none');
}

function layerShowsBackground(layer, imageUrl) {
  return layerHasBackground(layer)
    && layer.classList.contains('is-active')
    && layer.style.backgroundImage === backgroundCssValue(imageUrl);
}

function setBackgroundLayerActive(layers, activeLayer) {
  layers.forEach(layer => {
    const isActive = layer === activeLayer;
    layer.classList.toggle('is-active', isActive);
    layer.classList.toggle('is-inactive', !isActive);
    layer.classList.remove('is-incoming');
    layer.style.opacity = isActive ? '1' : '0';
  });
}

function getCreativeBackground(navId, stage) {
  const candidates = CREATIVE_BACKGROUNDS[navId]?.[stage];
  if (!candidates?.length) return null;
  const filename = candidates[Math.floor(Math.random() * candidates.length)];
  return `images/core/home/${filename}`;
}

async function applyCreativeBackground({ navId = currentNav, stage, screenKey }) {
  const area = document.getElementById('center-area');
  if (!area || !stage || !screenKey) return;

  // 배경 단계 정보는 향후 단계별 화면 처리가 필요할 때 사용할 수 있도록 유지한다.
  area.dataset.backgroundStage = stage;

  const activationKey = `${navId}:${stage}:${screenKey}`;
  currentBackgroundDescriptor = { navId, stage, screenKey };

  // 화면별 선택 기억과 이미지 로더의 요청 캐시는 별개다. 여기에는 실제 로딩에
  // 성공한 선택만 저장하며, 실패하거나 취소된 후보는 다음 방문을 막지 않는다.
  let path = creativeBackgroundMemory.get(activationKey);
  if (!path) {
    path = getCreativeBackground(navId, stage);
  }
  if (!path) return;
  let imageUrl = new URL(path, document.baseURI).href;

  // Do not use activeBackgroundScreen alone as a completion signal. It is set
  // before load/decode finishes, so A -> B -> A can invalidate A's first
  // request and then mistake that cancelled request for a visible background.
  // Only a committed layer (or the exact fade already in progress) may skip
  // the work. This is especially important for rapid back-swipe navigation.
  const layers = Array.from(area.querySelectorAll('.creative-background-layer'));
  const committedLayer = visibleBackgroundLayer >= 0 ? layers[visibleBackgroundLayer] : null;
  if (activeBackgroundScreen === activationKey
      && (layerShowsBackground(committedLayer, imageUrl)
        || (runningBackgroundTransition?.imageUrl === imageUrl
          && layerHasBackground(runningBackgroundTransition.nextLayer)))) return;

  activeBackgroundScreen = activationKey;
  const requestId = ++backgroundRequestId;

  // Navigation supersedes an in-flight fade immediately, not after its timer resolves.
  // Keep the last fully visible layer as the base while the newest image is prepared.
  // This prevents an obsolete request from extending the navigation by one fade duration
  // or committing its URL after a quick back/forward gesture.
  cancelRunningBackgroundTransition();
  /*
   * 이 값은 css/style.css 안에서 실제 background-image로 사용됩니다. 상대 경로를
   * 그대로 넘기면 브라우저가 CSS 파일 위치(css/)를 기준으로 해석하여
   * css/images/...를 찾게 되고, 이미지 대신 배경색만 보일 수 있습니다.
   * 현재 문서 주소를 기준으로 절대 URL을 만든 뒤 넘겨 어느 배포 경로에서도
   * 올바른 이미지 파일을 가리키게 합니다.
   */
  // 이전 배경/기본색은 새 배경이 실제 디코드될 때까지 그대로 둔다.
  let loaded = await IMAGE_LOADER.load(imageUrl);
  if (requestId !== backgroundRequestId || activeBackgroundScreen !== activationKey) return;

  // Do not strand the page on its plain fallback because one randomly chosen
  // file had a transient cache/network failure. Try the remaining images for
  // this stage and remember the first usable replacement for this route.
  if (!loaded) {
    const alternatives = (CREATIVE_BACKGROUNDS[navId]?.[stage] || [])
      .map(file => new URL(`images/core/home/${file}`, document.baseURI).href)
      .filter(url => url !== imageUrl);
    for (const alternativeUrl of alternatives) {
      loaded = await IMAGE_LOADER.load(alternativeUrl);
      if (requestId !== backgroundRequestId || activeBackgroundScreen !== activationKey) return;
      if (loaded) {
        imageUrl = alternativeUrl;
        break;
      }
    }
  }
  if (!loaded) return;

  // A successful URL belongs to this route for the rest of this creative
  // session, independently of whether a later navigation cancels its fade.
  creativeBackgroundMemory.set(activationKey, imageUrl);

  // 이미 화면에 있는 배경이라면 레이어를 다시 교차시켜 깜빡임을 만들지 않는다.
  if (visibleBackgroundUrl === imageUrl) {
    const restoredLayer = committedLayer || layers[0];
    if (!restoredLayer) return;
    restoredLayer.style.backgroundImage = backgroundCssValue(imageUrl);
    setBackgroundLayerActive(layers, restoredLayer);
    visibleBackgroundLayer = layers.indexOf(restoredLayer);
    activeBackgroundScreen = activationKey;
    return;
  }
  if (layers.length < 2) return;

  const nextLayerIndex = visibleBackgroundLayer === 0 ? 1 : 0;
  const nextLayer = layers[nextLayerIndex];
  const previousLayer = visibleBackgroundLayer >= 0 ? layers[visibleBackgroundLayer] : null;
  nextLayer.classList.remove('is-active', 'is-inactive');
  nextLayer.style.backgroundImage = backgroundCssValue(imageUrl);
  nextLayer.style.opacity = '0';
  nextLayer.classList.add('is-incoming');

  // 스타일을 먼저 확정한 다음 B만 A 위에서 나타나게 한다. A는 B가 완전히
  // 불투명해진 뒤에만 정리하므로 전환 중 흰색/투명 프레임이 생기지 않는다.
  void nextLayer.offsetWidth;
  const transition = {
    requestId,
    nextLayer,
    nextLayerIndex,
    previousLayer,
    imageUrl,
    timer: null,
    onTransitionEnd: null,
  };
  const finish = () => finishBackgroundTransition(transition);
  transition.onTransitionEnd = event => {
    if (event.propertyName === 'opacity') finish();
  };
  runningBackgroundTransition = transition;
  nextLayer.addEventListener('transitionend', transition.onTransitionEnd);
  requestAnimationFrame(() => {
    if (runningBackgroundTransition !== transition || requestId !== backgroundRequestId) return;
    nextLayer.style.opacity = '1';
    // transitionend가 생략되는 브라우저/백그라운드 탭에서도 버퍼를 해제한다.
    transition.timer = setTimeout(finish, 360);
  });
}

function finishBackgroundTransition(transition) {
  if (runningBackgroundTransition !== transition || transition.requestId !== backgroundRequestId) return;
  clearTimeout(transition.timer);
  transition.nextLayer.removeEventListener('transitionend', transition.onTransitionEnd);
  const area = transition.nextLayer.closest('.center-area');
  const layers = Array.from(area?.querySelectorAll('.creative-background-layer') || []);
  // Mark every non-owner inactive while the new owner is still above it. The
  // inactive class suppresses opacity transitions, so an old retained bitmap
  // cannot fade over (or flash after) the newly committed background.
  setBackgroundLayerActive(layers, transition.nextLayer);
  visibleBackgroundLayer = transition.nextLayerIndex;
  visibleBackgroundUrl = transition.imageUrl;
  runningBackgroundTransition = null;
}

function cancelRunningBackgroundTransition() {
  const transition = runningBackgroundTransition;
  if (!transition) return;
  clearTimeout(transition.timer);
  transition.nextLayer.removeEventListener('transitionend', transition.onTransitionEnd);
  transition.nextLayer.classList.remove('is-incoming', 'is-active');
  transition.nextLayer.classList.add('is-inactive');
  transition.nextLayer.style.opacity = '0';
  if (transition.previousLayer) {
    transition.previousLayer.classList.remove('is-incoming', 'is-inactive');
    transition.previousLayer.classList.add('is-active');
    transition.previousLayer.style.opacity = '1';
  }
  runningBackgroundTransition = null;
}

// A back swipe can interrupt a crossfade between its last animation frame and
// transitionend cleanup. Pin the last committed image before rebuilding the
// previous page so cancellation can never leave both buffers transparent.
// The destination still goes through applyCreativeBackground and its existing
// preload/decode/crossfade path; this only protects the swipe-back handoff.
function retainCreativeBackgroundForSwipeBack() {
  const area = document.getElementById('center-area');
  if (!area) return;

  backgroundRequestId++;
  cancelRunningBackgroundTransition();

  const layers = Array.from(area.querySelectorAll('.creative-background-layer'));
  let retainedLayer = visibleBackgroundLayer >= 0 ? layers[visibleBackgroundLayer] : null;
  const hasImage = layerHasBackground;

  if (!hasImage(retainedLayer)) {
    retainedLayer = layers.find(layer => hasImage(layer) && layer.style.opacity !== '0')
      || layers.find(hasImage)
      || null;
    if (retainedLayer) visibleBackgroundLayer = layers.indexOf(retainedLayer);
  }

  // Metadata can outlive inline styles during an interrupted cleanup. Reapply
  // the already decoded/visible URL rather than selecting or loading a new one.
  if (!hasImage(retainedLayer) && visibleBackgroundUrl && layers.length > 0) {
    retainedLayer = layers[visibleBackgroundLayer >= 0 ? visibleBackgroundLayer : 0];
    retainedLayer.style.backgroundImage = backgroundCssValue(visibleBackgroundUrl);
    visibleBackgroundLayer = layers.indexOf(retainedLayer);
  }

  if (retainedLayer) setBackgroundLayerActive(layers, retainedLayer);
}

function resetCreativeBackgroundActivation() {
  backgroundRequestId++;
  cancelRunningBackgroundTransition();
  activeBackgroundScreen = null;
  backgroundSessionSubId = null;
  currentBackgroundDescriptor = null;
  creativeBackgroundMemory.clear();
}

// Safari can restore a PWA page from its back/forward cache without rerunning the
// render functions. Inline compositor state is not always restored with the JS
// heap, so reassert the selected URL on pageshow/foreground instead of choosing
// another random image. applyCreativeBackground also verifies the actual layer,
// rather than trusting metadata that may have survived a discarded WebKit layer.
function restoreCreativeBackgroundAfterPageResume() {
  const createScreen = document.getElementById('screen-create');
  if (!createScreen?.classList.contains('active') || !currentBackgroundDescriptor) return;
  retainCreativeBackgroundForSwipeBack();
  applyCreativeBackground(currentBackgroundDescriptor);
}

window.addEventListener('pageshow', restoreCreativeBackgroundAfterPageResume);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') restoreCreativeBackgroundAfterPageResume();
});

function beginBackgroundCategorySession(subId) {
  // Keep every route's selection for the lifetime of the creative session.
  // The activation key already contains nav/stage/path, so retaining entries
  // cannot leak one category's image into another. Clearing here used to make
  // a revisited group pick a new random card background instead of restoring it.
  backgroundSessionSubId = subId;
}


/* ════════════════════════════════════════════════
   상태
════════════════════════════════════════════════ */
let currentNav   = 'character';
let currentSubId = null;
let selectedCards = {};   // { subId: Set<idx> }
let lockedCards = {};     // { subId: Set<idx> } - random/partial reset에서 유지할 카드
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

/* 하단 내비게이션의 선택 상태 이미지(-a)를 상단 패널에서도 그대로 사용한다. */
const MAIN_CATEGORY_IMAGE = {
  character:  `images/core/buttons/nav_character-a.webp?v=${NAV_IMAGE_VERSION}`,
  narrative2: `images/core/buttons/nav_story-a.webp?v=${NAV_IMAGE_VERSION}`,
  world:      `images/core/buttons/nav_world-a.webp?v=${NAV_IMAGE_VERSION}`,
  compass:    `images/core/buttons/nav_compass-a.webp?v=${NAV_IMAGE_VERSION}`
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
  // 첫 카드보다 앞에 섹션이 나타나 초기 그리드가 비어 있을 수 있다. 페이지에서
  // 첫 번째로 *실제로 표시되는* 행만 최상단 행이며, 이후 섹션 헤더 다음에 시작되는 행은
  // 팝오버를 계속 카드 위에 표시해야 한다.
  const grids = Array.from(page.querySelectorAll('.card-grid'));
  const firstCards = grids
    .map(grid => Array.from(grid.querySelectorAll('.data-card')))
    .find(cards => cards.length > 0);
  const cards = firstCards || [];
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
  retainCreativeBackgroundForSwipeBack();
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

    if (shouldGoBack) {
      UI_SOUND.play('page');
      navigateAddressBack();
    }
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
   오프닝 애니메이션
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
window.addEventListener('load', async () => {
  SCENE_SOUND.playOpeningOnce();
  IMAGE_LOADER.watch();
  // 홈의 두 장만 첫 전환 전에 기다리고, 공통 UI는 홈을 보는 동안 준비한다.
  await Promise.race([
    IMAGE_LOADER.preload(CORE_IMAGE_SOURCES.slice(0, 2), { background: false, limit: 2 }),
    new Promise(resolve => setTimeout(resolve, 1200))
  ]);
  switchScreen('screen-home', null, { type: 'launch', duration: FADE_MS_LAUNCH });
  // 첫 화면 전환을 먼저 시작한 뒤 유휴 시간에 모든 창작 화면 배경을 준비한다.
  // 배경 선택/화면별 기억 로직에는 관여하지 않는다.
  preloadCreativeBackgrounds();
  IMAGE_LOADER.preload(CORE_IMAGE_SOURCES.slice(2));
  preloadNavImages('character');
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js')
    .catch(error => console.warn('Service worker registration failed:', error)));
}



initCenterBackSwipe();
initScrollResponsiveChrome();
initInfoTextAutoFit();
initUiSounds();

/* ════════════════════════════════════════════════
   카드 제목 자동 맞춤
   CSS는 각 레이아웃에 하나의 표준 크기를 제공한다. 자동 맞춤은 의도적으로 내용이
   넘칠 때를 대비한 안전장치일 뿐이며, 개별 짧은 제목을 확대하지 않는다.
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

  // 문구가 양피지 경계에 바로 닿게 두지 않고 적당한 세로 안전 영역을 유지한다.
  // 문구 레이어의 CSS 너비가 이에 맞는 가로 안전 영역을 제공한다.
  const availableHeight = height - Math.max(3, height * 0.1);
  const standardLineHeight = standardLineHeightPx / standardSize;
  const candidates = getCardTitleCandidates(standardSize);

  for (const size of candidates) {
    applyCardTitleSize(text, size, standardLineHeight);
    if (cardTitleFits(text, availableHeight)) return;
  }

  // 최소 크기에서도 여전히 넘치는 극단적으로 긴 제목에만 줄 간격을 조금 좁게 적용한다.
  // 일반적인 한 줄 및 여러 줄 카드는 레이아웃별로 같은 여유로운 간격을 공유한다.
  const minimumSize = candidates[candidates.length - 1];
  const compactLineHeight = standardLineHeight * CARD_TITLE_COMPACT_LINE_HEIGHT_SCALE;
  applyCardTitleSize(text, minimumSize, compactLineHeight);
  if (cardTitleFits(text, availableHeight)) return;

  // 극단적으로 긴 제목은 양피지 밖으로 벗어나지 않고 .card-name에서 잘린다.
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

// 맞춤 로직은 위에서 선언한 상태를 즉시 읽으므로, 해당 상태가 일시적 사각지대를
// 벗어난 뒤에만 초기화한다.
initCardTitleAutoFit();

/* ════════════════════════════════════════════════
   정보 패널 문구 자동 맞춤
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
   스크롤 반응형 창작 화면 장식
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
   화면 전환
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
   내비게이션
════════════════════════════════════════════════ */
function goHome() {
  closeCardInfo();
  closeDetailSheet();
  closeStatusOverlay();
  closeExtraMenu({ instant: true });
  
  const createScreen = document.getElementById('screen-create');
  if (createScreen) createScreen.classList.remove('entering');
  resetCreativeBackgroundActivation();

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
  SCENE_SOUND.playStart();

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
   주 내비게이션 전환
════════════════════════════════════════════════ */
function switchNav(navId, skipAnimation, options = {}) {
  if (navId === currentNav && !skipAnimation && addressTrail.length > 0 && !options.force) return;

  const prev = currentNav;
  if (prev !== navId) resetCreativeBackgroundActivation();
  currentNav = navId;
  currentSubId = null;

    // 버튼 상태 (인스타그램식 선택 배경 이동 — CSS transition)
  setBottomNavState(navId);

  // 부분 초기화 버튼은 이미지로만 표시합니다.  텍스트 표기 하려면 NAV부분 추가해야함 →　if → .textContent = NAV_DATA[navId].resetLabel;
  const partialResetLabel = document.querySelector('#btn-partial-reset .extra-btn-label');
  if (partialResetLabel) partialResetLabel.textContent = '';

  // 서브 메뉴 렌더
  renderSubnav(navId, !skipAnimation && prev !== navId);
  preloadNavImages(navId);

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
   하위 메뉴 선택
════════════════════════════════════════════════ */
function selectSub(subId, navId) {
  closeCardInfo();
  beginBackgroundCategorySession(subId);
  // 이전 active 제거
  document.querySelectorAll('.subnav-item').forEach(el => el.classList.remove('active'));
  // 현재 active
  const el = document.querySelector(`[data-sub-id="${subId}"]`);
  if (el) el.classList.add('active');

  const same = currentSubId === subId;
  currentSubId = subId;
  showCardPage(subId, !same);
  const data = CARD_DATA[subId];
  if (data?.groups) preloadGroupDestinations(subId);
  else preloadCards(data);
  updateInfoPanel();
    setSubAddress(subId, navId || currentNav);
}

/* ════════════════════════════════════════════════
   중앙 표시 영역
════════════════════════════════════════════════ */
function showDefaultCenter() {
  closeCardInfo();
  const area = document.getElementById('center-area');

  // 기존 동적 페이지 제거
  area.querySelectorAll('.center-page:not(#page-default)').forEach(p => p.remove());

  const def = document.getElementById('page-default');
  def.classList.add('active');
  applyCreativeBackground({ navId: currentNav, stage: 'top', screenKey: 'top' });
}




function getGroupLayoutClass(count) {
  if (count === 2) return 'group-layout-two';
  if (count === 4) return 'group-layout-four';
  if (count === 6) return 'group-layout-six';
  if (count >= 6) return 'group-layout-grid';
  return 'group-layout-list';
}

const CARD_REVEAL_DURATION_MS = 450;
const CARD_REVEAL_WAVE_GAP_MS = 80;
const CARD_REVEAL_BURST_CARD_INDEX = 11;
const CARD_REVEAL_EXTRA_WAVE_STEPS = 2;
// Seven or more groups use a cumulative, accelerating reveal. These are the
// gaps *before* each following button: the opening order remains legible, then
// contracts into a quick stream. Every button after the tenth uses the final
// short gap, so a large group never turns into a long one-by-one sequence.
const GROUP_REVEAL_ACCELERATING_GAPS_MS = [80, 65, 55, 48, 42, 38, 32, 25, 18];
const GROUP_REVEAL_TAIL_GAP_MS = 12;

function getGroupRevealDelayMs(index, count) {
  const groupIndex = Math.max(0, Number(index) || 0);
  const groupCount = Math.max(0, Number(count) || 0);

  // 2~6개는 같은 그리드/목록 계열의 기존 등장 간격을 유지한다.
  if (groupCount <= 6) return groupIndex * 140;

  let delay = 0;
  for (let step = 0; step < groupIndex; step++) {
    delay += GROUP_REVEAL_ACCELERATING_GAPS_MS[step] ?? GROUP_REVEAL_TAIL_GAP_MS;
  }
  return delay;
}

function getCardRevealDelayStyle() {
  return `--card-reveal-duration:${CARD_REVEAL_DURATION_MS}ms`;
}

function setupCardRevealAnimations(page) {
  const cards = Array.from(page.querySelectorAll('.card-deal'));
  const rows = [];

  // 실제 배치 좌표로 행과 열을 찾으므로 3·4·5열과 섹션으로 나뉜 그리드에 모두 대응한다.
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    let row = rows.find(candidate => Math.abs(candidate.top - rect.top) < 1);
    if (!row) {
      row = { top: rect.top, cards: [] };
      rows.push(row);
    }
    row.cards.push({ card, left: rect.left });
  });

  rows.sort((a, b) => a.top - b.top);
  const waveSteps = new Map();
  rows.forEach((row, rowIndex) => {
    row.cards.sort((a, b) => a.left - b.left);
    row.cards.forEach(({ card }, columnIndex) => {
      waveSteps.set(card, rowIndex + columnIndex);
    });
  });

  // 12번째 카드의 파동 뒤 두 단계를 더 보여 준 다음, 남은 카드도 같은 flip으로 함께 시작한다.
  const twelfthCardWave = waveSteps.get(cards[CARD_REVEAL_BURST_CARD_INDEX]);
  const lastSequentialWave = twelfthCardWave === undefined
    ? Infinity
    : twelfthCardWave + CARD_REVEAL_EXTRA_WAVE_STEPS;
  const burstWave = lastSequentialWave + 1;

  cards.forEach(card => {
    const naturalWave = waveSteps.get(card) || 0;
    const wave = naturalWave > lastSequentialWave ? burstWave : naturalWave;
    card.style.animationDelay = `${wave * CARD_REVEAL_WAVE_GAP_MS}ms`;

    // 각 카드는 이후 순차 공개를 기다리는 다른 카드와 관계없이 자신의 공개가
    // 시작되는 순간 사용할 수 있게 된다.
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
  applyCreativeBackground({ navId: currentNav, stage: 'group', screenKey: `group:${subId}` });

  const page = document.createElement('div');
  page.className = 'center-page active';
  page.id = 'page-' + subId;

  const groupLayoutClass = getGroupLayoutClass(data.groups.length);
  const groupRevealClass = data.groups.length >= 7
    ? ' group-reveal-flow group-reveal-accelerating'
    : '';
  let html = `<div class="group-select-wrap ${groupLayoutClass}${groupRevealClass}">`;
  data.groups.forEach((grp, i) => {
    // This page is rebuilt whenever it becomes visible. Always restoring the
    // delay makes re-entry (including the same category and swipe-back) replay
    // only the reveal animation without touching selection/UI state.
    const delay = `style="animation-delay:${getGroupRevealDelayMs(i, data.groups.length)}ms"`;

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
  IMAGE_LOADER.preload(imageSources(grp.subgroups));
  grp.subgroups.forEach(sg => preloadCards(sg.cards));
  applyCreativeBackground({ navId: currentNav, stage: 'group', screenKey: `subgroup:${subId}:${groupIdx}` });

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

     const delay = `style="animation-delay:${sgIdx * 0.14}s"`;
     
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
  applyCreativeBackground({ navId: currentNav, stage: 'card', screenKey: `subgroup-cards:${subId}:${groupIdx}:${sgIdx}` });

  const sg = grp.subgroups[sgIdx];
  if (!sg) return;
  preloadCards(sg.cards);

  document.querySelectorAll('.center-page:not(#page-default)').forEach(p => p.remove());

  const page = document.createElement('div');
  page.className = 'center-page active';
  page.id = `page-${subId}_sgc_${grp.id}_${sg.id}`;

  if (!selectedCards[subId]) selectedCards[subId] = new Set();

 let html = getCardGridOpenTag(grp);

  sg.cards.forEach((card, rawIdx) => {
    if (card.type === 'section') {
      html += `</div><div class="card-section-header">${formatSectionHeaderLabel(card.label)}</div>${getCardGridOpenTag(grp)}`;
      return;
    }
    const idx = rawIdx;
   // globalIdx = (groupIdx + 1) * 1000000 + sgIdx * 1000 + idx
    const globalIdx = getSubgroupCardGlobalIdx(groupIdx, sgIdx, idx);
    const sel = selectedCards[subId].has(globalIdx) ? ' selected' : '';
    const locked = lockedCards[subId]?.has(globalIdx) ? ' locked' : '';
    html += `
      <div class="data-card pressable card-deal${sel}${locked}"
        style="${getCardRevealDelayStyle()}"
         data-global-idx="${globalIdx}"
        onclick="subgroupCardClick('${subId}', ${groupIdx}, ${sgIdx}, ${idx})"
        ondblclick="openSubgroupCardDetail('${subId}', ${groupIdx}, ${sgIdx}, ${idx})"
        onmousedown="startLongPress(event,this,'subgroup','${subId}',${groupIdx},${sgIdx},${idx})"
        ontouchstart="startLongPress(event,this,'subgroup','${subId}',${groupIdx},${sgIdx},${idx})"
        onmouseup="cancelLongPress()" ontouchend="handleCardTouchEnd(event,'subgroup','${subId}',${groupIdx},${sgIdx},${idx})"
        onmouseleave="cancelLongPress()" ontouchcancel="cancelLongPress()">
        <img class="card-lock-mark" src="images/core/buttons/lock.webp" alt="잠금됨" draggable="false">
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
    if (isCardLocked(subId, globalIdx)) return;
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
  preloadCards(grp.cards);
  applyCreativeBackground({ navId: currentNav, stage: 'card', screenKey: `group-cards:${subId}:${groupIdx}` });

  document.querySelectorAll('.center-page:not(#page-default)').forEach(p => p.remove());

  const page = document.createElement('div');
  page.className = 'center-page active';
  page.id = 'page-' + subId + '_' + grp.id;

  if (!selectedCards[subId]) selectedCards[subId] = new Set();

  // 카드 idx = groupIdx * 1000 + cardIdx
  const offset = groupIdx * 1000;

  let html = getCardGridOpenTag(grp);
  grp.cards.forEach((card, rawIdx) => {
    if (card.type === 'section') {
      html += `</div><div class="card-section-header">${formatSectionHeaderLabel(card.label)}</div>${getCardGridOpenTag(grp)}`;
      return;
    }
    const idx = rawIdx;
    const globalIdx = getGroupCardGlobalIdx(groupIdx, idx);
    const sel = selectedCards[subId].has(globalIdx) ? ' selected' : '';
    const locked = lockedCards[subId]?.has(globalIdx) ? ' locked' : '';
    html += `
  <div class="data-card pressable card-deal${sel}${locked}"
    style="${getCardRevealDelayStyle()}"
    data-global-idx="${globalIdx}"
    onclick="groupCardClick('${subId}', ${groupIdx}, ${idx})"
    ondblclick="openGroupCardDetail('${subId}', ${groupIdx}, ${idx})"
    onmousedown="startLongPress(event,this,'group','${subId}',${groupIdx},${idx})"
    ontouchstart="startLongPress(event,this,'group','${subId}',${groupIdx},${idx})"
    onmouseup="cancelLongPress()" ontouchend="handleCardTouchEnd(event,'group','${subId}',${groupIdx},${idx})"
    onmouseleave="cancelLongPress()" ontouchcancel="cancelLongPress()">
        <img class="card-lock-mark" src="images/core/buttons/lock.webp" alt="잠금됨" draggable="false">
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
    if (isCardLocked(subId, globalIdx)) return;
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
  applyCreativeBackground({ navId: currentNav, stage: 'card', screenKey: `cards:${subId}` });

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

  cards.forEach((card, rawIdx) => {
    if (card.type === 'section') {
      html += `</div><div class="card-section-header">${formatSectionHeaderLabel(card.label)}</div>${getCardGridOpenTag()}`;
      return;
    }
    const idx = rawIdx;       // ← 배열 원본 인덱스
    const sel = selectedCards[subId].has(idx) ? ' selected' : '';
    const locked = lockedCards[subId]?.has(idx) ? ' locked' : '';
    const deal = animate ? ' card-deal' : '';
    const delay = animate ? ` style="${getCardRevealDelayStyle()}"` : '';
   html += `
  <div class="data-card pressable${sel}${locked}${deal}"${delay}
    data-global-idx="${idx}"
    onclick="cardClick('${subId}', ${idx})"
    ondblclick="openCardDetail('${subId}', ${idx})"
    onmousedown="startLongPress(event,this,'card','${subId}',${idx})"
    ontouchstart="startLongPress(event,this,'card','${subId}',${idx})"
    onmouseup="cancelLongPress()"  ontouchend="handleCardTouchEnd(event,'card','${subId}',${idx})"
    onmouseleave="cancelLongPress()" ontouchcancel="cancelLongPress()">
        <img class="card-lock-mark" src="images/core/buttons/lock.webp" alt="잠금됨" draggable="false">
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
  const panel = document.querySelector('.card-info-popover:not(.is-closing)');
  const cardEl = getFocusedCardElement();

  if (!panel || !cardEl) {
    panel?.remove();
    document.querySelectorAll('.data-card.card-info-active').forEach(card => card.classList.remove('card-info-active'));
    focusedCard = null;
    return;
  }

  // 패널을 스크롤 페이지에서 분리해 고정 좌표에 둔다. 축소의 원점은 카드가
  // 아니라 패널에 붙은 마름모 꼬리의 중심으로 잡아 몸체가 꼬리 안으로 접히게 한다.
  const panelRect = panel.getBoundingClientRect();
  const isBelowCard = panel.classList.contains('is-below-card');
  const anchorX = Number.parseFloat(getComputedStyle(panel).getPropertyValue('--card-anchor-x'))
    || panelRect.width / 2;
  // ::before의 16px 마름모는 위/아래 경계에서 10px만큼 바깥에 놓인다.
  // 그 중심은 아래 꼬리에서는 height - 2px, 위 꼬리에서는 2px 지점이다.
  const tailCenterY = isBelowCard ? 2 : panelRect.height - 2;
  const screen = document.getElementById('screen-create');

  // 꼬리가 위에 달린 첫 행 패널도 닫히는 동안 방향을 그대로 유지한다.
  panel.classList.remove('is-positioned', 'is-body-pressing');
  panel.classList.add('is-closing');
  panel.style.left = `${panelRect.left}px`;
  panel.style.top = `${panelRect.top}px`;
  panel.style.width = `${panelRect.width}px`;
  panel.style.height = `${panelRect.height}px`;
  panel.style.setProperty('--card-tail-origin-x', `${anchorX}px`);
  panel.style.setProperty('--card-tail-origin-y', `${tailCenterY}px`);
  screen.appendChild(panel);

  cardEl.classList.remove('card-info-active');
  focusedCard = null;

  let removed = false;
  const removePanel = () => {
    if (removed) return;
    removed = true;
    panel.remove();
  };
  panel.addEventListener('animationend', removePanel, { once: true });
  // background tabs can suppress animation events, so never leave a stale panel behind.
  setTimeout(removePanel, 300);
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
  panel.classList.add('is-positioned');
}

function renderCardInfo() {
  document.querySelectorAll('.card-info-popover:not(.is-closing)').forEach(panel => panel.remove());
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
  const locked = isCardLocked(focusedCard.subId, focusedCard.idx);
  const panel = document.createElement('section');
  panel.className = 'card-info-popover';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', `${focusedCard.name} 카드 정보`);
  panel.setAttribute('tabindex', '0');
  panel.innerHTML = `
    <button type="button" class="card-info-close pressable" aria-label="카드 정보 닫기"><img class="close-icon" src="images/core/buttons/cancel.webp" alt="" aria-hidden="true" draggable="false"></button>
    <div class="card-info-copy card-info-open-area">
      <h3 class="card-info-title">${escapeHtml(focusedCard.name)}</h3>
      <p class="card-info-desc">${escapeHtml(focusedCard.desc || '설명 없음')}</p>
    </div>
    <div class="card-info-actions">
      <button type="button" class="card-info-lock pressable${locked ? ' is-locked' : ''}" aria-label="${locked ? '잠금 해제' : '잠금'}" aria-pressed="${locked}"${selected ? '' : ' disabled title="카드를 먼저 선택해주세요."'}><img src="images/core/buttons/${locked ? 'lock-off' : 'lock-on'}.webp" alt="" aria-hidden="true" draggable="false"></button>
      <button type="button" class="card-info-detail pressable" aria-label="상세정보"><img src="images/core/buttons/detail.webp" alt="" aria-hidden="true" draggable="false"></button>
      <button type="button" class="card-info-select pressable${selected ? ' is-selected' : ''}" aria-label="${selected ? '선택 취소' : '선택'}" aria-pressed="${selected}"${locked ? ' disabled title="잠금을 해제한 뒤 선택을 취소할 수 있습니다."' : ''}><img src="images/core/buttons/${selected ? 'close' : 'select'}.webp" alt="" aria-hidden="true" draggable="false"></button>
    </div>`;
  page.appendChild(panel);
  const openFocusedCardDetail = () => openDetailSheet('card');
  const isPanelAction = target => Boolean(target.closest('button'));
  panel.addEventListener('click', event => {
    if (!isPanelAction(event.target)) openFocusedCardDetail();
  });
  const releaseBodyPress = () => panel.classList.remove('is-body-pressing');
  panel.addEventListener('pointerdown', event => {
    if (!isPanelAction(event.target)) panel.classList.add('is-body-pressing');
  });
  panel.addEventListener('pointerup', releaseBodyPress);
  panel.addEventListener('pointercancel', releaseBodyPress);
  panel.addEventListener('pointerleave', releaseBodyPress);
  panel.addEventListener('keydown', event => {
    if (event.target !== panel || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    openFocusedCardDetail();
  });
  const bindAction = (selector, action) => {
    panel.querySelector(selector).addEventListener('click', event => {
      event.stopPropagation();
      action();
    });
  };
  bindAction('.card-info-close', closeCardInfo);
  bindAction('.card-info-detail', openFocusedCardDetail);
  bindAction('.card-info-select', selectCurrentCard);
  bindAction('.card-info-lock', toggleCurrentCardLock);
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
  const sub = currentSubId ? nav?.subs.find(item => item.id === currentSubId) : null;
  const image = sub?.img || MAIN_CATEGORY_IMAGE[currentNav];
  const icon = sub?.icon || info.icon || '◆';

  setInfoVisual(document.getElementById('info-cat-icon'), image, icon);
  document.getElementById('info-cat-name').textContent = sub?.label || nav?.label || '';
  document.getElementById('info-cat-desc').textContent = sub
    ? getSubDescription(sub.id)
    : (info.description || '');
  requestInfoTextAutoFit();
}

function selectCurrentCard() {
  if (!focusedCard) return;
  const wasSelected = Boolean(selectedCards[focusedCard.subId]?.has(focusedCard.idx));
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
  UI_SOUND.play(wasSelected ? 'cancel' : 'category5');
}

function isCardLocked(subId, idx) {
  return Boolean(lockedCards[subId]?.has(idx));
}

function toggleCurrentCardLock() {
  if (!focusedCard || !selectedCards[focusedCard.subId]?.has(focusedCard.idx)) return;

  const { subId, idx } = focusedCard;
  if (!lockedCards[subId]) lockedCards[subId] = new Set();
  if (lockedCards[subId].has(idx)) {
    lockedCards[subId].delete(idx);
    if (lockedCards[subId].size === 0) delete lockedCards[subId];
  } else {
    lockedCards[subId].add(idx);
  }

  const cardEl = getFocusedCardElement();
  if (cardEl) cardEl.classList.toggle('locked', isCardLocked(subId, idx));
  refreshCardInfo();
}

function toggleCardSelect(subId, idx) {
  if (!selectedCards[subId]) selectedCards[subId] = new Set();
  if (selectedCards[subId].has(idx)) {
    if (isCardLocked(subId, idx)) return;
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
    document.querySelector('.detail-overlay .popup-swipe-frame'),
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
   상태 오버레이
════════════════════════════════════════════════ */
function openStatusOverlay() {
  setBottomNavState('idea');
  renderStatusContent();
  document.getElementById('status-overlay').classList.add('active');
  attachSwipeToClose(
    document.querySelector('.status-overlay .popup-swipe-frame'),
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

async function shareStatus() {
  const format = await showAppDialog('선택된 아이디어를 어떻게 저장할까요?', [
    { label: '이미지로 저장', className: 'app-dialog-btn-confirm', value: 'png' },
    { label: 'PDF로 저장', className: 'app-dialog-btn-confirm', value: 'pdf' },
    { label: '취소', className: 'app-dialog-btn-cancel', value: false }
  ]);
  if (format === 'png') exportStatusAsPng();
  if (format === 'pdf') exportStatusAsPdf();
}

function statusExportFilename(extension, part) {
  const now = new Date();
  const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  return `아이디어통합_${date}${part ? `_${part}` : ''}.${extension}`;
}

function createStatusExportClone() {
  const source = document.querySelector('.status-panel');
  const clone = source.cloneNode(true);
  clone.removeAttribute('style');
  clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
  clone.classList.add('status-export-panel');
  clone.style.width = `${source.getBoundingClientRect().width}px`;
  clone.style.height = 'auto';
  clone.style.maxHeight = 'none';
  clone.style.opacity = '1';
  clone.style.transform = 'none';
  clone.style.overflow = 'visible';
  const body = clone.querySelector('.status-body');
  body.style.height = 'auto';
  body.style.overflow = 'visible';
  body.style.flex = 'none';
  return clone;
}

async function waitForExportImages(root) {
  await Promise.all(Array.from(root.querySelectorAll('img')).map(img => {
    if (img.complete && img.naturalWidth) return Promise.resolve();
    return new Promise(resolve => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    });
  }));
  if (document.fonts?.ready) await document.fonts.ready;
}

async function imageToDataUrl(url) {
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) return url;
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (_) {
    return url;
  }
}

async function prepareCloneForSvg(root) {
  const sourceRoot = document.querySelector('.status-panel');
  const originals = document.querySelectorAll('.status-panel *');
  const clones = root.querySelectorAll('*');
  // foreignObject is isolated from the page stylesheet, so preserve the exact
  // computed appearance on every node rather than changing the visible panel.
  const copyComputedStyle = (original, node) => {
    const computed = getComputedStyle(original);
    node.style.cssText = Array.from(computed).map(prop => `${prop}:${computed.getPropertyValue(prop)};`).join('');
  };
  copyComputedStyle(sourceRoot, root);
  clones.forEach((node, i) => {
    const original = originals[i];
    if (!original) return;
    copyComputedStyle(original, node);
  });
  root.style.width = `${sourceRoot.getBoundingClientRect().width}px`;
  root.style.height = 'auto';
  root.style.maxHeight = 'none';
  root.style.opacity = '1';
  root.style.transform = 'none';
  root.style.overflow = 'visible';
  const body = root.querySelector('.status-body');
  body.style.height = 'auto';
  body.style.overflow = 'visible';
  body.style.flex = 'none';
  await Promise.all(Array.from(root.querySelectorAll('img')).map(async img => {
    img.src = await imageToDataUrl(img.currentSrc || img.src);
  }));
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => canvas.toBlob(
    blob => blob ? resolve(blob) : reject(new Error('PNG 이미지를 만들지 못했습니다.')),
    'image/png'
  ));
}

async function renderStatusSlice(root, width, top, height, scale) {
  const serialized = new XMLSerializer().serializeToString(root);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width * scale}" height="${height * scale}" viewBox="0 0 ${width} ${height}"><foreignObject width="${width}" height="${height}"><div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;transform:translateY(-${top}px);transform-origin:top left">${serialized}</div></foreignObject></svg>`;
  const blobUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error('캡처 이미지를 렌더링하지 못했습니다.'));
      image.src = blobUrl;
    });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(width * scale);
    canvas.height = Math.ceil(height * scale);
    const context = canvas.getContext('2d');
    context.fillStyle = '#f9f9f9';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvasToBlob(canvas);
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

async function deliverExportFiles(files) {
  if (navigator.share && navigator.canShare) {
    const shareFiles = files.map(item => new File([item.blob], item.name, { type: item.blob.type }));
    if (navigator.canShare({ files: shareFiles })) {
      try {
        await navigator.share({ files: shareFiles, title: '선택된 아이디어' });
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }
  }
  files.forEach((item, index) => setTimeout(() => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(item.blob);
    link.download = item.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 30000);
  }, index * 250));
}

async function exportStatusAsPng() {
  const button = document.querySelector('.status-share-btn');
  const originalLabel = button.textContent;
  button.disabled = true;
  button.textContent = '준비 중…';
  const stage = document.createElement('div');
  stage.className = 'status-export-stage';
  const clone = createStatusExportClone();
  stage.appendChild(clone);
  document.body.appendChild(stage);
  try {
    await waitForExportImages(clone);
    await prepareCloneForSvg(clone);
    clone.querySelector('.status-header-actions')?.remove();
    const width = Math.ceil(clone.scrollWidth);
    const fullHeight = Math.ceil(clone.scrollHeight);
    // 16 MP / 8192 px stays below conservative iOS Safari canvas limits.
    const scale = Math.min(2, 8192 / width, Math.sqrt(16000000 / (width * Math.min(fullHeight, 7000))));
    const sliceHeight = Math.max(1, Math.floor(Math.min(7000, 8192 / scale)));
    const count = Math.ceil(fullHeight / sliceHeight);
    const files = [];
    for (let index = 0; index < count; index += 1) {
      const top = index * sliceHeight;
      const height = Math.min(sliceHeight, fullHeight - top);
      const blob = await renderStatusSlice(clone, width, top, height, scale);
      files.push({ blob, name: statusExportFilename('png', count > 1 ? `${index + 1}-${count}` : '') });
    }
    const isAppleTouchDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isAppleTouchDevice && navigator.share && navigator.canShare) {
      // Rendering consumes the original click's transient user activation.
      // A final tap gives Safari/PWA a fresh activation for the native share sheet.
      await showAppDialog('이미지가 준비되었습니다.', [
        { label: '공유 시트 열기', className: 'app-dialog-btn-single', value: true }
      ]);
    }
    await deliverExportFiles(files);
  } catch (error) {
    console.error(error);
    showAppNotice('이미지 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.');
  } finally {
    stage.remove();
    button.disabled = false;
    button.textContent = originalLabel;
  }
}

function exportStatusAsPdf() {
  const printRoot = document.createElement('div');
  printRoot.id = 'status-print-export';
  printRoot.appendChild(createStatusExportClone());
  printRoot.querySelector('.status-header-actions')?.remove();
  document.body.appendChild(printRoot);
  const previousTitle = document.title;
  document.title = statusExportFilename('pdf').replace(/\.pdf$/, '');
  document.body.classList.add('status-printing');
  const cleanup = () => {
    document.body.classList.remove('status-printing');
    printRoot.remove();
    document.title = previousTitle;
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);
  requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  // Some iOS/PWA versions do not dispatch afterprint.
  setTimeout(() => {
    if (document.body.contains(printRoot) && !window.matchMedia('print').matches) cleanup();
  }, 60000);
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
      if (b.sound) btn.dataset.sound = b.sound;
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

function showAppConfirm(msg, confirmSound) {
  return showAppDialog(msg, [
    { label: '아니오', className: 'app-dialog-btn-cancel', value: false },
    { label: '예', className: 'app-dialog-btn-confirm', value: true, sound: confirmSound }
  ]);
}

function refreshStatusIfOpen() {
  const overlay = document.getElementById('status-overlay');
  if (overlay && overlay.classList.contains('active')) {
    renderStatusContent();
  }
}

/* ════════════════════════════════════════════════
   초기화
════════════════════════════════════════════════ */
async function partialReset() {
  const label = NAV_DATA[currentNav].label;
  const ok = await showAppConfirm(`${label} 탭의 선택을 모두 초기화하시겠습니까?`);
  if (!ok) return;
  UI_SOUND.play('delete2');
  const subs = NAV_DATA[currentNav].subs;
  subs.forEach(sub => {
    const locks = lockedCards[sub.id];
    if (locks?.size) {
      selectedCards[sub.id] = new Set(locks);
    } else {
      delete selectedCards[sub.id];
    }
    // 해당 서브의 세부정보와 서브 이미지 선택도 초기화
    Object.keys(selectedDetails).forEach(key => {
      if (key.startsWith(sub.id + '__') && !locks?.has(Number(key.slice((sub.id + '__').length)))) {
        delete selectedDetails[key];
      }
    });
     Object.keys(selectedSubImages).forEach(key => {
      if (key.startsWith(sub.id + '__') && !locks?.has(Number(key.slice((sub.id + '__').length)))) {
        delete selectedSubImages[key];
      }
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
  const ok = await showAppConfirm('모든 선택을 초기화하시겠습니까?\n잠금된 카드의 선택 및 잠금 상태도 모두 초기화됩니다.');
  if (!ok) return;
  UI_SOUND.play('delete');
  selectedCards = {};
  lockedCards = {};
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
   아이콘 렌더링(이모지 또는 이미지 자동 분기)
════════════════════════════════════════════════ */
function renderIcon(icon, img, className) {
  if (img) {
    return `<img src="${img}" class="${className} managed-image" alt="" decoding="async">`;
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
   유틸리티
════════════════════════════════════════════════ */
function escHtml(s) {
  return s.replace(/'/g, "\\'");
}

/* ════════════════════════════════════════════════
   추가 메뉴 전환
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
   무작위 선택
════════════════════════════════════════════════ */

function getCurrentRandomScope(subId) {
  const location = addressTrail[addressTrail.length - 1];

  if (!location || location.subId !== subId) {
    return {};
  }

  if (location.type === 'subgroup') {
    return {
      groupIdx: location.groupIdx,
      sgIdx: location.sgIdx
    };
  }

  if (location.type === 'group' || location.type === 'groupCards') {
    return {
      groupIdx: location.groupIdx
    };
  }

  return {};
}

function getRandomCandidates(subId, scope = {}) {
  const data = CARD_DATA[subId];
  let candidates = [];

  if (data && data.groups) {
    data.groups.forEach((group, groupIdx) => {
      if (
        scope.groupIdx !== undefined &&
        groupIdx !== scope.groupIdx
      ) {
        return;
      }

      if (group.subgroups) {
        group.subgroups.forEach((subgroup, subgroupIdx) => {
          if (
            scope.sgIdx !== undefined &&
            subgroupIdx !== scope.sgIdx
          ) {
            return;
          }

          subgroup.cards.forEach((card, cardIdx) => {
            if (isSectionItem(card)) {
              return;
            }

            candidates.push({
              globalIdx: getSubgroupCardGlobalIdx(
                groupIdx,
                subgroupIdx,
                cardIdx
              ),
              path: {
                type: 'subgroup',
                groupIdx,
                sgIdx: subgroupIdx,
                cardIdx
              },
              ...card
            });
          });
        });

        return;
      }

      if (group.cards) {
        group.cards.forEach((card, cardIdx) => {
          if (isSectionItem(card)) {
            return;
          }

          candidates.push({
            globalIdx: getGroupCardGlobalIdx(groupIdx, cardIdx),
            path: {
              type: 'group',
              groupIdx,
              cardIdx
            },
            ...card
          });
        });
      }
    });

    return candidates;
  }

  if (Array.isArray(data)) {
    candidates = data
      .map((card, cardIdx) => {
        if (isSectionItem(card)) {
          return null;
        }

        return {
          globalIdx: cardIdx,
          ...card
        };
      })
      .filter(Boolean);
  }

  return candidates;
}

// 현재 사용자가 들어가 있는 가장 깊은 범위에서 카드 1개 랜덤 선택
async function randomSelectCurrent() {
  if (!currentSubId) {
    showAppNotice('먼저 카테고리를 선택해주세요.');
    return;
  }

  const navLabel = NAV_DATA[currentNav].label;
  const subLabel =
    NAV_DATA[currentNav].subs.find(
      sub => sub.id === currentSubId
    )?.label || currentSubId;

  const ok = await showAppConfirm(
    `[${navLabel} — ${subLabel}]\n랜덤 선택을 하시겠습니까?`,
    'selectYes'
  );

  if (!ok) {
    return;
  }

  const scope = getCurrentRandomScope(currentSubId);
  const allCards = getRandomCandidates(currentSubId, scope)
    .filter(card => !isCardLocked(currentSubId, card.globalIdx));

  if (allCards.length === 0) {
    return;
  }

  const pick =
    allCards[Math.floor(Math.random() * allCards.length)];

  selectedCards[currentSubId] = new Set(lockedCards[currentSubId] || []);
  selectedCards[currentSubId].add(pick.globalIdx);

  // UI 갱신
  showCardPage(currentSubId, false);
  renderSubnav(currentNav, false);

  const currentSubElement = document.querySelector(
    `[data-sub-id="${currentSubId}"]`
  );

  if (currentSubElement) {
    currentSubElement.classList.add('active');
  }

  // 설명창 갱신
  focusedCard = {
    subId: currentSubId,
    idx: pick.globalIdx,
    path: pick.path,
    name: pick.name,
    icon: pick.icon,
    img: pick.img
  };

  updateInfoPanel();
  refreshStatusIfOpen();
  updateNavBadges();
}

// 현재 탭의 모든 서브(마름모) 각 1개씩 랜덤 선택
async function randomSelectAll() {
  const navLabel = NAV_DATA[currentNav].label;
  const ok = await showAppConfirm(`[${navLabel}]\n모든 카테고리에서 각 1개씩\n랜덤 선택을 하시겠습니까?`, 'selectYes');
  if (!ok) return;

  const subs = NAV_DATA[currentNav].subs;
subs.forEach(sub => {
  const allCards = getRandomCandidates(sub.id)
    .filter(card => !isCardLocked(sub.id, card.globalIdx));
  if (allCards.length === 0) return;
  const pick = allCards[Math.floor(Math.random() * allCards.length)];
  selectedCards[sub.id] = new Set(lockedCards[sub.id] || []);
  selectedCards[sub.id].add(pick.globalIdx);
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
    const usesFastReveal = btn.closest('.group-reveal-flow');
    const finishReveal = (event) => {
      // 다수 그룹의 이동은 fade보다 먼저 끝나므로 fade가 완료될 때까지 기존
      // opacity 애니메이션을 제거하지 않는다.
      if (usesFastReveal && event.animationName !== 'groupBtnFadeIn') return;
      btn.classList.add('group-appear-done');
      btn.removeEventListener('animationend', finishReveal);
    };
    btn.addEventListener('animationend', finishReveal);

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
   길게 누르기 → 카드 선택/취소
════════════════════════════════════════════════ */
let _lpTimer = null;
let _lpStartX = 0;
let _lpStartY = 0;
let _lpDidFire = false;
let _lastCardTap = null;
let _suppressedTouchClick = null;
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
    let globalIdx;
    if (type === 'subgroup') globalIdx = getSubgroupCardGlobalIdx(a, b, c);
    else if (type === 'group') globalIdx = getGroupCardGlobalIdx(a, b);
    else globalIdx = a;
    const wasSelected = Boolean(selectedCards[subId]?.has(globalIdx));
    if (wasSelected && isCardLocked(subId, globalIdx)) return;

    if (type === 'subgroup') subgroupCardDblClick(subId, a, b, c);
    else if (type === 'group') groupCardDblClick(subId, a, b);
    else {
      cardClick(subId, a);
      toggleCardSelect(subId, a);
    }
    UI_SOUND.play(wasSelected ? 'cancel' : 'category5');
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
    // 첫 탭의 합성 click에서 이미 한 번 재생되므로, 네이티브 dblclick이 없는
    // 터치 환경에서는 여기서 두 번째 소리만 더한다.
    const cardSounds = ['pong1', 'pong2', 'pong3', 'pong4', 'pong5'];
    UI_SOUND.play(cardSounds[Math.floor(Math.random() * cardSounds.length)]);
    _suppressedTouchClick = { card: evt.currentTarget, time: performance.now() };
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
   스와이프로 닫기(왼쪽 스와이프로 패널 닫기)
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
      UI_SOUND.play('page');
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
