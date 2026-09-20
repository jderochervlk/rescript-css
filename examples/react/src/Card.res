module Styles = {
  let card = Css.style({
    vars: [(Vars.surface, "#ecfeff"), (Vars.text, "#164e63")],
    background: Vars.surface,
    border: "1px solid currentColor",
    borderRadius: Px(8),
    color: Vars.text,
    display: Grid,
    gap: Rem(1.0),
    lineHeight: Number(1.5),
    maxWidth: Ch(60.0),
    padding: Var(Vars.spaceMd),
  })
}

let content = "This component overrides shared variables within its own scope."

@react.component
let make = () => <article className=Styles.card> {React.string(content)} </article>
