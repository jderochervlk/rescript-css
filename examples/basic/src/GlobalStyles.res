let _ = Css.layerOrder(["reset", "tokens", "base", "components"])

let _ = Css.global(
  ~selector="*, *::before, *::after",
  ~layer=Css.namedLayer("reset"),
  {
    boxSizing: BorderBox,
  },
)

let _ = Css.global(
  ~selector="body",
  ~layer=Css.namedLayer("base"),
  {
    margin: Zero,
    color: Var(Vars.text),
    background: Vars.surface,
    fontFamily: `${Fonts.inter}, system-ui, sans-serif`,
    a: Css.style({color: Var(Vars.brand)}),
    selection: Css.style({
      color: Var(Vars.onBrand),
      background: Vars.brand,
    }),
  },
)
