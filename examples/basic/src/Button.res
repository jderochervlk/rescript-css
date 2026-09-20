let className = Css.class({
  display: InlineFlex,
  alignItems: Center,
  justifyContent: Center,
  gap: Em(0.5),
  background: Vars.brand,
  border: "0",
  borderRadius: Px(6),
  color: Vars.onBrand,
  padding: Var(Vars.spaceMd),
  cursor: Pointer,
  userSelect: None,
  transition: "transform 150ms ease, box-shadow 150ms ease",
  hover: Css.style({
    transform: "translateY(-1px)",
    boxShadow: "0 0.25rem 0.75rem rgb(15 118 110 / 25%)",
  }),
  focusVisible: Css.style({
    outline: "2px solid currentColor",
    outlineOffset: Px(2),
  }),
})

let html = `<button class="${className}">Shared variables</button>`
