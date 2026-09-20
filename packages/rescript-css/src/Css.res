type displayMode =
  | Block
  | Flex
  | Grid
  | InlineBlock
  | InlineFlex

type length =
  | Rem(float)
  | Em(float)
  | Px(int)
  | Percent(float)
  | Auto
  | Zero
  | Var(string)
  | Raw(string)

type css = {
  vars?: array<(string, string)>,
  display?: displayMode,
  background?: string,
  border?: string,
  color?: string,
  width?: length,
  padding?: length,
  margin?: length,
  fontSize?: length,
  h1?: string,
}

type definition = Runtime.definition

let var: string => string = Runtime.var
let registerVars: array<string> => unit = Runtime.registerVars
let register: definition => string = Runtime.style

let displayValue = mode =>
  switch mode {
  | Block => "block"
  | Flex => "flex"
  | Grid => "grid"
  | InlineBlock => "inline-block"
  | InlineFlex => "inline-flex"
  }

let lengthValue = length =>
  switch length {
  | Rem(value) => `${value->Float.toString}rem`
  | Em(value) => `${value->Float.toString}em`
  | Px(value) => `${value->Int.toString}px`
  | Percent(value) => `${value->Float.toString}%`
  | Auto => "auto"
  | Zero => "0"
  | Var(value)
  | Raw(value) => value
  }

let optionalLengthValue = value =>
  switch value {
  | Some(value) => Some(lengthValue(value))
  | None => None
  }

let style = (css: css) => {
  let {
    ?vars,
    ?display,
    ?background,
    ?border,
    ?color,
    ?width,
    ?padding,
    ?margin,
    ?fontSize,
    ?h1,
  } = css

  let vars = switch vars {
  | Some(value) => value
  | None => []
  }

  let display = switch display {
  | Some(value) => Some(displayValue(value))
  | None => None
  }

  let nested = switch h1 {
  | Some(className) => [("h1", className)]
  | None => []
  }

  register({
    vars,
    display,
    background,
    border,
    color,
    width: optionalLengthValue(width),
    padding: optionalLengthValue(padding),
    margin: optionalLengthValue(margin),
    fontSize: optionalLengthValue(fontSize),
    nested,
  })
}

let class = style
