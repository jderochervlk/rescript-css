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

The repository builds consumer examples with ReScript 11.1.4, 12.3.1, and the current ReScript 13
preview. ReScript 13 is currently published as an alpha, not a beta.

## Install

```sh
pnpm add @jvlk/rescript-css
```

```sh
npm install @jvlk/rescript-css
```

## Configure ReScript

Add the package to `rescript.json` and emit ESM modules:

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

Custom ESM suffixes such as `.res.mjs` are supported. The Vite plugin discovers the configured
suffix from the nearest `rescript.json`.

## Configure Vite

Add `rescriptCss()` to the application's plugins:

```ts
import { defineConfig } from 'vite';
import { rescriptCss } from '@jvlk/rescript-css/vite';

export default defineConfig({
  plugins: [rescriptCss()],
});
```

Compile ReScript before Vite runs:

```json
{
  "scripts": {
    "dev": "rescript build && vite",
    "build": "rescript build && vite build"
  }
}
```

## Generated CSS

During the Vite build, the plugin replaces the style registration with a stable class name and
emits a neighboring stylesheet:

```css
.rc_abc123_0 {
  display: inline-flex;
  padding: 12px;
  align-items: center;
  gap: 0.5rem;
  color: white;
  background: #0f766e;
  border-radius: 6px;
  cursor: pointer;
}
```

## Global Styles And Variables

Use `Css.global` for document-level selectors and `Css.var` for shared custom properties:

```rescript
// Vars.res
let canvas = Css.var("#f8fafc")
let text = Css.var("#172321")

let _ = Css.registerVars([canvas, text])
```

```rescript
// GlobalStyles.res
let _ = Css.global(~selector="*, *::before, *::after", {
  boxSizing: BorderBox,
})

let _ = Css.global(~selector="body", {
  margin: Zero,
  color: Var(Vars.text),
  background: Vars.canvas,
})
```

Import the compiled registry modules from the application's JavaScript entry point when they are
not already reached through another ReScript module:

```js
import './Vars.res.js';
import './GlobalStyles.res.js';
```

## Nested And Conditional Styles

`Css.class` folds nested rules into its generated class. Element, state, arbitrary selector, media,
feature, and container-query helpers are available:

```rescript
let card = Css.class({
  display: Grid,
  gap: Rem(1.0),
  h2: Css.style({color: Named("teal")}),
  hover: Css.style({transform: TranslateY(Px(-1))}),
  selectors: [
    ("&[data-compact]", Css.style({padding: Rem(0.75)})),
  ],
  media: [
    Css.media(
      ~query="(width >= 48rem)",
      Css.style({gridTemplateColumns: Raw("repeat(2, minmax(0, 1fr))")}),
    ),
  ],
})
```

## Static CSS Features

The package also extracts these module-level registrations:

- Hashed `Css.keyframes` animations
- Typed `Css.fontFace` declarations
- Named and anonymous cascade layers
- Structured `@property`, `@scope`, and `@page` rules
- Typed modern properties, SVG presentation values, transforms, easing, and grid tracks

Keep `Css.style`, `Css.class`, `Css.keyframes`, and `Css.fontFace` directly assigned to top-level
bindings. Keep unit-returning registrations such as `Css.global` and `Css.layerOrder` at module
scope. This gives the plugin stable declarations to collect and remove from the browser bundle.

## Documentation

- [Getting started](docs/getting-started.md)
- [Values, modern properties, and migration guidance](docs/values-and-properties.md)
- [CSS variables](docs/variables.md)
- [Nesting, queries, scopes, and layers](docs/nesting.md)
- [Changelog](CHANGELOG.md)

For repository setup, testing, generated artifacts, release operations, and future engineering work,
see [CONTRIBUTING.md](CONTRIBUTING.md).
