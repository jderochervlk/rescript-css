# Structured Values Plan

## Goal

Increase value-level autocomplete and make invalid unit/category combinations harder to express,
while preserving deliberate `Raw` and variable escape hatches.

## Value Families

Implement focused modules for:

- `Color`: named keywords, transparent/current color, hex, RGB, HSL, OKLCH, variables, and raw.
- `Time`: milliseconds, seconds, zero, variables, and raw.
- `Angle`: degrees, radians, gradians, turns, zero, variables, and raw.
- `Easing`: keywords, cubic Bezier, steps, linear function, variables, and raw.
- `TrackBreadth` and `TrackList`: fractions, lengths, min/max content, `minmax`, `fit-content`,
  repeat, subgrid, names, and raw.
- `Transform`: typed translate, scale, rotate, skew, perspective, matrix, composition, and raw.

## Proposed API Direction

```rescript
let panel = Css.style({
  color: Oklch({lightness: 0.42, chroma: 0.09, hue: 210.0}),
  transitionDuration: Ms(180),
  transitionTimingFunction: CubicBezier(0.2, 0.8, 0.2, 1.0),
  gridTemplateColumns: Tracks([
    Repeat(AutoFit, [Minmax(Rem(16.0), Fr(1.0))]),
  ]),
})
```

Final constructor spelling should favor contextual variants and small records when positional
arguments become ambiguous.

## Compatibility Decision

Changing a string-valued field to a variant is source-breaking even if `Raw(string)` preserves all
CSS values. Deliver the migration as one explicit 0.x compatibility change rather than mixing field
changes across unrelated releases. Document a mechanical migration from `"value"` to `Raw("value")`.

Do not weaken types to accept both unrelated representations through unchecked identity casts.

## Architecture

1. Keep every serializer pure and exhaustive in `CssValue.res`, splitting into additional modules if
   the file stops being navigable.
2. Reuse shared primitives instead of duplicating unit formatting and CSS string escaping.
3. Model valid category composition: `Fr` belongs in track breadth, not general length; time cannot be
   passed to length properties; angle cannot be passed to opacity.
4. Validate bounded numeric values only where CSS itself requires a bound. Preserve valid out-of-range
   values when CSS defines clamping at computed-value time.
5. Keep `Var` and `Raw` in every family that accepts arbitrary substitution.

## Files

- `packages/rescript-css/src/CssValue.res` or new `CssValue*` modules
- `packages/rescript-css/src/Css.res`
- ReScript serializer tests plus plugin output fixtures
- All examples that use migrated string fields
- `docs/values-and-properties.md`

## Tests

- One serialization test per constructor and edge case, including negative and fractional values.
- Composition tests for nested track, transform, and easing values.
- Compile-time fixture examples for contextual constructor inference.
- Raw and variable escape-hatch tests.
- Regression tests for formatting stability and locale-independent decimals.

## Acceptance Criteria

- The selected fields no longer require string assembly for ordinary values.
- Invalid cross-category unit use fails during ReScript compilation.
- Every migrated property has documented before/after syntax.
- Generated CSS remains standards-shaped and whitespace-stable.

## Non-Goals

- Parsing arbitrary CSS strings back into typed values.
- Runtime validation in the browser.
- Modeling the entire CSS Values specification in one release.
