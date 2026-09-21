# Cascade Layers Plan

## Goal

Support explicit cascade ordering and place class or global rules inside named or anonymous
`@layer` blocks.

## Prerequisites

- [Global styles](global-styles.md) for ordered rules.
- Keyframes and font-face should land first so layer behavior is defined consistently for every
  emitted rule kind.

## Proposed API

```rescript
let _ = Css.layerOrder(["reset", "tokens", "base", "components", "utilities"])

let button = Css.style({
  layer: "components",
  display: InlineFlex,
  padding: Px(12),
})

let _ = Css.global(~selector="body", ~layer="base", {
  margin: Zero,
})
```

Registration APIs such as `fontFace` and `keyframes` should accept an optional `~layer` argument
when CSS permits that rule to be nested inside a layer.

## Architecture

1. Add optional layer metadata to collected rules rather than pre-wrapping CSS strings throughout
   the runtime.
2. Serialize layer-order statements before any rules that reference those layers.
3. Group only adjacent rules with the same layer; do not reorder rules merely to reduce wrappers.
4. Validate layer names as dot-separated CSS identifiers. Provide `Raw` only if identifier
   validation would reject emerging valid syntax.
5. Define anonymous-layer behavior explicitly; anonymous layers cannot be referenced by order or
   reused across calls.

## Files

- `packages/rescript-css/src/Css.res`
- `packages/rescript-css/src/Runtime.res` and `Runtime.resi`
- `packages/rescript-css/vite/vite-plugin.ts`
- Plugin tests and cascade fixtures
- `examples/basic` or `examples/react`
- `docs/nesting.md`

## Tests

- Emits one layer-order statement followed by layered and unlayered rules.
- Preserves ordering when the same layer appears in non-adjacent source locations.
- Supports dotted nested names such as `framework.components`.
- Covers global rules, class rules, font faces, and keyframes.
- Reports invalid names and conflicting layer-order declarations.
- Confirms nested `@media`/`@supports` output remains valid inside a layer.

## Acceptance Criteria

- Layer order is deterministic and independent of Vite traversal order within one module.
- Existing styles remain unlayered unless users opt in.
- The generated CSS uses native layers with no specificity rewriting.

## Non-Goals

- Inferring a project-wide layer order.
- Automatically assigning variables or styles to layers.
- Merging layer declarations across separately built packages.
