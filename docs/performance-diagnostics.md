# iPhone Safari/PWA performance diagnostics

This is instrumentation for the app based on main `30d86f9`; it does not optimize
or change the existing rendering, animation, selection or navigation algorithms.
Use the deployed **Draft PR build**. Main does not contain this feature yet.

## On an iPhone

1. Open the build URL in Safari with `?perf=1` appended (use `&perf=1` if the URL
   already has a query). The developer controls appear. Recording is initially off.
2. Navigate to the parent group/subgroup, then tap **기록 시작**. Enter the card
   screen, scroll, swipe back or cancel a swipe, and repeat the problematic action.
3. Tap **진단 기록 종료**, then **결과 복사**. Paste the JSON text into a message or
   note. If clipboard access is denied, the report appears in a selected text box;
   use the native Select All/Copy menu. No report is sent to a server.
4. Tap **진단 끄기** to reload without diagnostics. `?perf=0` also explicitly
   disables it. Opt-in is URL-only: normal URLs never inherit activation. Recordings are not persisted.

For PWA measurements, add the diagnostic URL to the Home Screen and launch that
icon. Confirm the developer controls are visible and the report's `standalone`
field is true. Safari and an existing installed PWA may use different storage;
activating Safari does not guarantee diagnostics in the existing PWA. Do not
combine browser and standalone results as if they were identical environments.

Record each representative route separately: race/fantasy 139 cards,
race/anthropomorphic 4 cards back to 4 subgroups, compass/experience 116 cards,
and attribute's light 2-card group. Include whether this was a first visit or
re-entry, whether images had been cached, and whether the phone was warm or in
Low Power Mode. Stop before switching apps; hiding/leaving the page stops the
recording automatically. A recording ends after 120 seconds, 3,000 events or
7,200 frames, whichever comes first. Reaching a limit is recorded in `stopReason`.

## Reading a report

- `events[].t` and `frames[].t`: milliseconds from record start. `screen` indexes
  `screens` (nav, sub, page ID and address trail); `transition`/`kind` identify the
  app navigation that was most recently initiated, not its animation lifetime.
- `transition.start` and `transition.dom-return`: app route start and synchronous
  return after DOM creation. Nested render/navigation function spans are also
  recorded. Promise-returning functions have a separate `.async-elapsed` span
  for completion; the unsuffixed span covers the synchronous call only.
  **Do not add nested durations** as if they were independent CPU cost.
- `render-opportunity-proxy.first-raf` / `second-raf`: time to the first/second rAF
  callback after DOM creation. These are explicitly **display-opportunity proxies**,
  not first visible pixels or first Paint. Content may still be transparent, below
  the viewport, loading, or waiting for a later browser frame. No extra style or
  geometry polling is performed to try to infer visibility.
- `frames[].gapMs`, `long-frame`: rAF callback gaps; >50 ms gaps include their start
  time. These show JS scheduling stalls and cannot measure compositor-only frames.
- `metrics`: call count, total, average and longest wall time for screen creation,
  title fitting, info-panel fitting, observer registrations/callbacks, gesture
  handlers (including `onTouchEnd`), panel frame updates and back navigation.
- `scroll.read` / `scroll.restore`: elapsed time of existing scrollTop reads/writes,
  including any synchronous browser work they trigger. A fast write does not prove
  that later browser layout/scroll notification was free. No extra reads are added.
- `observer.*`: callback/observe timings and IDs. The bounded `observers` inventory
  identifies each observer's first target. Observers created later appear in
  observe events. Browser layout and notification scheduling outside callbacks are
  not measured.
- `swipe.drag-start`, `swipe.decision`, `swipe.return-*`: recognition, back/cancel
  decision, and the existing return animation's start/finish callback. Raw touch
  handler spans distinguish input start, movement, release and touch cancellation.
- `panel.animation-*`, `panel.renderChrome`: existing panel start/finish decisions
  and JS update times. `background.request`, `image.prepare`, `image.decode`,
  `background.image-ready`, `background.fade-start/finish` distinguish readiness
  waits and fade scheduling. Async elapsed times include waiting; they are not CPU
  decode or GPU animation cost. `background.reuse` identifies the existing
  committed/in-flight reuse path; cached image readiness does not create another
  prepare/decode event. Background finish may use the app's existing timer
  fallback, so it is not proof of actual displayed opacity.

JS cannot directly measure Paint, GPU composition, actual display presentation,
forced-layout breakdown or device memory here. Use Safari Web Inspector/recorded
video to correlate these when available. Instrumentation has overhead: compare
recordings made with the same diagnostic configuration, and confirm perceived
behavior with diagnostics disabled too. There is no live statistics rendering,
console stream, DOM/style interception, viewport title scheduling or DOM cache.
Reports contain user agent, viewport and app route labels/asset paths, but no
selected/locked card contents or URL queries. Inspect the text before sharing.

## Local validation

Serve the repository at localhost, then run `node tests/performance-diagnostics.cjs`.
Requires Playwright and Chromium (`CHROMIUM_PATH` can override the binary;
`PERF_TEST_URL` can override http://127.0.0.1:8001).
This is a Chromium functional/record-bounding check, not a real iPhone performance
measurement. Actual iPhone Safari/PWA behavior still needs device validation.
