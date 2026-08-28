# Screen Bridge

Screen Bridge helps blind and low-vision people reach visual controls in a
remote desktop or legacy dialog. It turns one selected screen region into
numbered labels that can be heard with a screen reader.

Open `/demo` or choose **Try it with sample data** to load the complete sample
dialog in an isolated workspace. It works offline after the first visit.

## Use it

1. Choose **Capture a screen** and select a screen, window, or tab.
2. Set crop coordinates around one dialog, then choose **Analyze this crop**.
3. Press `1`–`9`, then `Enter`, to hear a target. Select targets 10–12
   directly.
4. Save a target list in this browser or export it as JSON.

Screen pixels and OCR stay in this browser. Saved lists contain target text and
crop coordinates, never a screenshot. See [/privacy](/privacy) and
[/terms](/terms).

## Develop and verify

Node 22+ is required.

    npm ci
    npm test
    npm run test:browser
    npx tsc -b --pretty false
    npm run build

The static PWA is emitted to `dist/` with `dist/index.html` at its root.
Deploy `dist/` as a same-origin static site using the included
`staticwebapp.config.json`. Run individual observable claim checks from
`.factory/claims.json`.

## Credits

The signal-desk illustration is original Azure AI Foundry generated artwork.
Its prompt and provenance are in `.factory/design.md`. UI icons are
hand-authored SVG.
