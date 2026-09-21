# @jvlk/rescript-css

Write CSS in ReScript next to the components that use it. The Vite plugin compiles typed style
values into ordinary CSS and scoped class names, with no browser runtime style injection.

## Usage

Keep a component and its styles in the same ReScript module:

```rescript
module Styles = {
  let button = Css.class({
    display: InlineFlex,
    alignItems: Center,
    gap: Rem(0.5),
    padding: Px(12),
    color: Named("white"),
    background: "#0f766e",
    borderRadius: Raw("6px"),
    cursor: Pointer,
    hover: Css.style({background: "#115e59"}),
  })
}

@react.component
let make = () =>
  <button className=Styles.button> {React.string("Save")} </button>
```

The generated value is an ordinary class-name string. Pass it to `className` in React, set it on a
DOM element with `@rescript/webapi`, or use it with any other ReScript UI framework.

## Requirements

- ReScript 11.1.4, 12.3.1, or 13.0.0-alpha.6
- Vite 7 or 8
- Node.js `>=24.12.0`

The repository includes buildable consumer examples for ReScript 11.1.4, 12.3.1, and the current
ReScript 13 preview. ReScript 13 is currently published as an alpha, not a beta.

## Install

```sh
pnpm add @jvlk/rescript-css
```

Add the package to `rescript.json` with ESM output:

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

Configure Vite:

```ts
import { defineConfig } from 'vite';
import { rescriptCss } from '@jvlk/rescript-css/vite';

export default defineConfig({
  plugins: [rescriptCss()],
});
```

Compile ReScript before starting or building with Vite:

```json
{
  "scripts": {
    "dev": "rescript build && vite",
    "build": "rescript build && vite build"
  }
}
```

The package also supports global styles, CSS variables, nested selectors, media and feature
queries, keyframes, font faces, cascade layers, structured at-rules, modern properties, SVG values,
and deliberate `Raw` escape hatches.

See the [complete documentation](https://github.com/jderochervlk/rescript-css/tree/main/docs) and
[migration guidance](https://github.com/jderochervlk/rescript-css/blob/main/docs/values-and-properties.md#0x-structured-value-migration).
