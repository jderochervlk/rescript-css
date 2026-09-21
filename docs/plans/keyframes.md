# Keyframes Plan

## Goal

Generate hashed `@keyframes` rules and return the generated animation name for use in ordinary style
records.

## Prerequisite

[Global styles](global-styles.md) must land first because keyframes use its ordered collected-rule
representation and shared definition serializer.

## Proposed API

```rescript
let fadeIn = Css.keyframes([
  Css.frame(~at="from", {opacity: 0.0}),
  Css.frame(~at="to", {opacity: 1.0}),
])

let enter = Css.style({
  animationName: fadeIn,
  animationDuration: "180ms",
  animationTimingFunction: "ease-out",
})
```

`at` accepts `from`, `to`, percentages, or comma-separated selectors. A future structured selector
type may be additive, but strings keep the initial API complete.

## Architecture

1. Add a pure `frame` value containing its selector and serialized declarations. Frames must not
   register temporary classes.
2. Add collected keyframes with a temporary runtime name and ordered CSS text.
3. Extend source analysis to pair each top-level keyframes call with its direct `let` binding, then
   replace the call with a stable hashed animation name derived from module scope and binding name.
4. Rewrite the temporary name in both the returned JavaScript value and emitted `@keyframes` rule.
5. Validate frame selectors at the boundary: reject empty selectors and values that would escape the
   keyframes block. Return a typed plugin failure rather than silently emitting malformed CSS.

Keyframe steps should accept declarations and `vars`, but reject nested selectors and conditional
rules because they are invalid inside a keyframe block.

## Files

- `packages/rescript-css/src/Css.res`
- `packages/rescript-css/src/Runtime.res` and `Runtime.resi`
- `packages/rescript-css/vite/vite-plugin.ts`
- Plugin fixtures and tests
- `examples/basic` animation example
- `docs/values-and-properties.md`

## Tests

- Emits `from`, `to`, percentage, and multi-position frames in source order.
- Hashes names deterministically and does not expose temporary runtime names.
- Supports multiple animations in one module without collisions.
- Preserves references when keyframes are exported or imported by another style module.
- Reports invalid or unpaired keyframe declarations clearly.
- Verifies HMR and production builds do not duplicate keyframe rules.

## Acceptance Criteria

- Users never manually coordinate animation names.
- Generated names are stable for an unchanged binding and module.
- Keyframes remain fully static and tree-shakable with their owning module.
- Existing string-valued animation properties remain source compatible.

## Non-Goals

- A typed animation shorthand.
- Automatic reduced-motion behavior.
- Deduplicating equivalent keyframe bodies across modules.
