let className = Css.class(
  ~layer=Css.namedLayer("components"),
  {
    display: InlineFlex,
    alignItems: Center,
    justifyContent: Center,
    gap: Em(0.5),
    background: Vars.brand,
    border: "0",
    borderRadius: switch CssValue.BorderRadius.single(Px(6)) {
    | Ok(radius) => radius
    | Error(_) => Raw("6px")
    },
    color: Var(Vars.onBrand),
    padding: Var(Vars.spaceMd),
    cursor: Pointer,
    userSelect: None,
    animationName: Animations.fadeIn,
    animationDuration: switch CssValue.Duration.ms(180.0) {
    | Ok(duration) => duration
    | Error(_) => CssValue.Duration.zero
    },
    animationTimingFunction: EaseOut,
    transition: "transform 150ms ease, box-shadow 150ms ease",
    hover: Css.style({
      transform: TranslateY(Px(-1)),
      boxShadow: "0 0.25rem 0.75rem rgb(15 118 110 / 25%)",
    }),
    focusVisible: Css.style({
      outline: "2px solid currentColor",
      outlineOffset: Px(2),
    }),
  },
)

let html = `<button class="${className}">Shared variables</button>`
