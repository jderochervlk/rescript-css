module Styles = {
  let button = Css.style({
    background: Vars.brand,
    border: "0",
    color: Vars.onBrand,
    display: Css.InlineFlex,
    padding: Var(Vars.spaceMd),
  })
}

let label = "Shared variables"

@react.component
let make = () => <button className=Styles.button> {React.string(label)} </button>
