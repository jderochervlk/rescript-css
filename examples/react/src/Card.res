module Styles = {
  let card = Css.style({
    vars: [
      (Vars.surface, "#ecfeff"),
      (Vars.text, "#164e63"),
    ],
    background: Vars.surface,
    border: "1px solid currentColor",
    color: Vars.text,
    padding: Vars.spaceMd,
  })
}

let content = "This component overrides shared variables within its own scope."

@react.component
let make = () => <article className=Styles.card> {React.string(content)} </article>
