type definition = {
  vars: array<(string, string)>,
  declarations: array<(string, string)>,
  nested: array<(string, string)>,
}

type frame
type layer = string

let var: string => string
let registerVars: array<string> => unit
let namedLayer: string => layer
let anonymousLayer: layer
let unlayeredLayer: layer
let layerOrder: array<string> => unit
let style: (~layer: layer=?, definition) => string
let global: (~layer: layer=?, string, definition) => unit
let frame: (~at: string, definition) => frame
let keyframes: (~layer: layer=?, array<frame>) => string
let fontFace: (~layer: layer=?, string, string) => string
let registerProperty: (
  ~layer: layer=?,
  ~name: string,
  ~syntax: string,
  ~inherits: bool,
  ~initialValue: string,
) => unit
let scope: (~layer: layer=?, ~root: string, ~limit: string=?, ~selector: string, definition) => unit
let page: (~layer: layer=?, ~selector: string=?, array<(string, string)>) => unit
