let className = Css.class({
  vars: [(Vars.surface, "#ecfeff"), (Vars.text, "#164e63")],
  background: Vars.surface,
  border: "1px solid currentColor",
  borderRadius: Px(8),
  color: Vars.text,
  display: Grid,
  gap: Rem(1.0),
  width: Percent(100.0),
  maxWidth: Ch(60.0),
  padding: Var(Vars.spaceMd),
  margin: Auto,
  lineHeight: Number(1.5),
  h1: Css.style({
    color: Vars.brand,
    fontSize: Em(1.75),
    fontWeight: Bold,
    marginBlock: Zero,
  }),
})

let html = `<article class="${className}"><h1>Scoped variable overrides</h1></article>`
