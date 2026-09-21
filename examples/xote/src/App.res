module Styles = {
  let fractionalTrack: CssValue.TrackBreadth.t = switch CssValue.TrackFraction.make(1.0) {
  | Ok(value) => Fraction(value)
  | Error(_) => Raw("1fr")
  }

  let repeatedTracks: CssValue.TrackList.t = switch (
    CssValue.TrackLength.make(Zero),
    CssValue.TrackFraction.make(1.0),
    CssValue.RepeatCount.make(3),
  ) {
  | (Ok(minimum), Ok(maximum), Ok(count)) =>
    Tracks([
      Repeat(count, [RepeatBreadth(Minmax(MinimumLength(minimum), MaximumFraction(maximum)))]),
    ])
  | _ => Raw("repeat(3, minmax(0, 1fr))")
  }

  let page = Css.class({
    background: Vars.canvas,
    boxSizing: BorderBox,
    color: Var(Vars.text),
    display: Grid,
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    minHeight: Dvh(100.0),
    padding: Rem(1.25),
    placeItems: Center,
    width: Percent(100.0),
    selection: Css.style({
      background: Vars.accent,
      color: Var(Vars.onBrand),
    }),
    media: [
      Css.media(
        ~query="(width >= 40rem)",
        Css.style({
          padding: Rem(3.0),
        }),
      ),
    ],
  })

  let panel = Css.class({
    background: Vars.surface,
    border: "1px solid",
    borderColor: Var(Vars.border),
    borderRadius: switch CssValue.BorderRadius.single(Px(8)) {
    | Ok(radius) => radius
    | Error(_) => Raw("8px")
    },
    boxShadow: "0 1.5rem 4rem rgb(23 35 33 / 12%)",
    boxSizing: BorderBox,
    display: Grid,
    gap: Rem(1.5),
    maxWidth: Ch(58.0),
    overflow: Hidden,
    padding: Rem(1.5),
    position: Relative,
    width: Percent(100.0),
    h1: Css.style({
      fontSize: Rem(2.25),
      fontWeight: Bold,
      letterSpacing: Em(0.01),
      lineHeight: Number(1.05),
      margin: Zero,
    }),
    media: [
      Css.media(
        ~query="(width >= 40rem)",
        Css.style({
          padding: Rem(2.5),
        }),
      ),
    ],
    supports: [
      Css.supports(
        ~condition="(anchor-scope: --counter-control)",
        Css.style({anchorScope: "--counter-control"}),
      ),
    ],
  })

  let eyebrow = Css.style({
    color: Var(Vars.brand),
    fontSize: Rem(0.75),
    fontWeight: Bold,
    letterSpacing: Em(0.1),
    margin: Zero,
    textTransform: Uppercase,
  })

  let intro = Css.style({
    color: Var(Vars.muted),
    fontSize: Rem(1.0),
    lineHeight: Number(1.6),
    margin: Zero,
    maxWidth: Ch(48.0),
  })

  let readout = Css.class({
    vars: [(Vars.surface, "#087f73"), (Vars.text, "#ffffff"), (Vars.muted, "#d4efeb")],
    alignItems: Center,
    background: Vars.surface,
    borderRadius: switch CssValue.BorderRadius.single(Px(6)) {
    | Ok(radius) => radius
    | Error(_) => Raw("6px")
    },
    color: Var(Vars.text),
    display: Grid,
    gap: Rem(0.25),
    gridTemplateColumns: Tracks([Breadth(fractionalTrack), Breadth(Auto)]),
    padding: Rem(1.25),
  })

  let readoutValue = Css.style({
    fontSize: Rem(3.5),
    fontWeight: Weight(800),
    lineHeight: Number(1.0),
  })

  let metric = Css.class({
    color: Var(Vars.muted),
    display: Grid,
    fontSize: Rem(0.8125),
    gap: Rem(0.25),
    justifyItems: End,
    textTransform: Uppercase,
    span: Css.style({
      color: Var(Vars.text),
      fontSize: Rem(1.125),
      fontWeight: Bold,
    }),
  })

  let controls = Css.class({
    display: Grid,
    gap: Rem(0.75),
    gridTemplateColumns: Tracks([Breadth(fractionalTrack)]),
    media: [
      Css.media(
        ~query="(width >= 30rem)",
        Css.style({
          gridTemplateColumns: repeatedTracks,
        }),
      ),
    ],
  })

  let button = Css.class({
    appearance: None,
    background: Vars.brand,
    border: "1px solid",
    borderColor: Var(Vars.brand),
    borderRadius: switch CssValue.BorderRadius.single(Px(6)) {
    | Ok(radius) => radius
    | Error(_) => Raw("6px")
    },
    color: Var(Vars.onBrand),
    cursor: Pointer,
    fontFamily: "inherit",
    fontSize: Rem(0.9375),
    fontWeight: Bold,
    minHeight: Rem(2.75),
    paddingInline: Var(Vars.spaceMd),
    position: Relative,
    textWrapMode: NoWrap,
    transition: "background-color 150ms ease, border-color 150ms ease, transform 150ms ease",
    hover: Css.style({
      background: Vars.accent,
      borderColor: Var(Vars.accent),
      transform: TranslateY(Px(-1)),
    }),
    focusVisible: Css.style({
      outline: "3px solid rgb(232 93 74 / 35%)",
      outlineOffset: Px(2),
    }),
    active: Css.style({
      transform: TranslateY(Zero),
    }),
    supports: [
      Css.supports(
        ~condition="(anchor-name: --counter-control)",
        Css.style({anchorName: "--counter-control", transitionBehavior: AllowDiscrete}),
      ),
    ],
  })

  let secondaryButton = Css.class({
    background: Vars.surface,
    border: "1px solid",
    borderColor: Var(Vars.border),
    borderRadius: switch CssValue.BorderRadius.single(Px(6)) {
    | Ok(radius) => radius
    | Error(_) => Raw("6px")
    },
    color: Var(Vars.text),
    cursor: Pointer,
    fontFamily: "inherit",
    fontSize: Rem(0.9375),
    fontWeight: Bold,
    minHeight: Rem(2.75),
    paddingInline: Var(Vars.spaceMd),
    transition: "background-color 150ms ease, border-color 150ms ease",
    hover: Css.style({
      background: Vars.canvas,
      borderColor: Var(Vars.brand),
    }),
    focusVisible: Css.style({
      outline: "3px solid rgb(8 127 115 / 30%)",
      outlineOffset: Px(2),
    }),
  })
}

@xote.component
let make = () => {
  let count = Signal.make(0)
  let doubled = Computed.make(() => Signal.get(count) * 2)

  let decrease = (_event: Dom.event) => Signal.update(count, value => value - 1)
  let reset = (_event: Dom.event) => Signal.set(count, 0)
  let increase = (_event: Dom.event) => Signal.update(count, value => value + 1)

  <main class=Styles.page>
    <section class=Styles.panel>
      <p class=Styles.eyebrow> {"Xote + rescript-css"} </p>
      <h1> {"Signals, meet typed styles."} </h1>
      <p class=Styles.intro>
        {"This counter pairs Xote's fine-grained updates with statically extracted CSS, shared variables, nested selectors, and responsive rules."}
      </p>

      <div class=Styles.readout attrs=[("aria-live", "polite")]>
        <span class=Styles.readoutValue> {Signal.get(count)} </span>
        <span class=Styles.metric>
          {"Doubled"}
          <span> {Signal.get(doubled)} </span>
        </span>
      </div>

      <div class=Styles.controls>
        <button class=Styles.secondaryButton onClick=decrease> {"Decrease"} </button>
        <button class=Styles.secondaryButton onClick=reset> {"Reset"} </button>
        <button class=Styles.button onClick=increase> {"Increase"} </button>
      </div>
    </section>
  </main>
}
