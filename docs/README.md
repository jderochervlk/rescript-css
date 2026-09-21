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

Repository setup, verification, generated-artifact rules, implementation follow-ups, and release
operations are documented in [CONTRIBUTING.md](../CONTRIBUTING.md).

## API At A Glance

```rescript
let className = Css.style({...})
let className = Css.class({...})
let animationName = Css.keyframes([Css.frame(~at="from", {...}), Css.frame(~at="to", {...})])
let family = Css.fontFace({family: "Inter", src: [Css.fontSource(~url="/inter.woff2")]})
let _ = Css.registerProperty({name: "--progress", syntax: "<number>", inherits: false, initialValue: "0"})
let _ = Css.scope(~root=".article", ~selector=":scope > h2", {...})
let _ = Css.page(~selector=":first", [("size", "A4")])

let _ = Css.layerOrder(["reset", "base", "components"])
let layeredClass = Css.class(~layer=Css.namedLayer("components"), {...})

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
