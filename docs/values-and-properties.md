# Values And Properties

## Property Names

CSS properties use camelCase record fields. Generated output uses standard kebab-case names:

```rescript
let text = Css.style({
  minInlineSize: Zero,
  marginBlockEnd: Rem(1.0),
  backgroundColor: Hex("#ffffff"),
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
  borderRadius: Raw("8px"),
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

## Structured Values

Common colors, times, angles, easings, grid tracks, and transforms use focused value families. The
style record supplies the expected type, so their constructors are normally written without a
module prefix.

### Colors

Color fields accept `Transparent`, `CurrentColor`, `Named`, `Hex`, `Rgb`, `Hsl`, `Oklch`, `Var`, and
`Raw`. Functional colors use records with channel-specific labels:

```rescript
let palette = Css.style({
  color: Named("rebeccapurple"),
  backgroundColor: Oklch({lightness: 0.96, chroma: 0.02, hue: 210.0}),
  borderColor: Rgb({red: 15.0, green: 118.0, blue: 110.0, alpha: 0.25}),
  outlineColor: Hsl({hue: 172.0, saturation: 66.0, lightness: 32.0}),
})
```

`Hex` accepts values with or without the leading `#`. The optional `alpha` field is a unitless CSS
alpha value.

### Times And Easings

Durations and delays have separate validated families. Duration constructors reject negative or
nonfinite values; delay constructors accept negative finite values. Bounded easing constructors
return typed validation failures:

```rescript
let duration = switch CssValue.Duration.ms(180.0) {
| Ok(value) => value
| Error(_) => CssValue.Duration.zero
}

let curve = switch CssValue.Easing.cubicBezier(~x1=0.2, ~y1=0.8, ~x2=0.2, ~y2=1.0) {
| Ok(value) => value
| Error(_) => Ease
}

let motion = Css.style({
  animationDuration: duration,
  animationDelay: CssValue.Time.zero,
  animationTimingFunction: curve,
})
```

Keyword easings are `Linear`, `Ease`, `EaseIn`, `EaseOut`, and `EaseInOut`. Step positions are
`JumpStart`, `JumpEnd`, `JumpNone`, `JumpBoth`, `Start`, and `End`. `steps` requires a positive
count, and `JumpNone` requires at least two steps. Cubic Bezier x coordinates must be within zero
and one. Linear stops validate finite outputs, positions from 0% through 100%, and a minimum of two
stops. `Var` and `Raw` remain available on both time families and on easing values.

### Angles And Transforms

Angles use `Deg`, `Rad`, `Grad`, `Turn`, `Zero`, `Var`, or `Raw`. They are contextual arguments to
rotation and skew constructors. Use `Transforms` to compose operations in source order:

```rescript
let transformed = Css.style({
  transform: Transforms([
    TranslateY(Px(-1)),
    Rotate(Deg(2.0)),
    ScaleUniform(1.02),
  ]),
})
```

The transform family also includes axis-specific and 3D translation, scale, and rotation variants,
plus `Skew`, `Perspective`, and `Matrix`. The third `XYZ` translate component uses a validated
`TranslateZLength`, so percentages are rejected, while independent scale factors explicitly use
`Number` or `Percent`.

### Grid Tracks

Grid lengths, fractions, and integer repeat counts use validating smart constructors. Minimum and
maximum `minmax()` arguments have distinct types, repeat children cannot contain another repeat,
and automatic repeats accept fixed track sizes only:

```rescript
let columns: CssValue.TrackList.t =
  switch (CssValue.TrackLength.make(Rem(16.0)), CssValue.TrackFraction.make(1.0)) {
  | (Ok(minimum), Ok(maximum)) =>
    Tracks([
      AutoRepeat(AutoFit, [FixedBreadth(Minmax(minimum, MaximumFraction(maximum)))]),
    ])
  | _ => Raw("repeat(auto-fit, minmax(16rem, 1fr))")
  }

let responsiveGrid = Css.style({gridTemplateColumns: columns})
```

`gridAutoColumns` and `gridAutoRows` use `AutoTrackList`, which admits track sizes but not template
line names, `Subgrid`, or `Repeat`. `Raw` and `Var` remain deliberate escape hatches.

### Variables And Raw Values

Every structured family provides `Var` and `Raw`. `Var` consumes the reference returned by
`Css.var`, while `Raw` is the deliberate escape hatch for valid CSS not yet modeled by a dedicated
constructor:

```rescript
let themed = Css.style({
  color: Var(Vars.text),
  animationDuration: CssValue.Duration.variable(Vars.duration),
  transform: Raw("translate3d(calc(100% - 1rem), 0, 0)"),
})
```

Shorthands and open grammars such as `background`, `border`, `animation`, `transition`, gradients,
and shadows remain strings:

```rescript
let complex = Css.style({
  backgroundImage: "linear-gradient(to bottom, white, #f8fafc)",
  boxShadow: "0 0.5rem 1.5rem rgb(15 23 42 / 12%)",
  transition: "transform 150ms ease, box-shadow 150ms ease",
})
```

## Modern Properties

The style record includes complete logical border and scrolling families, independent transforms,
motion paths, anchor positioning, view transitions, SVG presentation properties, fragmentation,
shapes, containment intrinsic sizes, and modern typography controls. The
[machine-readable inventory](modern-properties.csv) records all 118 additions, their emitted names,
types, standards-track status, validated browser-availability category, and exact serializer test
values.

Finite values stay typed while compositional grammars remain open strings:

```rescript
let articleRadius = switch CssValue.BorderRadius.single(Rem(1.0)) {
| Ok(radius) => radius
| Error(_) => Raw("1rem")
}

let article = Css.style({
  textWrap: Pretty,
  fontSynthesis: Values([Weight, Style]),
  borderInlineStartColor: Named("teal"),
  borderInlineStartStyle: Solid,
  borderInlineStartWidth: Thin,
  borderRadius: articleRadius,
  scrollMarginBlock: Two(Rem(1.0), Rem(2.0)),
  translate: XY(Rem(1.0), Percent(20.0)),
  scale: XY(Number(1.2), Percent(80.0)),
  rotate: X(Deg(15.0)),
  transitionBehavior: AllowDiscrete,
})
```

SVG paint supports colors, paint-server URLs, contextual paint, variables, and `Raw`. Alpha values
distinguish unitless numbers from percentages:

```rescript
let icon = Css.style({
  fill: Color(Hex("336699")),
  fillOpacity: Number(0.6),
  stroke: Color(CurrentColor),
  strokeWidth: Px(2),
  strokeOpacity: Percent(75.0),
  strokeDasharray: Values([Px(4), Px(2)]),
  vectorEffect: NonScalingStroke,
})
```

Properties marked `limited` or `partial` in the inventory should have a usable fallback and be
gated with `Css.supports`. The fallback remains outside the feature query:

```rescript
let anchored = Css.class({
  position: Absolute,
  insetBlockStart: Zero,
  supports: [
    Css.supports(
      ~condition="(position-anchor: --trigger)",
      Css.style({
        positionAnchor: "--trigger",
        positionArea: "block-end span-inline-end",
        positionVisibility: Conditions([AnchorVisible, NoOverflow]),
      }),
    ),
  ],
})
```

The modern-property batch has no deferred inventory entries. Moving syntax remains available through
the relevant `Raw` constructor or an open string field; vendor-prefixed properties and additional
out-of-plan families remain intentionally outside this inventory.

## 0.x Structured Value Migration

This is an intentional source-breaking 0.x change. Replace strings only on fields that now use a
structured family; string-valued shorthands do not change.

| Field                      | Before                                | After                                         |
| -------------------------- | ------------------------------------- | --------------------------------------------- |
| `color`                    | `color: "white"`                      | `color: Named("white")`                       |
| `textDecorationColor`      | `textDecorationColor: "red"`          | `textDecorationColor: Named("red")`           |
| `backgroundColor`          | `backgroundColor: "#ffffff"`          | `backgroundColor: Hex("#ffffff")`             |
| `borderColor`              | `borderColor: Vars.border`            | `borderColor: Var(Vars.border)`               |
| `outlineColor`             | `outlineColor: "currentColor"`        | `outlineColor: CurrentColor`                  |
| `accentColor`              | `accentColor: "teal"`                 | `accentColor: Named("teal")`                  |
| `caretColor`               | `caretColor: "transparent"`           | `caretColor: Transparent`                     |
| `animationDelay`           | `animationDelay: "50ms"`              | validated `CssValue.Time.ms(50.0)`            |
| `animationDuration`        | `animationDuration: "180ms"`          | validated `CssValue.Duration.ms(180.0)`       |
| `animationTimingFunction`  | `animationTimingFunction: "ease-out"` | `animationTimingFunction: EaseOut`            |
| `transitionDelay`          | `transitionDelay: "0s"`               | `transitionDelay: CssValue.Time.zero`         |
| `transitionDuration`       | `transitionDuration: "0.15s"`         | validated `CssValue.Duration.seconds(0.15)`   |
| `transitionTimingFunction` | `transitionTimingFunction: "linear"`  | `transitionTimingFunction: Linear`            |
| `transform`                | `transform: "translateY(-1px)"`       | `transform: TranslateY(Px(-1))`               |
| `gridTemplateColumns`      | `gridTemplateColumns: "1fr"`          | validated `TrackFraction` inside `Tracks`     |
| `gridTemplateRows`         | `gridTemplateRows: "auto"`            | `gridTemplateRows: Tracks([Breadth(Auto)])`   |
| `gridAutoColumns`          | `gridAutoColumns: "8rem"`             | `AutoTrackList.Tracks([Length(trackLength)])` |
| `gridAutoRows`             | `gridAutoRows: "min-content"`         | `AutoTrackList.Tracks([MinContent])`          |
| `overscrollBehavior`       | `overscrollBehavior: "contain"`       | `overscrollBehavior: Contain`                 |

For a mechanical migration when no dedicated constructor is appropriate, wrap the previous string
in the field's contextual `Raw`, such as `transform: Raw("custom-transform()")`. Invalid
cross-category combinations remain compile-time type errors.

Numeric properties accept ReScript numbers directly where the CSS grammar is unambiguous:

```rescript
let item = Css.style({
  zIndex: 10,
  opacity: 0.8,
  flexGrow: 1.0,
  order: 2,
})
```

## Font Faces

Register downloadable and locally installed fonts with `Css.fontFace`. The returned family value is
already quoted and can be reused directly in a `fontFamily` declaration:

```rescript
let inter = Css.fontFace({
  family: "Inter",
  src: [
    Css.localFontSource(~name="Inter"),
    Css.fontSource(
      ~url="/fonts/inter-variable.woff2",
      ~format="woff2",
      ~tech=["variations"],
    ),
  ],
  style: Normal,
  weight: "100 900",
  stretch: "75% 125%",
  display: Swap,
  unicodeRange: "U+0000-00FF",
  ascentOverride: "90%",
  descentOverride: "20%",
  lineGapOverride: "0%",
  sizeAdjust: "105%",
})

let body = Css.style({
  fontFamily: `${inter}, system-ui, sans-serif`,
})
```

Sources are emitted in array order. URL sources accept optional `format()` and `tech()` hints, while
`Css.localFontSource` emits a quoted `local()` lookup. Register each weight or style as a separate
font face with the same family name.

`style` and `display` provide contextual keyword variants and `Raw` escape hatches. Compound
descriptors such as `weight`, `featureSettings`, and `variationSettings` remain strings so variable
ranges and OpenType settings can be expressed directly. Empty required values and strings that can
break out of a descriptor are rejected during static collection.

## Keyframes

Define animations with `Css.keyframes` and use the returned name in an ordinary style record:

```rescript
let fadeIn = Css.keyframes([
  Css.frame(~at="from", {opacity: 0.0, transform: TranslateY(Rem(0.25))}),
  Css.frame(~at="60%, 80%", {opacity: 0.8}),
  Css.frame(~at="to", {opacity: 1.0, transform: TranslateY(Zero)}),
])

let enter = Css.style({
  animationName: fadeIn,
  animationDuration: CssValue.Duration.raw("180ms"),
  animationTimingFunction: EaseOut,
})
```

The plugin replaces each module-level keyframes binding with a stable, scoped animation name and
emits its frames in source order. Exporting that binding and using it from another style module is
supported.

Frame selectors accept `from`, `to`, percentages from `0%` through `100%`, or a comma-separated
list of those values. Frames support declarations and `vars`, but nested selectors and conditional
rules are rejected because CSS does not allow them inside `@keyframes`.

## Registered Custom Properties

Use `Css.registerProperty` to emit a structured `@property` rule:

```rescript
let _ = Css.registerProperty({
  name: "--progress",
  syntax: "<number>",
  inherits: false,
  initialValue: "0",
})
```

All four descriptors are required by the record type. Custom-property names must begin with `--`,
and descriptor values are checked before collection so they cannot escape the generated rule.
Registrations also accept `~layer` when they should participate in an explicit cascade layer.

## Page Rules

`Css.page` emits ordered page descriptors without exposing a raw at-rule block:

```rescript
let _ = Css.page(~selector=":first", [
  ("size", "A4"),
  ("margin", "2cm"),
])
```

Omit `~selector` for the default page rule. Named pages and the `:left`, `:right`, `:first`, and
`:blank` pseudo-pages are supported. Descriptor names must be CSS identifiers and values cannot
contain rule boundaries. Page rules may also opt into a cascade layer. Paged-media margin boxes are
not yet part of this API.

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
