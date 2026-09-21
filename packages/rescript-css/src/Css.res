type conditionalStyle = {
  condition: string,
  style: string,
}

type css = {
  vars?: array<(string, string)>,
  custom?: array<(string, string)>,
  display?: CssValue.Display.t,
  position?: CssValue.Position.t,
  anchorName?: string,
  anchorScope?: string,
  positionAnchor?: string,
  positionArea?: string,
  positionTry?: string,
  positionTryFallbacks?: string,
  positionTryOrder?: CssValue.PositionTryOrder.t,
  positionVisibility?: CssValue.PositionVisibility.t,
  inset?: CssValue.Length.t,
  insetBlock?: CssValue.Length.t,
  insetInline?: CssValue.Length.t,
  insetBlockStart?: CssValue.Length.t,
  insetBlockEnd?: CssValue.Length.t,
  insetInlineStart?: CssValue.Length.t,
  insetInlineEnd?: CssValue.Length.t,
  top?: CssValue.Length.t,
  right?: CssValue.Length.t,
  bottom?: CssValue.Length.t,
  left?: CssValue.Length.t,
  zIndex?: int,
  float?: CssValue.Float.t,
  clear?: CssValue.Clear.t,
  overflow?: CssValue.Overflow.t,
  overflowX?: CssValue.Overflow.t,
  overflowY?: CssValue.Overflow.t,
  visibility?: CssValue.Visibility.t,
  boxSizing?: CssValue.BoxSizing.t,
  width?: CssValue.Length.t,
  minWidth?: CssValue.Length.t,
  maxWidth?: CssValue.Length.t,
  height?: CssValue.Length.t,
  minHeight?: CssValue.Length.t,
  maxHeight?: CssValue.Length.t,
  blockSize?: CssValue.Length.t,
  minBlockSize?: CssValue.Length.t,
  maxBlockSize?: CssValue.Length.t,
  inlineSize?: CssValue.Length.t,
  minInlineSize?: CssValue.Length.t,
  maxInlineSize?: CssValue.Length.t,
  aspectRatio?: string,
  containIntrinsicSize?: string,
  containIntrinsicWidth?: CssValue.ContainIntrinsicAxis.t,
  containIntrinsicHeight?: CssValue.ContainIntrinsicAxis.t,
  containIntrinsicBlockSize?: CssValue.ContainIntrinsicAxis.t,
  containIntrinsicInlineSize?: CssValue.ContainIntrinsicAxis.t,
  margin?: CssValue.Length.t,
  marginTop?: CssValue.Length.t,
  marginRight?: CssValue.Length.t,
  marginBottom?: CssValue.Length.t,
  marginLeft?: CssValue.Length.t,
  marginBlock?: CssValue.Length.t,
  marginBlockStart?: CssValue.Length.t,
  marginBlockEnd?: CssValue.Length.t,
  marginInline?: CssValue.Length.t,
  marginInlineStart?: CssValue.Length.t,
  marginInlineEnd?: CssValue.Length.t,
  padding?: CssValue.Length.t,
  paddingTop?: CssValue.Length.t,
  paddingRight?: CssValue.Length.t,
  paddingBottom?: CssValue.Length.t,
  paddingLeft?: CssValue.Length.t,
  paddingBlock?: CssValue.Length.t,
  paddingBlockStart?: CssValue.Length.t,
  paddingBlockEnd?: CssValue.Length.t,
  paddingInline?: CssValue.Length.t,
  paddingInlineStart?: CssValue.Length.t,
  paddingInlineEnd?: CssValue.Length.t,
  flex?: string,
  flexBasis?: CssValue.Length.t,
  flexDirection?: CssValue.FlexDirection.t,
  flexFlow?: string,
  flexGrow?: float,
  flexShrink?: float,
  flexWrap?: CssValue.FlexWrap.t,
  order?: int,
  alignContent?: CssValue.Alignment.t,
  alignItems?: CssValue.Alignment.t,
  alignSelf?: CssValue.Alignment.t,
  justifyContent?: CssValue.Alignment.t,
  justifyItems?: CssValue.Alignment.t,
  justifySelf?: CssValue.Alignment.t,
  placeContent?: CssValue.Alignment.t,
  placeItems?: CssValue.Alignment.t,
  placeSelf?: CssValue.Alignment.t,
  grid?: string,
  gridArea?: string,
  gridTemplate?: string,
  gridTemplateAreas?: string,
  gridTemplateColumns?: CssValue.TrackList.t,
  gridTemplateRows?: CssValue.TrackList.t,
  gridAutoColumns?: CssValue.AutoTrackList.t,
  gridAutoRows?: CssValue.AutoTrackList.t,
  gridAutoFlow?: CssValue.GridAutoFlow.t,
  gridColumn?: string,
  gridColumnStart?: string,
  gridColumnEnd?: string,
  gridRow?: string,
  gridRowStart?: string,
  gridRowEnd?: string,
  gap?: CssValue.Length.t,
  rowGap?: CssValue.Length.t,
  columnGap?: CssValue.Length.t,
  color?: CssValue.Color.t,
  colorScheme?: string,
  forcedColorAdjust?: CssValue.ForcedColorAdjust.t,
  printColorAdjust?: CssValue.PrintColorAdjust.t,
  font?: string,
  fontFamily?: string,
  fontFeatureSettings?: string,
  fontVariationSettings?: string,
  fontPalette?: string,
  fontSynthesis?: CssValue.FontSynthesis.t,
  fontSizeAdjust?: CssValue.FontSizeAdjust.t,
  fontKerning?: string,
  fontOpticalSizing?: string,
  fontSize?: CssValue.Length.t,
  fontStretch?: string,
  fontStyle?: CssValue.FontStyle.t,
  fontVariant?: string,
  fontWeight?: CssValue.FontWeight.t,
  letterSpacing?: CssValue.Length.t,
  lineHeight?: CssValue.LineHeight.t,
  lineClamp?: CssValue.LineClamp.t,
  textAlign?: CssValue.TextAlign.t,
  textAlignLast?: CssValue.TextAlign.t,
  textDecoration?: string,
  textDecorationColor?: CssValue.Color.t,
  textDecorationLine?: string,
  textDecorationStyle?: string,
  textIndent?: CssValue.Length.t,
  textOverflow?: CssValue.TextOverflow.t,
  textShadow?: string,
  textTransform?: CssValue.TextTransform.t,
  textWrap?: CssValue.TextWrap.t,
  textWrapMode?: CssValue.TextWrapMode.t,
  textWrapStyle?: CssValue.TextWrapStyle.t,
  textEmphasis?: string,
  textOrientation?: CssValue.TextOrientation.t,
  unicodeBidi?: CssValue.UnicodeBidi.t,
  hangingPunctuation?: CssValue.HangingPunctuation.t,
  whiteSpace?: CssValue.WhiteSpace.t,
  wordBreak?: CssValue.WordBreak.t,
  wordSpacing?: CssValue.Length.t,
  overflowWrap?: CssValue.OverflowWrap.t,
  hyphens?: string,
  tabSize?: int,
  verticalAlign?: string,
  writingMode?: CssValue.WritingMode.t,
  direction?: CssValue.Direction.t,
  background?: string,
  backgroundAttachment?: string,
  backgroundBlendMode?: string,
  backgroundClip?: string,
  backgroundColor?: CssValue.Color.t,
  backgroundImage?: string,
  backgroundOrigin?: string,
  backgroundPosition?: string,
  backgroundRepeat?: string,
  backgroundSize?: string,
  border?: string,
  borderTop?: string,
  borderRight?: string,
  borderBottom?: string,
  borderLeft?: string,
  borderBlock?: string,
  borderInline?: string,
  borderBlockStart?: string,
  borderBlockEnd?: string,
  borderInlineStart?: string,
  borderInlineEnd?: string,
  borderColor?: CssValue.Color.t,
  borderBlockColor?: CssValue.Color.t,
  borderBlockStartColor?: CssValue.Color.t,
  borderBlockEndColor?: CssValue.Color.t,
  borderInlineColor?: CssValue.Color.t,
  borderInlineStartColor?: CssValue.Color.t,
  borderInlineEndColor?: CssValue.Color.t,
  borderStyle?: CssValue.BorderStyle.t,
  borderBlockStyle?: CssValue.BorderStyle.t,
  borderBlockStartStyle?: CssValue.BorderStyle.t,
  borderBlockEndStyle?: CssValue.BorderStyle.t,
  borderInlineStyle?: CssValue.BorderStyle.t,
  borderInlineStartStyle?: CssValue.BorderStyle.t,
  borderInlineEndStyle?: CssValue.BorderStyle.t,
  borderWidth?: CssValue.BorderWidth.t,
  borderBlockWidth?: CssValue.LogicalBorderWidth.t,
  borderBlockStartWidth?: CssValue.BorderWidthValue.t,
  borderBlockEndWidth?: CssValue.BorderWidthValue.t,
  borderInlineWidth?: CssValue.LogicalBorderWidth.t,
  borderInlineStartWidth?: CssValue.BorderWidthValue.t,
  borderInlineEndWidth?: CssValue.BorderWidthValue.t,
  borderRadius?: CssValue.BorderRadius.t,
  borderTopLeftRadius?: CssValue.CornerRadius.t,
  borderTopRightRadius?: CssValue.CornerRadius.t,
  borderBottomRightRadius?: CssValue.CornerRadius.t,
  borderBottomLeftRadius?: CssValue.CornerRadius.t,
  borderStartStartRadius?: CssValue.CornerRadius.t,
  borderStartEndRadius?: CssValue.CornerRadius.t,
  borderEndStartRadius?: CssValue.CornerRadius.t,
  borderEndEndRadius?: CssValue.CornerRadius.t,
  outline?: string,
  outlineColor?: CssValue.Color.t,
  outlineStyle?: CssValue.BorderStyle.t,
  outlineWidth?: CssValue.Length.t,
  outlineOffset?: CssValue.Length.t,
  boxShadow?: string,
  opacity?: float,
  filter?: string,
  backdropFilter?: string,
  mixBlendMode?: string,
  isolation?: CssValue.Isolation.t,
  transform?: CssValue.Transform.t,
  translate?: CssValue.Translate.t,
  rotate?: CssValue.Rotate.t,
  scale?: CssValue.Scale.t,
  transformBox?: CssValue.TransformBox.t,
  transformOrigin?: string,
  transformStyle?: string,
  perspective?: CssValue.Length.t,
  perspectiveOrigin?: string,
  backfaceVisibility?: CssValue.Visibility.t,
  clipPath?: string,
  mask?: string,
  viewTransitionName?: string,
  viewTransitionClass?: string,
  animation?: string,
  animationDelay?: CssValue.Time.t,
  animationDirection?: string,
  animationDuration?: CssValue.Duration.t,
  animationFillMode?: string,
  animationIterationCount?: string,
  animationName?: string,
  animationPlayState?: string,
  animationTimingFunction?: CssValue.Easing.t,
  transition?: string,
  transitionDelay?: CssValue.Time.t,
  transitionDuration?: CssValue.Duration.t,
  transitionProperty?: string,
  transitionTimingFunction?: CssValue.Easing.t,
  transitionBehavior?: CssValue.TransitionBehavior.t,
  offset?: string,
  offsetPath?: string,
  offsetDistance?: CssValue.Length.t,
  offsetPosition?: string,
  offsetAnchor?: string,
  offsetRotate?: CssValue.OffsetRotate.t,
  objectFit?: CssValue.ObjectFit.t,
  objectPosition?: string,
  imageRendering?: string,
  listStyle?: string,
  listStyleImage?: string,
  listStylePosition?: CssValue.ListStylePosition.t,
  listStyleType?: string,
  borderCollapse?: CssValue.BorderCollapse.t,
  borderSpacing?: CssValue.Length.t,
  captionSide?: string,
  emptyCells?: string,
  tableLayout?: CssValue.TableLayout.t,
  appearance?: CssValue.Appearance.t,
  accentColor?: CssValue.Color.t,
  caretColor?: CssValue.Color.t,
  cursor?: CssValue.Cursor.t,
  pointerEvents?: CssValue.PointerEvents.t,
  resize?: CssValue.Resize.t,
  userSelect?: CssValue.UserSelect.t,
  touchAction?: string,
  scrollBehavior?: CssValue.ScrollBehavior.t,
  scrollMargin?: CssValue.Length.t,
  scrollMarginTop?: CssValue.Length.t,
  scrollMarginRight?: CssValue.Length.t,
  scrollMarginBottom?: CssValue.Length.t,
  scrollMarginLeft?: CssValue.Length.t,
  scrollMarginBlock?: CssValue.LengthPair.t,
  scrollMarginBlockStart?: CssValue.Length.t,
  scrollMarginBlockEnd?: CssValue.Length.t,
  scrollMarginInline?: CssValue.LengthPair.t,
  scrollMarginInlineStart?: CssValue.Length.t,
  scrollMarginInlineEnd?: CssValue.Length.t,
  scrollPadding?: CssValue.Length.t,
  scrollPaddingTop?: CssValue.Length.t,
  scrollPaddingRight?: CssValue.Length.t,
  scrollPaddingBottom?: CssValue.Length.t,
  scrollPaddingLeft?: CssValue.Length.t,
  scrollPaddingBlock?: CssValue.LengthPair.t,
  scrollPaddingBlockStart?: CssValue.Length.t,
  scrollPaddingBlockEnd?: CssValue.Length.t,
  scrollPaddingInline?: CssValue.LengthPair.t,
  scrollPaddingInlineStart?: CssValue.Length.t,
  scrollPaddingInlineEnd?: CssValue.Length.t,
  scrollSnapAlign?: string,
  scrollSnapStop?: string,
  scrollSnapType?: string,
  overscrollBehavior?: CssValue.OverscrollBehavior.t,
  overscrollBehaviorX?: CssValue.OverscrollBehavior.t,
  overscrollBehaviorY?: CssValue.OverscrollBehavior.t,
  overscrollBehaviorBlock?: CssValue.OverscrollBehavior.t,
  overscrollBehaviorInline?: CssValue.OverscrollBehavior.t,
  scrollbarColor?: string,
  scrollbarWidth?: string,
  willChange?: string,
  columns?: string,
  columnCount?: int,
  columnFill?: string,
  columnRule?: string,
  columnSpan?: string,
  columnWidth?: CssValue.Length.t,
  contain?: string,
  containerName?: string,
  containerType?: string,
  contentVisibility?: string,
  container?: string,
  boxDecorationBreak?: CssValue.BoxDecorationBreak.t,
  breakBefore?: CssValue.BreakBetween.t,
  breakAfter?: CssValue.BreakBetween.t,
  breakInside?: CssValue.BreakInside.t,
  orphans?: int,
  widows?: int,
  shapeOutside?: string,
  shapeMargin?: CssValue.Length.t,
  shapeImageThreshold?: CssValue.Alpha.t,
  fieldSizing?: CssValue.FieldSizing.t,
  interpolateSize?: CssValue.InterpolateSize.t,
  content?: string,
  quotes?: string,
  counterIncrement?: string,
  counterReset?: string,
  fill?: CssValue.Paint.t,
  fillOpacity?: CssValue.Alpha.t,
  fillRule?: CssValue.FillRule.t,
  stroke?: CssValue.Paint.t,
  strokeWidth?: CssValue.Length.t,
  strokeOpacity?: CssValue.Alpha.t,
  strokeLinecap?: CssValue.StrokeLinecap.t,
  strokeLinejoin?: CssValue.StrokeLinejoin.t,
  strokeDasharray?: CssValue.StrokeDasharray.t,
  strokeDashoffset?: CssValue.Length.t,
  strokeMiterlimit?: float,
  paintOrder?: CssValue.PaintOrder.t,
  vectorEffect?: CssValue.VectorEffect.t,
  stopColor?: CssValue.Color.t,
  stopOpacity?: CssValue.Alpha.t,
  h1?: string,
  h2?: string,
  h3?: string,
  h4?: string,
  h5?: string,
  h6?: string,
  p?: string,
  a?: string,
  button?: string,
  input?: string,
  textarea?: string,
  select?: string,
  label?: string,
  img?: string,
  svg?: string,
  ul?: string,
  ol?: string,
  li?: string,
  table?: string,
  thead?: string,
  tbody?: string,
  tr?: string,
  th?: string,
  td?: string,
  div?: string,
  span?: string,
  section?: string,
  article?: string,
  header?: string,
  footer?: string,
  nav?: string,
  main?: string,
  form?: string,
  children?: string,
  hover?: string,
  focus?: string,
  focusVisible?: string,
  focusWithin?: string,
  active?: string,
  disabled?: string,
  checked?: string,
  visited?: string,
  firstChild?: string,
  lastChild?: string,
  before?: string,
  after?: string,
  placeholder?: string,
  selection?: string,
  selectors?: array<(string, string)>,
  media?: array<conditionalStyle>,
  supports?: array<conditionalStyle>,
  containerQueries?: array<conditionalStyle>,
}

type definition = Runtime.definition

let var: string => string = Runtime.var
let registerVars: array<string> => unit = Runtime.registerVars
let register: definition => string = definition => Runtime.style(definition)

let lengthValue = CssValue.Length.toString
let displayValue = CssValue.Display.toString
let intValue = value => value->Int.toString
let floatValue = value => value->Float.toString

let media = (~query, style) => {condition: `@media ${query}`, style}
let supports = (~condition, style) => {condition: `@supports ${condition}`, style}
let container = (~query, style) => {condition: `@container ${query}`, style}
let rgb = CssValue.Color.rgb
let hsl = CssValue.Color.hsl
let oklch = CssValue.Color.oklch
let easingStop = CssValue.Easing.linearStop
let linearEasing = CssValue.Easing.linearFunction
let timeMs = CssValue.Time.ms
let timeSeconds = CssValue.Time.seconds
let timeZero = CssValue.Time.zero
let timeVar = CssValue.Time.variable
let timeRaw = CssValue.Time.raw
let durationMs = CssValue.Duration.ms
let durationSeconds = CssValue.Duration.seconds
let durationZero = CssValue.Duration.zero
let durationVar = CssValue.Duration.variable
let durationRaw = CssValue.Duration.raw
let cubicBezier = CssValue.Easing.cubicBezier
let steps = CssValue.Easing.steps
let trackLength = CssValue.TrackLength.make
let trackFraction = CssValue.TrackFraction.make
let repeatCount = CssValue.RepeatCount.make
let borderLength = CssValue.BorderLength.make
let translateZLength = CssValue.TranslateZLength.make

let mapOptional = (value, serialize) =>
  switch value {
  | Some(value) => Some(serialize(value))
  | None => None
  }

let declarationsFrom = fields =>
  fields->Array.filterMap(((property, value)) =>
    switch value {
    | Some(value) => Some((property, value))
    | None => None
    }
  )

let layoutDeclarations = css =>
  [
    ("display", css.display->mapOptional(CssValue.Display.toString)),
    ("position", css.position->mapOptional(CssValue.Position.toString)),
    ("anchor-name", css.anchorName),
    ("anchor-scope", css.anchorScope),
    ("position-anchor", css.positionAnchor),
    ("position-area", css.positionArea),
    ("position-try", css.positionTry),
    ("position-try-fallbacks", css.positionTryFallbacks),
    ("position-try-order", css.positionTryOrder->mapOptional(CssValue.PositionTryOrder.toString)),
    (
      "position-visibility",
      css.positionVisibility->mapOptional(CssValue.PositionVisibility.toString),
    ),
    ("inset", css.inset->mapOptional(CssValue.Length.toString)),
    ("inset-block", css.insetBlock->mapOptional(CssValue.Length.toString)),
    ("inset-inline", css.insetInline->mapOptional(CssValue.Length.toString)),
    ("inset-block-start", css.insetBlockStart->mapOptional(CssValue.Length.toString)),
    ("inset-block-end", css.insetBlockEnd->mapOptional(CssValue.Length.toString)),
    ("inset-inline-start", css.insetInlineStart->mapOptional(CssValue.Length.toString)),
    ("inset-inline-end", css.insetInlineEnd->mapOptional(CssValue.Length.toString)),
    ("top", css.top->mapOptional(CssValue.Length.toString)),
    ("right", css.right->mapOptional(CssValue.Length.toString)),
    ("bottom", css.bottom->mapOptional(CssValue.Length.toString)),
    ("left", css.left->mapOptional(CssValue.Length.toString)),
    ("z-index", css.zIndex->mapOptional(intValue)),
    ("float", css.float->mapOptional(CssValue.Float.toString)),
    ("clear", css.clear->mapOptional(CssValue.Clear.toString)),
    ("overflow", css.overflow->mapOptional(CssValue.Overflow.toString)),
    ("overflow-x", css.overflowX->mapOptional(CssValue.Overflow.toString)),
    ("overflow-y", css.overflowY->mapOptional(CssValue.Overflow.toString)),
    ("visibility", css.visibility->mapOptional(CssValue.Visibility.toString)),
    ("box-sizing", css.boxSizing->mapOptional(CssValue.BoxSizing.toString)),
  ]->declarationsFrom

let sizeDeclarations = css =>
  [
    ("width", css.width->mapOptional(CssValue.Length.toString)),
    ("min-width", css.minWidth->mapOptional(CssValue.Length.toString)),
    ("max-width", css.maxWidth->mapOptional(CssValue.Length.toString)),
    ("height", css.height->mapOptional(CssValue.Length.toString)),
    ("min-height", css.minHeight->mapOptional(CssValue.Length.toString)),
    ("max-height", css.maxHeight->mapOptional(CssValue.Length.toString)),
    ("block-size", css.blockSize->mapOptional(CssValue.Length.toString)),
    ("min-block-size", css.minBlockSize->mapOptional(CssValue.Length.toString)),
    ("max-block-size", css.maxBlockSize->mapOptional(CssValue.Length.toString)),
    ("inline-size", css.inlineSize->mapOptional(CssValue.Length.toString)),
    ("min-inline-size", css.minInlineSize->mapOptional(CssValue.Length.toString)),
    ("max-inline-size", css.maxInlineSize->mapOptional(CssValue.Length.toString)),
    ("aspect-ratio", css.aspectRatio),
    ("contain-intrinsic-size", css.containIntrinsicSize),
    (
      "contain-intrinsic-width",
      css.containIntrinsicWidth->mapOptional(CssValue.ContainIntrinsicAxis.toString),
    ),
    (
      "contain-intrinsic-height",
      css.containIntrinsicHeight->mapOptional(CssValue.ContainIntrinsicAxis.toString),
    ),
    (
      "contain-intrinsic-block-size",
      css.containIntrinsicBlockSize->mapOptional(CssValue.ContainIntrinsicAxis.toString),
    ),
    (
      "contain-intrinsic-inline-size",
      css.containIntrinsicInlineSize->mapOptional(CssValue.ContainIntrinsicAxis.toString),
    ),
  ]->declarationsFrom

let marginDeclarations = css =>
  [
    ("margin", css.margin->mapOptional(CssValue.Length.toString)),
    ("margin-top", css.marginTop->mapOptional(CssValue.Length.toString)),
    ("margin-right", css.marginRight->mapOptional(CssValue.Length.toString)),
    ("margin-bottom", css.marginBottom->mapOptional(CssValue.Length.toString)),
    ("margin-left", css.marginLeft->mapOptional(CssValue.Length.toString)),
    ("margin-block", css.marginBlock->mapOptional(CssValue.Length.toString)),
    ("margin-block-start", css.marginBlockStart->mapOptional(CssValue.Length.toString)),
    ("margin-block-end", css.marginBlockEnd->mapOptional(CssValue.Length.toString)),
    ("margin-inline", css.marginInline->mapOptional(CssValue.Length.toString)),
    ("margin-inline-start", css.marginInlineStart->mapOptional(CssValue.Length.toString)),
    ("margin-inline-end", css.marginInlineEnd->mapOptional(CssValue.Length.toString)),
  ]->declarationsFrom

let paddingDeclarations = css =>
  [
    ("padding", css.padding->mapOptional(CssValue.Length.toString)),
    ("padding-top", css.paddingTop->mapOptional(CssValue.Length.toString)),
    ("padding-right", css.paddingRight->mapOptional(CssValue.Length.toString)),
    ("padding-bottom", css.paddingBottom->mapOptional(CssValue.Length.toString)),
    ("padding-left", css.paddingLeft->mapOptional(CssValue.Length.toString)),
    ("padding-block", css.paddingBlock->mapOptional(CssValue.Length.toString)),
    ("padding-block-start", css.paddingBlockStart->mapOptional(CssValue.Length.toString)),
    ("padding-block-end", css.paddingBlockEnd->mapOptional(CssValue.Length.toString)),
    ("padding-inline", css.paddingInline->mapOptional(CssValue.Length.toString)),
    ("padding-inline-start", css.paddingInlineStart->mapOptional(CssValue.Length.toString)),
    ("padding-inline-end", css.paddingInlineEnd->mapOptional(CssValue.Length.toString)),
  ]->declarationsFrom

let flexDeclarations = css =>
  [
    ("flex", css.flex),
    ("flex-basis", css.flexBasis->mapOptional(CssValue.Length.toString)),
    ("flex-direction", css.flexDirection->mapOptional(CssValue.FlexDirection.toString)),
    ("flex-flow", css.flexFlow),
    ("flex-grow", css.flexGrow->mapOptional(floatValue)),
    ("flex-shrink", css.flexShrink->mapOptional(floatValue)),
    ("flex-wrap", css.flexWrap->mapOptional(CssValue.FlexWrap.toString)),
    ("order", css.order->mapOptional(intValue)),
    ("align-content", css.alignContent->mapOptional(CssValue.Alignment.toString)),
    ("align-items", css.alignItems->mapOptional(CssValue.Alignment.toString)),
    ("align-self", css.alignSelf->mapOptional(CssValue.Alignment.toString)),
    ("justify-content", css.justifyContent->mapOptional(CssValue.Alignment.toString)),
    ("justify-items", css.justifyItems->mapOptional(CssValue.Alignment.toString)),
    ("justify-self", css.justifySelf->mapOptional(CssValue.Alignment.toString)),
    ("place-content", css.placeContent->mapOptional(CssValue.Alignment.toString)),
    ("place-items", css.placeItems->mapOptional(CssValue.Alignment.toString)),
    ("place-self", css.placeSelf->mapOptional(CssValue.Alignment.toString)),
  ]->declarationsFrom

let gridDeclarations = css =>
  [
    ("grid", css.grid),
    ("grid-area", css.gridArea),
    ("grid-template", css.gridTemplate),
    ("grid-template-areas", css.gridTemplateAreas),
    ("grid-template-columns", css.gridTemplateColumns->mapOptional(CssValue.TrackList.toString)),
    ("grid-template-rows", css.gridTemplateRows->mapOptional(CssValue.TrackList.toString)),
    ("grid-auto-columns", css.gridAutoColumns->mapOptional(CssValue.AutoTrackList.toString)),
    ("grid-auto-rows", css.gridAutoRows->mapOptional(CssValue.AutoTrackList.toString)),
    ("grid-auto-flow", css.gridAutoFlow->mapOptional(CssValue.GridAutoFlow.toString)),
    ("grid-column", css.gridColumn),
    ("grid-column-start", css.gridColumnStart),
    ("grid-column-end", css.gridColumnEnd),
    ("grid-row", css.gridRow),
    ("grid-row-start", css.gridRowStart),
    ("grid-row-end", css.gridRowEnd),
    ("gap", css.gap->mapOptional(CssValue.Length.toString)),
    ("row-gap", css.rowGap->mapOptional(CssValue.Length.toString)),
    ("column-gap", css.columnGap->mapOptional(CssValue.Length.toString)),
  ]->declarationsFrom

let fontDeclarations = css =>
  [
    ("color", css.color->mapOptional(CssValue.Color.toString)),
    ("color-scheme", css.colorScheme),
    (
      "forced-color-adjust",
      css.forcedColorAdjust->mapOptional(CssValue.ForcedColorAdjust.toString),
    ),
    ("print-color-adjust", css.printColorAdjust->mapOptional(CssValue.PrintColorAdjust.toString)),
    ("font", css.font),
    ("font-family", css.fontFamily),
    ("font-feature-settings", css.fontFeatureSettings),
    ("font-variation-settings", css.fontVariationSettings),
    ("font-palette", css.fontPalette),
    ("font-synthesis", css.fontSynthesis->mapOptional(CssValue.FontSynthesis.toString)),
    ("font-size-adjust", css.fontSizeAdjust->mapOptional(CssValue.FontSizeAdjust.toString)),
    ("font-kerning", css.fontKerning),
    ("font-optical-sizing", css.fontOpticalSizing),
    ("font-size", css.fontSize->mapOptional(CssValue.Length.toString)),
    ("font-stretch", css.fontStretch),
    ("font-style", css.fontStyle->mapOptional(CssValue.FontStyle.toString)),
    ("font-variant", css.fontVariant),
    ("font-weight", css.fontWeight->mapOptional(CssValue.FontWeight.toString)),
    ("letter-spacing", css.letterSpacing->mapOptional(CssValue.Length.toString)),
    ("line-height", css.lineHeight->mapOptional(CssValue.LineHeight.toString)),
    ("line-clamp", css.lineClamp->mapOptional(CssValue.LineClamp.toString)),
  ]->declarationsFrom

let textDeclarations = css =>
  [
    ("text-align", css.textAlign->mapOptional(CssValue.TextAlign.toString)),
    ("text-align-last", css.textAlignLast->mapOptional(CssValue.TextAlign.toString)),
    ("text-decoration", css.textDecoration),
    ("text-decoration-color", css.textDecorationColor->mapOptional(CssValue.Color.toString)),
    ("text-decoration-line", css.textDecorationLine),
    ("text-decoration-style", css.textDecorationStyle),
    ("text-indent", css.textIndent->mapOptional(CssValue.Length.toString)),
    ("text-overflow", css.textOverflow->mapOptional(CssValue.TextOverflow.toString)),
    ("text-shadow", css.textShadow),
    ("text-transform", css.textTransform->mapOptional(CssValue.TextTransform.toString)),
    ("text-wrap", css.textWrap->mapOptional(CssValue.TextWrap.toString)),
    ("text-wrap-mode", css.textWrapMode->mapOptional(CssValue.TextWrapMode.toString)),
    ("text-wrap-style", css.textWrapStyle->mapOptional(CssValue.TextWrapStyle.toString)),
    ("text-emphasis", css.textEmphasis),
    ("text-orientation", css.textOrientation->mapOptional(CssValue.TextOrientation.toString)),
    ("unicode-bidi", css.unicodeBidi->mapOptional(CssValue.UnicodeBidi.toString)),
    (
      "hanging-punctuation",
      css.hangingPunctuation->mapOptional(CssValue.HangingPunctuation.toString),
    ),
    ("white-space", css.whiteSpace->mapOptional(CssValue.WhiteSpace.toString)),
    ("word-break", css.wordBreak->mapOptional(CssValue.WordBreak.toString)),
    ("word-spacing", css.wordSpacing->mapOptional(CssValue.Length.toString)),
    ("overflow-wrap", css.overflowWrap->mapOptional(CssValue.OverflowWrap.toString)),
    ("hyphens", css.hyphens),
    ("tab-size", css.tabSize->mapOptional(intValue)),
    ("vertical-align", css.verticalAlign),
    ("writing-mode", css.writingMode->mapOptional(CssValue.WritingMode.toString)),
    ("direction", css.direction->mapOptional(CssValue.Direction.toString)),
  ]->declarationsFrom

let backgroundDeclarations = css =>
  [
    ("background", css.background),
    ("background-attachment", css.backgroundAttachment),
    ("background-blend-mode", css.backgroundBlendMode),
    ("background-clip", css.backgroundClip),
    ("background-color", css.backgroundColor->mapOptional(CssValue.Color.toString)),
    ("background-image", css.backgroundImage),
    ("background-origin", css.backgroundOrigin),
    ("background-position", css.backgroundPosition),
    ("background-repeat", css.backgroundRepeat),
    ("background-size", css.backgroundSize),
  ]->declarationsFrom

let borderDeclarations = css =>
  [
    ("border", css.border),
    ("border-top", css.borderTop),
    ("border-right", css.borderRight),
    ("border-bottom", css.borderBottom),
    ("border-left", css.borderLeft),
    ("border-block", css.borderBlock),
    ("border-inline", css.borderInline),
    ("border-block-start", css.borderBlockStart),
    ("border-block-end", css.borderBlockEnd),
    ("border-inline-start", css.borderInlineStart),
    ("border-inline-end", css.borderInlineEnd),
    ("border-color", css.borderColor->mapOptional(CssValue.Color.toString)),
    ("border-block-color", css.borderBlockColor->mapOptional(CssValue.Color.toString)),
    ("border-block-start-color", css.borderBlockStartColor->mapOptional(CssValue.Color.toString)),
    ("border-block-end-color", css.borderBlockEndColor->mapOptional(CssValue.Color.toString)),
    ("border-inline-color", css.borderInlineColor->mapOptional(CssValue.Color.toString)),
    ("border-inline-start-color", css.borderInlineStartColor->mapOptional(CssValue.Color.toString)),
    ("border-inline-end-color", css.borderInlineEndColor->mapOptional(CssValue.Color.toString)),
    ("border-style", css.borderStyle->mapOptional(CssValue.BorderStyle.toString)),
    ("border-block-style", css.borderBlockStyle->mapOptional(CssValue.BorderStyle.toString)),
    (
      "border-block-start-style",
      css.borderBlockStartStyle->mapOptional(CssValue.BorderStyle.toString),
    ),
    ("border-block-end-style", css.borderBlockEndStyle->mapOptional(CssValue.BorderStyle.toString)),
    ("border-inline-style", css.borderInlineStyle->mapOptional(CssValue.BorderStyle.toString)),
    (
      "border-inline-start-style",
      css.borderInlineStartStyle->mapOptional(CssValue.BorderStyle.toString),
    ),
    (
      "border-inline-end-style",
      css.borderInlineEndStyle->mapOptional(CssValue.BorderStyle.toString),
    ),
    ("border-width", css.borderWidth->mapOptional(CssValue.BorderWidth.toString)),
    ("border-block-width", css.borderBlockWidth->mapOptional(CssValue.LogicalBorderWidth.toString)),
    (
      "border-block-start-width",
      css.borderBlockStartWidth->mapOptional(CssValue.BorderWidthValue.toString),
    ),
    (
      "border-block-end-width",
      css.borderBlockEndWidth->mapOptional(CssValue.BorderWidthValue.toString),
    ),
    (
      "border-inline-width",
      css.borderInlineWidth->mapOptional(CssValue.LogicalBorderWidth.toString),
    ),
    (
      "border-inline-start-width",
      css.borderInlineStartWidth->mapOptional(CssValue.BorderWidthValue.toString),
    ),
    (
      "border-inline-end-width",
      css.borderInlineEndWidth->mapOptional(CssValue.BorderWidthValue.toString),
    ),
    ("border-radius", css.borderRadius->mapOptional(CssValue.BorderRadius.toString)),
    (
      "border-top-left-radius",
      css.borderTopLeftRadius->mapOptional(CssValue.CornerRadius.toString),
    ),
    (
      "border-top-right-radius",
      css.borderTopRightRadius->mapOptional(CssValue.CornerRadius.toString),
    ),
    (
      "border-bottom-right-radius",
      css.borderBottomRightRadius->mapOptional(CssValue.CornerRadius.toString),
    ),
    (
      "border-bottom-left-radius",
      css.borderBottomLeftRadius->mapOptional(CssValue.CornerRadius.toString),
    ),
    (
      "border-start-start-radius",
      css.borderStartStartRadius->mapOptional(CssValue.CornerRadius.toString),
    ),
    (
      "border-start-end-radius",
      css.borderStartEndRadius->mapOptional(CssValue.CornerRadius.toString),
    ),
    (
      "border-end-start-radius",
      css.borderEndStartRadius->mapOptional(CssValue.CornerRadius.toString),
    ),
    ("border-end-end-radius", css.borderEndEndRadius->mapOptional(CssValue.CornerRadius.toString)),
    ("outline", css.outline),
    ("outline-color", css.outlineColor->mapOptional(CssValue.Color.toString)),
    ("outline-style", css.outlineStyle->mapOptional(CssValue.BorderStyle.toString)),
    ("outline-width", css.outlineWidth->mapOptional(CssValue.Length.toString)),
    ("outline-offset", css.outlineOffset->mapOptional(CssValue.Length.toString)),
  ]->declarationsFrom

let effectDeclarations = css =>
  [
    ("box-shadow", css.boxShadow),
    ("opacity", css.opacity->mapOptional(floatValue)),
    ("filter", css.filter),
    ("backdrop-filter", css.backdropFilter),
    ("mix-blend-mode", css.mixBlendMode),
    ("isolation", css.isolation->mapOptional(CssValue.Isolation.toString)),
    ("transform", css.transform->mapOptional(CssValue.Transform.toString)),
    ("translate", css.translate->mapOptional(CssValue.Translate.toString)),
    ("rotate", css.rotate->mapOptional(CssValue.Rotate.toString)),
    ("scale", css.scale->mapOptional(CssValue.Scale.toString)),
    ("transform-box", css.transformBox->mapOptional(CssValue.TransformBox.toString)),
    ("transform-origin", css.transformOrigin),
    ("transform-style", css.transformStyle),
    ("perspective", css.perspective->mapOptional(CssValue.Length.toString)),
    ("perspective-origin", css.perspectiveOrigin),
    ("backface-visibility", css.backfaceVisibility->mapOptional(CssValue.Visibility.toString)),
    ("clip-path", css.clipPath),
    ("mask", css.mask),
    ("view-transition-name", css.viewTransitionName),
    ("view-transition-class", css.viewTransitionClass),
  ]->declarationsFrom

let motionDeclarations = css =>
  [
    ("animation", css.animation),
    ("animation-delay", css.animationDelay->mapOptional(CssValue.Time.toString)),
    ("animation-direction", css.animationDirection),
    ("animation-duration", css.animationDuration->mapOptional(CssValue.Duration.toString)),
    ("animation-fill-mode", css.animationFillMode),
    ("animation-iteration-count", css.animationIterationCount),
    ("animation-name", css.animationName),
    ("animation-play-state", css.animationPlayState),
    (
      "animation-timing-function",
      css.animationTimingFunction->mapOptional(CssValue.Easing.toString),
    ),
    ("transition", css.transition),
    ("transition-delay", css.transitionDelay->mapOptional(CssValue.Time.toString)),
    ("transition-duration", css.transitionDuration->mapOptional(CssValue.Duration.toString)),
    ("transition-property", css.transitionProperty),
    (
      "transition-timing-function",
      css.transitionTimingFunction->mapOptional(CssValue.Easing.toString),
    ),
    (
      "transition-behavior",
      css.transitionBehavior->mapOptional(CssValue.TransitionBehavior.toString),
    ),
    ("offset", css.offset),
    ("offset-path", css.offsetPath),
    ("offset-distance", css.offsetDistance->mapOptional(CssValue.Length.toString)),
    ("offset-position", css.offsetPosition),
    ("offset-anchor", css.offsetAnchor),
    ("offset-rotate", css.offsetRotate->mapOptional(CssValue.OffsetRotate.toString)),
  ]->declarationsFrom

let contentDeclarations = css =>
  [
    ("object-fit", css.objectFit->mapOptional(CssValue.ObjectFit.toString)),
    ("object-position", css.objectPosition),
    ("image-rendering", css.imageRendering),
    ("list-style", css.listStyle),
    ("list-style-image", css.listStyleImage),
    (
      "list-style-position",
      css.listStylePosition->mapOptional(CssValue.ListStylePosition.toString),
    ),
    ("list-style-type", css.listStyleType),
    ("border-collapse", css.borderCollapse->mapOptional(CssValue.BorderCollapse.toString)),
    ("border-spacing", css.borderSpacing->mapOptional(CssValue.Length.toString)),
    ("caption-side", css.captionSide),
    ("empty-cells", css.emptyCells),
    ("table-layout", css.tableLayout->mapOptional(CssValue.TableLayout.toString)),
    ("content", css.content),
    ("quotes", css.quotes),
    ("counter-increment", css.counterIncrement),
    ("counter-reset", css.counterReset),
    ("fill", css.fill->mapOptional(CssValue.Paint.toString)),
    ("fill-opacity", css.fillOpacity->mapOptional(CssValue.Alpha.toString)),
    ("fill-rule", css.fillRule->mapOptional(CssValue.FillRule.toString)),
    ("stroke", css.stroke->mapOptional(CssValue.Paint.toString)),
    ("stroke-width", css.strokeWidth->mapOptional(CssValue.Length.toString)),
    ("stroke-opacity", css.strokeOpacity->mapOptional(CssValue.Alpha.toString)),
    ("stroke-linecap", css.strokeLinecap->mapOptional(CssValue.StrokeLinecap.toString)),
    ("stroke-linejoin", css.strokeLinejoin->mapOptional(CssValue.StrokeLinejoin.toString)),
    ("stroke-dasharray", css.strokeDasharray->mapOptional(CssValue.StrokeDasharray.toString)),
    ("stroke-dashoffset", css.strokeDashoffset->mapOptional(CssValue.Length.toString)),
    ("stroke-miterlimit", css.strokeMiterlimit->mapOptional(floatValue)),
    ("paint-order", css.paintOrder->mapOptional(CssValue.PaintOrder.toString)),
    ("vector-effect", css.vectorEffect->mapOptional(CssValue.VectorEffect.toString)),
    ("stop-color", css.stopColor->mapOptional(CssValue.Color.toString)),
    ("stop-opacity", css.stopOpacity->mapOptional(CssValue.Alpha.toString)),
  ]->declarationsFrom

let interactionDeclarations = css =>
  [
    ("appearance", css.appearance->mapOptional(CssValue.Appearance.toString)),
    ("accent-color", css.accentColor->mapOptional(CssValue.Color.toString)),
    ("caret-color", css.caretColor->mapOptional(CssValue.Color.toString)),
    ("cursor", css.cursor->mapOptional(CssValue.Cursor.toString)),
    ("pointer-events", css.pointerEvents->mapOptional(CssValue.PointerEvents.toString)),
    ("resize", css.resize->mapOptional(CssValue.Resize.toString)),
    ("user-select", css.userSelect->mapOptional(CssValue.UserSelect.toString)),
    ("touch-action", css.touchAction),
    ("scroll-behavior", css.scrollBehavior->mapOptional(CssValue.ScrollBehavior.toString)),
    ("scroll-margin", css.scrollMargin->mapOptional(CssValue.Length.toString)),
    ("scroll-margin-top", css.scrollMarginTop->mapOptional(CssValue.Length.toString)),
    ("scroll-margin-right", css.scrollMarginRight->mapOptional(CssValue.Length.toString)),
    ("scroll-margin-bottom", css.scrollMarginBottom->mapOptional(CssValue.Length.toString)),
    ("scroll-margin-left", css.scrollMarginLeft->mapOptional(CssValue.Length.toString)),
    ("scroll-margin-block", css.scrollMarginBlock->mapOptional(CssValue.LengthPair.toString)),
    (
      "scroll-margin-block-start",
      css.scrollMarginBlockStart->mapOptional(CssValue.Length.toString),
    ),
    ("scroll-margin-block-end", css.scrollMarginBlockEnd->mapOptional(CssValue.Length.toString)),
    ("scroll-margin-inline", css.scrollMarginInline->mapOptional(CssValue.LengthPair.toString)),
    (
      "scroll-margin-inline-start",
      css.scrollMarginInlineStart->mapOptional(CssValue.Length.toString),
    ),
    ("scroll-margin-inline-end", css.scrollMarginInlineEnd->mapOptional(CssValue.Length.toString)),
    ("scroll-padding", css.scrollPadding->mapOptional(CssValue.Length.toString)),
    ("scroll-padding-top", css.scrollPaddingTop->mapOptional(CssValue.Length.toString)),
    ("scroll-padding-right", css.scrollPaddingRight->mapOptional(CssValue.Length.toString)),
    ("scroll-padding-bottom", css.scrollPaddingBottom->mapOptional(CssValue.Length.toString)),
    ("scroll-padding-left", css.scrollPaddingLeft->mapOptional(CssValue.Length.toString)),
    ("scroll-padding-block", css.scrollPaddingBlock->mapOptional(CssValue.LengthPair.toString)),
    (
      "scroll-padding-block-start",
      css.scrollPaddingBlockStart->mapOptional(CssValue.Length.toString),
    ),
    ("scroll-padding-block-end", css.scrollPaddingBlockEnd->mapOptional(CssValue.Length.toString)),
    ("scroll-padding-inline", css.scrollPaddingInline->mapOptional(CssValue.LengthPair.toString)),
    (
      "scroll-padding-inline-start",
      css.scrollPaddingInlineStart->mapOptional(CssValue.Length.toString),
    ),
    (
      "scroll-padding-inline-end",
      css.scrollPaddingInlineEnd->mapOptional(CssValue.Length.toString),
    ),
    ("scroll-snap-align", css.scrollSnapAlign),
    ("scroll-snap-stop", css.scrollSnapStop),
    ("scroll-snap-type", css.scrollSnapType),
    (
      "overscroll-behavior",
      css.overscrollBehavior->mapOptional(CssValue.OverscrollBehavior.toString),
    ),
    (
      "overscroll-behavior-x",
      css.overscrollBehaviorX->mapOptional(CssValue.OverscrollBehavior.toString),
    ),
    (
      "overscroll-behavior-y",
      css.overscrollBehaviorY->mapOptional(CssValue.OverscrollBehavior.toString),
    ),
    (
      "overscroll-behavior-block",
      css.overscrollBehaviorBlock->mapOptional(CssValue.OverscrollBehavior.toString),
    ),
    (
      "overscroll-behavior-inline",
      css.overscrollBehaviorInline->mapOptional(CssValue.OverscrollBehavior.toString),
    ),
    ("scrollbar-color", css.scrollbarColor),
    ("scrollbar-width", css.scrollbarWidth),
    ("will-change", css.willChange),
  ]->declarationsFrom

let columnDeclarations = css =>
  [
    ("columns", css.columns),
    ("column-count", css.columnCount->mapOptional(intValue)),
    ("column-fill", css.columnFill),
    ("column-rule", css.columnRule),
    ("column-span", css.columnSpan),
    ("column-width", css.columnWidth->mapOptional(CssValue.Length.toString)),
    ("contain", css.contain),
    ("container-name", css.containerName),
    ("container-type", css.containerType),
    ("content-visibility", css.contentVisibility),
    ("container", css.container),
    (
      "box-decoration-break",
      css.boxDecorationBreak->mapOptional(CssValue.BoxDecorationBreak.toString),
    ),
    ("break-before", css.breakBefore->mapOptional(CssValue.BreakBetween.toString)),
    ("break-after", css.breakAfter->mapOptional(CssValue.BreakBetween.toString)),
    ("break-inside", css.breakInside->mapOptional(CssValue.BreakInside.toString)),
    ("orphans", css.orphans->mapOptional(intValue)),
    ("widows", css.widows->mapOptional(intValue)),
    ("shape-outside", css.shapeOutside),
    ("shape-margin", css.shapeMargin->mapOptional(CssValue.Length.toString)),
    ("shape-image-threshold", css.shapeImageThreshold->mapOptional(CssValue.Alpha.toString)),
    ("field-sizing", css.fieldSizing->mapOptional(CssValue.FieldSizing.toString)),
    ("interpolate-size", css.interpolateSize->mapOptional(CssValue.InterpolateSize.toString)),
  ]->declarationsFrom

let declarationsFor = css =>
  layoutDeclarations(css)
  ->Array.concat(sizeDeclarations(css))
  ->Array.concat(marginDeclarations(css))
  ->Array.concat(paddingDeclarations(css))
  ->Array.concat(flexDeclarations(css))
  ->Array.concat(gridDeclarations(css))
  ->Array.concat(fontDeclarations(css))
  ->Array.concat(textDeclarations(css))
  ->Array.concat(backgroundDeclarations(css))
  ->Array.concat(borderDeclarations(css))
  ->Array.concat(effectDeclarations(css))
  ->Array.concat(motionDeclarations(css))
  ->Array.concat(contentDeclarations(css))
  ->Array.concat(interactionDeclarations(css))
  ->Array.concat(columnDeclarations(css))
  ->Array.concat(
    switch css.custom {
    | Some(declarations) => declarations
    | None => []
    },
  )

let conditionsFor = conditions =>
  switch conditions {
  | Some(conditions) => conditions->Array.map(({condition, style}) => (condition, style))
  | None => []
  }

let nestedFor = css =>
  [
    ("h1", css.h1),
    ("h2", css.h2),
    ("h3", css.h3),
    ("h4", css.h4),
    ("h5", css.h5),
    ("h6", css.h6),
    ("p", css.p),
    ("a", css.a),
    ("button", css.button),
    ("input", css.input),
    ("textarea", css.textarea),
    ("select", css.select),
    ("label", css.label),
    ("img", css.img),
    ("svg", css.svg),
    ("ul", css.ul),
    ("ol", css.ol),
    ("li", css.li),
    ("table", css.table),
    ("thead", css.thead),
    ("tbody", css.tbody),
    ("tr", css.tr),
    ("th", css.th),
    ("td", css.td),
    ("div", css.div),
    ("span", css.span),
    ("section", css.section),
    ("article", css.article),
    ("header", css.header),
    ("footer", css.footer),
    ("nav", css.nav),
    ("main", css.main),
    ("form", css.form),
    ("> *", css.children),
    ("&:hover", css.hover),
    ("&:focus", css.focus),
    ("&:focus-visible", css.focusVisible),
    ("&:focus-within", css.focusWithin),
    ("&:active", css.active),
    ("&:disabled", css.disabled),
    ("&:checked", css.checked),
    ("&:visited", css.visited),
    ("&:first-child", css.firstChild),
    ("&:last-child", css.lastChild),
    ("&::before", css.before),
    ("&::after", css.after),
    ("&::placeholder", css.placeholder),
    ("&::selection", css.selection),
  ]
  ->Array.filterMap(((selector, className)) =>
    switch className {
    | Some(className) => Some((selector, className))
    | None => None
    }
  )
  ->Array.concat(
    switch css.selectors {
    | Some(selectors) => selectors
    | None => []
    },
  )
  ->Array.concat(conditionsFor(css.media))
  ->Array.concat(conditionsFor(css.supports))
  ->Array.concat(conditionsFor(css.containerQueries))

let definitionFor = (css: css): definition => {
  let vars = switch css.vars {
  | Some(value) => value
  | None => []
  }

  {
    vars,
    declarations: declarationsFor(css),
    nested: nestedFor(css),
  }
}

type layer = Runtime.layer

let namedLayer = Runtime.namedLayer

let anonymousLayer = Runtime.anonymousLayer

let layerOrder = Runtime.layerOrder

let style = (~layer=Runtime.unlayeredLayer, css: css) => Runtime.style(~layer, definitionFor(css))

let global = (~selector, ~layer=Runtime.unlayeredLayer, css: css) =>
  Runtime.global(~layer, selector, definitionFor(css))

let frame = (~at, css: css) => Runtime.frame(~at, definitionFor(css))

let keyframes = (~layer=Runtime.unlayeredLayer, frames) => Runtime.keyframes(~layer, frames)

type fontSource = CssFont.source
type fontFaceDescriptors = CssFont.descriptors

let fontSource = CssFont.fontSource

let localFontSource = CssFont.localFontSource

let fontFace = (~layer=Runtime.unlayeredLayer, descriptors: fontFaceDescriptors) =>
  switch CssFont.serialize(descriptors) {
  | Ok({family, cssText}) => Runtime.fontFace(~layer, family, cssText)
  | Error(error) =>
    JsError.throwWithMessage(`@jvlk/rescript-css: ${CssFont.validationMessage(error)}`)
  }

type propertyDescriptors = {
  name: string,
  syntax: string,
  inherits: bool,
  initialValue: string,
}

let registerProperty = (~layer=Runtime.unlayeredLayer, descriptors: propertyDescriptors) =>
  Runtime.registerProperty(
    ~layer,
    ~name=descriptors.name,
    ~syntax=descriptors.syntax,
    ~inherits=descriptors.inherits,
    ~initialValue=descriptors.initialValue,
  )

let scope = (~root, ~limit=?, ~selector, ~layer=Runtime.unlayeredLayer, css: css) =>
  Runtime.scope(~layer, ~root, ~limit?, ~selector, definitionFor(css))

let page = (~selector=?, ~layer=Runtime.unlayeredLayer, descriptors) =>
  Runtime.page(~layer, ~selector?, descriptors)

let class = style
