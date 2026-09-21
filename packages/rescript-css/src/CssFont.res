module Style = {
  type t = Auto | Normal | Italic | Oblique | Raw(string)

  let toString = style =>
    switch style {
    | Auto => "auto"
    | Normal => "normal"
    | Italic => "italic"
    | Oblique => "oblique"
    | Raw(value) => value
    }
}

module Display = {
  type t = Auto | Block | Swap | Fallback | Optional | Raw(string)

  let toString = display =>
    switch display {
    | Auto => "auto"
    | Block => "block"
    | Swap => "swap"
    | Fallback => "fallback"
    | Optional => "optional"
    | Raw(value) => value
    }
}

type urlSource = {
  url: string,
  format: option<string>,
  tech: array<string>,
}

type source = Url(urlSource) | Local(string)

type descriptors = {
  family: string,
  src: array<source>,
  style?: Style.t,
  weight?: string,
  stretch?: string,
  display?: Display.t,
  unicodeRange?: string,
  featureSettings?: string,
  variationSettings?: string,
  ascentOverride?: string,
  descentOverride?: string,
  lineGapOverride?: string,
  sizeAdjust?: string,
}

type validationError =
  | EmptyFamily
  | EmptySources
  | EmptySource(string)
  | InvalidTechnology(string)
  | EmptyDescriptor(string)
  | UnsafeDescriptor(string)

type serialized = {
  family: string,
  cssText: string,
}

@send external replaceAll: (string, string, string) => string = "replaceAll"

type regex

@new external makeRegex: string => regex = "RegExp"
@send external testRegex: (regex, string) => bool = "test"

let technologyPattern = makeRegex("^[A-Za-z_][A-Za-z0-9_-]*$")

let fontSource = (~url, ~format=?, ~tech=[]) => Url({url, format, tech})

let localFontSource = (~name) => Local(name)

let quote = value => {
  let escaped =
    value
    ->replaceAll("\\", "\\\\")
    ->replaceAll("\"", "\\\"")
    ->replaceAll("\n", "\\A ")
    ->replaceAll("\r", "\\D ")
    ->replaceAll("\u000C", "\\C ")
  `"${escaped}"`
}

let isEmpty = value => value->String.trim->String.length === 0

let hasUnsafeBoundary = value =>
  [";", "{", "}", "\n", "\r", "\u000C", "/*", "*/"]->Compat.arraySome(boundary =>
    Compat.stringIncludes(value, boundary)
  )

let descriptorValidationError = ((name, value)) =>
  if value->isEmpty {
    Some(EmptyDescriptor(name))
  } else if value->hasUnsafeBoundary {
    Some(UnsafeDescriptor(name))
  } else {
    None
  }

let sourceValidationError = source =>
  switch source {
  | Local(name) => name->isEmpty ? Some(EmptySource("local name")) : None
  | Url({url, format, tech}) =>
    if url->isEmpty {
      Some(EmptySource("URL"))
    } else {
      switch format {
      | Some(format) if format->isEmpty => Some(EmptySource("format"))
      | _ =>
        tech->Compat.arrayFindMap(value =>
          if value->isEmpty {
            Some(EmptySource("technology"))
          } else if !(technologyPattern->testRegex(value)) {
            Some(InvalidTechnology(value))
          } else {
            None
          }
        )
      }
    }
  }

let validationError = (descriptors: descriptors) =>
  if descriptors.family->isEmpty {
    Some(EmptyFamily)
  } else if descriptors.src->Array.length === 0 {
    Some(EmptySources)
  } else {
    switch descriptors.src->Compat.arrayFindMap(sourceValidationError) {
    | Some(error) => Some(error)
    | None =>
      [
        ("font-style", descriptors.style->Compat.optionMap(Style.toString)),
        ("font-weight", descriptors.weight),
        ("font-stretch", descriptors.stretch),
        ("font-display", descriptors.display->Compat.optionMap(Display.toString)),
        ("unicode-range", descriptors.unicodeRange),
        ("font-feature-settings", descriptors.featureSettings),
        ("font-variation-settings", descriptors.variationSettings),
        ("ascent-override", descriptors.ascentOverride),
        ("descent-override", descriptors.descentOverride),
        ("line-gap-override", descriptors.lineGapOverride),
        ("size-adjust", descriptors.sizeAdjust),
      ]
      ->Compat.arrayFilterMap(((name, value)) => value->Compat.optionMap(value => (name, value)))
      ->Compat.arrayFindMap(descriptorValidationError)
    }
  }

let sourceToString = source =>
  switch source {
  | Local(name) => `local(${name->quote})`
  | Url({url, format, tech}) => {
      let formatHint = switch format {
      | Some(format) => ` format(${format->quote})`
      | None => ""
      }
      let techHint = switch tech {
      | [] => ""
      | values => ` tech(${values->Compat.arrayJoin(", ")})`
      }
      `url(${url->quote})${formatHint}${techHint}`
    }
  }

let optionalDeclaration = (name, value) => value->Compat.optionMap(value => `  ${name}: ${value};`)

let stylesheetFor = (descriptors: descriptors) => {
  let family = descriptors.family->quote
  let sources = descriptors.src->Compat.arrayMap(sourceToString)->Compat.arrayJoin(", ")
  let optionalDeclarations =
    [
      optionalDeclaration("font-style", descriptors.style->Compat.optionMap(Style.toString)),
      optionalDeclaration("font-weight", descriptors.weight),
      optionalDeclaration("font-stretch", descriptors.stretch),
      optionalDeclaration("font-display", descriptors.display->Compat.optionMap(Display.toString)),
      optionalDeclaration("unicode-range", descriptors.unicodeRange),
      optionalDeclaration("font-feature-settings", descriptors.featureSettings),
      optionalDeclaration("font-variation-settings", descriptors.variationSettings),
      optionalDeclaration("ascent-override", descriptors.ascentOverride),
      optionalDeclaration("descent-override", descriptors.descentOverride),
      optionalDeclaration("line-gap-override", descriptors.lineGapOverride),
      optionalDeclaration("size-adjust", descriptors.sizeAdjust),
    ]->Compat.arrayFilterMap(value => value)
  let declarations =
    [`  font-family: ${family};`, `  src: ${sources};`]->Compat.arrayConcat(optionalDeclarations)
  {family, cssText: `@font-face {\n${declarations->Compat.arrayJoin("\n")}\n}\n`}
}

let serialize = (descriptors: descriptors) =>
  switch descriptors->validationError {
  | Some(error) => Error(error)
  | None => Ok(stylesheetFor(descriptors))
  }

let validationMessage = error =>
  switch error {
  | EmptyFamily => "Expected font-face family to be a non-empty string."
  | EmptySources => "Expected font-face src to contain at least one source."
  | EmptySource(name) => `Expected font-face ${name} to be a non-empty string.`
  | InvalidTechnology(value) =>
    `Invalid font-face source technology "${value}". Expected an ASCII CSS identifier.`
  | EmptyDescriptor(name) => `Expected font-face descriptor "${name}" to be non-empty.`
  | UnsafeDescriptor(name) => `Font-face descriptor "${name}" contains an unsafe rule boundary.`
  }
