# Modern Properties Plan

## Goal

Expand named property coverage beyond the current 225 fields, prioritizing modern, broadly useful
CSS and filling asymmetric logical-property families.

## Prerequisite

[Structured values](structured-values.md) should land first so new properties use the correct value
families instead of adding more temporary string fields.

## Property Batches

### Typography And Accessibility

`colorScheme`, `forcedColorAdjust`, `printColorAdjust`, `fontVariationSettings`, `fontPalette`,
`fontSynthesis`, `fontSizeAdjust`, `textWrap`, `textWrapMode`, `textWrapStyle`, `textEmphasis`,
`textOrientation`, `unicodeBidi`, `hangingPunctuation`, and `lineClamp`.

### Logical Borders And Scrolling

Complete block/inline start/end border color/style/width and logical corner radii. Add logical and
per-side scroll margin, scroll padding, and overscroll longhands.

### Independent Transforms And Motion Paths

`translate`, `rotate`, `scale`, `transformBox`, `offset`, `offsetPath`, `offsetDistance`,
`offsetPosition`, `offsetAnchor`, `offsetRotate`, and `transitionBehavior`.

### View Transitions And Anchor Positioning

`viewTransitionName`, `viewTransitionClass`, `anchorName`, `anchorScope`, `positionAnchor`,
`positionArea`, `positionTry`, `positionTryFallbacks`, `positionTryOrder`, and
`positionVisibility`. Gate Limited Availability examples behind `@supports` in documentation.

### SVG Presentation

`fill`, `fillOpacity`, `fillRule`, `stroke`, `strokeWidth`, `strokeOpacity`, `strokeLinecap`,
`strokeLinejoin`, `strokeDasharray`, `strokeDashoffset`, `strokeMiterlimit`, `paintOrder`,
`vectorEffect`, `stopColor`, and `stopOpacity`.

### Additional Layout And UI

Audit `boxDecorationBreak`, `breakBefore`, `breakAfter`, `breakInside`, `orphans`, `widows`,
`shapeOutside`, `shapeMargin`, `shapeImageThreshold`, `fieldSizing`, `interpolateSize`, and missing
containment or intrinsic-sizing longhands.

## Implementation Method

1. Create a checked-in inventory table mapping ReScript field, emitted CSS name, value type,
   standards status, and test case. Do not add a runtime dependency on a browser-data package.
2. Land one coherent batch per commit so review can catch spelling and serializer mistakes.
3. Prefer logical properties and complete families rather than adding isolated physical aliases.
4. Use structured types for finite or category-sensitive values; retain strings for genuinely open
   grammars and `custom` for experimental omissions.
5. Keep property order deterministic by adding each field to the appropriate declaration group.

## Files

- `packages/rescript-css/src/Css.res`
- `packages/rescript-css/src/CssValue.res` as needed
- New checked-in property inventory under `docs/` or package tests
- Serializer/output tests
- `examples/react` and `examples/xote` coverage components
- `docs/values-and-properties.md`

## Tests

- Every new field has an assertion for exact kebab-case output.
- Every new variant constructor has exhaustive serialization tests.
- Logical properties are tested independently from physical equivalents.
- Limited Availability properties are demonstrated only with a fallback or `Css.supports`.
- A duplicate emitted-property-name check prevents record-to-serializer copy mistakes.

## Acceptance Criteria

- All inventory entries are implemented, tested, and documented or explicitly deferred with a
  reason.
- No new field falls back to `string` when an existing value family models it correctly.
- Existing output order and source compatibility are preserved except for the documented structured
  value migration.

## Non-Goals

- Vendor-prefixed properties.
- Obsolete layout models or browser-specific hacks.
- Claiming percentage coverage against an unstable count of every historical CSS property.
