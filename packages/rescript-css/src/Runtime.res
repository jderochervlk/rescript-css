type collectedStyle = {
  className: string,
  cssText: string,
}

type collector = {
  scope: string,
  styles: array<collectedStyle>,
}

type definition = {
  display: option<string>,
  background: option<string>,
  border: option<string>,
  color: option<string>,
  padding: option<string>,
}

@send external toStringWithRadix: (float, ~radix: int) => string = "toString"

module CollectorStore = {
  @val external globalThis: unknown = "globalThis"
  @val @scope("Symbol") external symbolFor: string => Symbol.t = "for"
  @val @scope("Reflect") external get: (unknown, Symbol.t) => unknown = "get"
  @val @scope("Reflect") external set: (unknown, Symbol.t, 'value) => bool = "set"
  @get external scope: Type.Classify.object => unknown = "scope"
  @get external styles: Type.Classify.object => unknown = "styles"
  external collectorFromUnknown: unknown => collector = "%identity"

  let key = symbolFor("@jvlk/rescript-css.collector")

  let isCollector = value =>
    switch Type.Classify.classify(value) {
    | Object(candidate) =>
      switch (Type.Classify.classify(candidate->scope), candidate->styles->Array.isArray) {
      | (String(_), true) => true
      | _ => false
      }
    | _ => false
    }

  let read = () => get(globalThis, key)

  let write = collector => {
    let _ = set(globalThis, key, collector)
    ()
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

let createCollector = () => {scope: "unscoped", styles: []}

let currentCollector = () =>
  switch CollectorStore.read()->CollectorStore.decode {
  | Some(collector) => collector
  | None => {
      let fallback = createCollector()
      fallback->CollectorStore.write
      fallback
    }
  }

let declarationsFor = definition =>
  [
    ("display", definition.display),
    ("background", definition.background),
    ("border", definition.border),
    ("color", definition.color),
    ("padding", definition.padding),
  ]->Array.filterMap(((property, value)) =>
    switch value {
    | Some(value) => Some(`  ${property}: ${value};`)
    | None => None
    }
  )

let stylesheetFor = (className, definition) =>
  `.${className} {\n${definition->declarationsFor->Array.join("\n")}\n}\n`

let style = definition => {
  let collector = currentCollector()
  let className = `rc_${collector.scope->hashScope}_${collector.styles->Array.length->Int.toString}`
  let collectedStyle = {className, cssText: stylesheetFor(className, definition)}
  let updatedCollector = {
    scope: collector.scope,
    styles: collector.styles->Array.concat([collectedStyle]),
  }

  updatedCollector->CollectorStore.write
  className
}
