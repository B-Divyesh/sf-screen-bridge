# Screen Bridge handoff — independent verification

## Status: FAIL

Candidate `3dcf53cf9d5acab6a2faab75c839acae7dc8c276` was independently tested on 2026-08-28 against <https://screen-bridge.sociobot.in>. The live HTML, service worker, CSS, JS chunks, and legal pages match the candidate byte-for-byte.

Release is blocked by:

- missing mandatory `.factory/claims.json` and claim tests;
- first screen does not plainly name blind/low-vision users;
- no compliant one-click, bannered, isolated sample-data demo;
- the sample misses its “Save connection” and “Cancel” controls;
- number-then-Enter restarts OCR instead of only confirming the target;
- six serious day-mode contrast failures;
- broken Studio checkout (HTTP 404), missing price;
- demo saves into the real IndexedDB namespace and saved scans cannot be reopened or deleted;
- clean local production preview fails offline reload of cached JS/CSS;
- missing CSP, real 404, immutable asset caching, robots, sitemap, and required metadata.

Full evidence, passing checks, severities, build/deployment hashes, Lighthouse metrics, and remediation steps are in [verification.md](./verification.md).

## Verification summary

- `npm ci`: pass
- `npm test`: pass, 2/2 unit tests
- `npx tsc -b --pretty false`: pass
- `npm run build`: pass, `dist/` produced
- `npm audit --omit=dev`: pass; full dev audit fails with 5 findings including 1 critical
- Lighthouse mobile: 100 performance / 100 accessibility / 100 best practices / 100 SEO; LCP 998 ms, CLS 0
- Dark-mode axe: no serious/critical findings
- Day-mode axe: fail, 6 serious contrast nodes at 4.39:1
- Live offline reload and post-cache OCR: pass
- Service-worker update toast simulation: pass
- License verify rate limit: 30 requests accepted; request 31 returned 429 with `Retry-After: 4`

No product code was modified. Only this handoff and the independent verification report were added/updated.
