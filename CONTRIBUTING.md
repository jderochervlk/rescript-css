# Contributing

## Prerequisites

- Node.js `>=24.12.0`
- pnpm `11.15.1`
- Corepack enabled, or a compatible pnpm installation

Install the workspace from a clean checkout:

```sh
pnpm install --frozen-lockfile
```

## Repository Layout

- `packages/rescript-css`: public ReScript API, collection runtime, and Vite plugin
- `examples/basic`: framework-free consumer
- `examples/react`: ReScript React consumer
- `examples/xote`: Xote consumer using the `.res.mjs` suffix
- `docs`: consumer guides, implementation plans, release instructions, and property inventory
- `scripts/verify-package.mjs`: clean packed-package consumer verification

## Development

Run a focused example during development:

```sh
pnpm dev:basic
pnpm dev:react
pnpm dev:xote
```

Build the package and every example:

```sh
pnpm build:all
```

The main verification commands are:

```sh
pnpm format:check
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm package:check
```

Coverage must remain above 90% for statements, branches, functions, and lines. New public behavior
should have success, failure, boundary, and corrupted-collector coverage where relevant.

## Generated Artifacts

Example `*.res.js`, `*.res.mjs`, and `*.css` files are tracked because they demonstrate the final
static-extraction output. Edit the corresponding `.res` source, then run `pnpm build:all`.

The pre-commit hook runs a plain ReScript build, which can temporarily replace Vite-transformed
example modules with raw compiler output when ReScript sources changed. After the hook, rerun
`pnpm build:all`, verify `git diff`, and restage the generated artifacts before committing.

Do not edit files under `lib`, `dist`, or `coverage`. Those directories are generated and ignored.

## Architecture Boundaries

- Collection happens while Vite evaluates compiled ReScript modules; browser runtime injection is
  out of scope.
- Keep collector values immutable and perform filesystem writes only in the Vite plugin boundary.
- Validate collected metadata again in TypeScript before serializing CSS.
- Preserve source rule order. Root variables and explicit layer-order statements have dedicated
  stylesheet positions.
- Keep `Raw`, `Var`, and `custom` as explicit forward-compatible escape hatches.

## Known Follow-up Work

These are useful future improvements, not `0.2.0` release blockers:

- Replace masked textual JavaScript analysis with an AST-backed implementation if supported call
  shapes expand. The current scanner masks complete template literals, including `${...}`.
- Reject empty grid-track arrays and validate grid line-name tokens.
- Revisit open grammars as specifications stabilize, especially motion paths, anchor fallback
  lists, view-transition identifiers, font palettes, and containment shorthands.
- Consider optional `@scope` roots and the `@property` universal-syntax case where `initial-value`
  may be omitted.
- Add typed paged-media margin boxes if they can remain coherent with ordered descriptors.
- Consider escape-aware CSS identifier parsing beyond the current conservative ASCII grammar.
- Consider graph-based merging if multiple registries need to contribute compatible partial layer
  orders. A module currently accepts one canonical order.

Review `docs/modern-properties.csv` against current standards before each minor release. Limited
and partial properties should retain fallbacks and `Css.supports` examples.

## Pull Requests

Keep changes focused and follow the existing ReScript, TypeScript, and fixture patterns. Before
opening a pull request, run:

```sh
pnpm format:check
pnpm typecheck
pnpm test:coverage
pnpm build:all
pnpm package:check
git diff --check
```

Include documentation and a consumer example whenever a public API changes.

## Releases

See [docs/releasing.md](docs/releasing.md) for the GitHub Release and npm trusted-publishing flow.
Release tags must match the package version with a `v` prefix.
