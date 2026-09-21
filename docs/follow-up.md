# Follow-up Work

The CSS surface expansion is complete for `0.2.0`. The items below are useful next steps rather
than release blockers.

## Extraction

- Replace the masked textual JavaScript scan with an AST-backed analysis when the compiler output
  contract or supported call shapes expand. The current scanner ignores strings and comments but
  conservatively masks complete template literals, including `${...}` expressions.
- Keep top-level `Css.keyframes` and `Css.fontFace` calls directly assigned to bindings. Supporting
  wrapped or computed registrations requires a more capable source analysis contract.
- Add cross-module collection tests whenever the ReScript compiler changes its emitted module
  shape or import syntax.

## Value Modeling

- Reject empty grid-track arrays and validate grid line-name tokens. `Raw` remains the intentional
  escape hatch until those constructors enforce the complete grammar.
- Revisit open string grammars as specifications stabilize, especially motion paths, anchor
  fallback lists, view-transition identifiers, font palettes, and containment shorthands.
- Review `docs/modern-properties.csv` against current standards before each minor release. Limited
  and partial properties should retain fallbacks and `Css.supports` examples.

## At-rules And Layers

- Consider optional `@scope` roots and the `@property` universal-syntax case where `initial-value`
  may be omitted.
- Add typed paged-media margin boxes only if they can remain coherent with ordered page
  descriptors. `@import` should remain the bundler's responsibility.
- Layer names, custom-property names, and page identifiers currently use a conservative ASCII
  grammar. Broaden this only with an escape-aware CSS identifier parser.
- A module accepts one canonical `Css.layerOrder` declaration; repeated identical declarations are
  harmless, while different declarations fail. A graph-based merge can be considered if multiple
  registries need to contribute compatible partial orders.

## Build And Release

- Tracked example `*.res.js` and `*.css` files are Vite-transformed artifacts. The pre-commit hook's
  plain ReScript build temporarily regenerates raw modules, so run `pnpm build:all` and restage
  artifacts before committing whenever example sources change.
- Before publishing, run `pnpm run format:check`, `pnpm run typecheck`, `pnpm run test:coverage`,
  `pnpm run build:all`, and `pnpm run package:check`.
- For `0.2.0`, merge the version commit, wait for CI, then create the `v0.2.0` GitHub Release and
  approve the npm environment deployment described in [Releasing](releasing.md).
