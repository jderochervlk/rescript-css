type definition = {
  vars: array<(string, string)>,
  declarations: array<(string, string)>,
  nested: array<(string, string)>,
}

let var: string => string
let registerVars: array<string> => unit
let style: definition => string
