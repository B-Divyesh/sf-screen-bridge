# Screen Bridge repair handoff

## Status: PASS

Implementation commit: `2e4dfce5162a6c6e0ae33398f8142d6f992123d3`.

Deployed to <https://screen-bridge.sociobot.in> on 2026-09-06 UTC. The live
`index.html`, service worker, initial CSS, initial app JavaScript, and deferred
OCR JavaScript match the clean local `dist/` byte-for-byte.

## What changed

- Allowed WebAssembly compilation with CSP `script-src 'wasm-unsafe-eval'`.
  Tesseract remains fully local; no broad `unsafe-eval` allowance was added.
- Corrected Day-mode selected-target metadata text to `#405056` on the selected
  background, a 5.24:1 contrast ratio.
- Added observable claim coverage for local OCR completion, free-core use with
  no account, and screenshot-free saved target lists.
- Browser tests now serve `dist/` with the shipped static-app headers from
  `staticwebapp.config.json`; no globally installed test server is required.
- Added a real OCR failure-recovery test. If local OCR cannot start on the
  sample, usable sample targets remain available instead of an indefinite read
  state.
- Added the catalog description in `.factory/catalog-description.txt` and the
  required copy in `/work/.evidence/catalog-description.txt`.

## Verification

From a clean dependency install:

```sh
npm ci
npm test
npx tsc -b --pretty false
npm run build
CI=1 npm run test:browser
npm audit --omit=dev --json
npm audit --json
```

Results: Vitest 3/3, TypeScript pass, production build pass, Playwright 11/11,
and both audits report zero vulnerabilities. Every eight declared command in
`.factory/claims.json` was also run separately and passed.

The local header-aware OCR claim runs the actual shipped Tesseract worker and
recognizes a sample crop without console/page errors. It would fail if the
production CSP again blocked Wasm.

Fresh live desktop (1440x900) and phone (390x844) contexts both showed, before
scrolling:

- Job: “Reach visual controls with your screen reader.”
- Audience: blind and low-vision people using remote desktops or legacy dialogs.
- First action: “Try it with sample data.”

On both devices the one-click sample gave five targets, **Analyze this crop**
completed real local OCR with four returned targets, and `1`, then `Enter`,
read the chosen target without restarting analysis. A fresh phone context also
reloaded `/demo` offline under service-worker control with its five sample
targets and no console errors.

Live `@axe-core/playwright` WCAG 2 A/AA checks found no serious or critical
findings in Night or Day mode after keyboard selection and saving. The attached
`verify-url.sh` check passed for HTTPS: title, `lang=en`, one h1, main, image
alt text, named buttons, and no console errors. The standalone axe CLI could
not start because this worker lacks a system Chrome binary; the permitted
Playwright axe integration was used instead.

Lighthouse mobile against HTTPS: Performance 100, Accessibility 100, Best
Practices 100, SEO 100; FCP 1.1 s, LCP 1.1 s, TBT 0 ms, CLS 0, total transfer
40 KiB.

Checked live recovery and routes: invalid JSON reports a clear import error;
an out-of-range crop returns useful targets without a page error; privacy flow
requests stay same-origin; `/`, `/demo`, `/privacy`, and `/terms` return 200
with correct titles; the styled `/does-not-exist` response deliberately returns
404. All landing links resolve to those valid routes or same-page anchors.

## Earlier findings

- The previous CSP P0 is resolved by the live OCR run above.
- The selected Day-mode contrast P1 is resolved by the selected-and-saved live
  axe check.
- The two unregistered claims now have registered, outcome-based tests.
- The earlier demo isolation, one-click populated sample, keyboard confirmation,
  saved-list, offline, responsive, metadata, header, caching, and designed-404
  findings remain covered by the full browser suite and live smoke checks.

## Known gaps and next steps

The free core is complete. No paid offer is currently advertised or registered,
so no billing metadata file is applicable. Future paid desktop-capture
integrations and support described in the research brief remain unavailable
until they are separately built and registered with Sociobot billing.

