let fadeIn = Css.keyframes(
  ~layer=Css.namedLayer("components"),
  [
    Css.frame(
      ~at="from",
      {
        opacity: 0.0,
        transform: TranslateY(Rem(0.25)),
      },
    ),
    Css.frame(
      ~at="60%, 80%",
      {
        opacity: 0.8,
      },
    ),
    Css.frame(
      ~at="to",
      {
        opacity: 1.0,
        transform: TranslateY(Zero),
      },
    ),
  ],
)
