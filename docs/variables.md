# CSS Variables

## Create A Registry

Keep shared variables in a module that can be imported throughout the application:

```rescript
// Vars.res
let brand = Css.var("#0f766e")
let onBrand = Css.var("#ffffff")
let surface = Css.var("#f8fafc")
let text = Css.var("#0f172a")
let spaceMd = Css.var("1rem")

let _ = Css.registerVars([brand, onBrand, surface, text, spaceMd])
```

`Css.registerVars` emits the initial values under `:root`:

```css
:root {
  --rc_16lsq83: #0f766e;
  --rc_1se5ehu: #ffffff;
  --rc_ytpt3h: #f8fafc;
  --rc_mszmw5: #0f172a;
  --rc_w2uaph: 1rem;
}
```

The variable names remain readable in ReScript and JavaScript. Only the generated CSS custom
properties use scoped hashes.

## Consume Variables

String-valued properties accept variable references directly. Wrap references in the contextual
`Var` constructor when the property uses a structured value family:

```rescript
let button = Css.style({
  color: Var(Vars.onBrand),
  background: Vars.brand,
})
```

Wrap a variable in `Var` when the property expects a typed length:

```rescript
let card = Css.style({
  padding: Var(Vars.spaceMd),
})
```

## Override Variables

Use the `vars` field to override values within a class scope:

```rescript
let alternate = Css.style({
  vars: [
    (Vars.brand, "#2dd4bf"),
    (Vars.onBrand, "#042f2e"),
  ],
  color: Var(Vars.onBrand),
  background: Vars.brand,
})
```

This produces scoped custom-property declarations:

```css
.rc_abc123_0 {
  --rc_brand_hash: #2dd4bf;
  --rc_on_brand_hash: #042f2e;
  color: var(--rc_on_brand_hash);
  background: var(--rc_brand_hash);
}
```

Nested elements inherit these overrides through the normal CSS cascade.

## Loading Behavior

The plugin generates `Vars.css` beside `Vars.res.js` and inserts a stylesheet import into the
compiled variable module. Importing `Vars` from multiple components does not duplicate the CSS;
Vite includes the module and stylesheet once in its graph.

Register each shared variable once in its registry module. Component-level overrides do not need
another `registerVars` call.
