# Global Styles Plan

## Goal

Add statically extracted rules for document-level selectors such as `html`, `body`, `*`, and
`:root`, without requiring users to attach a generated class.

This plan owns the shared collected-rule foundation required by the other at-rule plans.

## Proposed API

```rescript
let _ = Css.global(~selector="*, *::before, *::after", {
  boxSizing: BorderBox,
})

let _ = Css.global(~selector="body", {
  margin: Zero,
  color: Vars.text,
  background: Vars.canvas,
  fontFamily: "Inter, system-ui, sans-serif",
})
```

The final argument receives the same `Css.css` context as `Css.style`, so unqualified constructors
continue to work. Arbitrary selectors remain strings because selector grammar is intentionally open.

## Architecture

1. Extract the pure `css -> Runtime.definition` conversion from `Css.style` so class, global, and
   future rule APIs share declaration serialization.
2. Add an ordered collected-rule representation to `Runtime.collector`. Keep class styles available
   for source inlining, but assign every emitted rule a stable order.
3. Implement `Runtime.global` by serializing a definition against the supplied selector. Reuse the
   existing nested-selector and conditional-rule behavior.
4. Extend the plugin's collector decoder and `stylesheetFor` to validate and emit collected rules.
5. Update the plugin's API detection and statement removal so a top-level `Css.global` call leaves
   no runtime import behind when the module contains no other CSS API calls.

`:root` variable registrations must continue to emit before ordinary rules. Other global and class
rules should preserve declaration order within a module.

## Files

- `packages/rescript-css/src/Css.res`
- `packages/rescript-css/src/Runtime.res`
- `packages/rescript-css/src/Runtime.resi`
- `packages/rescript-css/vite/vite-plugin.ts`
- `packages/rescript-css/vite/__tests__/vite-plugin.test.ts`
- New global-style fixture and one example registry module
- `docs/getting-started.md` and `docs/nesting.md`

## Tests

- Emits one global selector without a generated class.
- Supports selector lists, pseudo-elements, variables, nested selectors, and conditional rules.
- Preserves global/class rule ordering and keeps registered `:root` variables first.
- Removes collection calls and unused imports from transformed JavaScript.
- Rejects a corrupted collected-rule shape with an actionable typed failure.
- Produces the same CSS in development, production, and the packed consumer smoke test.

## Acceptance Criteria

- Global rules are ordinary generated CSS imported once by Vite.
- No browser runtime injection is introduced.
- Existing `Css.style`, nesting, and variable output remains byte-for-byte compatible.
- The implementation provides the ordered-rule primitive used by subsequent plans.

## Non-Goals

- Cross-module deduplication of identical global selectors.
- Selector parsing or specificity validation.
- Cascade layers; those are covered by the layer plan.
