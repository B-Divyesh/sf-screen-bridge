# Screen Bridge

Screen Bridge is a private, local-first helper for blind and low-vision people working with a remote desktop, legacy dialog, or canvas application whose controls are missing from the accessibility tree.

It captures a user-selected screen or window, lets the user crop one region, then runs local OCR and visual-boundary detection to make numbered targets. Press a number and Enter to hear a confirmed target. It does not click or control another computer, upload captures, recognise faces, or replace a screen reader.

## Use it

1. Open the app in a current desktop browser and choose **Capture screen**.
2. Select a screen, window, or browser tab in the browser permission prompt.
3. Enter crop coordinates around one visual dialog, then choose **Analyze this crop**.
4. Press `1`–`9`, then Enter, or select a target to hear it. Amber targets are explicitly uncertain.

**Try a safe sample** exercises the complete OCR path without sharing a real screen. The first OCR scan loads local English recognition files; once the PWA has been opened online, the shell and recognition assets are cached for offline reuse.

## Privacy

Screen pixels and OCR are processed in the browser. Captures are kept only in memory. **Save target list locally** stores just text targets and crop coordinates in IndexedDB, never a screenshot. JSON export/import is explicit. See [/privacy](/privacy) and [/terms](/terms).

## Develop

Requirements: Node 22+.

```sh
npm install
npm run dev
npm test
npm run build
```

The production static site is written to `dist/` with `dist/index.html` at its root. Deploy it as a same-origin static site so the service worker can install.

## Paid Studio unlock

The free local capture, OCR, keyboard targets, and export are never gated. Studio is a one-time Sociobot license for desktop-capture integrations and support. The purchase link is hosted by Sociobot; users can paste a license to restore it on another device. Verification is background-only and at most once per day, so it never blocks the free tool.

## Credits

The signal-desk hero illustration is an original Azure AI Foundry generated asset. Prompt and provenance are recorded in `.factory/design.md`. UI icons are hand-authored SVG.
