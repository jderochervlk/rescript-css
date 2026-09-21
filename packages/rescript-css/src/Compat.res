@val external floatToString: float => string = "String"
@val external intToString: int => string = "String"
@val @scope("Number") external floatIsFinite: float => bool = "isFinite"
@val external floatFromInt: int => float = "Number"

@send external nativeArraySome: (array<'value>, 'value => bool) => bool = "some"
@send external nativeArrayGetUnsafe: (array<'value>, int) => 'value = "at"
@send external nativeArrayGet: (array<'value>, int) => option<'value> = "at"
@send external nativeArrayConcat: (array<'value>, array<'value>) => array<'value> = "concat"
@send external nativeArrayJoin: (array<string>, string) => string = "join"
@send external nativeArrayMap: (array<'input>, 'input => 'output) => array<'output> = "map"
@send
external nativeArrayFlatMap: (array<'input>, 'input => array<'output>) => array<'output> = "flatMap"
@send external nativeArrayFilter: (array<'value>, 'value => bool) => array<'value> = "filter"
@send external nativeArrayPush: (array<'value>, 'value) => unit = "push"
@send external nativeArrayIncludes: (array<'value>, 'value) => bool = "includes"
@send external nativeArraySliceToEnd: (array<'value>, int) => array<'value> = "slice"
@send external nativeArrayEvery: (array<'value>, 'value => bool) => bool = "every"
@send external stringIncludes: (string, string) => bool = "includes"
@send external stringStartsWith: (string, string) => bool = "startsWith"
@send external stringEndsWith: (string, string) => bool = "endsWith"
@send external stringCharCodeAt: (string, int) => int = "charCodeAt"
@send external stringSlice: (string, int, int) => string = "slice"
@send external stringSliceToEnd: (string, int) => string = "slice"
@send external stringSplit: (string, string) => array<string> = "split"
@send external stringToLowerCase: string => string = "toLowerCase"
@val @scope("Array") external arrayIsArray: unknown => bool = "isArray"
external intBitwiseXor: (int, int) => int = "%xorint"
@new external makeError: string => exn = "Error"

let throwWithMessage = message => raise(makeError(message))

let arraySome = (values, predicate) => nativeArraySome(values, predicate)

let arrayGet = (values, index) => nativeArrayGet(values, index)

let rec arrayFindMapAt = (
  values: array<'input>,
  callback: 'input => option<'output>,
  index: int,
): option<'output> =>
  if index === values->Array.length {
    None
  } else {
    switch callback(nativeArrayGetUnsafe(values, index)) {
    | Some(value) => Some(value)
    | None => arrayFindMapAt(values, callback, index + 1)
    }
  }

let arrayFindMap = (values: array<'input>, callback: 'input => option<'output>): option<'output> =>
  arrayFindMapAt(values, callback, 0)

let arrayFind = (values: array<'value>, predicate: 'value => bool): option<'value> =>
  arrayFindMap(values, value => predicate(value) ? Some(value) : None)

let arrayMap = (values, mapper) => nativeArrayMap(values, mapper)

let arrayConcat = (values, other) => nativeArrayConcat(values, other)

let arrayFlatMap = (values, mapper) => nativeArrayFlatMap(values, mapper)

let arrayFilter = (values, predicate) => nativeArrayFilter(values, predicate)

let arrayIncludes = (values, value) => nativeArrayIncludes(values, value)

let arraySliceToEnd = (values, start) => nativeArraySliceToEnd(values, start)

let arrayEvery = (values, predicate) => nativeArrayEvery(values, predicate)

let arrayFilterMap = (values: array<'input>, mapper: 'input => option<'output>): array<'output> => {
  let results: array<'output> = []
  let rec filterMapAt = index =>
    if index === values->Array.length {
      results
    } else {
      switch mapper(nativeArrayGetUnsafe(values, index)) {
      | Some(value) => {
          nativeArrayPush(results, value)
          filterMapAt(index + 1)
        }
      | None => filterMapAt(index + 1)
      }
    }

  filterMapAt(0)
}

let arrayJoin = (values, delimiter) => nativeArrayJoin(values, delimiter)

let optionMap = (value, mapper) =>
  switch value {
  | Some(value) => Some(mapper(value))
  | None => None
  }

let optionFlatMap = (value, mapper) =>
  switch value {
  | Some(value) => mapper(value)
  | None => None
  }

let optionIsSome = value =>
  switch value {
  | Some(_) => true
  | None => false
  }

let optionGetOr = (value, fallback) =>
  switch value {
  | Some(value) => value
  | None => fallback
  }
