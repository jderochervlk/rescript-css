let className = Css.class({
  vars: [(Vars.surface, "#ecfeff"), (Vars.text, "#164e63")],
  background: Vars.surface,
  border: "1px solid currentColor",
  borderRadius: switch CssValue.BorderRadius.single(Px(8)) {
  | Ok(radius) => radius
  | Error(_) => Raw("8px")
  },
  color: Var(Vars.text),
  display: Grid,
  gap: Rem(1.0),
  width: Percent(100.0),
  maxWidth: Ch(60.0),
  padding: Var(Vars.spaceMd),
  margin: Auto,
  lineHeight: Number(1.5),
  h1: Css.style({
    color: Var(Vars.brand),
    fontSize: Em(1.75),
    fontWeight: Bold,
    marginBlock: Zero,
  }),
})

let html = `<article class="${className}"><h1>Scoped variable overrides</h1></article>`
