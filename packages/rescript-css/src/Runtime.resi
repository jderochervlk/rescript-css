type definition = {
  vars: array<(string, string)>,
  display: option<string>,
  background: option<string>,
  border: option<string>,
  color: option<string>,
  width: option<string>,
  padding: option<string>,
  margin: option<string>,
  fontSize: option<string>,
  nested: array<(string, string)>,
}

let var: string => string
let registerVars: array<string> => unit
let style: definition => string
