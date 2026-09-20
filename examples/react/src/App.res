module Styles = {
  let page = Css.class({
    background: Vars.surface,
    boxSizing: BorderBox,
    color: Vars.text,
    fontFamily: "Inter, system-ui, sans-serif",
    minHeight: Dvh(100.0),
    width: Percent(100.0),
    padding: Rem(2.0),
    margin: Auto,
    h1: Css.style({
      color: Vars.brand,
      fontSize: Em(1.75),
      fontWeight: Bold,
      marginBlockStart: Zero,
    }),
    selectors: [
      (
        "&[data-compact]",
        Css.style({
          padding: Rem(1.0),
        }),
      ),
    ],
    media: [
      Css.media(
        ~query="(width >= 48rem)",
        Css.style({
          padding: Rem(3.0),
        }),
      ),
    ],
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
