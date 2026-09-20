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
      color: Vars.brand,
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
    transform: "translateY(-1px)",
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
  gridTemplateColumns: "1fr",
  media: [
    Css.media(
      ~query="(width >= 48rem)",
      Css.style({gridTemplateColumns: "repeat(2, minmax(0, 1fr))"}),
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
      Css.style({gridTemplateColumns: "10rem 1fr"}),
    ),
  ],
})
```

Conditions are passed as CSS strings so new query syntax remains available without a library
release.
