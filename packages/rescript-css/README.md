# @jvlk/rescript-css

Typed, statically extracted CSS for ReScript. Write styles with ReScript values and let the Vite
plugin emit ordinary CSS with scoped class names and custom properties.

## Install

```sh
pnpm add @jvlk/rescript-css
```

Add the package to `rescript.json`:

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

Then configure the Vite plugin:

```js
import { defineConfig } from 'vite';
import { rescriptCss } from '@jvlk/rescript-css/vite';

export default defineConfig({
  plugins: [rescriptCss()],
});
```

## Use

```rescript
module Styles = {
  let button = Css.style({
    display: InlineFlex,
    padding: Px(16),
    color: "white",
    background: "#0f766e",
  })
}
```

For variables, nested styles, conditional rules, and the full value API, see the
[documentation](https://github.com/jderochervlk/rescript-css/tree/main/docs).
