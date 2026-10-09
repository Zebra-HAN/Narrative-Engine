/* Developer-only instrumentation, loaded before app.js ONLY in opt-in mode. */
(() => {
  'use strict';
  const LIMITS = { events: 3000, frames: 7200, durationMs: 120000 };
  const nativeRAF = window.requestAnimationFrame.bind(window);
  const definitions = [];
  let recording = false, generation = 0, origin = 0, lastFrame = null;
  let frames = [], events = [], stats = new Map(), session = null;
  let frameId = 0, timeoutId = 0, transitionId = 0, routeDepth = 0;
  let screen = 'not-installed', transition = null, getScreen = () => screen;
  let dialog, status, output, stopButton, observerId = 0;
  let screens = [], screenKeys = new Map();
  function refreshScreen() {
    const value = getScreen();
    const key = JSON.stringify(value);
    if (!screenKeys.has(key)) { screenKeys.set(key, screens.length); screens.push(value); }
    screen = screenKeys.get(key);
  }
  const round = n => Math.round(n * 100) / 100;
  const safeURL = value => {
    try { return new URL(value, document.baseURI).pathname.slice(-160); }
    catch (_) { return ''; }
  };
  const targetLabel = target => target?.id ? '#' + target.id
    : String(target?.nodeName || 'unknown') + '.' + String(target?.className || '').slice(0, 80);
  const context = () => ({ screen, transition: transition?.id || null, kind: transition?.kind || null });

  function mark(name, data = {}, ctx = context(), time = performance.now()) {
    if (!recording) return;
    if (events.length >= LIMITS.events) { stop('event-limit'); return; }
    events.push({ t: round(time - origin), name, ...ctx, data });
  }
  function begin(name) {
    return recording ? { name, start: performance.now(), generation, ctx: context() } : null;
  }
  function end(token, data = {}) {
    if (!token || !recording || token.generation !== generation) return;
    const duration = performance.now() - token.start;
    let aggregate = stats.get(token.name);
    if (!aggregate) {
      // Names come from a fixed instrument list, never URLs/text/observer IDs.
      aggregate = { calls: 0, totalMs: 0, maxMs: 0 };
      stats.set(token.name, aggregate);
    }
    aggregate.calls++;
    aggregate.totalMs += duration;
    aggregate.maxMs = Math.max(aggregate.maxMs, duration);
    mark(token.name, { durationMs: round(duration), ...data }, token.ctx, token.start);
  }
  function measure(name, fn, data) {
    const token = begin(name);
    try { return fn(); } finally { end(token, data); }
  }
  function frame(time) {
    if (!recording) return;
    const gap = lastFrame === null ? null : time - lastFrame;
    frames.push({ t: round(time - origin), gapMs: gap === null ? null : round(gap), ...context() });
    if (gap > 50) mark('long-frame', { gapMs: round(gap), intervalStartMs: round(lastFrame - origin) });
    lastFrame = time;
    if (!recording) return;
    if (frames.length >= LIMITS.frames) { stop('frame-limit'); return; }
    frameId = nativeRAF(frame);
  }
  function start() {
    if (recording) return;
    generation++;
    frames = []; events = []; stats = new Map(); transition = null; transitionId = 0;
    origin = performance.now(); lastFrame = null; screens = []; screenKeys = new Map(); refreshScreen();
    session = {
      format: 'narrative-perf-v1', baseline: '30d86f9', startedAt: new Date().toISOString(),
      userAgent: navigator.userAgent, viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
      standalone: !!navigator.standalone || matchMedia('(display-mode: standalone)').matches,
      visibility: document.visibilityState, limits: LIMITS,
      timing: 'performance.now milliseconds relative to recording start',
      limitations: [
        'Instrumented JS wall time includes synchronous browser work and instrumentation overhead; spans can nest.',
        'rAF intervals measure callback opportunities, not GPU/display frames. Long frame threshold: >50ms.',
        'render-opportunity proxies are first/second rAF callbacks after DOM creation, NOT visible pixels or Paint completion.',
        'Image prepare/decode times are async elapsed times including waiting, not CPU decode cost.',
        'Observer observe/callback times exclude browser layout/notification scheduling outside the callback.',
        'GPU composition, Paint, forced-layout breakdown and memory usage are not directly measured.',
        'Font/network/cache conditions are not normalized. This report does not itself establish a speedup.'
      ], observers: definitions.slice(), fonts: document.fonts?.status || 'unsupported'
    };
    recording = true;
    mark('recording.start');
    dialog.hidden = true; stopButton.hidden = false;
    frameId = nativeRAF(frame);
    timeoutId = setTimeout(() => stop('time-limit'), LIMITS.durationMs);
  }
  function stop(reason = 'manual') {
    if (!recording) return;
    if (events.length < LIMITS.events) mark('recording.stop', { reason });
    recording = false;
    cancelAnimationFrame(frameId); clearTimeout(timeoutId);
    session.durationMs = round(performance.now() - origin);
    session.stopReason = reason;
    stopButton.hidden = true; dialog.hidden = false;
    status.textContent = `기록 종료 (${reason}). ${events.length}개 이벤트, ${frames.length}개 프레임. 복사를 눌러 주세요.`;
  }
  function report() {
    const measured = [...stats].map(([name, value]) => ({ name, calls: value.calls,
      totalMs: round(value.totalMs), maxMs: round(value.maxMs), averageMs: round(value.totalMs / value.calls) }));
    return JSON.stringify({ ...session, recording, screens, metrics: measured, events, frames }, null, 2);
  }
  async function copy() {
    if (recording) stop();
    if (!session) { status.textContent = '먼저 기록을 시작해 주세요.'; return false; }
    const text = report();
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = '결과를 복사했습니다. 채팅이나 메모에 붙여 넣어 주세요.';
      return true;
    } catch (_) {
      // iOS/PWA clipboard permissions vary. Native text selection remains available.
      output.hidden = false; output.value = text; output.focus(); output.select();
      output.setSelectionRange(0, text.length);
      status.textContent = '자동 복사가 제한됐습니다. 아래 텍스트를 길게 눌러 전체 선택 후 복사해 주세요.';
      return false;
    }
  }
  function disable() {
    if (recording) stop('disabled');
    try { localStorage.removeItem('narrative-perf'); } catch (_) {}
    const url = new URL(location.href); url.searchParams.set('perf', '0');
    location.replace(url.href); // reload removes every wrapper and restores native constructors
  }

  // Observe registrations/callbacks without inspecting styles or forcing extra layout.
  for (const type of ['MutationObserver', 'ResizeObserver', 'IntersectionObserver']) {
    const Native = window[type];
    if (!Native) continue;
    window[type] = class extends Native {
      constructor(callback) {
        const id = ++observerId;
        super(function(...args) {
          if (!recording) return callback.apply(this, args);
          return measure('observer.' + type + '.callback', () => callback.apply(this, args),
            { observerId: id, entries: args[0]?.length || 0 });
        });
        this.perfObserverId = id;
      }
      observe(target, options) {
        if (definitions.length < 64 && !definitions.some(d => d.id === this.perfObserverId)) {
          definitions.push({ id: this.perfObserverId, type, firstTarget: targetLabel(target) });
        }
        return measure('observer.' + type + '.observe', () => super.observe(target, options),
          { observerId: this.perfObserverId, target: targetLabel(target) });
      }
    };
  }

  // Only the existing app gesture handlers on center-area are wrapped. Listener
  // identity, capture/passive options, this and event cancellation are preserved.
  const add = EventTarget.prototype.addEventListener, remove = EventTarget.prototype.removeEventListener;
  const listeners = new WeakMap();
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (this.id !== 'center-area' || typeof listener !== 'function'
        || !/^on(Touch|ChromeTouch)(Start|Move|End|Cancel)$/.test(listener.name)) {
      return add.call(this, type, listener, options);
    }
    let map = listeners.get(this); if (!map) { map = new Map(); listeners.set(this, map); }
    const capture = typeof options === 'boolean' ? options : !!options?.capture;
    const key = type + ':' + capture;
    let entries = map.get(listener); if (!entries) { entries = new Map(); map.set(listener, entries); }
    if (!entries.has(key)) {
      entries.set(key, function(event) {
        if (!recording) return listener.call(this, event);
        return measure('gesture.' + listener.name, () => listener.call(this, event), { event: type });
      });
    }
    return add.call(this, type, entries.get(key), options);
  };
  EventTarget.prototype.removeEventListener = function(type, listener, options) {
    const capture = typeof options === 'boolean' ? options : !!options?.capture;
    const wrapped = listeners.get(this)?.get(listener)?.get(type + ':' + capture);
    return remove.call(this, type, wrapped || listener, options);
  };
  if (HTMLImageElement.prototype.decode) {
    const decode = HTMLImageElement.prototype.decode;
    HTMLImageElement.prototype.decode = function(...args) {
      const token = begin('image.decode');
      const promise = decode.apply(this, args);
      if (token) promise.then(() => end(token, { url: safeURL(this.src), result: 'ready' }),
        () => end(token, { url: safeURL(this.src), result: 'failed' }));
      return promise;
    };
  }

  function install(provider) {
    getScreen = provider;
    const routes = ['switchNav', 'selectSub', 'navigateAddressTag', 'navigateAddressBack',
      'showDefaultCenter', 'showCardPage', 'showGroupPage', 'showSubgroupPage', 'showGroupCards', 'showSubgroupCards'];
    const names = [...routes, 'fitAllCardTitles', 'fitGroupTitles', 'fitInfoPanelText',
      'scopeCardRevealAnimations', 'setupCardRevealAnimations', 'updateInfoPanel', 'renderAddressTrail',
      'applyCreativeBackground', 'finishBackgroundTransition', 'cancelRunningBackgroundTransition', 'retainCreativeBackgroundForSwipeBack'];
    for (const name of names) {
      const original = window[name]; if (typeof original !== 'function') continue;
      const isRoute = routes.includes(name);
      window[name] = function(...args) {
        if (!recording) return original.apply(this, args);
        const root = isRoute && routeDepth === 0;
        if (root) {
          refreshScreen();
          transition = { id: ++transitionId, kind: name, start: performance.now(), from: screen };
          mark('transition.start', { from: screen, args: args.slice(0, 3).filter(a => ['string', 'number', 'boolean'].includes(typeof a)) });
        }
        if (isRoute) routeDepth++;
        const token = begin(name);
        let result;
        try { result = original.apply(this, args); return result; }
        finally {
          if (isRoute) routeDepth--;
          end(token);
          if (result && typeof result.then === 'function') {
            const asyncToken = token ? { ...token, name: name + '.async-elapsed' } : null;
            if (asyncToken) result.then(() => end(asyncToken), () => end(asyncToken, { rejected: true }));
          }
          if (root && recording) {
            refreshScreen();
            const current = { ...transition }, run = generation;
            mark('transition.dom-return', { to: screen, elapsedMs: round(performance.now() - current.start) });
            nativeRAF(() => {
              if (!recording || run !== generation || transition?.id !== current.id) return;
              mark('render-opportunity-proxy.first-raf', { elapsedMs: round(performance.now() - current.start) });
              nativeRAF(() => {
                if (recording && run === generation && transition?.id === current.id) {
                  mark('render-opportunity-proxy.second-raf', { elapsedMs: round(performance.now() - current.start) });
                }
              });
            });
          }
        }
      };
    }
  }
  window.APP_PERF = { start, stop, copy, disable, report, mark, begin, end, measure, install,
    get recording() { return recording; }, safeURL };
  document.addEventListener('visibilitychange', () => {
    if (recording && document.hidden) stop('page-hidden');
  });
  window.addEventListener('pagehide', () => { if (recording) stop('pagehide'); });
  document.addEventListener('DOMContentLoaded', () => {
    const host = document.createElement('div'); host.id = 'perf-diagnostics';
    // Shadow DOM isolates developer controls from the app's button/textarea CSS.
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>
      :host{position:fixed;z-index:2147483647;inset:0;pointer-events:none;font:14px system-ui;color:#111}
      [hidden]{display:none!important}section{position:absolute;top:max(12px,env(safe-area-inset-top));left:12px;right:12px;max-height:85vh;overflow:auto;background:#fff;border:1px solid #777;border-radius:8px;padding:12px;pointer-events:auto}
      button{font:inherit;padding:10px;margin:4px;border:1px solid #777;border-radius:5px;background:#eee;color:#111}p{margin:8px 0;line-height:1.4}textarea{width:100%;height:35vh;box-sizing:border-box;font:12px monospace}
      #stop{position:absolute;right:8px;top:max(8px,env(safe-area-inset-top));pointer-events:auto;background:#fff}
      </style><section><strong>개발자 성능 진단 · 30d86f9</strong><p>기록 중 통계는 갱신하지 않습니다. 최대 2분 또는 기록량 제한까지 저장합니다. 실제 Paint/GPU 시간은 측정하지 않습니다.</p>
      <button id="start">기록 시작</button><button id="copy">결과 복사</button><button id="disable">진단 끄기</button><p id="status">시작 후 진입·스크롤·뒤로가기 동작을 재현해 주세요.</p><textarea id="output" readonly hidden aria-label="진단 결과"></textarea></section><button id="stop" hidden>진단 기록 종료</button>`;
    dialog = root.querySelector('section'); status = root.querySelector('#status'); output = root.querySelector('#output'); stopButton = root.querySelector('#stop');
    root.querySelector('#start').onclick = () => { output.hidden = true; start(); };
    root.querySelector('#copy').onclick = copy;
    root.querySelector('#disable').onclick = disable;
    stopButton.onclick = () => stop();
    document.body.appendChild(host);
  }, { once: true });
})();
