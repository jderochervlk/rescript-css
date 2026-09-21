module Styles = {
  let card = Css.style({
    vars: [(Vars.surface, "#ecfeff"), (Vars.text, "#164e63")],
    background: Vars.surface,
    border: "1px solid currentColor",
    borderRadius: switch CssValue.BorderRadius.single(Px(8)) {
    | Ok(radius) => radius
    | Error(_) => Raw("8px")
    },
    borderStartStartRadius: switch CssValue.CornerRadius.circular(Rem(1.5)) {
    | Ok(radius) => radius
    | Error(_) => Raw("1.5rem")
    },
    color: Var(Vars.text),
    container: "example-card / inline-size",
    containIntrinsicInlineSize: AutoLength(Ch(60.0)),
    display: Grid,
    gap: Rem(1.0),
    lineHeight: Number(1.5),
    maxWidth: Ch(60.0),
    padding: Var(Vars.spaceMd),
    scrollMarginBlock: One(Rem(1.0)),
    textWrap: Pretty,
    supports: [
      Css.supports(
        ~condition="(interpolate-size: allow-keywords)",
        Css.style({interpolateSize: AllowKeywords}),
      ),
    ],
  })
}

let content = "This component overrides shared variables within its own scope."

@react.component
let make = () => <article className=Styles.card> {React.string(content)} </article>
