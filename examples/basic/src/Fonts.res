let inter = Css.fontFace(
  ~layer=Css.namedLayer("tokens"),
  {
    family: "Inter",
    src: [
      Css.localFontSource(~name="Inter"),
      Css.fontSource(~url="/fonts/inter.woff2", ~format="woff2", ~tech=["variations"]),
    ],
    style: Normal,
    weight: "100 900",
    display: Swap,
  },
)
