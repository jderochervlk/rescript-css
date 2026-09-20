# @jvlk/rescript-css

An experimental typed CSS workspace for ReScript.

The Vite plugin finds static `Css.style` calls in compiled ReScript modules,
writes neighboring `*.css` assets, and imports those assets into Vite.

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
    display: Css.InlineFlex,
    color: "white",
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
  color: Vars.onBrand,
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
  color: Vars.onBrand,
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
      color: Vars.brand,
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

Run `pnpm dev:basic` or `pnpm dev:react` to compile and serve a focused example.

## Workspace

- `packages/rescript-css`: the ReScript API, CSS collection runtime, and `@jvlk/rescript-css/vite` plugin entry point.
- `examples/basic`: a framework-free Vite example.
- `examples/react`: a ReScript React Vite example.

Use `pnpm build:basic` or `pnpm build:react` for isolated production builds.
