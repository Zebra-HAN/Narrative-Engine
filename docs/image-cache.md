# Image replacement and caching

Replace an image at its existing path and deploy normally. No filename changes,
manual cache clearing, or version edits are required.

The service worker conditionally revalidates an image the first time a page uses
it. It sends the cached ETag (or Last-Modified) and uses `cache: 'no-cache'` so the
browser HTTP cache also checks the server. A 304 reuses the cached image body.
Later requests from the same page use CacheStorage directly, and concurrent
requests share one validation. There is no directory scan or full image download
at launch. Without server validators a used image needs a full response to check
its content; normal GitHub Pages ETags allow conditional requests.

SHA-256 content hashes are stored with cached responses. Only changed content
notifies open pages and receives an automatic `__image_revision` query parameter
to replace decoded images. The worker strips that parameter from the fetch/cache
key, so filenames, source data, and one cache entry per original URL are retained.
The preloader invalidates only that image. Selected random background filenames,
screen ownership, transition layers, and back navigation memory do not change.

On `pageshow`, return to the foreground, restored network connectivity, or service
worker takeover, the page revalidates images currently on screen, with at most
four concurrent validations. Other images are checked when next requested. No
page reload is needed. Service-worker responses use `Cache-Control: no-store` to
prevent browser memory-cache reuse from bypassing the worker; persistent caching
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
An iPhone/home-screen Safari check still requires an actual device; Chromium
lifecycle simulation is not a substitute for a Safari engine/device test.
