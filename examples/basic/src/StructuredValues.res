let duration = switch CssValue.Duration.ms(180.5) {
| Ok(value) => value
| Error(_) => CssValue.Duration.zero
}

let easing = switch CssValue.Easing.cubicBezier(~x1=0.2, ~y1=0.8, ~x2=0.2, ~y2=1.0) {
| Ok(value) => value
| Error(_) => Raw("ease")
}

let stepped = switch CssValue.Easing.steps(~count=4, ~position=JumpEnd) {
| Ok(value) => value
| Error(_) => Raw("steps(4, jump-end)")
}

let delay = switch CssValue.Time.seconds(-0.25) {
| Ok(value) => value
| Error(_) => CssValue.Time.zero
}

let linearEasing = switch (
  CssValue.Easing.linearStop(~output=0.0),
  CssValue.Easing.linearStop(~output=0.75, ~position=60.0),
  CssValue.Easing.linearStop(~output=1.0),
) {
| (Ok(start), Ok(middle), Ok(end)) =>
  switch CssValue.Easing.linearFunction([start, middle, end]) {
  | Ok(value) => value
  | Error(_) => Raw("linear")
  }
| _ => Raw("linear")
}

let responsiveColumns: CssValue.TrackList.t = switch (
  CssValue.TrackLength.make(Rem(16.0)),
  CssValue.TrackFraction.make(1.0),
) {
| (Ok(minimum), Ok(maximum)) =>
  Tracks([
    LineNames(["content-start"]),
    AutoRepeat(AutoFit, [FixedBreadth(Minmax(minimum, MaximumFraction(maximum)))]),
    LineNames(["content-end"]),
  ])
| _ => Raw("repeat(auto-fit, minmax(16rem, 1fr))")
}

let autoColumns: CssValue.AutoTrackList.t = switch CssValue.TrackLength.make(Percent(50.0)) {
| Ok(value) => Tracks([FitContent(value)])
| Error(_) => Raw("fit-content(50%)")
}

let showcase = Css.style({
  color: Oklch({lightness: 0.42, chroma: 0.09, hue: 210.0}),
  textDecorationColor: Transparent,
  backgroundColor: Rgb({red: 248.0, green: 250.0, blue: 252.0, alpha: 0.9}),
  borderColor: Hsl({hue: 188.0, saturation: 86.0, lightness: 40.0}),
  outlineColor: CurrentColor,
  accentColor: Named("rebeccapurple"),
  caretColor: Hex("0f766e"),
  animationDelay: delay,
  animationDuration: duration,
  animationTimingFunction: easing,
  transitionDelay: CssValue.Time.zero,
  transitionDuration: CssValue.Duration.variable("var(--motion-duration)"),
  transitionTimingFunction: stepped,
  gridTemplateColumns: responsiveColumns,
  gridTemplateRows: Subgrid(["row-start", "row-end"]),
  gridAutoColumns: autoColumns,
  gridAutoRows: Raw("minmax(4rem, auto)"),
  transform: Transforms([
    Translate(Rem(-0.5), Percent(25.0)),
    Rotate(Deg(-12.5)),
    Scale(1.0, 0.95),
  ]),
})

let escapeHatches = Css.style({
  color: Var(Vars.text),
  animationDuration: CssValue.Duration.raw("calc(1s / 2)"),
  animationTimingFunction: linearEasing,
  gridTemplateColumns: Var("var(--layout-columns)"),
  transform: Raw("translate(var(--x), var(--y))"),
})
