let className = Css.class({
  vars: [(Vars.surface, "#ecfeff"), (Vars.text, "#164e63")],
  background: Vars.surface,
  border: "1px solid currentColor",
  color: Vars.text,
  width: Percent(100.0),
  padding: Var(Vars.spaceMd),
  margin: Auto,
  h1: Css.style({
    color: Vars.brand,
    fontSize: Em(1.75),
  }),
})

let html = `<article class="${className}"><h1>Scoped variable overrides</h1></article>`
