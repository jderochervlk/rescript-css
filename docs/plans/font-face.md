# Font Face Plan

## Goal

Add typed, statically emitted `@font-face` registration and return a reusable family value.

## Prerequisite

[Global styles](global-styles.md) must land first for ordered non-class rule emission.

## Proposed API

```rescript
let inter = Css.fontFace({
  family: "Inter",
  src: [
    Css.fontSource(~url="/fonts/inter.woff2", ~format="woff2"),
  ],
  style: Normal,
  weight: "100 900",
  display: Swap,
})

let body = Css.style({fontFamily: `${inter}, system-ui, sans-serif`})
```

The returned value is the correctly quoted family name. `fontSource` should also support `local()`
and optional `tech()` metadata without asking users to concatenate descriptor syntax manually.

## Descriptor Model

Start with `family`, non-empty `src`, `style`, `weight`, `stretch`, `display`, `unicodeRange`,
`featureSettings`, `variationSettings`, `ascentOverride`, `descentOverride`, `lineGapOverride`, and
`sizeAdjust`. Finite values such as `font-display` should use contextual variants with `Raw`.

## Architecture

1. Define a dedicated descriptor record; do not reuse normal style declarations because descriptor
   names and allowed values differ from CSS properties.
2. Serialize sources and descriptors through small pure functions in `Css.res` or a focused
   `CssFont.res` module if `Css.res` becomes unwieldy.
3. Register the completed `@font-face` text as an ordered collected rule.
4. Replace the compiled registration call with the family string so downstream modules do not
   execute collection code at runtime.
5. Preserve multiple faces for the same family and their source order.

## Files

- `packages/rescript-css/src/Css.res` and optionally `CssFont.res`
- `packages/rescript-css/src/Runtime.res` and `Runtime.resi`
- `packages/rescript-css/vite/vite-plugin.ts`
- Plugin tests and a font fixture using local dummy URLs
- Package exports if a new ReScript module is introduced
- `docs/values-and-properties.md`

## Tests

- Emits URL and local sources with correct quoting and optional format/tech hints.
- Emits variable weight/stretch ranges and override descriptors.
- Supports several faces sharing one family.
- Rejects an empty family or source list before emitting CSS.
- Escapes quotes, backslashes, and unsafe descriptor boundaries.
- Inlines the returned family value in transformed JavaScript.

## Acceptance Criteria

- Font registration is emitted once with the importing module's stylesheet.
- Common descriptors have autocomplete and uncommon descriptors retain a controlled escape hatch.
- No real font binary is added to the repository or package tarball.

## Non-Goals

- Downloading, subsetting, or converting font files.
- Google Fonts or other provider integrations.
- Automatic preload tag generation.
