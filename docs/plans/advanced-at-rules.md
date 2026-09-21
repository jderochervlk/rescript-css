# Advanced At-Rules Plan

## Goal

Cover `@property`, `@scope`, and `@page` with APIs that preserve static extraction and prevent
structurally invalid output.

## Prerequisites

- [Global styles](global-styles.md)
- [Cascade layers](cascade-layers.md)

## Proposed APIs

```rescript
let _ = Css.registerProperty({
  name: "--progress",
  syntax: "<number>",
  inherits: false,
  initialValue: "0",
})

let _ = Css.scope(
  ~root=".article",
  ~limit=".comments",
  ~selector=":scope > h2",
  {marginBlockStart: Zero},
)

let _ = Css.page(~selector=":first", [
  ("size", "A4"),
  ("margin", "2cm"),
])
```

`scope` reuses the ordinary style definition and supports nested selectors. `page` starts with an
explicit descriptor list because page descriptors and margin at-rules do not match normal style
properties.

## Architecture

1. Implement one serializer per at-rule instead of a generic arbitrary-at-rule string API.
2. Validate custom-property names, required `@property` descriptors, balanced scope boundaries, and
   page selectors at their public boundaries.
3. Store structured metadata in the collector and render CSS at the final serializer boundary.
4. Permit optional layer metadata only where the CSS grammar allows it.
5. Return tagged failures from plugin decoding or rewriting; invalid public ReScript inputs that can
   be modeled statically should be prevented by types.

## Delivery Slices

1. `@property`: smallest grammar and highest value for typed custom-property animation.
2. `@scope`: builds on global selector serialization.
3. `@page`: descriptors first, margin boxes in a follow-up slice if they keep the API coherent.

Each slice must be independently documented and releasable.

## Files

- `packages/rescript-css/src/Css.res` and possibly focused serializer modules
- `packages/rescript-css/src/Runtime.res` and `Runtime.resi`
- `packages/rescript-css/vite/vite-plugin.ts`
- Dedicated fixtures and plugin tests per at-rule
- `docs/values-and-properties.md` and `docs/nesting.md`

## Tests

- Covers valid output, missing required descriptors, malformed names/selectors, and escaping.
- Verifies nested rules and conditions inside `@scope`.
- Verifies page selector omission, named pages, pseudo-pages, and descriptor ordering.
- Confirms at-rules coexist with layers, global rules, variables, and class rules.
- Ensures malformed collected data cannot escape into generated CSS.

## Acceptance Criteria

- All three at-rules produce standards-shaped static CSS.
- The API does not accept an unrestricted raw block that can break the surrounding stylesheet.
- Existing `supports`, `media`, and `container` APIs remain unchanged.

## Non-Goals

- `@import`, which should remain the bundler's responsibility.
- Vendor-prefixed at-rules.
- Full typed coverage of every paged-media margin box in the first slice.
