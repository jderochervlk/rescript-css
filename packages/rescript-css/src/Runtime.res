type collectedStyle = {
  className: string,
  cssText: string,
}

type collectedVariable = {
  reference: string,
  propertyName: string,
  initialValue: string,
}

type collector = {
  scope: string,
  styles: array<collectedStyle>,
  variables: array<collectedVariable>,
  rootCssText: string,
}

type definition = {
  vars: array<(string, string)>,
  declarations: array<(string, string)>,
  nested: array<(string, string)>,
}

@send external replaceAll: (string, string, string) => string = "replaceAll"

@send external toStringWithRadix: (float, ~radix: int) => string = "toString"

module CollectorStore = {
  @val external globalThis: unknown = "globalThis"
  @val @scope("Symbol") external symbolFor: string => Symbol.t = "for"
  @val @scope("Reflect") external get: (unknown, Symbol.t) => unknown = "get"
  @val @scope("Reflect") external set: (unknown, Symbol.t, 'value) => bool = "set"
  @get external scope: Type.Classify.object => unknown = "scope"
  @get external styles: Type.Classify.object => unknown = "styles"
  @get external variables: Type.Classify.object => unknown = "variables"
  @get external rootCssText: Type.Classify.object => unknown = "rootCssText"
  external collectorFromUnknown: unknown => collector = "%identity"

  let key = symbolFor("@jvlk/rescript-css.collector")

  let isCollector = value =>
    switch Type.Classify.classify(value) {
    | Object(candidate) =>
      switch (
        Type.Classify.classify(candidate->scope),
        candidate->styles->Array.isArray,
        candidate->variables->Array.isArray,
        Type.Classify.classify(candidate->rootCssText),
      ) {
      | (String(_), true, true, String(_)) => true
      | _ => false
      }
    | _ => false
    }

  let read = () => get(globalThis, key)

  let write = collector => {
    let _ = set(globalThis, key, collector)
  }

  let decode = value => isCollector(value) ? Some(collectorFromUnknown(value)) : None
}

let hashScope = scope => {
  let rec hashAt = (index, hash) =>
    index === scope->String.length
      ? hash
      : hashAt(index + 1, Int.bitwiseXor(hash * 33, scope->String.charCodeAtUnsafe(index)))

  let hash = hashAt(0, 5381)
  let unsignedHash = hash < 0 ? Float.fromInt(hash) +. 4294967296.0 : Float.fromInt(hash)
  unsignedHash->toStringWithRadix(~radix=36)
}

let createCollector = () => {scope: "unscoped", styles: [], variables: [], rootCssText: ""}

let currentCollector = () =>
  switch CollectorStore.read()->CollectorStore.decode {
  | Some(collector) => collector
  | None => {
      let fallback = createCollector()
      fallback->CollectorStore.write
      fallback
    }
  }

let propertyNameForReference = reference => {
  let prefix = "var("
  let suffix = ")"

  reference->String.startsWith(prefix) && reference->String.endsWith(suffix)
    ? reference->String.slice(~start=prefix->String.length, ~end=-(suffix->String.length))
    : reference
}

let declarationsFor = definition => {
  let variableDeclarations =
    definition.vars->Array.map(((reference, value)) =>
      `  ${reference->propertyNameForReference}: ${value};`
    )
  let propertyDeclarations =
    definition.declarations->Array.map(((property, value)) => `  ${property}: ${value};`)

  variableDeclarations->Array.concat(propertyDeclarations)
}

let stylesheetFor = (className, definition) =>
  `.${className} {\n${definition->declarationsFor->Array.join("\n")}\n}\n`

let isNestedStyle = (definition, style) =>
  switch definition.nested->Array.find(((_, className)) => className === style.className) {
  | Some(_) => true
  | None => false
  }

let selectorFor = (className, selector) =>
  selector->String.startsWith("&")
    ? selector->replaceAll("&", `.${className}`)
    : `.${className} ${selector}`

let indentStylesheet = cssText =>
  cssText
  ->String.split("\n")
  ->Array.map(line => line === "" ? line : `  ${line}`)
  ->Array.join("\n")

let nestedStylesheetFor = (className, selector, style) =>
  if selector->String.startsWith("@") {
    let cssText = style.cssText->replaceAll(`.${style.className}`, `.${className}`)
    `${selector} {\n${cssText->indentStylesheet}}\n`
  } else {
    style.cssText->replaceAll(`.${style.className}`, selectorFor(className, selector))
  }

let nestedStylesheetsFor = (className, definition, styles) =>
  definition.nested->Array.filterMap(((selector, nestedClassName)) =>
    switch styles->Array.find(style => style.className === nestedClassName) {
    | Some(style) => Some(nestedStylesheetFor(className, selector, style))
    | None => None
    }
  )

let variableName = (scope, index) => `--rc_${`${scope}:var:${index->Int.toString}`->hashScope}`

let var = initialValue => {
  let collector = currentCollector()
  let propertyName = variableName(collector.scope, collector.variables->Array.length)
  let reference = `var(${propertyName})`
  let variable = {reference, propertyName, initialValue}
  let updatedCollector = {
    ...collector,
    variables: collector.variables->Array.concat([variable]),
  }

  updatedCollector->CollectorStore.write
  reference
}

let registeredVariable = (collector, reference) =>
  collector.variables->Array.find(variable => variable.reference === reference)

let rootStylesheetFor = variables =>
  switch variables {
  | [] => ""
  | variables =>
    let declarations =
      variables->Array.map(variable => `  ${variable.propertyName}: ${variable.initialValue};`)
    `:root {\n${declarations->Array.join("\n")}\n}\n`
  }

let registerVars = references => {
  let collector = currentCollector()
  let variables = references->Array.filterMap(reference => collector->registeredVariable(reference))
  let rootCssText = variables->rootStylesheetFor
  let updatedCollector = {
    ...collector,
    rootCssText: collector.rootCssText ++ rootCssText,
  }

  updatedCollector->CollectorStore.write
}

let style = definition => {
  let collector = currentCollector()
  let remainingStyles = collector.styles->Array.filter(style => !isNestedStyle(definition, style))
  let className = `rc_${collector.scope->hashScope}_${remainingStyles->Array.length->Int.toString}`
  let nestedStylesheets = nestedStylesheetsFor(className, definition, collector.styles)
  let stylesheets = [stylesheetFor(className, definition)]->Array.concat(nestedStylesheets)
  let collectedStyle = {className, cssText: stylesheets->Array.join("\n")}
  let updatedCollector = {
    ...collector,
    styles: remainingStyles->Array.concat([collectedStyle]),
  }

  updatedCollector->CollectorStore.write
  className
}
