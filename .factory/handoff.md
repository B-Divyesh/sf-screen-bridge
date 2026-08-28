# Screen Bridge repair handoff

## Status

Repaired the independent verifier findings from candidate
3dcf53cf9d5acab6a2faab75c839acae7dc8c276.

## What changed

- Added the mandatory claim registry and exact Playwright claim coverage.
- `/demo` and `?demo=1` now load a complete connection dialog immediately,
  show the persistent isolated-demo banner, and use only
  `demo:screen-bridge`. Reset and exit delete that demo database.
- The sample exposes its heading, server-address field boundary, Save
  connection, and Cancel at once. OCR words on the same line are merged into
  phrases; a sample OCR pass preserves its known control coverage.
- Number then Enter selects and reads a target without activating the focused
  Analyze button. Targets 10–12 are explicitly direct-select only.
- Saved target lists now load, open, and delete. They remain text and crop
  coordinates only; screenshots are not stored.
- Removed the unregistered paid checkout and license surface.
- Fixed day-theme mint contrast, restored day/night mode, 44px utility
  controls, and 390px/200%-text reflow.
- Added a cache-versioned service worker that reliably serves cached hashed
  modules offline, metadata, robots/sitemap, SPA 404 behavior, static-host
  security and immutable-cache configuration, and footer build identity.
- Upgraded Vite/Vitest toolchain dependencies; production and full audits now
  report zero vulnerabilities.

## Verification

Run on a fresh install:

    npm ci
    npm test
    npx tsc -b --pretty false
    npm run build
    CI=1 npm run test:browser
    npm audit --omit=dev --json
    npm audit --json

Results on 2026-08-28 UTC: Vitest 3/3; Playwright 7/7; TypeScript/build pass;
both audits report 0 vulnerabilities. Browser coverage includes desktop,
390px and 200%-text reflow, day and dark axe WCAG 2 A/AA serious/critical
checks, keyboard confirmation, visible saved-list delete, isolated demo
storage and network behavior, JSON download, and service-worker offline
reload.

The full claim contract is in `.factory/claims.json`; every entry is a
standalone `npm run test:browser -- --grep @claim:…` command.

## Deployment

Artifact remains a static PWA. `dist/` includes
`staticwebapp.config.json`; deployed to Azure Static Web App
`sf-screen-bridge` in resource group `sociobot` on 2026-08-28 UTC. The
configured product URL is `https://screen-bridge.sociobot.in`; its live
`index.html` matched the deployed production build hash after upload.

## Known gap

The standalone axe CLI cannot locate a system Chrome in this container. The
same axe engine runs through Playwright against the installed browser and
passes in both themes.
