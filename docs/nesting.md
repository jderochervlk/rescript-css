# Nesting And Conditional Rules

## Descendant Elements

Use `Css.class` when a class owns nested rules. The nested `Css.style` calls are folded into the
parent class:

```rescript
module Styles = {
  let article = Css.class({
    display: Grid,
    gap: Rem(1.0),
    h1: Css.style({
      marginBlock: Zero,
      color: Var(Vars.brand),
      fontSize: Rem(2.0),
    }),
    p: Css.style({
      lineHeight: Number(1.6),
    }),
  })
}
```

Apply only the owning class:

```rescript
<article className=Styles.article>
  <h1> {React.string("Title")} </h1>
  <p> {React.string("Body copy")} </p>
</article>
```

The generated stylesheet uses descendant selectors:

```css
.rc_abc123_0 h1 {
  margin-block: 0;
  color: var(--rc_brand_hash);
  font-size: 2rem;
}
```

Common semantic elements are available as fields, including headings, paragraphs, links, controls,
lists, tables, media, and page-section elements.

Define nested `Css.style` calls inline inside their owning `Css.class` declaration. This keeps the
collector relationship explicit and allows the Vite plugin to remove the intermediate class values.

## States And Pseudo-Elements

State and pseudo-element fields rebase against the owning class:

```rescript
let button = Css.class({
  cursor: Pointer,
  hover: Css.style({
    transform: TranslateY(Px(-1)),
  }),
  focusVisible: Css.style({
    outline: "2px solid currentColor",
    outlineOffset: Px(2),
  }),
  disabled: Css.style({
    cursor: NotAllowed,
    opacity: 0.5,
  }),
  before: Css.style({
    content: "\"\"",
  }),
})
```

These fields emit selectors such as `.class:hover`, `.class:focus-visible`, `.class:disabled`, and
`.class::before`. Other built-in fields include `focus`, `focusWithin`, `active`, `checked`,
`visited`, `firstChild`, `lastChild`, `after`, `placeholder`, and `selection`.

## Arbitrary Selectors

Use `selectors` when a dedicated field does not exist:

```rescript
let navigation = Css.class({
  selectors: [
    ("> *", Css.style({minInlineSize: Zero})),
    ("&[aria-expanded=true]", Css.style({background: Vars.surface})),
    ("& > a[aria-current=page]", Css.style({fontWeight: Bold})),
  ],
})
```

Selectors beginning with `&` replace the parent reference directly. Other selectors become
descendants. The `children` field is shorthand for `> *`.

## Media Queries

Use `Css.media` inside the `media` field:

```rescript
let layout = Css.class({
  display: Grid,
  gridTemplateColumns: Raw("1fr"),
  media: [
    Css.media(
      ~query="(width >= 48rem)",
      Css.style({
        gridTemplateColumns: Raw("repeat(2, minmax(0, 1fr))"),
      }),
    ),
  ],
})
```

The nested style is rebased to the parent class inside the at-rule:

```css
@media (width >= 48rem) {
  .rc_abc123_0 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
```

## Feature And Container Queries

Feature queries use `Css.supports`:

```rescript
supports: [
  Css.supports(
    ~condition="(backdrop-filter: blur(1rem))",
    Css.style({backdropFilter: "blur(1rem)"}),
  ),
]
```

Container queries use `Css.container` and `containerQueries`:

```rescript
let card = Css.class({
  containerType: "inline-size",
  containerQueries: [
    Css.container(
      ~query="(width >= 30rem)",
      Css.style({
        gridTemplateColumns: Tracks([
          Breadth(Length(Rem(10.0))),
          Breadth(Raw("1fr")),
        ]),
      }),
    ),
  ],
})
```

Conditions are passed as CSS strings so new query syntax remains available without a library
release.

## Global Selectors

`Css.global` supports the same nested selectors and conditional fields as `Css.class`, but rebases
them against the supplied selector instead of a generated class:

```rescript
let _ = Css.global(~selector="body", {
  a: Css.style({color: Var(Vars.brand)}),
  selectors: [
    ("&::selection", Css.style({background: Vars.brand, color: Var(Vars.onBrand)})),
  ],
  media: [
    Css.media(
      ~query="(width >= 48rem)",
      Css.style({fontSize: Rem(1.125)}),
    ),
  ],
})
```

This emits `body a`, `body::selection`, and a `body` rule inside the media query. Selector lists and
open selector syntax remain strings, so selectors such as `html, body` and `*, *::before, *::after`
do not require library support.

## Scoped Styles

`Css.scope` wraps an ordinary style definition in `@scope`. The root and optional limit form the
scope boundary, while `~selector` identifies the rule inside it:

```rescript
let _ = Css.scope(
  ~root=".article",
  ~limit=".comments",
  ~selector=":scope > h2",
  {
    marginBlockStart: Zero,
    a: Css.style({color: Var(Vars.brand)}),
    media: [
      Css.media(~query="(width >= 48rem)", Css.style({fontSize: Rem(1.25)})),
    ],
  },
)
```

The body supports the same declarations, variables, nested selectors, and conditional rules as
`Css.global`. Scope selectors are checked for unsafe rule boundaries and balanced brackets,
parentheses, and quotes before CSS is collected. Scoped rules may also opt into a cascade layer.

## Cascade Layers

Declare a deterministic cascade order with `Css.layerOrder`, then opt individual registrations into
named layers:

```rescript
let _ = Css.layerOrder(["reset", "tokens", "base", "framework.components"])

let _ = Css.global(
  ~selector="body",
  ~layer=Css.namedLayer("base"),
  {margin: Zero},
)

let button = Css.class(
  ~layer=Css.namedLayer("framework.components"),
  {
    display: InlineFlex,
    media: [
      Css.media(
        ~query="(width >= 48rem)",
        Css.style({padding: Px(12)}),
      ),
    ],
  },
)
```

`Css.style`, `Css.class`, `Css.global`, `Css.keyframes`, and `Css.fontFace` all accept the same
optional `~layer` argument. Layer names are validated as dot-separated ASCII CSS identifiers. Calls
without `~layer` remain unlayered.

Use `~layer=Css.anonymousLayer` for a one-off anonymous layer. Each registration creates a distinct
anonymous layer, even when two calls are adjacent, because anonymous layers cannot be referenced or
reopened. Named registrations are grouped only when they are adjacent; the plugin never reorders
rules to merge layer blocks.

The layer order statement is emitted before registered variables and rules. Repeating the same
order is harmless, while conflicting orders in one stylesheet module fail extraction. The layer is
registration metadata supplied as an optional argument rather than a field in the style record;
this keeps it out of nested style definitions and applies the same API to every emitted rule kind.
