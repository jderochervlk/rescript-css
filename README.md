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

Run `pnpm dev:basic` or `pnpm dev:react` to compile and serve a focused example.

## Workspace

- `packages/rescript-css`: the ReScript API, CSS collection runtime, and `@jvlk/rescript-css/vite` plugin entry point.
- `examples/basic`: a framework-free Vite example.
- `examples/react`: a ReScript React Vite example.

Use `pnpm build:basic` or `pnpm build:react` for isolated production builds.
