# Values And Properties

## Property Names

CSS properties use camelCase record fields. Generated output uses standard kebab-case names:

```rescript
let text = Css.style({
  minInlineSize: Zero,
  marginBlockEnd: Rem(1.0),
  backgroundColor: "#ffffff",
  fontSize: Rem(1.125),
  lineHeight: Number(1.5),
})
```

```css
min-inline-size: 0;
margin-block-end: 1rem;
background-color: #ffffff;
font-size: 1.125rem;
line-height: 1.5;
```

The style record covers common properties across layout, logical sizing and spacing, flexbox, grid,
typography, backgrounds, borders, effects, animation, replaced content, tables, lists, scrolling,
columns, containment, and interaction.

## Lengths

Length-valued properties use contextual variants:

```rescript
let layout = Css.style({
  width: Percent(100.0),
  minHeight: Dvh(100.0),
  maxWidth: Ch(72.0),
  padding: Rem(1.5),
  borderRadius: Px(8),
  marginInline: Auto,
})
```

Available units include:

| Constructors                             | CSS units                                |
| ---------------------------------------- | ---------------------------------------- |
| `Rem`, `Em`, `Px`, `Percent`             | `rem`, `em`, `px`, `%`                   |
| `Ch`, `Ex`                               | `ch`, `ex`                               |
| `Vw`, `Vh`, `Vmin`, `Vmax`               | viewport units                           |
| `Dvw`, `Dvh`, `Svw`, `Svh`, `Lvw`, `Lvh` | dynamic, small, and large viewport units |
| `Cm`, `Mm`, `In`, `Pt`, `Pc`             | physical and print units                 |

Length keywords include `Auto`, `Zero`, `MinContent`, `MaxContent`, and `FitContent`.

Use `Raw` for a length expression that does not yet have a dedicated constructor:

```rescript
width: Raw("calc(100% - 2rem)")
```

Use `Var` when a CSS-variable reference is consumed by a length-valued property:

```rescript
padding: Var(Vars.spaceMd)
```

## Keyword Variants

Finite keyword properties provide contextual variants and autocomplete:

```rescript
let panel = Css.style({
  display: Grid,
  position: Relative,
  overflow: Hidden,
  boxSizing: BorderBox,
  alignItems: Center,
  justifyContent: SpaceBetween,
  borderStyle: Solid,
  fontStyle: Italic,
  fontWeight: Weight(600),
  textAlign: Start,
  whiteSpace: PreWrap,
  objectFit: Cover,
  pointerEvents: Auto,
  userSelect: None,
  cursor: Pointer,
})
```

Each property determines which meaning a repeated constructor has. For example, `Auto` is resolved
against the expected type of `overflow`, `pointerEvents`, or a length-valued field.

Most keyword families also expose `Raw("value")` for forward compatibility.

## Compound Values

Properties with highly compositional CSS grammars currently accept strings:

```rescript
let complex = Css.style({
  gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))",
  backgroundImage: "linear-gradient(to bottom, white, #f8fafc)",
  boxShadow: "0 0.5rem 1.5rem rgb(15 23 42 / 12%)",
  transform: "translateY(-1px) scale(1.02)",
  transition: "transform 150ms ease, box-shadow 150ms ease",
})
```

Numeric properties accept ReScript numbers directly where the CSS grammar is unambiguous:

```rescript
let item = Css.style({
  zIndex: 10,
  opacity: 0.8,
  flexGrow: 1.0,
  order: 2,
})
```

## Custom Declarations

Use `custom` for uncommon, experimental, or newly released properties:

```rescript
let field = Css.style({
  display: Block,
  custom: [
    ("field-sizing", "content"),
    ("interpolate-size", "allow-keywords"),
  ],
})
```

Custom declarations are emitted after typed fields. This allows an intentional custom override but
also means duplicate properties use the value in `custom`.
