type displayMode =
  | Block
  | Flex
  | Grid
  | InlineBlock
  | InlineFlex

type css = {
  display?: displayMode,
  background?: string,
  border?: string,
  color?: string,
  padding?: string,
}

type definition = Runtime.definition

let register: definition => string = Runtime.style

let displayValue = mode =>
  switch mode {
  | Block => "block"
  | Flex => "flex"
  | Grid => "grid"
  | InlineBlock => "inline-block"
  | InlineFlex => "inline-flex"
  }

let style = (css: css) => {
  let {?display, ?background, ?border, ?color, ?padding} = css

  let display = switch display {
  | Some(value) => Some(displayValue(value))
  | None => None
  }

  register({
    display,
    background,
    border,
    color,
    padding,
  })
}
