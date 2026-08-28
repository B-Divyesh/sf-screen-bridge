# Independent product verification 2

## Verdict: FAIL

Candidate 710b66e39211729bd31e967f5f1d4415f0f4fd93 is not releasable. The live PWA matches this commit, but its core local OCR path is broken in production: the live Content Security Policy blocks Tesseract's WebAssembly runtime. The app remains indefinitely on its reading state and produces no OCR targets.

- Tested commit: 710b66e39211729bd31e967f5f1d4415f0f4fd93
- Branch: main
- Live URL: https://screen-bridge.sociobot.in
- Verification date: 2026-08-28 UTC
- Starting tree: clean
- Product code changed by verifier: no

## Mandatory gates

### Claims gate — PASS

.factory/claims.json exists. From the clean install, I ran every command in the registry separately through its Playwright demo entry point. All passed.

| Claim ID | Exact command | Result |
|---|---|---:|
| sample-demo | npm run test:browser -- --grep @claim:sample-demo | PASS, 1 test |
| keyboard-confirm | npm run test:browser -- --grep @claim:keyboard-confirm | PASS, 1 test |
| privacy-local | npm run test:browser -- --grep @claim:privacy-local | PASS, 1 test |
| json-export | npm run test:browser -- --grep @claim:json-export | PASS, 1 test |
| offline-reload | npm run test:browser -- --grep @claim:offline-reload | PASS, 1 test |

### Cold first-read and one-click demo — PASS

Cold live desktop copy answers all three questions in plain words: “Reach visual controls with your screen reader”; “For blind and low-vision people using remote desktops or legacy dialogs”; and the primary action “Try it with sample data” with adjacent “Loads a complete sample dialog.”

The screen also gives three facts: local processing, works offline after the first visit, and free core/no account. One click changes the URL to /demo, displays the persistent demo banner, and exposes five targets including Save connection and Cancel. Direct /demo creates only demo:screen-bridge in a fresh context.

## Release-blocking defects

### P0 — Live CSP prevents the core OCR job from running

On live /demo, I clicked Analyze this crop against the shipped connection-dialog sample. After 25 seconds it was still:

    Reading the crop locally. This can take a few seconds the first time.

The result area remained “Reading locally…” with no targets. Browser output contained:

    CompileError: WebAssembly.instantiate(): Compiling or instantiating WebAssembly
    module violates the following Content Security Policy directive because
    'unsafe-eval' is not an allowed source of script

    RuntimeError: Aborted(CompileError: WebAssembly.instantiate() ...)

The live CSP is:

    default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:;
    connect-src 'self'; worker-src 'self' blob:; manifest-src 'self'; base-uri 'self';
    form-action 'self'; frame-ancestors 'none'

The app's real local Tesseract path therefore cannot complete in production. Pre-populated sample targets make the first demo look healthy, but the actual product operation required by the brief fails. The failure also never enters the existing actionable error recovery state.

### P1 — Serious day-mode contrast violation after ordinary keyboard use

From live /demo, press 1, press Enter, save the target list, switch to Day mode, then run axe WCAG 2 A/AA. Axe reports serious color-contrast on:

    <small>OCR text · 97% confidence</small>

The calculated foreground #4a5a62 on selected-target background #b8d2ca is 4.47:1 for 12.48px normal text, below the 4.5:1 requirement. The repository axe test passes because it never selects a target before testing day mode. The accessibility contract requires zero serious/critical findings.

### P1 — Two visitor-facing claims are not registered or proven

The claims registry has no entry/test for:

- “Free core, no account” on the landing page and equivalent Terms statement.
- The saved-list promise that records “never” contain a screenshot.

The privacy-local test records requests and database names but does not assert that saved IndexedDB values lack pixels. The claims contract requires each visitor-reliance claim to have a tagged observable test or be removed.

## What passed

### Clean checkout and repository checks

    npm ci                                      PASS (69 packages; audit clean)
    npm test                                    PASS (3/3 Vitest tests)
    npx tsc -b --pretty false                   PASS
    npm run build                               PASS
    CI=1 npm run test:browser                   PASS (7/7 Playwright tests)
    npm audit --omit=dev --json                 PASS (0 vulnerabilities)
    npm audit --json                            PASS (0 vulnerabilities)

There is no lint script. The Vite production build emits dist/. Initial application JavaScript is 41,611 bytes raw (16.67 KB gzip across two initial chunks); CSS is 8,965 bytes raw / 2.74 KB gzip; hero WebP is 26,102 bytes. These meet the static first-load budgets.

### Functional, privacy, accessibility, and PWA checks

- Sample targets, number then Enter confirmation, demo save/open/delete, Reset demo, Start for real, and JSON export work.
- Invalid JSON reports “That file is not a Screen Bridge target export.”
- A simulated cancelled getDisplayMedia reports “Capture was cancelled or unavailable. Nothing was retained.”
- A live request log across landing-to-demo/save contained only the product origin (HTML, JS, CSS, and hero) and no analytics, model, or other cross-origin requests. No sign-in, factory-unlock, or other server API exists; no request allowance/rate-limit check applies.
- Dark mode and untouched Day mode have no axe serious/critical WCAG 2 A/AA findings. The post-selection Day-mode defect above is the exception.
- At 390x844 with browser text set to 200%, scrollWidth remained 390 and no overflow offenders were found. Ordinary landing/demo flows had no console/page errors. Keyboard Tab reaches the skip link, navigation, theme, and demo controls with a visible 3px amber focus outline.
- Offline reload passes live: after the first /demo load under service-worker control, set offline and reload still renders the sample controls with no console errors. A controlled local static-server update with a byte-changed sw.js produced the in-app “Update ready. Refresh” toast.

### Deployment identity, routes, headers, and caching

Live SHA-256 values matched clean local dist/ for index.html, sw.js, manifest.webmanifest, robots.txt, sitemap.xml, both initial assets, the deferred OCR asset, and signal-desk.webp.

/, /demo, /privacy, and /terms return 200 with correct route titles, one h1, and one main. /does-not-exist returns HTTP 404 with the styled not-found page. robots.txt, sitemap.xml, and manifest return 200. The manifest has application/manifest+json; hashed assets and local OCR resources are immutable for one year; sw.js is no-cache. Live headers include HSTS, nosniff, Referrer-Policy, Permissions-Policy, and CSP.

## Required remediation

1. Make the live CSP compatible with the selected local Tesseract/Wasm runtime, or use a local runtime that works under the desired strict CSP. Add a browser claim/integration test that invokes Analyze this crop against a production-header-equivalent server and asserts completed OCR targets and recovery on failure.
2. Correct the day selected-target color pair and extend axe coverage to selected/saved states.
3. Add claim entries and observable tests for no-account/free-core access and screenshot-free saved records, or remove those claims.
