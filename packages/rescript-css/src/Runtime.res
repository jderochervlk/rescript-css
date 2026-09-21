type collectedStyle = {
  className: string,
  cssText: string,
  ruleOrder: int,
}

type collectedLayer = {
  kind: string,
  name: string,
}

type collectedRule = {
  order: int,
  cssText: string,
  layer: collectedLayer,
}

type collectedKeyframes = {
  temporaryName: string,
  ruleOrder: int,
}

type collectedFontFace = {
  family: string,
  ruleOrder: int,
}

type collectedProperty = {
  name: string,
  syntax: string,
  inherits: bool,
  initialValue: string,
  ruleOrder: int,
}

type collectedScope = {
  root: string,
  limit: string,
  hasLimit: bool,
  selector: string,
  bodyCssText: string,
  ruleOrder: int,
}

type collectedPage = {
  selector: string,
  hasSelector: bool,
  descriptors: array<(string, string)>,
  ruleOrder: int,
}

type collectedVariable = {
  reference: string,
  propertyName: string,
  initialValue: string,
}

type collector = {
  scope: string,
  styles: array<collectedStyle>,
  rules: array<collectedRule>,
  keyframes: array<collectedKeyframes>,
  fontFaces: array<collectedFontFace>,
  properties: array<collectedProperty>,
  scopes: array<collectedScope>,
  pages: array<collectedPage>,
  layerOrder: array<string>,
  nextRuleOrder: int,
  variables: array<collectedVariable>,
  rootCssText: string,
}

type definition = {
  vars: array<(string, string)>,
  declarations: array<(string, string)>,
  nested: array<(string, string)>,
}

type frame = {
  selector: string,
  definition: definition,
}

type layer = string

type regex

@new external makeRegex: string => regex = "RegExp"
@send external testRegex: (regex, string) => bool = "test"

@send external replaceAll: (string, string, string) => string = "replaceAll"

@send external toStringWithRadix: (float, ~radix: int) => string = "toString"

module CollectorStore = {
  @val external globalThis: unknown = "globalThis"
  @val @scope("Symbol") external symbolFor: string => Symbol.t = "for"
  @val @scope("Reflect") external get: (unknown, Symbol.t) => unknown = "get"
  @val @scope("Reflect") external set: (unknown, Symbol.t, 'value) => bool = "set"
  @get external scope: Type.Classify.object => unknown = "scope"
  @get external styles: Type.Classify.object => unknown = "styles"
  @get external rules: Type.Classify.object => unknown = "rules"
  @get external keyframes: Type.Classify.object => unknown = "keyframes"
  @get external fontFaces: Type.Classify.object => unknown = "fontFaces"
  @get external properties: Type.Classify.object => unknown = "properties"
  @get external scopes: Type.Classify.object => unknown = "scopes"
  @get external pages: Type.Classify.object => unknown = "pages"
  @get external layerOrder: Type.Classify.object => unknown = "layerOrder"
  @get external nextRuleOrder: Type.Classify.object => unknown = "nextRuleOrder"
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
        candidate->rules->Array.isArray,
        candidate->keyframes->Array.isArray,
        candidate->fontFaces->Array.isArray,
        candidate->properties->Array.isArray,
        candidate->scopes->Array.isArray,
        candidate->pages->Array.isArray,
        candidate->layerOrder->Array.isArray,
        Type.Classify.classify(candidate->nextRuleOrder),
        candidate->variables->Array.isArray,
        Type.Classify.classify(candidate->rootCssText),
      ) {
      | (
          String(_),
          true,
          true,
          true,
          true,
          true,
          true,
          true,
          true,
          Number(_),
          true,
          String(_),
        ) => true
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

let createCollector = () => {
  scope: "unscoped",
  styles: [],
  rules: [],
  keyframes: [],
  fontFaces: [],
  properties: [],
  scopes: [],
  pages: [],
  layerOrder: [],
  nextRuleOrder: 0,
  variables: [],
  rootCssText: "",
}

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

let stylesheetFor = (selector, definition) =>
  `${selector} {\n${definition->declarationsFor->Array.join("\n")}\n}\n`

let isNestedStyle = (definition, style) =>
  switch definition.nested->Array.find(((_, className)) => className === style.className) {
  | Some(_) => true
  | None => false
  }

let rec selectorBranchesAt = (value, index, start, parentheses, brackets, quote, branches) => {
  if index >= value->String.length {
    branches->Array.concat([value->String.slice(~start)->String.trim])
  } else {
    let code = value->String.charCodeAtUnsafe(index)
    if code === 92 {
      selectorBranchesAt(value, index + 2, start, parentheses, brackets, quote, branches)
    } else if quote !== 0 {
      selectorBranchesAt(
        value,
        index + 1,
        start,
        parentheses,
        brackets,
        code === quote ? 0 : quote,
        branches,
      )
    } else {
      switch code {
      | 34 | 39 =>
        selectorBranchesAt(value, index + 1, start, parentheses, brackets, code, branches)
      | 40 =>
        selectorBranchesAt(value, index + 1, start, parentheses + 1, brackets, quote, branches)
      | 41 =>
        selectorBranchesAt(value, index + 1, start, parentheses - 1, brackets, quote, branches)
      | 91 =>
        selectorBranchesAt(value, index + 1, start, parentheses, brackets + 1, quote, branches)
      | 93 =>
        selectorBranchesAt(value, index + 1, start, parentheses, brackets - 1, quote, branches)
      | 44 if parentheses === 0 && brackets === 0 =>
        selectorBranchesAt(
          value,
          index + 1,
          index + 1,
          parentheses,
          brackets,
          quote,
          branches->Array.concat([value->String.slice(~start, ~end=index)->String.trim]),
        )
      | _ => selectorBranchesAt(value, index + 1, start, parentheses, brackets, quote, branches)
      }
    }
  }
}

let selectorBranches = value => selectorBranchesAt(value, 0, 0, 0, 0, 0, [])

let selectorForBranch = (parentSelector, selector) =>
  selector->String.startsWith("&")
    ? selector->replaceAll("&", parentSelector)
    : `${parentSelector} ${selector}`

let selectorFor = (parentSelector, selector) =>
  parentSelector
  ->selectorBranches
  ->Array.flatMap(parentBranch =>
    selector
    ->selectorBranches
    ->Array.map(selectorBranch => selectorForBranch(parentBranch, selectorBranch))
  )
  ->Array.join(", ")

let indentStylesheet = cssText =>
  cssText
  ->String.split("\n")
  ->Array.map(line => line === "" ? line : `  ${line}`)
  ->Array.join("\n")

let nestedStylesheetFor = (parentSelector, selector, style: collectedStyle) =>
  if selector->String.startsWith("@") {
    let cssText = style.cssText->replaceAll(`.${style.className}`, parentSelector)
    `${selector} {\n${cssText->indentStylesheet}}\n`
  } else {
    style.cssText->replaceAll(`.${style.className}`, selectorFor(parentSelector, selector))
  }

let nestedStylesheetsFor = (parentSelector, definition, styles) =>
  definition.nested->Array.filterMap(((selector, nestedClassName)) =>
    switch styles->Array.find(style => style.className === nestedClassName) {
    | Some(style) => Some(nestedStylesheetFor(parentSelector, selector, style))
    | None => None
    }
  )

let remainingCollected = (collector, definition) => {
  let nestedOrders =
    collector.styles
    ->Array.filter(style => isNestedStyle(definition, style))
    ->Array.map(style => style.ruleOrder)

  (
    collector.styles->Array.filter(style => !(nestedOrders->Array.includes(style.ruleOrder))),
    collector.rules->Array.filter(rule => !(nestedOrders->Array.includes(rule.order))),
  )
}

let unlayeredLayer = "\x00"

let layerNamePattern = makeRegex(
  "^(?:--[A-Za-z0-9_-]+|-?[A-Za-z_][A-Za-z0-9_-]*)(?:\\.(?:--[A-Za-z0-9_-]+|-?[A-Za-z_][A-Za-z0-9_-]*))*$",
)

let cssWideKeywords = ["initial", "inherit", "unset", "revert", "revert-layer"]

let hasReservedLayerSegment = name =>
  name
  ->String.split(".")
  ->Array.some(segment => cssWideKeywords->Array.includes(segment->String.toLowerCase))

let validateLayerName = name =>
  if layerNamePattern->testRegex(name) && !hasReservedLayerSegment(name) {
    Ok(name)
  } else {
    Error(
      `Invalid layer name "${name}". Expected dot-separated ASCII CSS identifiers such as "framework.components".`,
    )
  }

let collectedLayerFor = layer =>
  if layer === unlayeredLayer {
    {kind: "unlayered", name: ""}
  } else if layer === "" {
    {kind: "anonymous", name: ""}
  } else {
    switch validateLayerName(layer) {
    | Ok(name) => {kind: "named", name}
    | Error(message) => JsError.throwWithMessage(`@jvlk/rescript-css: ${message}`)
    }
  }

let collectRule = (collector, cssText, layer) => {
  order: collector.nextRuleOrder,
  cssText,
  layer: collectedLayerFor(layer),
}

let namedLayer = name =>
  switch validateLayerName(name) {
  | Ok(name) => name
  | Error(message) => JsError.throwWithMessage(`@jvlk/rescript-css: ${message}`)
  }

let anonymousLayer = ""

let rec stringArraysEqualAt = (left, right, index) =>
  if index === left->Array.length {
    true
  } else if left[index] === right[index] {
    stringArraysEqualAt(left, right, index + 1)
  } else {
    false
  }

let stringArraysEqual = (left, right) =>
  left->Array.length === right->Array.length && stringArraysEqualAt(left, right, 0)

let rec duplicateLayerNameAt = (names, index) =>
  if index === names->Array.length {
    None
  } else {
    switch names[index] {
    | None => None
    | Some(name) =>
      names->Array.slice(~start=index + 1)->Array.includes(name)
        ? Some(name)
        : duplicateLayerNameAt(names, index + 1)
    }
  }

let duplicateLayerName = names => duplicateLayerNameAt(names, 0)

let layerOrder = names => {
  let failure = if names->Array.length === 0 {
    Some("Layer order must contain at least one named layer.")
  } else {
    switch names->Array.findMap(name =>
      switch validateLayerName(name) {
      | Ok(_) => None
      | Error(message) => Some(message)
      }
    ) {
    | Some(message) => Some(message)
    | None =>
      switch duplicateLayerName(names) {
      | Some(name) => Some(`Layer order contains duplicate layer name "${name}".`)
      | None => None
      }
    }
  }

  switch failure {
  | Some(message) => JsError.throwWithMessage(`@jvlk/rescript-css: ${message}`)
  | None => {
      let collector = currentCollector()
      if collector.layerOrder->Array.length === 0 {
        {...collector, layerOrder: names}->CollectorStore.write
      } else if !stringArraysEqual(collector.layerOrder, names) {
        let previous = collector.layerOrder->Array.join(", ")
        let received = names->Array.join(", ")
        JsError.throwWithMessage(
          `@jvlk/rescript-css: Layer order conflicts with the previously declared order "${previous}". Received "${received}".`,
        )
      }
    }
  }
}

let percentageSelectorPattern = makeRegex(
  "^(?:100(?:\\.0+)?|(?:[0-9]?[0-9])(?:\\.[0-9]+)?|\\.[0-9]+)%$",
)

let isKeyframePosition = position => {
  let normalized = position->String.trim->String.toLowerCase
  normalized === "from" || normalized === "to" || percentageSelectorPattern->testRegex(normalized)
}

let isKeyframeSelector = selector => {
  let positions = selector->String.split(",")
  positions->Array.length > 0 && positions->Array.every(isKeyframePosition)
}

let frame = (~at, definition) => {selector: at, definition}

let frameValidationFailure = frame =>
  if !isKeyframeSelector(frame.selector) {
    Some(
      `Invalid keyframe selector "${frame.selector}". Expected "from", "to", or percentages from 0% through 100%, separated by commas.`,
    )
  } else if frame.definition.nested->Array.length > 0 {
    Some(
      `Keyframe selector "${frame.selector}" contains nested selectors or conditional rules, which are not valid inside @keyframes.`,
    )
  } else {
    None
  }

let keyframeStylesheetFor = frame => {
  let declarations =
    frame.definition
    ->declarationsFor
    ->Array.map(declaration => `  ${declaration}`)
    ->Array.join("\n")
  `  ${frame.selector} {\n${declarations}\n  }`
}

let keyframesStylesheetFor = (name, frames) => {
  let frameStylesheets = frames->Array.map(keyframeStylesheetFor)->Array.join("\n")
  `@keyframes ${name} {\n${frameStylesheets}\n}\n`
}

let keyframes = (~layer=unlayeredLayer, frames) =>
  switch frames->Array.findMap(frameValidationFailure) {
  | Some(message) => JsError.throwWithMessage(`@jvlk/rescript-css: ${message}`)
  | None => {
      let collector = currentCollector()
      let temporaryName = `rc_kf_${collector.scope->hashScope}_${collector.keyframes
        ->Array.length
        ->Int.toString}`
      let rule = collectRule(collector, keyframesStylesheetFor(temporaryName, frames), layer)
      let collectedKeyframes = {temporaryName, ruleOrder: collector.nextRuleOrder}
      let updatedCollector = {
        ...collector,
        keyframes: collector.keyframes->Array.concat([collectedKeyframes]),
        rules: collector.rules->Array.concat([rule]),
        nextRuleOrder: collector.nextRuleOrder + 1,
      }

      updatedCollector->CollectorStore.write
      temporaryName
    }
  }

let fontFace = (~layer=unlayeredLayer, family, cssText) => {
  let collector = currentCollector()
  let rule = collectRule(collector, cssText, layer)
  let collectedFontFace = {family, ruleOrder: collector.nextRuleOrder}
  let updatedCollector = {
    ...collector,
    fontFaces: collector.fontFaces->Array.concat([collectedFontFace]),
    rules: collector.rules->Array.concat([rule]),
    nextRuleOrder: collector.nextRuleOrder + 1,
  }

  updatedCollector->CollectorStore.write
  family
}

let customPropertyNamePattern = makeRegex("^--[A-Za-z_][A-Za-z0-9_-]*$")

let pageSelectorPattern = makeRegex(
  "^(?:(?:--[A-Za-z0-9_-]+|-?[A-Za-z_][A-Za-z0-9_-]*))?(?::(?:left|right|first|blank))*$",
)

let descriptorNamePattern = makeRegex("^(?:--[A-Za-z0-9_-]+|-?[A-Za-z_][A-Za-z0-9_-]*)$")

let isEmpty = value => value->String.trim->String.length === 0

let hasUnsafeRuleBoundary = value =>
  [";", "{", "}", "\n", "\r", "\u000C", "/*", "*/"]->Array.some(boundary =>
    value->String.includes(boundary)
  )

let rec selectorIsBalancedAt = (value, index, parentheses, brackets, quote) => {
  if index >= value->String.length {
    parentheses === 0 && brackets === 0 && quote === 0
  } else {
    let code = value->String.charCodeAtUnsafe(index)
    if code === 92 {
      index + 1 < value->String.length &&
        selectorIsBalancedAt(value, index + 2, parentheses, brackets, quote)
    } else if quote !== 0 {
      selectorIsBalancedAt(value, index + 1, parentheses, brackets, code === quote ? 0 : quote)
    } else {
      switch code {
      | 34 | 39 => selectorIsBalancedAt(value, index + 1, parentheses, brackets, code)
      | 40 => selectorIsBalancedAt(value, index + 1, parentheses + 1, brackets, quote)
      | 41 =>
        parentheses > 0 && selectorIsBalancedAt(value, index + 1, parentheses - 1, brackets, quote)
      | 91 => selectorIsBalancedAt(value, index + 1, parentheses, brackets + 1, quote)
      | 93 =>
        brackets > 0 && selectorIsBalancedAt(value, index + 1, parentheses, brackets - 1, quote)
      | _ => selectorIsBalancedAt(value, index + 1, parentheses, brackets, quote)
      }
    }
  }
}

let selectorValidationFailure = (label, selector) => {
  let normalized = selector->String.trim
  if normalized->isEmpty {
    Some(`Expected ${label} to be a non-empty selector.`)
  } else if normalized->hasUnsafeRuleBoundary || normalized->String.startsWith("@") {
    Some(`${label} contains an unsafe rule boundary.`)
  } else if !selectorIsBalancedAt(normalized, 0, 0, 0, 0) {
    Some(`${label} contains unbalanced brackets, parentheses, or quotes.`)
  } else {
    None
  }
}

let descriptorValidationFailure = (ruleName, (name, value)) => {
  let normalizedName = name->String.trim
  let normalizedValue = value->String.trim
  if !(descriptorNamePattern->testRegex(normalizedName)) {
    Some(`${ruleName} descriptor name "${name}" is not a valid ASCII CSS identifier.`)
  } else if normalizedValue->isEmpty {
    Some(`${ruleName} descriptor "${normalizedName}" must have a non-empty value.`)
  } else if normalizedValue->hasUnsafeRuleBoundary {
    Some(`${ruleName} descriptor "${normalizedName}" contains an unsafe rule boundary.`)
  } else {
    None
  }
}

let registerProperty = (~layer=unlayeredLayer, ~name, ~syntax, ~inherits, ~initialValue) => {
  let normalizedName = name->String.trim
  let normalizedSyntax = syntax->String.trim
  let normalizedInitialValue = initialValue->String.trim
  let failure = if !(customPropertyNamePattern->testRegex(normalizedName)) {
    Some(`Invalid custom property name "${name}". Expected an ASCII name beginning with "--".`)
  } else if normalizedSyntax->isEmpty {
    Some("Expected @property syntax to be a non-empty string.")
  } else if normalizedSyntax->hasUnsafeRuleBoundary {
    Some("@property syntax contains an unsafe rule boundary.")
  } else if normalizedInitialValue->isEmpty {
    Some("Expected @property initial-value to be a non-empty string.")
  } else if normalizedInitialValue->hasUnsafeRuleBoundary {
    Some("@property initial-value contains an unsafe rule boundary.")
  } else {
    None
  }

  switch failure {
  | Some(message) => JsError.throwWithMessage(`@jvlk/rescript-css: ${message}`)
  | None => {
      let collector = currentCollector()
      let ruleOrder = collector.nextRuleOrder
      let property = {
        name: normalizedName,
        syntax: normalizedSyntax,
        inherits,
        initialValue: normalizedInitialValue,
        ruleOrder,
      }
      let rule = collectRule(collector, "", layer)
      {
        ...collector,
        properties: collector.properties->Array.concat([property]),
        rules: collector.rules->Array.concat([rule]),
        nextRuleOrder: ruleOrder + 1,
      }->CollectorStore.write
    }
  }
}

let scope = (~layer=unlayeredLayer, ~root, ~limit=?, ~selector, definition) => {
  let normalizedRoot = root->String.trim
  let normalizedLimit = limit->Option.map(String.trim)
  let normalizedSelector = selector->String.trim
  let failure = switch selectorValidationFailure("Scope root", normalizedRoot) {
  | Some(message) => Some(message)
  | None =>
    switch normalizedLimit->Option.flatMap(limit =>
      selectorValidationFailure("Scope limit", limit)
    ) {
    | Some(message) => Some(message)
    | None => selectorValidationFailure("Scope body selector", normalizedSelector)
    }
  }

  switch failure {
  | Some(message) => JsError.throwWithMessage(`@jvlk/rescript-css: ${message}`)
  | None => {
      let collector = currentCollector()
      let (remainingStyles, remainingRules) = remainingCollected(collector, definition)
      let nestedStylesheets = nestedStylesheetsFor(normalizedSelector, definition, collector.styles)
      let bodyCssText =
        [stylesheetFor(normalizedSelector, definition)]
        ->Array.concat(nestedStylesheets)
        ->Array.join("\n")
      let ruleOrder = collector.nextRuleOrder
      let scope = {
        root: normalizedRoot,
        limit: normalizedLimit->Option.getOr(""),
        hasLimit: normalizedLimit->Option.isSome,
        selector: normalizedSelector,
        bodyCssText,
        ruleOrder,
      }
      let rule = collectRule(collector, "", layer)
      {
        ...collector,
        styles: remainingStyles,
        scopes: collector.scopes->Array.concat([scope]),
        rules: remainingRules->Array.concat([rule]),
        nextRuleOrder: ruleOrder + 1,
      }->CollectorStore.write
    }
  }
}

let page = (~layer=unlayeredLayer, ~selector=?, descriptors) => {
  let normalizedSelector = selector->Option.map(String.trim)
  let normalizedDescriptors =
    descriptors->Array.map(((name, value)) => (name->String.trim, value->String.trim))
  let failure = switch normalizedSelector {
  | Some(selector) if selector->isEmpty || !(pageSelectorPattern->testRegex(selector)) =>
    Some(
      `Invalid page selector "${selector}". Expected a page name and optional :left, :right, :first, or :blank pseudo-pages.`,
    )
  | _ =>
    normalizedDescriptors->Array.findMap(descriptor =>
      descriptorValidationFailure("@page", descriptor)
    )
  }

  switch failure {
  | Some(message) => JsError.throwWithMessage(`@jvlk/rescript-css: ${message}`)
  | None => {
      let collector = currentCollector()
      let ruleOrder = collector.nextRuleOrder
      let page = {
        selector: normalizedSelector->Option.getOr(""),
        hasSelector: normalizedSelector->Option.isSome,
        descriptors: normalizedDescriptors,
        ruleOrder,
      }
      let rule = collectRule(collector, "", layer)
      {
        ...collector,
        pages: collector.pages->Array.concat([page]),
        rules: collector.rules->Array.concat([rule]),
        nextRuleOrder: ruleOrder + 1,
      }->CollectorStore.write
    }
  }
}

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

let style = (~layer=unlayeredLayer, definition) => {
  let collector = currentCollector()
  let (remainingStyles, remainingRules) = remainingCollected(collector, definition)
  let className = `rc_${collector.scope->hashScope}_${remainingStyles->Array.length->Int.toString}`
  let selector = `.${className}`
  let nestedStylesheets = nestedStylesheetsFor(selector, definition, collector.styles)
  let stylesheets = [stylesheetFor(selector, definition)]->Array.concat(nestedStylesheets)
  let cssText = stylesheets->Array.join("\n")
  let collectedStyle = {className, cssText, ruleOrder: collector.nextRuleOrder}
  let rule = collectRule(collector, cssText, layer)
  let updatedCollector = {
    ...collector,
    styles: remainingStyles->Array.concat([collectedStyle]),
    rules: remainingRules->Array.concat([rule]),
    nextRuleOrder: collector.nextRuleOrder + 1,
  }

  updatedCollector->CollectorStore.write
  className
}

let global = (~layer=unlayeredLayer, selector, definition) => {
  let collector = currentCollector()
  let (remainingStyles, remainingRules) = remainingCollected(collector, definition)
  let nestedStylesheets = nestedStylesheetsFor(selector, definition, collector.styles)
  let stylesheets = [stylesheetFor(selector, definition)]->Array.concat(nestedStylesheets)
  let rule = collectRule(collector, stylesheets->Array.join("\n"), layer)
  let updatedCollector = {
    ...collector,
    styles: remainingStyles,
    rules: remainingRules->Array.concat([rule]),
    nextRuleOrder: collector.nextRuleOrder + 1,
  }

  updatedCollector->CollectorStore.write
}
