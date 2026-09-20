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
    color: "white",
    background: "#0f766e",
    borderRadius: Px(6),
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

Keep style declarations at module scope and assign each top-level `Css.style` or `Css.class` call
directly to a `let` binding. This gives the plugin a stable build-time declaration to collect and
inline.

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
