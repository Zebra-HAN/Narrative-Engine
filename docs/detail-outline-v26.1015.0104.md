# Detail and outline update v26.1015.0104

- Outline opens real sections when there are at most three; unclassified opens independently. Manual collapse/expand remains available.
- Section summaries have short press feedback and no native disclosure markers. The close button is removed; the existing controls move right. Opening focus now goes to expand; Escape, outside dismissal and swipe handlers remain.
- Selected ideas show a corner check. Excluded main images/descriptions show a centered cancel. A fixed panel seal prioritizes lock over card selection; only detail content scrolls.
- Frozen controls suppress touch and CSS press feedback. Frozen included descriptions reuse disabled idea surface/ink/filter; title and section ink are muted. Excluded descriptions retain their distinct exclusion treatment.
- Shell cache version advances and precaches all three existing marker assets.

## Validation

Chromium with touch enabled at 320x568, 393x852 and 852x393:
- `detail-outline-improvements.cjs`: passed section counts 1–5, unclassified handling, manual section toggles, expand/collapse, close removal, check/cancel/lock state, locked selection immutability, frozen touch feedback, matching locked colors, unlock restoration, panel seal during scrolling, reopening and no page errors.
- `default-card-inclusion.cjs`: passed all five grouped/subgroup/plain configurations, defaults, independent exclusions, lock/reselect/random, panel and menu visibility.
- `ui-selection-polish.cjs`: passed image state, inclusion/lock/random, back gesture and panel behavior.
- `group-card-reentry.cjs`: passed background, scroll, selection/lock and address trail preservation across three viewports.
- `reentry-render-parity.cjs`: passed on repeat. One earlier concurrent run failed the animation completion sampling assertion.
- Offline service-worker shell reload and offline fetch of check/cancel/lock assets passed.
- `node --check` app/sw and `git diff --check` passed.
- Browser captures inspected for corner seal placement and scroll content.

Known pre-existing test failure: `card-edge-actions.cjs` fails the 320px card/button bounds assertion in both this change and unchanged main e541138. Its minimum 84px control row exceeds the roughly 54px five-column card. No unrelated layout change was made.

Actual iPhone Safari and installed PWA have not been tested. Legacy outline tests requiring the removed X button need their expectations updated for this new design; the dedicated test covers the new requirements.
