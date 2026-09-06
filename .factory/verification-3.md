# Verify Screen Bridge reaches visual controls

## Verdict: FAIL

Screen Bridge is not accepted. The core capture, local OCR, keyboard, save,
export, privacy, and offline paths work, but this review found seven remaining
contract findings. Four public claims have no declared claim test.

- Candidate implementation: `2e4dfce5162a6c6e0ae33398f8142d6f992123d3`
- Documentation baseline: `296e5a8289eec9b14f8b368f15e8deee72fe2bb9`
- Substantive verification document: `942f26d0a7a4418b1f76ded15723bec66c3110e4`
- Live URL: <https://screen-bridge.sociobot.in>
- Verification date: 2026-09-06 UTC
- Starting tree: clean
- Product code changed by verifier: no
- Finding count: 7
- Untested public claim count: 4

## First screen

Fresh 1440×900 desktop and 390×844 phone browsers showed all required text
before scrolling:

- Job: “Reach visual controls with your screen reader.”
- Audience: blind and low-vision people using remote desktops or legacy
  dialogs.
- First action: “Try it with sample data,” followed by “Loads a complete
  sample dialog.”

One click opened `/demo`, showed the persistent sample-data label, and loaded
five realistic targets: Connection settings, Server address, Server address
entry, Save connection, and Cancel.

## Findings

### P1 — Public claims are missing from the claim registry

All eight declared claim commands pass, but `.factory/claims.json` does not
cover all statements and controls a visitor can rely on.

The following four public claims have no declared claim test:

1. The Privacy page says the theme choice lives in this browser.
2. The Privacy page says resetting or leaving demo deletes saved sample lists.
3. The workspace and README say targets 10–12 can be selected directly.
4. The capture control advertises `Ctrl`+`Shift`+`S` as a keyboard shortcut.

The Privacy page also says every saved list can be opened or deleted. An
untagged full-suite test covers that behavior, but the claim is absent from the
registry. The claims contract requires every public claim to be listed and to
have one tagged observable test.

### P1 — Browser history does not restore the route state

From `/`, choosing the sample changes the URL to `/demo`. Pressing Back changes
the URL to `/`, but the demo label, sample image, and populated targets remain.
The internal storage mode also remains demo until reload. Forward and Back
therefore do not restore the state represented by the address bar.

Route navigation also leaves focus on `body` and provides no route-change live
region. The required focus move to the new `h1` and announcement are absent.

### P2 — Reset demo leaves deleted data on screen

After saving a demo target list, **Reset demo** deletes the
`demo:screen-bridge` database and restores the five sample targets. However,
the deleted saved-list row remains visible and the empty saved-list message is
absent. Reload clears the stale row. Reset must update both storage and the
visible saved-list state.

### P2 — Three phone controls are below the 44 px target size

At 390×844, the visible import file input measured 180×21 px. Footer Privacy
and Terms links measured 51×21 px and 41×21 px. The accessibility and design
contracts require every interactive target to be at least 44×44 CSS px.

### P2 — Public copy still uses banned metaphor and decorative labels

The live page includes “404 / SIGNAL LOST,” “That page is not in this bridge,”
“A NARROW BRIDGE, NOT A REPLACEMENT SCREEN READER,” and “No image in the
bridge.” These are metaphor or decorative labels instead of plain task names.
The three-step section also lacks a real “How it works” heading.

`.factory/copy-audit.md` contains only six first-screen lines rather than every
sentence on the landing page, so it does not provide the required complete
copy audit.

### P2 — Social and touch-icon metadata do not meet the site contract

The Open Graph image is `signal-desk.webp` at 960×640, not the required
1200×630 asset. The page has only `twitter:card`; it omits Twitter title,
description, and image metadata. The Apple touch icon points to a 192×192 file
rather than a 180 px touch icon.

### P2 — The live footer does not identify the deployed build

Every live route displays “Screen Bridge · build local.” The site contract
requires a version or build identity. “local” is not the deployed candidate
identity and cannot be used to trace the release.

## Declared claim commands

Each command was run separately after `npm ci` from the clean checkout.

| Claim | Exact command | Result |
| --- | --- | ---: |
| sample-demo | `npm run test:browser -- --grep @claim:sample-demo` | PASS, 1 test |
| keyboard-confirm | `npm run test:browser -- --grep @claim:keyboard-confirm` | PASS, 1 test |
| privacy-local | `npm run test:browser -- --grep @claim:privacy-local` | PASS, 1 test |
| local-ocr | `npm run test:browser -- --grep @claim:local-ocr` | PASS, 1 test |
| free-core | `npm run test:browser -- --grep @claim:free-core` | PASS, 1 test |
| screenshot-free-saves | `npm run test:browser -- --grep @claim:screenshot-free-saves` | PASS, 1 test |
| json-export | `npm run test:browser -- --grep @claim:json-export` | PASS, 1 test |
| offline-reload | `npm run test:browser -- --grep @claim:offline-reload` | PASS, 1 test |

The missing and unregistered claims above keep the claims gate from passing.

## Clean-checkout results

| Check | Result |
| --- | ---: |
| `npm ci` | PASS; 69 packages, zero vulnerabilities |
| `npm test` | PASS; 3/3 Vitest tests |
| `npx tsc -b --pretty false` | PASS |
| `npm run build` | PASS; `dist/index.html` produced |
| `CI=1 npm run test:browser` | PASS; 11/11 Playwright tests |
| `npm audit --omit=dev --json` | PASS; zero vulnerabilities |
| `npm audit --json` | PASS; zero vulnerabilities |

Initial JavaScript is 41,611 bytes raw and 16,523 bytes gzip across two chunks.
CSS is 9,066 bytes raw and 2,771 bytes gzip. The hero image is 26,102 bytes.
All are below the product budgets.

## Live functional evidence

- A fresh headed desktop browser captured the actual test desktop, showed the
  crop controls, and returned 12 OCR targets.
- **Analyze this crop** on the shipped sample completed live Tesseract OCR and
  returned four useful targets, including Save connection and Cancel.
- The OCR flow made only same-origin GET requests. It made no upload or
  cross-origin request.
- `1`, then `Enter`, selected and read target 1 without restarting OCR.
- Demo saving changed only `demo:screen-bridge`; a sentinel record in the real
  `screen-bridge` database remained unchanged.
- Saved records contained target text and crop coordinates and no screenshot,
  image, canvas, pixel, or base64 payload.
- **Start for real** removed demo storage and returned to an empty real
  workspace.
- Invalid JSON reported the expected import error. An out-of-range crop
  recovered with usable targets. Capture cancellation and unsupported capture
  both gave clear next steps.
- Offline reload and OCR passed in a fresh phone context after only the first
  online demo visit. Offline OCR also passed after an online OCR run.
- A controlled byte change to the local service worker showed the visible
  “Update ready. Refresh” notice.
- No ordinary landing, demo, save, OCR, offline, or route page error was
  recorded. The automated headed capture harness emitted a camera policy
  message because it uses Chromium's fake media flag; display capture and OCR
  still completed, so this is not classified as a product defect.

## Accessibility, routes, and performance

- Live Playwright axe checks found no serious or critical WCAG 2 A/AA
  violations in Night or Day mode after target selection and saving.
- The skip link receives first keyboard focus with a 3 px amber outline.
- Reduced-motion preference matched. At 200% text on a 390 px viewport,
  document width stayed 390 px with no overflow.
- `/`, `/demo`, `/privacy`, and `/terms` returned 200 with their correct title,
  canonical URL, one `h1`, and header/main/footer structure.
- `/does-not-exist` deliberately returned HTTP 404 with the designed page.
  This expected 404 is not a defect.
- Every landing link resolved. `robots.txt`, `sitemap.xml`, and the manifest
  returned 200. The manifest used the correct media type.
- Security headers include CSP with `wasm-unsafe-eval`, HSTS, nosniff,
  Referrer-Policy, and Permissions-Policy. Hashed assets are immutable for one
  year; `sw.js` is not cached.
- `/opt/fleet/lib/verify-url.sh` passed after its evidence directory was
  created: title, `lang=en`, one `h1`, main, image alt text, named buttons, and
  no load errors.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; FCP 1.14 s, LCP 1.14 s, TBT 86 ms, CLS 0, transfer 40,923 bytes.

This is a static PWA. Backend tenant isolation, database restart persistence,
health endpoints, and 429/Retry-After behavior do not apply. No paid feature
is advertised, so billing verification does not apply.

## Deployment identity

The live `index.html`, service worker, manifest, robots file, sitemap, initial
JavaScript, deferred OCR JavaScript, CSS, and hero image match the clean local
`dist/` byte-for-byte. The implementation is therefore candidate
`2e4dfce5162a6c6e0ae33398f8142d6f992123d3`; later commits changed only
verification documents.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Sample missed useful controls | Resolved: one-click sample has five useful targets; live OCR returns button labels. |
| Number then Enter restarted OCR | Resolved by live keyboard test. |
| Demo shared real storage | Resolved for storage isolation; reset has the separate stale-display finding above. |
| Saved lists could not be opened or deleted | Resolved by the full browser test, but the public claim is not registered. |
| Day-mode contrast | Resolved in selected and saved states by live axe checks. |
| Broken paid flow | Resolved by removing the unregistered offer. |
| Offline clean-build failure | Resolved locally and live, including OCR. |
| 200% phone overflow | Resolved. |
| Small phone targets | Partly resolved; the import input and footer links remain below 44 px. |
| Missing routes, metadata, headers, caching, and 404 | Mostly resolved; social/touch metadata and build identity remain findings. The deliberate 404 is correct. |
| Development audit findings | Resolved; both audits are clean. |
| Production Wasm CSP failure | Resolved by live OCR under the deployed CSP. |
| Selected Day-mode metadata contrast | Resolved by live axe checks. |
| Free-core and screenshot-free claims were unregistered | Resolved; both now have declared tests. Other omissions are listed above. |

## Required next work

1. Register and tag every public claim, including the four untested claims and
   the already-tested saved-list management claim.
2. Handle `popstate`, restore route state on Back and Forward, and move focus
   and announcements on route changes.
3. Re-render the saved-list area after Reset demo.
4. Make the file input and footer links at least 44×44 px.
5. Replace metaphor and decorative labels, add a real How it works heading,
   and complete the copy audit.
6. Ship compliant social/touch assets and inject the deployment commit into
   the footer build label.
