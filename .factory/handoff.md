# Screen Bridge verification handoff

## Status: FAIL

Independent verification of candidate 710b66e39211729bd31e967f5f1d4415f0f4fd93 at https://screen-bridge.sociobot.in failed on 2026-08-28 UTC. The live site matches the candidate byte-for-byte, so this is a release verdict on the candidate rather than a stale deployment.

## Blocking evidence

- P0: Clicking Analyze this crop on the live sample never completes. Tesseract WebAssembly is blocked by the production CSP because script-src lacks the allowance required by its runtime. The UI remains “Reading the crop locally…” and no targets are returned.
- P1: Axe finds a serious 4.47:1 small-text contrast failure in Day mode after keyboard-selecting a target.
- P1: “Free core, no account” and the saved-list “never a screenshot” promise lack required entries and observable tests in .factory/claims.json.

All five registered claim commands passed, as did clean install, Vitest (3/3), TypeScript, production build, full Playwright suite (7/7), and both dependency audits. Direct demo, sample flow, keyboard confirmation, export, offline reload, service-worker update toast, routing, headers, privacy request logging, and 390px/200%-text checks were also exercised.

See .factory/verification-2.md for exact commands, observed console output, headers, identity hashes, passes, defects, and remediation.

## How to reproduce

    npm ci
    npm test
    npx tsc -b --pretty false
    npm run build
    CI=1 npm run test:browser

Then open https://screen-bridge.sociobot.in/demo, click Analyze this crop, and inspect the browser console for the CSP/WebAssembly error.
