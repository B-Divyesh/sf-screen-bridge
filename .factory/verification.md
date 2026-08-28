# Independent product verification

## Verdict: FAIL

Candidate `3dcf53cf9d5acab6a2faab75c839acae7dc8c276` is not releasable against the supplied work order and researched brief. The mandatory claims gate and first-read/demo gate both fail. The representative sample also fails the core job: it does not identify the sample dialog's actionable controls, and the documented number-then-Enter keyboard flow restarts OCR.

- Tested commit: `3dcf53cf9d5acab6a2faab75c839acae7dc8c276`
- Tested branch: `main`
- Live URL: <https://screen-bridge.sociobot.in>
- Verification date: 2026-08-28 UTC
- Starting tree: clean
- Product code changed by verifier: no

## Mandatory gates

### Claims gate — FAIL, release blocking

`.factory/claims.json` does not exist. This was checked before install or any other repository test. Therefore there were no claim commands to run, and the acceptance contract explicitly makes the missing file release blocking.

Claim-like copy is nevertheless present and unlisted, including:

- “Captures are processed on this device. Nothing is streamed or uploaded.”
- “OCR and boundary finding run locally.”
- “The first OCR scan loads local English recognition files; once the PWA has been opened online, the shell and recognition assets are cached for offline reuse.”
- “Screenshots are never saved by the app.”
- “Verification is background-only and at most once per day.”

There is no test tagged `@claim:*`, and the two Vitest tests cover only OCR word ordering and the uncertainty phrase.

### Cold first-read and one-click demo — FAIL, release blocking

Cold desktop read at 1440×900:

- What it appears to do: capture and crop a remote desktop or visual-only dialog, then turn text and visual boundaries into numbered targets.
- For whom: not stated in plain words on the first screen. “PRIVATE PIXEL ACCESSIBILITY” does not name blind or low-vision users.
- What to click first: ambiguous between “Capture screen” and “Try a safe sample”; the required “Try it with sample data” action is absent.

Clicking “Try a safe sample” once only paints a sample image and exposes crop fields. Results still say “Awaiting a crop” and contain zero targets. A second click on “Analyze this crop” is required.

Both `/?demo=1` and `/demo` open the ordinary empty workspace. Neither loads sample data nor shows the required persistent “Demo — sample data, nothing is saved” banner, “Reset demo,” or “Start for real.” Demo saves use the production IndexedDB database `screen-bridge`, not a `demo:` namespace. `.factory/demo.md` is also absent.

The first-screen sentence is 24 words, over the plain-words 22-word cap. It provides only one of the required three short privacy/offline/price facts. `.factory/copy-audit.md` is absent.

## Release-blocking and high-severity defects

### P0 — Core sample does not produce useful controls

After the full real local Tesseract path completed, the sample returned four targets in this order:

1. `Connection`
2. `settings`
3. `address`
4. `Server`

It did not detect the sample dialog's “Save connection” or “Cancel” controls, and produced no visual-boundary targets. Thus its own representative dialog cannot demonstrate the brief's core job of exposing button/field targets. It also splits phrases into individual words and reverses “Server address” because the two OCR boxes differ by one vertical pixel.

### P0 — Primary keyboard workflow is broken

Immediately after analysis, focus remains on “Analyze this crop.” Following the displayed instruction—press `1`, then `Enter`—speaks target 1 twice and activates the focused Analyze button, restarting OCR. Observed final state: “Reading the crop locally…” with no selected target. A number alone speaks immediately, contradicting the copy that Enter confirms it. Targets 10–12 can be generated but have no number-key shortcut.

### P1 — Demo is not an isolated sandbox

The demo query is ignored. Saving after entering through `?demo=1` wrote a scan to IndexedDB database `screen-bridge`. There is no demo banner, reset, exit action, or separate namespace, so a demo action can write the same storage used by real work.

### P1 — Saved data cannot be reopened or deleted

“Save target list locally” writes records to IndexedDB, but the app never reads or displays those records. Reload returns to an empty workspace. There is no delete control despite the privacy page saying saved scans can be deleted “from the workspace.” Export works, but does not make the invisible saved-record feature usable.

### P1 — Day mode fails WCAG contrast

Axe reports one serious `color-contrast` rule affecting six nodes. Mint `#087f5b` on paper `#f4f0e5` measures 4.39:1, below 4.5:1. Affected content includes all three eyebrow labels, the Studio link, Privacy, and Terms. Dark mode and the initial 390 px mobile state have no axe serious/critical violations.

### P1 — Paid purchase flow is broken and incomplete

`GET https://api.sociobot.in/api/v1/products/screen-bridge/checkout` returns HTTP 404 with `{"error":"enabled factory product","status":404}`. The page gives no exact price, while advertising a one-time purchase. Automatic verification of a returned invalid license stores the verdict but shows no visible inactive-license notice.

### P1 — Offline behavior is not reproducible from the clean local production build

Using `context.setOffline(true)` after a controlled online load of `npm run preview`, navigation comes from the service worker but the cached JS and CSS fail with `net::ERR_FAILED`; only “Skip to workspace” remains. Cache Storage contains both hashed files. The same cache-clear/offline procedure succeeds on the live deployment, including a second OCR run after the OCR assets have been loaded once. This is not a deployment outage, but the required clean-clone offline verification is failing and there is no claim test to catch it.

## Other defects

### P2 — Accessibility and responsive robustness

- At 200% text size on a 390 px viewport, document width grows to 449 px and the headline/actions overflow horizontally.
- Mobile touch targets under 44 px include the 28 px-high brand link, 24 px-high license summary, 21 px-high Privacy/Terms links, and 43 px-high Studio link.
- The required sample action wording and explicit audience are absent, especially harmful for the intended screen-reader audience.
- The empty license field silently does nothing; it has no required indication or announced error.

Keyboard Tab order, the skip link, labels, dark-mode focus outlines, and ordinary target buttons otherwise work. Focus outlines measured 3 px solid amber in dark mode.

### P2 — Site structure, metadata, security, and caching

- No `Content-Security-Policy` or `Permissions-Policy` response header.
- Hashed assets, the 2 MB language pack, and the 3.9 MB selected OCR core all use `Cache-Control: public, must-revalidate, max-age=30`, not long-lived immutable caching.
- `/does-not-exist` returns the home app with HTTP 200; there is no designed 404.
- `/robots.txt` and `/sitemap.xml` return 404.
- No canonical URL, Open Graph metadata, Twitter card, or Apple touch icon.
- The manifest is served as `application/octet-stream`, not a manifest JSON media type.
- Direct `/privacy` and `/terms` pages have no header/footer skeleton, meta description, or canonical URL.
- Footer omits “Built by Param Factory” and a version/build identity.
- `.factory/brief.json` is absent, although the supplied work-order brief was used for this verification.

### P2 — Development dependency audit fails

`npm audit` reports 5 development-tool findings: 3 moderate, 1 high, and 1 critical. The critical advisory is `GHSA-5xrq-8626-4rwp` in Vitest; the high finding is through Vite. `npm audit --omit=dev` reports zero production dependency vulnerabilities.

## What passed

### Build and repository checks

| Check | Result | Evidence |
|---|---:|---|
| Clean candidate identity | PASS | `git rev-parse HEAD` = requested SHA; initial `git status --short` empty |
| `npm ci` | PASS | 75 packages installed |
| `npm test` | PASS | 1 file, 2 tests |
| `npx tsc -b --pretty false` | PASS | exit 0 |
| `npm run build` | PASS | Vite 6.4.3; `dist/index.html` produced |
| Production dependency audit | PASS | 0 vulnerabilities with `--omit=dev` |
| MIT license and basic README | PASS | present |

Build sizes:

- Initial app JS: 18,209 bytes raw / 7.44 KB gzip
- Deferred OCR API chunk: 17,478 bytes raw / 7.41 KB gzip
- CSS: 8,947 bytes raw / 2.86 KB gzip
- Hero WebP: 26,102 bytes
- Entire `dist/`: about 20 MB because local OCR runtimes/models are bundled

### Functional cases

| Case | Result | Evidence |
|---|---:|---|
| Real `getDisplayMedia` capture | PASS | Chromium auto-selected an actual desktop source; preview and crop controls became visible |
| Capture cancellation | PASS | “Capture was cancelled or unavailable. Nothing was retained.” |
| Unsupported capture API | PASS | Actionable current-browser/sample message |
| Sample OCR execution | PARTIAL | Local Tesseract completes, but misses all actionable sample controls |
| Out-of-range crop (`Left=999999`) | PASS | No page error; clear no-target recovery message |
| Invalid JSON import | PASS | “That file is not a Screen Bridge target export.” |
| Save privacy | PASS | IndexedDB record contains text targets/crop only, no screenshot |
| JSON export | PASS | Valid version 1 file, 4 targets, no screenshot field |
| Core demo outbound traffic | PASS | Only product-origin and `blob:` requests; no analytics/CDN/model calls |
| License return URL | PASS | Token stored, query stripped, one verify call; cached verdict prevents a second daily call |
| License API rate limiting | PASS | Requests 1–30 returned 200; request 31 returned 429 with `Retry-After: 4` |

### PWA, accessibility, and performance

- Manifest includes name, short name, 192/512 maskable icons, standalone display, theme/background colors, and a versioned start URL.
- Live service worker controls the page. After online OCR, cache-clear plus `context.setOffline(true)` supports offline reload and another OCR analysis.
- A simulated byte-changed service worker triggers the visible “Update ready. Refresh” toast.
- No console or page errors on ordinary dark-mode desktop/mobile load or the normal sample flow.
- `verify-url.sh` exits 0 for live: HTTP 200, title, `lang=en`, one h1, main, image alt, no console errors.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 922 ms, LCP 998 ms, TBT 48 ms, CLS 0, Speed Index 922 ms. Initial transfer: 40,991 bytes; JS 7,470 bytes, CSS 2,922 bytes, image 26,168 bytes.
- 390×844 initial layout has no horizontal overflow; both primary actions are 358×48 px.
- Reduced-motion media query matches and CSS collapses animations to 0.01 ms.

Lighthouse audits only the default dark theme; the separate axe day-mode result above remains a release defect.

## Live deployment identity

The live deployment is the candidate, not an older/newer build. SHA-256 values match the clean local production build for:

- `index.html`: `99866deb03fbc4abefa243f89d5c19d563a99717f361f534f652b26c0c8e049b`
- `sw.js`: `a11a426f42a30c77d45178c86a66d09ca45241ce03510cd8a6831d888741be5c`
- `assets/index-BRvr9Ma5.js`: `a57e2b9891c868d19317b7943e1b4388ba967a0d889a743246a9e04fdfb8dc60`
- `assets/index-CMhRuEyf.js`: `8e65c9cd441aae470869d427ffb5f62f2ca9da8cf5c827054dfa3d63ca66c2da`
- `assets/index-C9jC7dMI.css`: `5c44bc0b6aaac8c040d8f96c3ff8d23bab6dbab9ecde7ae995f34e7e617287`
- Both direct legal pages also match byte-for-byte.

## Commands used

```sh
npm ci
npm test
npx tsc -b --pretty false
npm run build
npm audit --json
npm audit --omit=dev --json
npm run preview -- --host 127.0.0.1
/opt/fleet/lib/verify-url.sh https://screen-bridge.sociobot.in /tmp/sb-verify-live
npx lighthouse@12.8.2 https://screen-bridge.sociobot.in ...
```

Playwright 1.58.2 and `@axe-core/playwright` were used for clean-context desktop/mobile, both themes, keyboard, storage/download, network, service worker, offline, response, and error-path checks.

## Required remediation before another candidate

1. Add `.factory/claims.json` and observable demo-based tests for every claim.
2. Implement the required direct demo route/query, one-click completed sample, banner/actions, and isolated storage namespace.
3. Make the sample detect and expose its actual buttons/field, then fix number-plus-Enter behavior with end-to-end keyboard tests.
4. Expose, reload, and delete saved scans; correct the privacy copy.
5. Repair day contrast, 200% text reflow, and all sub-44 px touch targets.
6. Either register and fully describe the paid product with exact price or remove the broken paid UI.
7. Add deployment routing/security/cache metadata and the missing factory artifacts, then rerun the full matrix.
