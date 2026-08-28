# Screen Bridge visual thesis

## Direction: pixel / demoscene signal desk

Screen Bridge is a focused assistive utility, so its visual language is a calm
late-night signal desk rather than a futuristic dashboard. A captured region is
rendered as a raster field, then resolved into high-contrast numbered targets.
Small scanlines, 1px borders, and deliberately square corners refer to the
pixel-level problem without reducing legibility.

### Palette

Both modes are first-class. Night mode is the default, keeping a capture
session visually quiet in a dim room. Ink `#10151f`, panel `#182433`, and
field `#0b1119` hold the canvas. Text is paper `#f3f7e8`; muted text is
`#b7c6c9`. The navigational signal is phosphor mint `#9ff5c5` with deep ink
text. Amber `#ffd166` marks uncertainty and coral `#ff8c7d` marks errors.
Day mode turns the same system into paper `#f4f0e5`, ink `#15202b`, mint
`#087f5b`, amber `#795600`, and coral `#b13932`. All body and control pairs
meet 4.5:1 contrast.

### Type and spacing

The UI uses self-hosted-like system stacks (no network font): `ui-monospace`
for labels, keys, and targets; `system-ui` for instructional prose. The scale
is 12/14/16/20/28/42px and every gap follows a 4px rhythm. Target numerals use
tabular figures. Controls are at least 44px high.

### Interaction grammar and motion

The main action is always a high-contrast **Capture screen** control. Results
arrive in scan order and may be operated with a number, then Enter; the live
announcer repeats a confirmed label through speech synthesis. Uncertain items
say so in both text and icon. Captures live only in this browser unless the
user exports a JSON archive. 180ms opacity/transform transitions suggest a
scan resolving into targets. With reduced motion enabled, those changes are
instant and the scanline texture is static.

### Asset plan and provenance

The one original raster hero is a nonliteral illustration of an illuminated
screen region resolving into numbered signal nodes. It has no readable text so
it cannot impersonate an actual capture. It is generated with the Factory
Azure image deployment on 2026-08-28 and converted to WebP locally.

Prompt sheet:

> Use case: stylized-concept. Asset type: compact product illustration for an
> accessibility utility. Scene/backdrop: dark navy pixel-grid field, with one
> framed desktop region transforming into a handful of bright mint and amber
> square signal nodes joined by fine pixel paths. Style/medium: original
> demoscene pixel art, restrained, precise, low-detail, flat raster blocks,
> slight CRT scanline texture. Lighting/mood: quiet, reassuring, technical.
> Color palette: ink navy, paper cream, phosphor mint, signal amber, a small
> coral accent. Composition: wide 3:2, visual mass on the right, open dark
> space on left. Constraints: no people, no app interface, no words, no
> letters, no digits, no logo, no watermark, no brand references.

Candidate is reviewed for text artifacts, unexpected symbols, seams, and
palette fit before it ships. Original SVG marks and icons are hand-authored in
the app. The footer identifies the illustration as AI-generated.
