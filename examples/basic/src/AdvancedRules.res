let _ = Css.registerProperty(
  ~layer=Css.namedLayer("tokens"),
  {
    name: "--card-progress",
    syntax: "<number>",
    inherits: false,
    initialValue: "0",
  },
)

let _ = Css.scope(
  ~root="article",
  ~selector=":scope > h1",
  ~layer=Css.namedLayer("base"),
  {
    color: Hex("172554"),
    selectors: [("& + p", Css.style({marginBlockStart: Rem(0.5)}))],
  },
)

let _ = Css.page(~selector=":first", [("size", "A4"), ("margin", "2cm")])
