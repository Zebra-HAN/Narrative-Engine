# Image replacement and caching

Replace an image at its existing path and deploy normally. No filename changes,
manual cache clearing, or version edits are required.

The service worker returns a cached image immediately. Conditional validation
runs separately under `event.waitUntil`, using ETag (or Last-Modified) and
`cache: 'no-cache'` to check the browser HTTP cache too. A 304 reuses the cached
body. Concurrent requests share validation, and successfully checked resources
are not checked again during the same page session until resume. Only a cache
miss waits for the network. There is no directory scan or full image download
at launch. Without server validators a used image needs a full response to check
its content; normal GitHub Pages ETags allow conditional requests.

SHA-256 content hashes are stored with cached responses. Changed content
notifies open pages and receives an automatic `__image_revision` query parameter
to replace decoded images. The worker strips that parameter from the fetch/cache
key, so filenames, source data, and one cache entry per original URL are retained.
The page prepares the new hash URL offscreen and awaits decoding before
publishing its revision or replacing any DOM image. Existing DOM nodes keep their
pixels until prepared replacements are ready. Obsolete preloader entries are
removed after this commit, while new decoded entries remain reusable. Up to 256
decoded preload images are retained, bounding memory on mobile devices.
Group/card pages also decode their actual image nodes while detached and keep
the outgoing page until commit. Request tokens prevent cancelled navigations
from attaching late pages. Home startup waits for its two images without a timeout that could reveal them
unprepared. Home-to-create entry waits for a prepared background;
existing background layers remain opaque until incoming backgrounds are ready. Selected random background filenames,
screen ownership, transition layers, and back navigation memory do not change.

On `pageshow`, return to the foreground, restored network connectivity, or service
worker takeover, the page revalidates images currently on screen, with at most
four concurrent validations. Other images are checked when next requested. No
page reload is needed. Original URLs use `Cache-Control: no-cache`, and hash URLs
use immutable browser caching to preserve decoded-resource reuse. Explicit
foreground validation also reports the current hash when unchanged, so browser
memory reuse cannot strand a restored page on old pixels. Persistent caching
still happens in CacheStorage. Worker registration uses `updateViaCache: 'none'`
and checks for worker updates on resume, including Safari/home-screen PWA flows.

Activation copies the previous `narrative-images-v3` entries into v4 before
removing v3. Existing offline images survive; they are checked online before
being considered current. Network errors, HTTP errors, and five-second timeouts
fall back to a cached image without marking it validated, allowing a later retry.
The shell remains network-first with an offline fallback. Its four data scripts
are also precached so the first worker takeover can be followed by an offline
reload without missing navigation/card definitions.

## Verification

Run `node tests/image-cache-update.cjs` with Playwright and Chromium installed.
`CHROMIUM_PATH` can override `/usr/bin/chromium`. To test WebKit where installed,
run `IMAGE_TEST_ENGINE=webkit node tests/image-cache-update.cjs`.

The test uses real service workers and CacheStorage, migrates cached red pixels,
replaces the same path with blue/green/yellow images, checks hashes, warm preload
network counts, conditional 304s, foreground/pageshow updates, retained random
backgrounds and back navigation, HTTP failure recovery, and offline reuse.
It holds replacement decoding behind a gate and samples every animation frame
for complete, visible images and opaque background coverage; screenshot pixels
must stay blue while blocked and become green only after preparation. It also
checks delayed conditional responses, first group/card visits, repeated returns,
and cancelled navigation while actual image nodes are decoding.
An iPhone/home-screen Safari check still requires an actual device; Chromium
lifecycle simulation is not a substitute for a Safari engine/device test.
