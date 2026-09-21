let className = Css.class({
  display: Grid,
  gap: Rem(0.75),
  maxWidth: Rem(32.0),
  margin: Auto,
  padding: Rem(1.5),
  color: Named("#0f172a"),
  background: "#ecfeff",
  borderRadius: Raw("8px"),
  hover: Css.style({background: "#cffafe"}),
})

let html = `<main class="${className}"><h1>ReScript 12</h1><p>CSS compiled with ReScript 12.3.1 and Vite 8.</p></main>`
