let className = Css.style({
  vars: [
    (Vars.surface, "#ecfeff"),
    (Vars.text, "#164e63"),
  ],
  background: Vars.surface,
  border: "1px solid currentColor",
  color: Vars.text,
  padding: Vars.spaceMd,
})

let html = `<article class="${className}">Scoped variable overrides</article>`
