let floatWithUnit = (value, unit) => `${Compat.floatToString(value)}${unit}`
let intWithUnit = (value, unit) => `${Compat.intToString(value)}${unit}`
let floatToString = value => Compat.floatToString(value)

module Length = {
  type t =
    | Rem(float)
    | Em(float)
    | Px(int)
    | Percent(float)
    | Ch(float)
    | Ex(float)
    | Vw(float)
    | Vh(float)
    | Vmin(float)
    | Vmax(float)
    | Dvw(float)
    | Dvh(float)
    | Svw(float)
    | Svh(float)
    | Lvw(float)
    | Lvh(float)
    | Cm(float)
    | Mm(float)
    | In(float)
    | Pt(float)
    | Pc(float)
    | Auto
    | Zero
    | MinContent
    | MaxContent
    | FitContent
    | Var(string)
    | Raw(string)

  let toString = value =>
    switch value {
    | Rem(value) => floatWithUnit(value, "rem")
    | Em(value) => floatWithUnit(value, "em")
    | Px(value) => intWithUnit(value, "px")
    | Percent(value) => floatWithUnit(value, "%")
    | Ch(value) => floatWithUnit(value, "ch")
    | Ex(value) => floatWithUnit(value, "ex")
    | Vw(value) => floatWithUnit(value, "vw")
    | Vh(value) => floatWithUnit(value, "vh")
    | Vmin(value) => floatWithUnit(value, "vmin")
    | Vmax(value) => floatWithUnit(value, "vmax")
    | Dvw(value) => floatWithUnit(value, "dvw")
    | Dvh(value) => floatWithUnit(value, "dvh")
    | Svw(value) => floatWithUnit(value, "svw")
    | Svh(value) => floatWithUnit(value, "svh")
    | Lvw(value) => floatWithUnit(value, "lvw")
    | Lvh(value) => floatWithUnit(value, "lvh")
    | Cm(value) => floatWithUnit(value, "cm")
    | Mm(value) => floatWithUnit(value, "mm")
    | In(value) => floatWithUnit(value, "in")
    | Pt(value) => floatWithUnit(value, "pt")
    | Pc(value) => floatWithUnit(value, "pc")
    | Auto => "auto"
    | Zero => "0"
    | MinContent => "min-content"
    | MaxContent => "max-content"
    | FitContent => "fit-content"
    | Var(value)
    | Raw(value) => value
    }
}

module Color = {
  type rgb = {
    red: float,
    green: float,
    blue: float,
    alpha?: float,
  }

  type hsl = {
    hue: float,
    saturation: float,
    lightness: float,
    alpha?: float,
  }

  type oklch = {
    lightness: float,
    chroma: float,
    hue: float,
    alpha?: float,
  }

  type t =
    | Transparent
    | CurrentColor
    | Named(string)
    | Hex(string)
    | Rgb(rgb)
    | Hsl(hsl)
    | Oklch(oklch)
    | Var(string)
    | Raw(string)

  let rgb = (~red, ~green, ~blue, ~alpha=?) => {red, green, blue, ?alpha}
  let hsl = (~hue, ~saturation, ~lightness, ~alpha=?) => {hue, saturation, lightness, ?alpha}
  let oklch = (~lightness, ~chroma, ~hue, ~alpha=?) => {lightness, chroma, hue, ?alpha}

  let withAlpha = (functionName, channels, alpha) =>
    switch alpha {
    | Some(alpha) => `${functionName}(${channels} / ${alpha->floatToString})`
    | None => `${functionName}(${channels})`
    }

  let rgbToString = (value: rgb) =>
    withAlpha(
      "rgb",
      `${value.red->floatToString} ${value.green->floatToString} ${value.blue->floatToString}`,
      value.alpha,
    )

  let hslToString = (value: hsl) =>
    withAlpha(
      "hsl",
      `${value.hue->floatToString} ${value.saturation->floatWithUnit(
          "%",
        )} ${value.lightness->floatWithUnit("%")}`,
      value.alpha,
    )

  let oklchToString = (value: oklch) =>
    withAlpha(
      "oklch",
      `${value.lightness->floatToString} ${value.chroma->floatToString} ${value.hue->floatToString}`,
      value.alpha,
    )

  let toString = value =>
    switch value {
    | Transparent => "transparent"
    | CurrentColor => "currentColor"
    | Named(value) => value
    | Hex(value) => Compat.stringStartsWith(value, "#") ? value : `#${value}`
    | Rgb(value) => value->rgbToString
    | Hsl(value) => value->hslToString
    | Oklch(value) => value->oklchToString
    | Var(value)
    | Raw(value) => value
    }
}

module Time: {
  type validationError = NonFinite(float)
  type finite
  type t = Ms(finite) | S(finite) | Zero | Var(string) | Raw(string)

  let ms: float => result<t, validationError>
  let seconds: float => result<t, validationError>
  let zero: t
  let variable: string => t
  let raw: string => t
  let toString: t => string
} = {
  type validationError = NonFinite(float)
  type finite = float
  type t = Ms(finite) | S(finite) | Zero | Var(string) | Raw(string)

  let validate = (constructor, value) =>
    Compat.floatIsFinite(value) ? Ok(constructor(value)) : Error(NonFinite(value))

  let ms = value => validate(value => Ms(value), value)
  let seconds = value => validate(value => S(value), value)
  let zero = Zero
  let variable = value => Var(value)
  let raw = value => Raw(value)

  let toString = value =>
    switch value {
    | Ms(value) => floatWithUnit(value, "ms")
    | S(value) => floatWithUnit(value, "s")
    | Zero => "0s"
    | Var(value)
    | Raw(value) => value
    }
}

module Duration: {
  type validationError = NonFinite(float) | Negative(float)
  type nonNegative
  type t = Ms(nonNegative) | S(nonNegative) | Zero | Var(string) | Raw(string)

  let ms: float => result<t, validationError>
  let seconds: float => result<t, validationError>
  let zero: t
  let variable: string => t
  let raw: string => t
  let toString: t => string
} = {
  type validationError = NonFinite(float) | Negative(float)
  type nonNegative = float
  type t = Ms(nonNegative) | S(nonNegative) | Zero | Var(string) | Raw(string)

  let validate = (constructor, value) =>
    if !Compat.floatIsFinite(value) {
      Error(NonFinite(value))
    } else if value < 0.0 {
      Error(Negative(value))
    } else {
      Ok(constructor(value))
    }

  let ms = value => validate(value => Ms(value), value)
  let seconds = value => validate(value => S(value), value)
  let zero = Zero
  let variable = value => Var(value)
  let raw = value => Raw(value)

  let toString = value =>
    switch value {
    | Ms(value) => floatWithUnit(value, "ms")
    | S(value) => floatWithUnit(value, "s")
    | Zero => "0s"
    | Var(value)
    | Raw(value) => value
    }
}

module Angle = {
  type t = Deg(float) | Rad(float) | Grad(float) | Turn(float) | Zero | Var(string) | Raw(string)

  let toString = value =>
    switch value {
    | Deg(value) => floatWithUnit(value, "deg")
    | Rad(value) => floatWithUnit(value, "rad")
    | Grad(value) => floatWithUnit(value, "grad")
    | Turn(value) => floatWithUnit(value, "turn")
    | Zero => "0deg"
    | Var(value)
    | Raw(value) => value
    }
}

module Easing: {
  type stepPosition = JumpStart | JumpEnd | JumpNone | JumpBoth | Start | End
  type validationError =
    | NonFiniteControlPoint(float)
    | CubicBezierXOutOfRange(float)
    | InvalidStepCount(int)
    | JumpNoneRequiresTwoSteps
    | NonFiniteLinearOutput(float)
    | NonFiniteLinearPosition(float)
    | LinearPositionOutOfRange(float)
    | LinearFunctionRequiresTwoStops
  type linearStop
  type cubicBezier
  type steps
  type linearStops
  type t =
    | Linear
    | Ease
    | EaseIn
    | EaseOut
    | EaseInOut
    | CubicBezier(cubicBezier)
    | Steps(steps)
    | LinearFunction(linearStops)
    | Var(string)
    | Raw(string)

  let linearStop: (~output: float, ~position: float=?) => result<linearStop, validationError>
  let linearFunction: array<linearStop> => result<t, validationError>
  let cubicBezier: (~x1: float, ~y1: float, ~x2: float, ~y2: float) => result<t, validationError>
  let steps: (~count: int, ~position: stepPosition) => result<t, validationError>
  let toString: t => string
} = {
  type stepPosition = JumpStart | JumpEnd | JumpNone | JumpBoth | Start | End

  type validationError =
    | NonFiniteControlPoint(float)
    | CubicBezierXOutOfRange(float)
    | InvalidStepCount(int)
    | JumpNoneRequiresTwoSteps
    | NonFiniteLinearOutput(float)
    | NonFiniteLinearPosition(float)
    | LinearPositionOutOfRange(float)
    | LinearFunctionRequiresTwoStops

  type linearStop = {
    output: float,
    position?: float,
  }

  type cubicBezier = {
    x1: float,
    y1: float,
    x2: float,
    y2: float,
  }

  type steps = {
    count: int,
    position: stepPosition,
  }

  type linearStops = array<linearStop>

  type t =
    | Linear
    | Ease
    | EaseIn
    | EaseOut
    | EaseInOut
    | CubicBezier(cubicBezier)
    | Steps(steps)
    | LinearFunction(linearStops)
    | Var(string)
    | Raw(string)

  let linearStop = (~output, ~position=?) =>
    if !Compat.floatIsFinite(output) {
      Error(NonFiniteLinearOutput(output))
    } else {
      switch position {
      | Some(position) if !Compat.floatIsFinite(position) =>
        Error(NonFiniteLinearPosition(position))
      | Some(position) if position < 0.0 || position > 100.0 =>
        Error(LinearPositionOutOfRange(position))
      | _ => Ok({output, ?position})
      }
    }

  let linearFunction = stops =>
    stops->Array.length < 2 ? Error(LinearFunctionRequiresTwoStops) : Ok(LinearFunction(stops))

  let cubicBezier = (~x1, ~y1, ~x2, ~y2) =>
    switch [x1, y1, x2, y2]->Compat.arrayFind(controlPoint => !Compat.floatIsFinite(controlPoint)) {
    | Some(controlPoint) => Error(NonFiniteControlPoint(controlPoint))
    | None if x1 < 0.0 || x1 > 1.0 => Error(CubicBezierXOutOfRange(x1))
    | None if x2 < 0.0 || x2 > 1.0 => Error(CubicBezierXOutOfRange(x2))
    | None => Ok(CubicBezier({x1, y1, x2, y2}))
    }

  let steps = (~count, ~position) =>
    if count <= 0 {
      Error(InvalidStepCount(count))
    } else if position == JumpNone && count < 2 {
      Error(JumpNoneRequiresTwoSteps)
    } else {
      Ok(Steps({count, position}))
    }

  let stepPositionToString = position =>
    switch position {
    | JumpStart => "jump-start"
    | JumpEnd => "jump-end"
    | JumpNone => "jump-none"
    | JumpBoth => "jump-both"
    | Start => "start"
    | End => "end"
    }

  let linearStopToString = (stop: linearStop) =>
    switch stop.position {
    | Some(position) => `${stop.output->floatToString} ${position->floatWithUnit("%")}`
    | None => stop.output->floatToString
    }

  let toString = value =>
    switch value {
    | Linear => "linear"
    | Ease => "ease"
    | EaseIn => "ease-in"
    | EaseOut => "ease-out"
    | EaseInOut => "ease-in-out"
    | CubicBezier({x1, y1, x2, y2}) =>
      `cubic-bezier(${x1->floatToString}, ${y1->floatToString}, ${x2->floatToString}, ${y2->floatToString})`
    | Steps({count, position}) =>
      `steps(${Compat.intToString(count)}, ${position->stepPositionToString})`
    | LinearFunction(stops) =>
      `linear(${stops->Compat.arrayMap(linearStopToString)->Compat.arrayJoin(", ")})`
    | Var(value)
    | Raw(value) => value
    }
}

module TrackLength: {
  type validationError = NonFiniteLength | NegativeLength | UnsupportedLength
  type t

  let make: Length.t => result<t, validationError>
  let toString: t => string
} = {
  type validationError = NonFiniteLength | NegativeLength | UnsupportedLength
  type t = Length.t

  let numericValue = (value: Length.t) =>
    switch value {
    | Rem(value)
    | Em(value)
    | Percent(value)
    | Ch(value)
    | Ex(value)
    | Vw(value)
    | Vh(value)
    | Vmin(value)
    | Vmax(value)
    | Dvw(value)
    | Dvh(value)
    | Svw(value)
    | Svh(value)
    | Lvw(value)
    | Lvh(value)
    | Cm(value)
    | Mm(value)
    | In(value)
    | Pt(value)
    | Pc(value) =>
      Some(value)
    | Px(value) => Some(Compat.floatFromInt(value))
    | Zero => Some(0.0)
    | Var(_)
    | Raw(_) =>
      None
    | Auto
    | MinContent
    | MaxContent
    | FitContent =>
      None
    }

  let make = (value: Length.t) =>
    switch (value, value->numericValue) {
    | (Var(_) | Raw(_), _) => Ok(value)
    | (Auto | MinContent | MaxContent | FitContent, _) => Error(UnsupportedLength)
    | (_, Some(number)) if !Compat.floatIsFinite(number) => Error(NonFiniteLength)
    | (_, Some(number)) if number < 0.0 => Error(NegativeLength)
    | (_, Some(_)) => Ok(value)
    | (_, None) => Error(UnsupportedLength)
    }

  let toString = value => value->Length.toString
}

module TrackFraction: {
  type validationError = NonFiniteFraction | NegativeFraction
  type t

  let make: float => result<t, validationError>
  let toString: t => string
} = {
  type validationError = NonFiniteFraction | NegativeFraction
  type t = float

  let make = value =>
    if !Compat.floatIsFinite(value) {
      Error(NonFiniteFraction)
    } else if value < 0.0 {
      Error(NegativeFraction)
    } else {
      Ok(value)
    }

  let toString = value => floatWithUnit(value, "fr")
}

module TrackBreadth = {
  type inflexible =
    | MinimumAuto
    | MinimumMinContent
    | MinimumMaxContent
    | MinimumLength(TrackLength.t)
    | MinimumVar(string)
    | MinimumRaw(string)

  type maximum =
    | MaximumAuto
    | MaximumMinContent
    | MaximumMaxContent
    | MaximumFraction(TrackFraction.t)
    | MaximumLength(TrackLength.t)
    | MaximumVar(string)
    | MaximumRaw(string)

  type t =
    | Auto
    | MinContent
    | MaxContent
    | Fraction(TrackFraction.t)
    | Length(TrackLength.t)
    | Minmax(inflexible, maximum)
    | FitContent(TrackLength.t)
    | Var(string)
    | Raw(string)

  let inflexibleToString = value =>
    switch value {
    | MinimumAuto => "auto"
    | MinimumMinContent => "min-content"
    | MinimumMaxContent => "max-content"
    | MinimumLength(value) => value->TrackLength.toString
    | MinimumVar(value)
    | MinimumRaw(value) => value
    }

  let maximumToString = value =>
    switch value {
    | MaximumAuto => "auto"
    | MaximumMinContent => "min-content"
    | MaximumMaxContent => "max-content"
    | MaximumFraction(value) => value->TrackFraction.toString
    | MaximumLength(value) => value->TrackLength.toString
    | MaximumVar(value)
    | MaximumRaw(value) => value
    }

  let toString = value =>
    switch value {
    | Auto => "auto"
    | MinContent => "min-content"
    | MaxContent => "max-content"
    | Fraction(value) => value->TrackFraction.toString
    | Length(value) => value->TrackLength.toString
    | Minmax(minimum, maximum) =>
      `minmax(${minimum->inflexibleToString}, ${maximum->maximumToString})`
    | FitContent(value) => `fit-content(${value->TrackLength.toString})`
    | Var(value)
    | Raw(value) => value
    }
}

module FixedTrackSize = {
  type t =
    | Length(TrackLength.t)
    | Minmax(TrackLength.t, TrackBreadth.maximum)
    | MinmaxInflexible(TrackBreadth.inflexible, TrackLength.t)
    | Var(string)
    | Raw(string)

  let toString = value =>
    switch value {
    | Length(value) => value->TrackLength.toString
    | Minmax(minimum, maximum) =>
      `minmax(${minimum->TrackLength.toString}, ${maximum->TrackBreadth.maximumToString})`
    | MinmaxInflexible(minimum, maximum) =>
      `minmax(${minimum->TrackBreadth.inflexibleToString}, ${maximum->TrackLength.toString})`
    | Var(value)
    | Raw(value) => value
    }
}

module RepeatCount: {
  type validationError = NonPositiveCount(int)
  type t

  let make: int => result<t, validationError>
  let toString: t => string
} = {
  type validationError = NonPositiveCount(int)
  type t = int

  let make = value => value > 0 ? Ok(value) : Error(NonPositiveCount(value))
  let toString = value => Compat.intToString(value)
}

module TrackList = {
  type autoRepeat = AutoFill | AutoFit
  type repeatItem = RepeatBreadth(TrackBreadth.t) | RepeatLineNames(array<string>)
  type fixedRepeatItem = FixedBreadth(FixedTrackSize.t) | FixedLineNames(array<string>)

  type item =
    | Breadth(TrackBreadth.t)
    | Repeat(RepeatCount.t, array<repeatItem>)
    | AutoRepeat(autoRepeat, array<fixedRepeatItem>)
    | LineNames(array<string>)

  type t = Tracks(array<item>) | Subgrid(array<string>) | Var(string) | Raw(string)

  let repeatItemToString = item =>
    switch item {
    | RepeatBreadth(value) => value->TrackBreadth.toString
    | RepeatLineNames(names) => `[${names->Compat.arrayJoin(" ")}]`
    }

  let fixedRepeatItemToString = item =>
    switch item {
    | FixedBreadth(value) => value->FixedTrackSize.toString
    | FixedLineNames(names) => `[${names->Compat.arrayJoin(" ")}]`
    }

  let itemToString = item =>
    switch item {
    | Breadth(value) => value->TrackBreadth.toString
    | Repeat(count, items) =>
      `repeat(${count->RepeatCount.toString}, ${items
        ->Compat.arrayMap(repeatItemToString)
        ->Compat.arrayJoin(" ")})`
    | AutoRepeat(count, items) =>
      let count = switch count {
      | AutoFill => "auto-fill"
      | AutoFit => "auto-fit"
      }
      `repeat(${count}, ${items->Compat.arrayMap(fixedRepeatItemToString)->Compat.arrayJoin(" ")})`
    | LineNames(names) => `[${names->Compat.arrayJoin(" ")}]`
    }

  let subgridLineNames = names =>
    switch names {
    | [] => "subgrid"
    | names => `subgrid ${names->Compat.arrayMap(name => `[${name}]`)->Compat.arrayJoin(" ")}`
    }

  let toString = value =>
    switch value {
    | Tracks(items) => items->Compat.arrayMap(itemToString)->Compat.arrayJoin(" ")
    | Subgrid(names) => subgridLineNames(names)
    | Var(value)
    | Raw(value) => value
    }
}

module AutoTrackList = {
  type t = Tracks(array<TrackBreadth.t>) | Var(string) | Raw(string)

  let toString = value =>
    switch value {
    | Tracks(items) => items->Compat.arrayMap(TrackBreadth.toString)->Compat.arrayJoin(" ")
    | Var(value)
    | Raw(value) => value
    }
}

module LengthPair = {
  type t = One(Length.t) | Two(Length.t, Length.t) | Var(string) | Raw(string)

  let toString = value =>
    switch value {
    | One(value) => value->Length.toString
    | Two(first, second) => `${first->Length.toString} ${second->Length.toString}`
    | Var(value)
    | Raw(value) => value
    }
}

module BorderLength: {
  type validationError = NonFiniteLength | NegativeLength | PercentageNotAllowed | KeywordNotAllowed
  type t

  let make: Length.t => result<t, validationError>
  let toString: t => string
} = {
  type validationError = NonFiniteLength | NegativeLength | PercentageNotAllowed | KeywordNotAllowed
  type t = Length.t

  let make = (value: Length.t) =>
    switch value {
    | Percent(_) => Error(PercentageNotAllowed)
    | Auto
    | MinContent
    | MaxContent
    | FitContent =>
      Error(KeywordNotAllowed)
    | Var(_)
    | Raw(_)
    | Zero =>
      Ok(value)
    | Px(value) if value < 0 => Error(NegativeLength)
    | Px(_) => Ok(value)
    | Rem(value)
    | Em(value)
    | Ch(value)
    | Ex(value)
    | Vw(value)
    | Vh(value)
    | Vmin(value)
    | Vmax(value)
    | Dvw(value)
    | Dvh(value)
    | Svw(value)
    | Svh(value)
    | Lvw(value)
    | Lvh(value)
    | Cm(value)
    | Mm(value)
    | In(value)
    | Pt(value)
    | Pc(value) if !Compat.floatIsFinite(value) =>
      Error(NonFiniteLength)
    | Rem(value)
    | Em(value)
    | Ch(value)
    | Ex(value)
    | Vw(value)
    | Vh(value)
    | Vmin(value)
    | Vmax(value)
    | Dvw(value)
    | Dvh(value)
    | Svw(value)
    | Svh(value)
    | Lvw(value)
    | Lvh(value)
    | Cm(value)
    | Mm(value)
    | In(value)
    | Pt(value)
    | Pc(value) if value < 0.0 =>
      Error(NegativeLength)
    | Rem(_)
    | Em(_)
    | Ch(_)
    | Ex(_)
    | Vw(_)
    | Vh(_)
    | Vmin(_)
    | Vmax(_)
    | Dvw(_)
    | Dvh(_)
    | Svw(_)
    | Svh(_)
    | Lvw(_)
    | Lvh(_)
    | Cm(_)
    | Mm(_)
    | In(_)
    | Pt(_)
    | Pc(_) =>
      Ok(value)
    }

  let toString = value => value->Length.toString
}

module BorderWidthValue = {
  type t = Thin | Medium | Thick | Length(BorderLength.t) | Var(string) | Raw(string)

  let length = value =>
    switch value->BorderLength.make {
    | Ok(value) => Ok(Length(value))
    | Error(error) => Error(error)
    }

  let toString = value =>
    switch value {
    | Thin => "thin"
    | Medium => "medium"
    | Thick => "thick"
    | Length(value) => value->BorderLength.toString
    | Var(value)
    | Raw(value) => value
    }
}

module LogicalBorderWidth = {
  type t = One(BorderWidthValue.t) | Two(BorderWidthValue.t, BorderWidthValue.t) | Raw(string)

  let toString = value =>
    switch value {
    | One(value) => value->BorderWidthValue.toString
    | Two(first, second) =>
      `${first->BorderWidthValue.toString} ${second->BorderWidthValue.toString}`
    | Raw(value) => value
    }
}

module BorderWidth = {
  type t =
    | One(BorderWidthValue.t)
    | Two(BorderWidthValue.t, BorderWidthValue.t)
    | Three(BorderWidthValue.t, BorderWidthValue.t, BorderWidthValue.t)
    | Four(BorderWidthValue.t, BorderWidthValue.t, BorderWidthValue.t, BorderWidthValue.t)
    | Raw(string)

  let toString = value =>
    switch value {
    | One(value) => value->BorderWidthValue.toString
    | Two(topBottom, leftRight) =>
      `${topBottom->BorderWidthValue.toString} ${leftRight->BorderWidthValue.toString}`
    | Three(top, leftRight, bottom) =>
      `${top->BorderWidthValue.toString} ${leftRight->BorderWidthValue.toString} ${bottom->BorderWidthValue.toString}`
    | Four(top, right, bottom, left) =>
      `${top->BorderWidthValue.toString} ${right->BorderWidthValue.toString} ${bottom->BorderWidthValue.toString} ${left->BorderWidthValue.toString}`
    | Raw(value) => value
    }
}

module CornerRadius = {
  type t =
    | Circular(TrackLength.t)
    | Elliptical(TrackLength.t, TrackLength.t)
    | Var(string)
    | Raw(string)

  let circular = value =>
    switch value->TrackLength.make {
    | Ok(value) => Ok(Circular(value))
    | Error(error) => Error(error)
    }

  let elliptical = (~horizontal, ~vertical) =>
    switch (horizontal->TrackLength.make, vertical->TrackLength.make) {
    | (Ok(horizontal), Ok(vertical)) => Ok(Elliptical(horizontal, vertical))
    | (Error(error), _)
    | (_, Error(error)) =>
      Error(error)
    }

  let toString = value =>
    switch value {
    | Circular(radius) => radius->TrackLength.toString
    | Elliptical(horizontal, vertical) =>
      `${horizontal->TrackLength.toString} ${vertical->TrackLength.toString}`
    | Var(value)
    | Raw(value) => value
    }
}

module BorderRadius = {
  type radii =
    | One(TrackLength.t)
    | Two(TrackLength.t, TrackLength.t)
    | Three(TrackLength.t, TrackLength.t, TrackLength.t)
    | Four(TrackLength.t, TrackLength.t, TrackLength.t, TrackLength.t)

  type t = Circular(radii) | Elliptical(radii, radii) | Var(string) | Raw(string)

  let single = value =>
    switch value->TrackLength.make {
    | Ok(value) => Ok(Circular(One(value)))
    | Error(error) => Error(error)
    }

  let two = (first, second) =>
    switch (first->TrackLength.make, second->TrackLength.make) {
    | (Ok(first), Ok(second)) => Ok(Two(first, second))
    | (Error(error), _)
    | (_, Error(error)) =>
      Error(error)
    }

  let three = (first, second, third) =>
    switch (first->TrackLength.make, second->TrackLength.make, third->TrackLength.make) {
    | (Ok(first), Ok(second), Ok(third)) => Ok(Three(first, second, third))
    | (Error(error), _, _)
    | (_, Error(error), _)
    | (_, _, Error(error)) =>
      Error(error)
    }

  let four = (first, second, third, fourth) =>
    switch (
      first->TrackLength.make,
      second->TrackLength.make,
      third->TrackLength.make,
      fourth->TrackLength.make,
    ) {
    | (Ok(first), Ok(second), Ok(third), Ok(fourth)) => Ok(Four(first, second, third, fourth))
    | (Error(error), _, _, _)
    | (_, Error(error), _, _)
    | (_, _, Error(error), _)
    | (_, _, _, Error(error)) =>
      Error(error)
    }

  let radiiToString = radii =>
    switch radii {
    | One(value) => value->TrackLength.toString
    | Two(first, second) => `${first->TrackLength.toString} ${second->TrackLength.toString}`
    | Three(first, second, third) =>
      `${first->TrackLength.toString} ${second->TrackLength.toString} ${third->TrackLength.toString}`
    | Four(first, second, third, fourth) =>
      `${first->TrackLength.toString} ${second->TrackLength.toString} ${third->TrackLength.toString} ${fourth->TrackLength.toString}`
    }

  let toString = value =>
    switch value {
    | Circular(radii) => radii->radiiToString
    | Elliptical(horizontal, vertical) =>
      `${horizontal->radiiToString} / ${vertical->radiiToString}`
    | Var(value)
    | Raw(value) => value
    }
}

module Transform = {
  type rec t =
    | None
    | Translate(Length.t, Length.t)
    | TranslateX(Length.t)
    | TranslateY(Length.t)
    | Translate3d(Length.t, Length.t, Length.t)
    | Scale(float, float)
    | ScaleUniform(float)
    | ScaleX(float)
    | ScaleY(float)
    | Scale3d(float, float, float)
    | Rotate(Angle.t)
    | RotateX(Angle.t)
    | RotateY(Angle.t)
    | RotateZ(Angle.t)
    | Rotate3d(float, float, float, Angle.t)
    | Skew(Angle.t, Angle.t)
    | SkewX(Angle.t)
    | SkewY(Angle.t)
    | Perspective(Length.t)
    | Matrix(float, float, float, float, float, float)
    | Transforms(array<t>)
    | Var(string)
    | Raw(string)

  let length = value => value->Length.toString
  let angle = value => value->Angle.toString

  let rec toString = value =>
    switch value {
    | None => "none"
    | Translate(x, y) => `translate(${x->length}, ${y->length})`
    | TranslateX(x) => `translateX(${x->length})`
    | TranslateY(y) => `translateY(${y->length})`
    | Translate3d(x, y, z) => `translate3d(${x->length}, ${y->length}, ${z->length})`
    | Scale(x, y) => `scale(${x->floatToString}, ${y->floatToString})`
    | ScaleUniform(value) => `scale(${value->floatToString})`
    | ScaleX(value) => `scaleX(${value->floatToString})`
    | ScaleY(value) => `scaleY(${value->floatToString})`
    | Scale3d(x, y, z) => `scale3d(${x->floatToString}, ${y->floatToString}, ${z->floatToString})`
    | Rotate(value) => `rotate(${value->angle})`
    | RotateX(value) => `rotateX(${value->angle})`
    | RotateY(value) => `rotateY(${value->angle})`
    | RotateZ(value) => `rotateZ(${value->angle})`
    | Rotate3d(x, y, z, value) =>
      `rotate3d(${x->floatToString}, ${y->floatToString}, ${z->floatToString}, ${value->angle})`
    | Skew(x, y) => `skew(${x->angle}, ${y->angle})`
    | SkewX(value) => `skewX(${value->angle})`
    | SkewY(value) => `skewY(${value->angle})`
    | Perspective(value) => `perspective(${value->length})`
    | Matrix(a, b, c, d, tx, ty) =>
      `matrix(${a->floatToString}, ${b->floatToString}, ${c->floatToString}, ${d->floatToString}, ${tx->floatToString}, ${ty->floatToString})`
    | Transforms(values) => values->Compat.arrayMap(toString)->Compat.arrayJoin(" ")
    | Var(value)
    | Raw(value) => value
    }
}

module Display = {
  type t =
    | None
    | Contents
    | Block
    | Inline
    | RunIn
    | Flow
    | FlowRoot
    | ListItem
    | Flex
    | Grid
    | Table
    | Ruby
    | InlineBlock
    | InlineFlex
    | InlineGrid
    | InlineTable
    | TableRow
    | TableCell
    | TableCaption
    | Raw(string)

  let toString = value =>
    switch value {
    | None => "none"
    | Contents => "contents"
    | Block => "block"
    | Inline => "inline"
    | RunIn => "run-in"
    | Flow => "flow"
    | FlowRoot => "flow-root"
    | ListItem => "list-item"
    | Flex => "flex"
    | Grid => "grid"
    | Table => "table"
    | Ruby => "ruby"
    | InlineBlock => "inline-block"
    | InlineFlex => "inline-flex"
    | InlineGrid => "inline-grid"
    | InlineTable => "inline-table"
    | TableRow => "table-row"
    | TableCell => "table-cell"
    | TableCaption => "table-caption"
    | Raw(value) => value
    }
}

module Position = {
  type t = Static | Relative | Absolute | Fixed | Sticky | Raw(string)

  let toString = value =>
    switch value {
    | Static => "static"
    | Relative => "relative"
    | Absolute => "absolute"
    | Fixed => "fixed"
    | Sticky => "sticky"
    | Raw(value) => value
    }
}

module Overflow = {
  type t = Visible | Hidden | Clip | Scroll | Auto | Raw(string)

  let toString = value =>
    switch value {
    | Visible => "visible"
    | Hidden => "hidden"
    | Clip => "clip"
    | Scroll => "scroll"
    | Auto => "auto"
    | Raw(value) => value
    }
}

module Visibility = {
  type t = Visible | Hidden | Collapse | Raw(string)

  let toString = value =>
    switch value {
    | Visible => "visible"
    | Hidden => "hidden"
    | Collapse => "collapse"
    | Raw(value) => value
    }
}

module BoxSizing = {
  type t = ContentBox | BorderBox | Raw(string)

  let toString = value =>
    switch value {
    | ContentBox => "content-box"
    | BorderBox => "border-box"
    | Raw(value) => value
    }
}

module Float = {
  type t = None | Left | Right | InlineStart | InlineEnd | Raw(string)

  let toString = value =>
    switch value {
    | None => "none"
    | Left => "left"
    | Right => "right"
    | InlineStart => "inline-start"
    | InlineEnd => "inline-end"
    | Raw(value) => value
    }
}

module Clear = {
  type t = None | Left | Right | Both | InlineStart | InlineEnd | Raw(string)

  let toString = value =>
    switch value {
    | None => "none"
    | Left => "left"
    | Right => "right"
    | Both => "both"
    | InlineStart => "inline-start"
    | InlineEnd => "inline-end"
    | Raw(value) => value
    }
}

module FlexDirection = {
  type t = Row | RowReverse | Column | ColumnReverse | Raw(string)

  let toString = value =>
    switch value {
    | Row => "row"
    | RowReverse => "row-reverse"
    | Column => "column"
    | ColumnReverse => "column-reverse"
    | Raw(value) => value
    }
}

module FlexWrap = {
  type t = NoWrap | Wrap | WrapReverse | Raw(string)

  let toString = value =>
    switch value {
    | NoWrap => "nowrap"
    | Wrap => "wrap"
    | WrapReverse => "wrap-reverse"
    | Raw(value) => value
    }
}

module Alignment = {
  type t =
    | Auto
    | Normal
    | Stretch
    | Center
    | Start
    | End
    | FlexStart
    | FlexEnd
    | SelfStart
    | SelfEnd
    | Baseline
    | FirstBaseline
    | LastBaseline
    | SpaceBetween
    | SpaceAround
    | SpaceEvenly
    | Raw(string)

  let toString = value =>
    switch value {
    | Auto => "auto"
    | Normal => "normal"
    | Stretch => "stretch"
    | Center => "center"
    | Start => "start"
    | End => "end"
    | FlexStart => "flex-start"
    | FlexEnd => "flex-end"
    | SelfStart => "self-start"
    | SelfEnd => "self-end"
    | Baseline => "baseline"
    | FirstBaseline => "first baseline"
    | LastBaseline => "last baseline"
    | SpaceBetween => "space-between"
    | SpaceAround => "space-around"
    | SpaceEvenly => "space-evenly"
    | Raw(value) => value
    }
}

module GridAutoFlow = {
  type t = Row | Column | Dense | RowDense | ColumnDense | Raw(string)

  let toString = value =>
    switch value {
    | Row => "row"
    | Column => "column"
    | Dense => "dense"
    | RowDense => "row dense"
    | ColumnDense => "column dense"
    | Raw(value) => value
    }
}

module BorderStyle = {
  type t =
    None | Hidden | Dotted | Dashed | Solid | Double | Groove | Ridge | Inset | Outset | Raw(string)

  let toString = value =>
    switch value {
    | None => "none"
    | Hidden => "hidden"
    | Dotted => "dotted"
    | Dashed => "dashed"
    | Solid => "solid"
    | Double => "double"
    | Groove => "groove"
    | Ridge => "ridge"
    | Inset => "inset"
    | Outset => "outset"
    | Raw(value) => value
    }
}

module FontStyle = {
  type t = Normal | Italic | Oblique | Raw(string)

  let toString = value =>
    switch value {
    | Normal => "normal"
    | Italic => "italic"
    | Oblique => "oblique"
    | Raw(value) => value
    }
}

module FontWeight = {
  type t = Normal | Bold | Bolder | Lighter | Weight(int) | Var(string) | Raw(string)

  let toString = value =>
    switch value {
    | Normal => "normal"
    | Bold => "bold"
    | Bolder => "bolder"
    | Lighter => "lighter"
    | Weight(value) => Compat.intToString(value)
    | Var(value)
    | Raw(value) => value
    }
}

module LineHeight = {
  type t = Normal | Number(float) | Length(Length.t) | Var(string) | Raw(string)

  let toString = value =>
    switch value {
    | Normal => "normal"
    | Number(value) => floatToString(value)
    | Length(value) => value->Length.toString
    | Var(value)
    | Raw(value) => value
    }
}

module TextAlign = {
  type t = Start | End | Left | Right | Center | Justify | MatchParent | Raw(string)

  let toString = value =>
    switch value {
    | Start => "start"
    | End => "end"
    | Left => "left"
    | Right => "right"
    | Center => "center"
    | Justify => "justify"
    | MatchParent => "match-parent"
    | Raw(value) => value
    }
}

module TextTransform = {
  type t = None | Capitalize | Uppercase | Lowercase | FullWidth | FullSizeKana | Raw(string)

  let toString = value =>
    switch value {
    | None => "none"
    | Capitalize => "capitalize"
    | Uppercase => "uppercase"
    | Lowercase => "lowercase"
    | FullWidth => "full-width"
    | FullSizeKana => "full-size-kana"
    | Raw(value) => value
    }
}

module WhiteSpace = {
  type t = Normal | NoWrap | Pre | PreWrap | PreLine | BreakSpaces | Raw(string)

  let toString = value =>
    switch value {
    | Normal => "normal"
    | NoWrap => "nowrap"
    | Pre => "pre"
    | PreWrap => "pre-wrap"
    | PreLine => "pre-line"
    | BreakSpaces => "break-spaces"
    | Raw(value) => value
    }
}

module WordBreak = {
  type t = Normal | BreakAll | KeepAll | BreakWord | AutoPhrase | Raw(string)

  let toString = value =>
    switch value {
    | Normal => "normal"
    | BreakAll => "break-all"
    | KeepAll => "keep-all"
    | BreakWord => "break-word"
    | AutoPhrase => "auto-phrase"
    | Raw(value) => value
    }
}

module OverflowWrap = {
  type t = Normal | BreakWord | Anywhere | Raw(string)

  let toString = value =>
    switch value {
    | Normal => "normal"
    | BreakWord => "break-word"
    | Anywhere => "anywhere"
    | Raw(value) => value
    }
}

module TextOverflow = {
  type t = Clip | Ellipsis | Raw(string)

  let toString = value =>
    switch value {
    | Clip => "clip"
    | Ellipsis => "ellipsis"
    | Raw(value) => value
    }
}

module ObjectFit = {
  type t = Fill | Contain | Cover | None | ScaleDown | Raw(string)

  let toString = value =>
    switch value {
    | Fill => "fill"
    | Contain => "contain"
    | Cover => "cover"
    | None => "none"
    | ScaleDown => "scale-down"
    | Raw(value) => value
    }
}

module Cursor = {
  type t =
    | Auto
    | Default
    | None
    | ContextMenu
    | Help
    | Pointer
    | Progress
    | Wait
    | Cell
    | Crosshair
    | Text
    | VerticalText
    | Alias
    | Copy
    | Move
    | NoDrop
    | NotAllowed
    | Grab
    | Grabbing
    | ColResize
    | RowResize
    | NResize
    | EResize
    | SResize
    | WResize
    | NeResize
    | NwResize
    | SeResize
    | SwResize
    | EwResize
    | NsResize
    | NeswResize
    | NwseResize
    | ZoomIn
    | ZoomOut
    | Raw(string)

  let toString = value =>
    switch value {
    | Auto => "auto"
    | Default => "default"
    | None => "none"
    | ContextMenu => "context-menu"
    | Help => "help"
    | Pointer => "pointer"
    | Progress => "progress"
    | Wait => "wait"
    | Cell => "cell"
    | Crosshair => "crosshair"
    | Text => "text"
    | VerticalText => "vertical-text"
    | Alias => "alias"
    | Copy => "copy"
    | Move => "move"
    | NoDrop => "no-drop"
    | NotAllowed => "not-allowed"
    | Grab => "grab"
    | Grabbing => "grabbing"
    | ColResize => "col-resize"
    | RowResize => "row-resize"
    | NResize => "n-resize"
    | EResize => "e-resize"
    | SResize => "s-resize"
    | WResize => "w-resize"
    | NeResize => "ne-resize"
    | NwResize => "nw-resize"
    | SeResize => "se-resize"
    | SwResize => "sw-resize"
    | EwResize => "ew-resize"
    | NsResize => "ns-resize"
    | NeswResize => "nesw-resize"
    | NwseResize => "nwse-resize"
    | ZoomIn => "zoom-in"
    | ZoomOut => "zoom-out"
    | Raw(value) => value
    }
}

module PointerEvents = {
  type t =
    | Auto
    | None
    | VisiblePainted
    | VisibleFill
    | VisibleStroke
    | Visible
    | Painted
    | Fill
    | Stroke
    | All
    | Raw(string)

  let toString = value =>
    switch value {
    | Auto => "auto"
    | None => "none"
    | VisiblePainted => "visiblePainted"
    | VisibleFill => "visibleFill"
    | VisibleStroke => "visibleStroke"
    | Visible => "visible"
    | Painted => "painted"
    | Fill => "fill"
    | Stroke => "stroke"
    | All => "all"
    | Raw(value) => value
    }
}

module UserSelect = {
  type t = Auto | Text | None | Contain | All | Raw(string)

  let toString = value =>
    switch value {
    | Auto => "auto"
    | Text => "text"
    | None => "none"
    | Contain => "contain"
    | All => "all"
    | Raw(value) => value
    }
}

module Resize = {
  type t = None | Both | Horizontal | Vertical | Block | Inline | Raw(string)

  let toString = value =>
    switch value {
    | None => "none"
    | Both => "both"
    | Horizontal => "horizontal"
    | Vertical => "vertical"
    | Block => "block"
    | Inline => "inline"
    | Raw(value) => value
    }
}

module ScrollBehavior = {
  type t = Auto | Smooth | Raw(string)

  let toString = value =>
    switch value {
    | Auto => "auto"
    | Smooth => "smooth"
    | Raw(value) => value
    }
}

module Isolation = {
  type t = Auto | Isolate | Raw(string)

  let toString = value =>
    switch value {
    | Auto => "auto"
    | Isolate => "isolate"
    | Raw(value) => value
    }
}

module Appearance = {
  type t = None | Auto | MenulistButton | Textfield | Raw(string)

  let toString = value =>
    switch value {
    | None => "none"
    | Auto => "auto"
    | MenulistButton => "menulist-button"
    | Textfield => "textfield"
    | Raw(value) => value
    }
}

module ListStylePosition = {
  type t = Inside | Outside | Raw(string)

  let toString = value =>
    switch value {
    | Inside => "inside"
    | Outside => "outside"
    | Raw(value) => value
    }
}

module TableLayout = {
  type t = Auto | Fixed | Raw(string)

  let toString = value =>
    switch value {
    | Auto => "auto"
    | Fixed => "fixed"
    | Raw(value) => value
    }
}

module BorderCollapse = {
  type t = Separate | Collapse | Raw(string)

  let toString = value =>
    switch value {
    | Separate => "separate"
    | Collapse => "collapse"
    | Raw(value) => value
    }
}

module WritingMode = {
  type t = HorizontalTb | VerticalRl | VerticalLr | SidewaysRl | SidewaysLr | Raw(string)

  let toString = value =>
    switch value {
    | HorizontalTb => "horizontal-tb"
    | VerticalRl => "vertical-rl"
    | VerticalLr => "vertical-lr"
    | SidewaysRl => "sideways-rl"
    | SidewaysLr => "sideways-lr"
    | Raw(value) => value
    }
}

module Direction = {
  type t = Ltr | Rtl | Raw(string)

  let toString = value =>
    switch value {
    | Ltr => "ltr"
    | Rtl => "rtl"
    | Raw(value) => value
    }
}

module ForcedColorAdjust = {
  type t = Auto | None | PreserveParentColor | Var(string) | Raw(string)

  let toString = value =>
    switch value {
    | Auto => "auto"
    | None => "none"
    | PreserveParentColor => "preserve-parent-color"
    | Var(value)
    | Raw(value) => value
    }
}

module PrintColorAdjust = {
  type t = Economy | Exact | Var(string) | Raw(string)

  let toString = value =>
    switch value {
    | Economy => "economy"
    | Exact => "exact"
    | Var(value)
    | Raw(value) => value
    }
}

module TextWrap = {
  type t = Wrap | NoWrap | Balance | Pretty | Stable | Var(string) | Raw(string)

  let toString = value =>
    switch value {
    | Wrap => "wrap"
    | NoWrap => "nowrap"
    | Balance => "balance"
    | Pretty => "pretty"
    | Stable => "stable"
    | Var(value)
    | Raw(value) => value
    }
}

module TextWrapMode = {
  type t = Wrap | NoWrap | Var(string) | Raw(string)

  let toString = value =>
    switch value {
    | Wrap => "wrap"
    | NoWrap => "nowrap"
    | Var(value)
    | Raw(value) => value
    }
}

module TextWrapStyle = {
  type t = Auto | Balance | Stable | Pretty | AvoidShortLastLine | Var(string) | Raw(string)

  let toString = value =>
    switch value {
    | Auto => "auto"
    | Balance => "balance"
    | Stable => "stable"
    | Pretty => "pretty"
    | AvoidShortLastLine => "avoid-short-last-line"
    | Var(value)
    | Raw(value) => value
    }
}

module TextOrientation = {
  type t = Mixed | Upright | Sideways | Var(string) | Raw(string)

  let toString = value =>
    switch value {
    | Mixed => "mixed"
    | Upright => "upright"
    | Sideways => "sideways"
    | Var(value)
    | Raw(value) => value
    }
}

module UnicodeBidi = {
  type t = Normal | Embed | Isolate | BidiOverride | IsolateOverride | Plaintext | Raw(string)

  let toString = value =>
    switch value {
    | Normal => "normal"
    | Embed => "embed"
    | Isolate => "isolate"
    | BidiOverride => "bidi-override"
    | IsolateOverride => "isolate-override"
    | Plaintext => "plaintext"
    | Raw(value) => value
    }
}

module LineClamp = {
  type t = None | Lines(int) | Var(string) | Raw(string)

  let toString = value =>
    switch value {
    | None => "none"
    | Lines(value) => Compat.intToString(value)
    | Var(value)
    | Raw(value) => value
    }
}

module FontSynthesis = {
  type keyword = Weight | Style | SmallCaps | Position
  type t = None | Values(array<keyword>) | Var(string) | Raw(string)

  let keywordToString = value =>
    switch value {
    | Weight => "weight"
    | Style => "style"
    | SmallCaps => "small-caps"
    | Position => "position"
    }

  let toString = value =>
    switch value {
    | None => "none"
    | Values(values) => values->Compat.arrayMap(keywordToString)->Compat.arrayJoin(" ")
    | Var(value)
    | Raw(value) => value
    }
}

module FontSizeAdjust = {
  type metric = ExHeight | CapHeight | ChWidth | IcWidth | IcHeight
  type t =
    | None
    | Number(float)
    | FromFont
    | Metric(metric, float)
    | MetricFromFont(metric)
    | Var(string)
    | Raw(string)

  let metricToString = value =>
    switch value {
    | ExHeight => "ex-height"
    | CapHeight => "cap-height"
    | ChWidth => "ch-width"
    | IcWidth => "ic-width"
    | IcHeight => "ic-height"
    }

  let toString = value =>
    switch value {
    | None => "none"
    | Number(value) => value->floatToString
    | FromFont => "from-font"
    | Metric(metric, value) => `${metric->metricToString} ${value->floatToString}`
    | MetricFromFont(metric) => `${metric->metricToString} from-font`
    | Var(value)
    | Raw(value) => value
    }
}

module HangingPunctuation = {
  type keyword = First | Last | ForceEnd | AllowEnd
  type t = None | Values(array<keyword>) | Var(string) | Raw(string)

  let keywordToString = value =>
    switch value {
    | First => "first"
    | Last => "last"
    | ForceEnd => "force-end"
    | AllowEnd => "allow-end"
    }

  let toString = value =>
    switch value {
    | None => "none"
    | Values(values) => values->Compat.arrayMap(keywordToString)->Compat.arrayJoin(" ")
    | Var(value)
    | Raw(value) => value
    }
}

module OverscrollBehavior = {
  type t = Auto | Contain | None | Var(string) | Raw(string)

  let toString = value =>
    switch value {
    | Auto => "auto"
    | Contain => "contain"
    | None => "none"
    | Var(value)
    | Raw(value) => value
    }
}

module TransformBox = {
  type t = ContentBox | BorderBox | FillBox | StrokeBox | ViewBox | Raw(string)

  let toString = value =>
    switch value {
    | ContentBox => "content-box"
    | BorderBox => "border-box"
    | FillBox => "fill-box"
    | StrokeBox => "stroke-box"
    | ViewBox => "view-box"
    | Raw(value) => value
    }
}

module TranslateZLength: {
  type validationError = PercentageNotAllowed | KeywordNotAllowed
  type t

  let make: Length.t => result<t, validationError>
  let toString: t => string
} = {
  type validationError = PercentageNotAllowed | KeywordNotAllowed
  type t = Length.t

  let make = (value: Length.t) =>
    switch value {
    | Percent(_) => Error(PercentageNotAllowed)
    | Auto
    | MinContent
    | MaxContent
    | FitContent =>
      Error(KeywordNotAllowed)
    | _ => Ok(value)
    }

  let toString = value => value->Length.toString
}

module Translate = {
  type t =
    | None
    | X(Length.t)
    | XY(Length.t, Length.t)
    | XYZ(Length.t, Length.t, TranslateZLength.t)
    | Var(string)
    | Raw(string)

  let toString = value =>
    switch value {
    | None => "none"
    | X(x) => x->Length.toString
    | XY(x, y) => `${x->Length.toString} ${y->Length.toString}`
    | XYZ(x, y, z) => `${x->Length.toString} ${y->Length.toString} ${z->TranslateZLength.toString}`
    | Var(value)
    | Raw(value) => value
    }
}

module Rotate = {
  type t =
    | None
    | Angle(Angle.t)
    | X(Angle.t)
    | Y(Angle.t)
    | Z(Angle.t)
    | Axis(float, float, float, Angle.t)
    | Var(string)
    | Raw(string)

  let toString = value =>
    switch value {
    | None => "none"
    | Angle(angle) => angle->Angle.toString
    | X(angle) => `x ${angle->Angle.toString}`
    | Y(angle) => `y ${angle->Angle.toString}`
    | Z(angle) => `z ${angle->Angle.toString}`
    | Axis(x, y, z, angle) =>
      `${x->floatToString} ${y->floatToString} ${z->floatToString} ${angle->Angle.toString}`
    | Var(value)
    | Raw(value) => value
    }
}

module Scale = {
  type factor = Number(float) | Percent(float)

  type t =
    | None
    | Uniform(factor)
    | XY(factor, factor)
    | XYZ(factor, factor, factor)
    | Var(string)
    | Raw(string)

  let factorToString = factor =>
    switch factor {
    | Number(value) => value->floatToString
    | Percent(value) => value->floatWithUnit("%")
    }

  let toString = value =>
    switch value {
    | None => "none"
    | Uniform(scale) => scale->factorToString
    | XY(x, y) => `${x->factorToString} ${y->factorToString}`
    | XYZ(x, y, z) => `${x->factorToString} ${y->factorToString} ${z->factorToString}`
    | Var(value)
    | Raw(value) => value
    }
}

module OffsetRotate = {
  type t =
    | Auto
    | AutoAngle(Angle.t)
    | Reverse
    | ReverseAngle(Angle.t)
    | Angle(Angle.t)
    | Var(string)
    | Raw(string)

  let toString = value =>
    switch value {
    | Auto => "auto"
    | AutoAngle(angle) => `auto ${angle->Angle.toString}`
    | Reverse => "reverse"
    | ReverseAngle(angle) => `reverse ${angle->Angle.toString}`
    | Angle(angle) => angle->Angle.toString
    | Var(value)
    | Raw(value) => value
    }
}

module TransitionBehavior = {
  type t = Normal | AllowDiscrete | Var(string) | Raw(string)

  let toString = value =>
    switch value {
    | Normal => "normal"
    | AllowDiscrete => "allow-discrete"
    | Var(value)
    | Raw(value) => value
    }
}

module PositionTryOrder = {
  type t = Normal | MostWidth | MostHeight | MostBlockSize | MostInlineSize | Raw(string)

  let toString = value =>
    switch value {
    | Normal => "normal"
    | MostWidth => "most-width"
    | MostHeight => "most-height"
    | MostBlockSize => "most-block-size"
    | MostInlineSize => "most-inline-size"
    | Raw(value) => value
    }
}

module PositionVisibility = {
  type condition = AnchorValid | AnchorVisible | NoOverflow
  type t = Always | Conditions(array<condition>) | Var(string) | Raw(string)

  let conditionToString = value =>
    switch value {
    | AnchorValid => "anchor-valid"
    | AnchorVisible => "anchor-visible"
    | NoOverflow => "no-overflow"
    }

  let toString = value =>
    switch value {
    | Always => "always"
    | Conditions(values) => values->Compat.arrayMap(conditionToString)->Compat.arrayJoin(" ")
    | Var(value)
    | Raw(value) => value
    }
}

module Alpha = {
  type t = Number(float) | Percent(float) | Var(string) | Raw(string)

  let toString = value =>
    switch value {
    | Number(value) => value->floatToString
    | Percent(value) => value->floatWithUnit("%")
    | Var(value)
    | Raw(value) => value
    }
}

module Paint = {
  type t =
    | None
    | Color(Color.t)
    | ContextFill
    | ContextStroke
    | Url(string)
    | Var(string)
    | Raw(string)

  let toString = value =>
    switch value {
    | None => "none"
    | Color(value) => value->Color.toString
    | ContextFill => "context-fill"
    | ContextStroke => "context-stroke"
    | Url(value) => `url(${value})`
    | Var(value)
    | Raw(value) => value
    }
}

module FillRule = {
  type t = Nonzero | Evenodd | Var(string) | Raw(string)

  let toString = value =>
    switch value {
    | Nonzero => "nonzero"
    | Evenodd => "evenodd"
    | Var(value)
    | Raw(value) => value
    }
}

module StrokeLinecap = {
  type t = Butt | Round | Square | Var(string) | Raw(string)

  let toString = value =>
    switch value {
    | Butt => "butt"
    | Round => "round"
    | Square => "square"
    | Var(value)
    | Raw(value) => value
    }
}

module StrokeLinejoin = {
  type t = Arcs | Bevel | Miter | MiterClip | Round | Var(string) | Raw(string)

  let toString = value =>
    switch value {
    | Arcs => "arcs"
    | Bevel => "bevel"
    | Miter => "miter"
    | MiterClip => "miter-clip"
    | Round => "round"
    | Var(value)
    | Raw(value) => value
    }
}

module StrokeDasharray = {
  type t = None | Values(array<Length.t>) | Var(string) | Raw(string)

  let toString = value =>
    switch value {
    | None => "none"
    | Values(values) => values->Compat.arrayMap(Length.toString)->Compat.arrayJoin(" ")
    | Var(value)
    | Raw(value) => value
    }
}

module PaintOrder = {
  type component = Fill | Stroke | Markers
  type t = Normal | Values(array<component>) | Var(string) | Raw(string)

  let componentToString = value =>
    switch value {
    | Fill => "fill"
    | Stroke => "stroke"
    | Markers => "markers"
    }

  let toString = value =>
    switch value {
    | Normal => "normal"
    | Values(values) => values->Compat.arrayMap(componentToString)->Compat.arrayJoin(" ")
    | Var(value)
    | Raw(value) => value
    }
}

module VectorEffect = {
  type t = None | NonScalingStroke | NonScalingSize | NonRotation | FixedPosition | Raw(string)

  let toString = value =>
    switch value {
    | None => "none"
    | NonScalingStroke => "non-scaling-stroke"
    | NonScalingSize => "non-scaling-size"
    | NonRotation => "non-rotation"
    | FixedPosition => "fixed-position"
    | Raw(value) => value
    }
}

module BoxDecorationBreak = {
  type t = Slice | Clone | Var(string) | Raw(string)

  let toString = value =>
    switch value {
    | Slice => "slice"
    | Clone => "clone"
    | Var(value)
    | Raw(value) => value
    }
}

module BreakBetween = {
  type t =
    | Auto
    | Avoid
    | Always
    | All
    | AvoidPage
    | Page
    | Left
    | Right
    | Recto
    | Verso
    | AvoidColumn
    | Column
    | AvoidRegion
    | Region
    | Raw(string)

  let toString = value =>
    switch value {
    | Auto => "auto"
    | Avoid => "avoid"
    | Always => "always"
    | All => "all"
    | AvoidPage => "avoid-page"
    | Page => "page"
    | Left => "left"
    | Right => "right"
    | Recto => "recto"
    | Verso => "verso"
    | AvoidColumn => "avoid-column"
    | Column => "column"
    | AvoidRegion => "avoid-region"
    | Region => "region"
    | Raw(value) => value
    }
}

module BreakInside = {
  type t = Auto | Avoid | AvoidPage | AvoidColumn | AvoidRegion | Raw(string)

  let toString = value =>
    switch value {
    | Auto => "auto"
    | Avoid => "avoid"
    | AvoidPage => "avoid-page"
    | AvoidColumn => "avoid-column"
    | AvoidRegion => "avoid-region"
    | Raw(value) => value
    }
}

module FieldSizing = {
  type t = Fixed | Content | Var(string) | Raw(string)

  let toString = value =>
    switch value {
    | Fixed => "fixed"
    | Content => "content"
    | Var(value)
    | Raw(value) => value
    }
}

module InterpolateSize = {
  type t = NumericOnly | AllowKeywords | Var(string) | Raw(string)

  let toString = value =>
    switch value {
    | NumericOnly => "numeric-only"
    | AllowKeywords => "allow-keywords"
    | Var(value)
    | Raw(value) => value
    }
}

module ContainIntrinsicAxis = {
  type t = None | Length(Length.t) | AutoNone | AutoLength(Length.t) | Var(string) | Raw(string)

  let toString = value =>
    switch value {
    | None => "none"
    | Length(value) => value->Length.toString
    | AutoNone => "auto none"
    | AutoLength(value) => `auto ${value->Length.toString}`
    | Var(value)
    | Raw(value) => value
    }
}
