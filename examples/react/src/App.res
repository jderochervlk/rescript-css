module Styles = {
  let page = Css.class({
    background: Vars.surface,
    color: Vars.text,
    width: Percent(100.0),
    padding: Rem(2.0),
    margin: Auto,
    h1: Css.style({
      color: Vars.brand,
      fontSize: Em(1.75),
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
