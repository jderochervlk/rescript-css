module Styles = {
  let page = Css.class({
    background: Vars.surface,
    color: Vars.text,
    padding: "2rem",
    h1: Css.style({
      color: Vars.brand,
    }),
  })
}

let headingText = "Typed CSS variables in ReScript React"

@react.component
let make = () =>
  <main className=Styles.page>
    <h1> {React.string(headingText)} </h1>
    <Button />
    <Card />
  </main>
