let className = Css.class({
  vars: [(Vars.surface, "#ecfeff"), (Vars.text, "#164e63")],
  background: Vars.surface,
  border: "1px solid currentColor",
  color: Vars.text,
  padding: Vars.spaceMd,
  h1: Css.style({
    color: Vars.brand,
  }),
})

let html = `<article class="${className}"><h1>Scoped variable overrides</h1></article>`
