# @jvlk/rescript-css

An experimental typed CSS workspace for ReScript.

The Vite plugin finds static `Css.style` calls in compiled ReScript modules,
writes neighboring `*.css` assets, and imports those assets into Vite.

## Documentation

- [Documentation overview](docs/README.md)
- [Getting started](docs/getting-started.md)
- [Values and properties](docs/values-and-properties.md)
- [CSS variables](docs/variables.md)
- [Nesting and conditional rules](docs/nesting.md)
- [Releasing](docs/releasing.md)

## Quick start

Install workspace dependencies and build an example:

```sh
pnpm install
pnpm build:basic
```

Use the plugin in Vite:

```ts
import { defineConfig } from 'vite';
import { rescriptCss } from '@jvlk/rescript-css/vite';

export default defineConfig({
  plugins: [rescriptCss()],
});
```

Create styles directly in `Component.res`:

```rescript
module Styles = {
  let button = Css.style({
    display: InlineFlex,
    color: Named("white"),
  })
}
```

Use the class name in the same component:

```rescript
let buttonClassName = Styles.button
```

The plugin emits `Component.css` and adds it to Vite's module graph automatically.

## CSS variables

Define shared variables in a registry module and register their initial values on `:root`:

```rescript
// Vars.res
let brand = Css.var("#0f766e")
let onBrand = Css.var("#ffffff")
let spaceMd = Css.var("1rem")

let _ = Css.registerVars([brand, onBrand, spaceMd])
```

The ReScript and JavaScript exports retain their source names. Generated CSS uses scoped hashes:

```css
:root {
  --rc_16lsq83: #0f766e;
  --rc_1se5ehu: #ffffff;
  --rc_w2uaph: 1rem;
}
```

Variable references can be consumed directly from any stylesheet module:

```rescript
let button = Css.style({
  background: Vars.brand,
  color: Var(Vars.onBrand),
  padding: Var(Vars.spaceMd),
})
```

Override variables within any style scope through the `vars` field:

```rescript
let alternate = Css.style({
  vars: [
    (Vars.brand, "#2dd4bf"),
    (Vars.onBrand, "#042f2e"),
  ],
  background: Vars.brand,
  color: Var(Vars.onBrand),
  padding: Rem(1.0),
})
```

## Typed units

Length-valued properties use variants. The surrounding `Css.style` call gives ReScript enough
context to resolve their constructors without a `Css.` prefix:

```rescript
let box = Css.style({
  width: Rem(24.0),
  padding: Px(16),
  margin: Auto,
  fontSize: Em(1.125),
})
```

The API covers common layout, logical sizing and spacing, flexbox, grid, typography, borders,
backgrounds, effects, animation, scrolling, tables, lists, and interaction properties. Finite CSS
keywords and common compound values use contextual variants, while shorthands and open grammars
remain strings:

```rescript
let panel = Css.style({
  display: Grid,
  gridTemplateColumns: Raw("repeat(auto-fit, minmax(16rem, 1fr))"),
  alignItems: Center,
  gap: Rem(1.0),
  overflow: Hidden,
  borderStyle: Solid,
  borderRadius: Raw("8px"),
  fontWeight: Weight(600),
  lineHeight: Number(1.5),
  cursor: Pointer,
})
```

Use `Percent`, `Zero`, and `Raw` for percentages, unitless zero, and an explicit escape hatch.
CSS variable references use `Var` in length-valued properties:

```rescript
let card = Css.style({
  width: Percent(100.0),
  padding: Var(Vars.spaceMd),
})
```

The generated `Vars.res.js` imports `Vars.css`. Vite includes that stylesheet once even when
many modules consume the same variables.

## Nested styles

Use `Css.class` when a class owns styles for a nested element. Nested `Css.style` calls are
folded into the parent class rather than exposed as separate class names:

```rescript
module Styles = {
  let box = Css.class({
    background: Vars.surface,
    padding: Var(Vars.spaceMd),
    h1: Css.style({
      color: Var(Vars.brand),
    }),
  })
}
```

Apply only the parent class:

```rescript
<article className=Styles.box>
  <h1> {React.string("Nested heading")} </h1>
</article>
```

The nested rule shares the parent's hashed class in generated CSS:

```css
.rc_abc123_0 h1 {
  color: var(--rc_def456);
}
```

Common elements, states, and pseudo-elements can be nested the same way:

```rescript
let button = Css.class({
  cursor: Pointer,
  hover: Css.style({
    transform: TranslateY(Px(-1)),
  }),
  focusVisible: Css.style({
    outline: "2px solid currentColor",
  }),
  before: Css.style({
    content: "\"\"",
  }),
})
```

Arbitrary selectors and conditional rules cover selectors and at-rules that do not have dedicated
fields:

```rescript
let layout = Css.class({
  selectors: [
    ("> strong", Css.style({fontWeight: Bold})),
    ("&[data-compact]", Css.style({padding: Rem(1.0)})),
  ],
  media: [
    Css.media(
      ~query="(width >= 48rem)",
      Css.style({
        gridTemplateColumns: Raw("repeat(2, minmax(0, 1fr))"),
      }),
    ),
  ],
  supports: [
    Css.supports(~condition="(container-type: inline-size)", Css.style({containerType: "inline-size"})),
  ],
})
```

Use `custom` as the final fallback for new or uncommon declarations. Custom declarations are
emitted after typed fields, so they can intentionally override them:

```rescript
let experimental = Css.style({
  custom: [("field-sizing", "content")],
})
```

Run `pnpm dev:basic`, `pnpm dev:react`, or `pnpm dev:xote` to compile and serve a focused example.

## Workspace

- `packages/rescript-css`: the ReScript API, CSS collection runtime, and `@jvlk/rescript-css/vite` plugin entry point.
- `examples/basic`: a framework-free Vite example.
- `examples/react`: a ReScript React Vite example.
- `examples/xote`: a reactive [Xote](https://xote.dev/) Vite example.

Use `pnpm build:basic`, `pnpm build:react`, or `pnpm build:xote` for isolated production builds.
