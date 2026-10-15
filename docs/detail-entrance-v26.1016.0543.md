# Detail entrance — v26.1016.0543

General and title-card detail sheets now scale from 90% to 100% in 170ms using ease-out. There is no overshoot or rebound. Backwards fill still releases the animation transform after completion, and the final panel dimensions, position and scroll structure are unchanged. No touch listeners, selection rules, pressed feedback or closing behavior changed. Reduced-motion preferences still disable the entrance.

`tests/detail-quick-entrance.cjs` verifies the updated duration/range, monotonic sampled scales, released transform, stable layout and scroll position, short/long native vertical input, taps and reduced motion at 320/393/852px. It also reopens both general/title sheets with separate rendering frames between close/open, then uses requestAnimationFrame to observe the running animation without pausing/seeking: an intermediate scale must be observed before the final 100% state. These are browser rendering-loop measurements, not real iPhone validation.

Home version: v26.1016.0543. Shell cache: v24; image cache unchanged. Actual iPhone Safari/PWA and resolution of the previously reported short-flick inertia issue remain unverified.

Validation passed: detail-quick-entrance, detail-native-scroll and detail-selection-origin at all three viewports, plus syntax/whitespace checks. Running-frame samples included 90%, 91.6%, 93.0%, 94.4%, 95.6%, 96.7% and subsequent progression to 100% for both detail types.
