# Documentation

`@jvlk/rescript-css` provides a typed ReScript API that generates static CSS through Vite. Styles
remain colocated with ReScript modules while the browser receives ordinary CSS files and class
names.

## Guides

- [Getting started](getting-started.md): installation, configuration, and your first generated class.
- [Values and properties](values-and-properties.md): contextual variants, units, property naming,
  and escape hatches.
- [CSS variables](variables.md): declaring, registering, consuming, and overriding shared tokens.
- [Nesting and conditional rules](nesting.md): descendants, states, arbitrary selectors, media
  queries, feature queries, and container queries.

## API At A Glance

```rescript
let className = Css.style({...})
let className = Css.class({...})

let token = Css.var("initial value")
let _ = Css.registerVars([token])

Css.media(~query="(width >= 48rem)", Css.style({...}))
Css.supports(~condition="(display: grid)", Css.style({...}))
Css.container(~query="(width >= 30rem)", Css.style({...}))
```

Use `Css.style` for a single class rule. Use `Css.class` when the rule owns nested element, state,
selector, or conditional styles.

## Generated Files

For a stylesheet module such as `Button.res`, the plugin writes `Button.css` beside the compiled
module and adds the stylesheet to Vite's module graph. Generated class names and custom-property
names are scoped hashes. ReScript exports keep their source-level names.

Generated `*.css` and transformed `*.res.js` files are build artifacts. Edit the corresponding
`.res` source instead.
