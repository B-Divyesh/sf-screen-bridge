# Screen Bridge handoff

## Delivered

- A Vite + TypeScript PWA in `dist/`, with a dark/day pixel-demoscene visual system documented in `.factory/design.md`.
- Actual browser screen capture (`getDisplayMedia`), coordinate cropping, on-device English OCR (Tesseract worker/core/language data served locally), simple visual-boundary candidates, numbered keyboard targets, and speech confirmation (`1`–`9`, then Enter).
- A safe sample for testing without sharing a real screen, clear cancellation, no-result, local-recognition-error, offline, and unsupported-capture states.
- Captures stay in memory; optional saved target lists (never screenshots) use IndexedDB with explicit JSON export/import.
- Manifest, maskable 192/512 icons, versioned-cache service worker, offline fallback, update toast, local PWA assets, and `/privacy` + `/terms` routes.
- Free core stays ungated. A Sociobot Studio checkout link and local license restore/background verification flow are present; no payment provider is embedded.

## Verification

Performed on 2026-08-28:

- `npm test` — pass (2 Vitest tests).
- `npm run build` — pass; `dist/index.html` present.
- Playwright at 390×844: loaded the safe sample, ran the real local OCR path, and received 4 numbered targets. Keyboard target interaction is wired in the same flow.
- Playwright + axe-core: 0 violations; no browser page errors.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:5173/ /tmp/sb-verify`: title present, `lang=en`, one h1, main landmark, image alt, no console errors.
- Service worker controller installed before `context.setOffline(true)` and served the app shell on offline reload after an online load.
- Build report: initial JS is 14.62 KB gzip across the app and deferred OCR API chunk; CSS is 2.86 KB gzip; hero WebP is 26 KB. These are under the static initial JS/CSS/hero budgets. The Tesseract model assets are intentionally deferred, local, and considerably larger than the shell.

## Known gaps / next steps

- Browser APIs cannot activate controls in an external desktop. Screen Bridge intentionally only labels and speaks targets; users operate the remote app with their existing keyboard/mouse/remote-desktop tools.
- OCR is English-only in v1. Add downloadable, consented local language packs after user research.
- Visual-boundary detection is deliberately conservative and lower-confidence; it is not an object-recognition model. Pilot feedback should guide detection improvements and capture-crop ergonomics.
- Lighthouse was not installed in the worker image. Build-size evidence and Playwright/axe verification are recorded above; run production Lighthouse after deployment for final field metrics.
