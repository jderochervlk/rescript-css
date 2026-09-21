# Getting Started

## Install

Add the package to the application:

```sh
pnpm add @jvlk/rescript-css
```

Add it to `rescript.json`:

```json
{
  "dependencies": ["@jvlk/rescript-css"],
  "package-specs": {
    "module": "esmodule",
    "in-source": true
  },
  "suffix": ".res.js"
}
```

The package expects ESM output. The Vite plugin reads the configured ReScript suffix, so custom ESM
suffixes such as `.res.mjs` are also supported.

## Configure Vite

Add `rescriptCss()` to the application's Vite plugins:

```typescript
import { defineConfig } from 'vite';
import { rescriptCss } from '@jvlk/rescript-css/vite';

export default defineConfig({
  plugins: [rescriptCss()],
});
```

## Create A Style

Declare styles at module scope in a ReScript file:

```rescript
module Styles = {
  let button = Css.style({
    display: InlineFlex,
    alignItems: Center,
    gap: Rem(0.5),
    padding: Px(12),
    color: Named("white"),
    background: "#0f766e",
    borderRadius: Raw("6px"),
    cursor: Pointer,
  })
}
```

`Css.style` supplies the expected record type, so constructors such as `InlineFlex`, `Center`, and
`Rem` do not need a `Css.` prefix.

Use the returned class name like any other string:

```rescript
@react.component
let make = () =>
  <button className=Styles.button> {React.string("Save")} </button>
```

Framework-free code works the same way:

```rescript
let html = `<button class="${Styles.button}">Save</button>`
```

## Add Global Styles

Use `Css.global` for document-level rules that do not need a generated class:

```rescript
let _ = Css.global(~selector="*, *::before, *::after", {
  boxSizing: BorderBox,
})

let _ = Css.global(~selector="body", {
  margin: Zero,
  color: Var(Vars.text),
  background: Vars.canvas,
  fontFamily: "Inter, system-ui, sans-serif",
})
```

Global rules use the same typed style record as `Css.style`. Keep them at module scope; the plugin
collects them into an ordinary generated stylesheet and removes the build-time calls and unused
runtime import from the compiled module.

## Generated Output

The plugin emits a neighboring stylesheet and replaces the static style call with its generated
class name:

```css
.rc_abc123_0 {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 12px;
  color: white;
  background: #0f766e;
  border-radius: 6px;
  cursor: pointer;
}
```

Keep style and animation declarations at module scope and assign each top-level `Css.style`,
`Css.class`, `Css.keyframes`, or `Css.fontFace` call directly to a `let` binding. Keep `Css.global`,
`Css.layerOrder`, `Css.registerProperty`, `Css.scope`, and `Css.page` calls at module scope as well.
This gives the plugin stable build-time declarations to collect, inline, or remove.

## Build And Develop

Compile ReScript before starting Vite, or use scripts that run both tools:

```json
{
  "scripts": {
    "build": "rescript build && vite build",
    "dev": "rescript build && vite"
  }
}
```

Continue with [values and properties](values-and-properties.md) or
[CSS variables](variables.md).
