# @jvlk/rescript-css

Typed, statically extracted CSS for ReScript. Author styles with ReScript values and let the Vite
plugin emit ordinary CSS files without browser runtime injection.

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

## Use

Declare styles at module scope:

```rescript
module Styles = {
  let button = Css.style({
    display: InlineFlex,
    alignItems: Center,
    padding: Px(12),
    color: Named("white"),
    background: "#0f766e",
    borderRadius: Raw("6px"),
  })
}
```

Use the returned class name as a string:

```rescript
@react.component
let make = () =>
  <button className=Styles.button> {React.string("Save")} </button>
```

The package also supports global styles, CSS variables, nested selectors, media and feature
queries, keyframes, font faces, cascade layers, structured at-rules, modern properties, SVG values,
and deliberate `Raw` escape hatches.

See the [complete documentation](https://github.com/jderochervlk/rescript-css/tree/main/docs) and
[migration guidance](https://github.com/jderochervlk/rescript-css/blob/main/docs/values-and-properties.md#0x-structured-value-migration).
