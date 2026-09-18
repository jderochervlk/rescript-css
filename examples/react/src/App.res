module Styles = {
  let page = Css.style({
    background: Vars.surface,
    color: Vars.text,
    padding: "2rem",
  })

  let title = Css.style({
    color: Vars.brand,
  })
}

let headingText = "Typed CSS variables in ReScript React"

@react.component
let make = () =>
  <main className=Styles.page>
    <h1 className=Styles.title> {React.string(headingText)} </h1>
    <Button />
    <Card />
  </main>
