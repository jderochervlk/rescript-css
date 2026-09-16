module Styles = {
  let page = Css.style({
    background: "#f8fafc",
    color: "#0f172a",
    padding: "2rem",
  })

  let title = Css.style({
    color: "#0f766e",
  })

  let button = Css.style({
    background: "#0f766e",
    border: "0",
    color: "white",
    display: Css.InlineFlex,
    padding: "0.75rem 1rem",
  })
}

@react.component
let make = () =>
  <main className=Styles.page>
    <h1 className=Styles.title> {React.string("Typed CSS in ReScript React")} </h1>
    <button className=Styles.button> {React.string("A styled button")} </button>
  </main>
