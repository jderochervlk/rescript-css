module Styles = {
  let button = Css.class({
    alignItems: Center,
    background: Vars.brand,
    border: "0",
    borderRadius: switch CssValue.BorderRadius.single(Px(6)) {
    | Ok(radius) => radius
    | Error(_) => Raw("6px")
    },
    color: Var(Vars.onBrand),
    display: InlineFlex,
    gap: Em(0.5),
    justifyContent: Center,
    padding: Var(Vars.spaceMd),
    cursor: Pointer,
    userSelect: None,
    transition: "transform 150ms ease, box-shadow 150ms ease",
    hover: Css.style({
      transform: TranslateY(Px(-1)),
      boxShadow: "0 0.25rem 0.75rem rgb(15 118 110 / 25%)",
    }),
    focusVisible: Css.style({
      outline: "2px solid currentColor",
      outlineOffset: Px(2),
    }),
  })
}

let label = "Shared variables"

@react.component
let make = () => <button className=Styles.button> {React.string(label)} </button>
