type displayMode =
  | Block
  | Flex
  | Grid
  | InlineBlock
  | InlineFlex

type css = {
  vars?: array<(string, string)>,
  display?: displayMode,
  background?: string,
  border?: string,
  color?: string,
  padding?: string,
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

let style = (css: css) => {
  let {?vars, ?display, ?background, ?border, ?color, ?padding, ?h1} = css

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
    padding,
    nested,
  })
}

let class = style
