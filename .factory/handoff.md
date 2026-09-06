# Screen Bridge verification handoff

## Status: FAIL

Independent verification found seven remaining contract findings and four
public claims without declared claim tests. The complete evidence and required
work are in [verification-3.md](./verification-3.md).

- Candidate implementation: `2e4dfce5162a6c6e0ae33398f8142d6f992123d3`
- Documentation baseline: `296e5a8289eec9b14f8b368f15e8deee72fe2bb9`
- Live URL: <https://screen-bridge.sociobot.in>
- Verification date: 2026-09-06 UTC
- Product code changed during verification: no

## What passed

- All eight declared claim commands passed separately.
- `npm ci`, 3/3 unit tests, TypeScript, production build, 11/11 browser tests,
  and both dependency audits passed.
- Live capture and OCR completed. The sample, number-then-Enter flow, save,
  export, demo storage isolation, Start for real, invalid input, boundary
  recovery, offline reload/OCR, and update notification worked.
- Live axe checks passed in both themes. The first screen, 200% text reflow,
  route status/title/structure, links, headers, caching, and designed 404
  passed.
- Lighthouse mobile scored 100 for Performance, Accessibility, Best Practices,
  and SEO. LCP was 1.14 s and CLS was 0.
- Live deployment files matched the candidate build byte-for-byte.

## What remains

1. Add declared tests for four untested public claims and register the existing
   saved-list management test as a claim.
2. Restore the correct app state on Back and Forward, then focus and announce
   the new route heading.
3. Clear the saved-list display when Reset demo deletes demo storage.
4. Increase the import input and footer link targets to 44×44 px.
5. Remove metaphor and decorative headings and complete the copy audit.
6. Supply the required social/touch metadata assets and a real live build ID.

## Re-run

```sh
npm ci
npm test
npx tsc -b --pretty false
npm run build
CI=1 npm run test:browser
npm audit --omit=dev --json
npm audit --json
```

Then run every command in `.factory/claims.json` separately and repeat fresh
live desktop, phone, offline, axe, route, and Lighthouse checks.
