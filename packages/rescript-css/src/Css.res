type conditionalStyle = {
  condition: string,
  style: string,
}

type css = {
  vars?: array<(string, string)>,
  custom?: array<(string, string)>,
  display?: CssValue.Display.t,
  position?: CssValue.Position.t,
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
  gridTemplateColumns?: string,
  gridTemplateRows?: string,
  gridAutoColumns?: string,
  gridAutoRows?: string,
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
  color?: string,
  font?: string,
  fontFamily?: string,
  fontFeatureSettings?: string,
  fontKerning?: string,
  fontOpticalSizing?: string,
  fontSize?: CssValue.Length.t,
  fontStretch?: string,
  fontStyle?: CssValue.FontStyle.t,
  fontVariant?: string,
  fontWeight?: CssValue.FontWeight.t,
  letterSpacing?: CssValue.Length.t,
  lineHeight?: CssValue.LineHeight.t,
  textAlign?: CssValue.TextAlign.t,
  textAlignLast?: CssValue.TextAlign.t,
  textDecoration?: string,
  textDecorationColor?: string,
  textDecorationLine?: string,
  textDecorationStyle?: string,
  textIndent?: CssValue.Length.t,
  textOverflow?: CssValue.TextOverflow.t,
  textShadow?: string,
  textTransform?: CssValue.TextTransform.t,
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
  backgroundColor?: string,
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
  borderColor?: string,
  borderStyle?: CssValue.BorderStyle.t,
  borderWidth?: CssValue.Length.t,
  borderRadius?: CssValue.Length.t,
  borderTopLeftRadius?: CssValue.Length.t,
  borderTopRightRadius?: CssValue.Length.t,
  borderBottomRightRadius?: CssValue.Length.t,
  borderBottomLeftRadius?: CssValue.Length.t,
  outline?: string,
  outlineColor?: string,
  outlineStyle?: CssValue.BorderStyle.t,
  outlineWidth?: CssValue.Length.t,
  outlineOffset?: CssValue.Length.t,
  boxShadow?: string,
  opacity?: float,
  filter?: string,
  backdropFilter?: string,
  mixBlendMode?: string,
  isolation?: CssValue.Isolation.t,
  transform?: string,
  transformOrigin?: string,
  transformStyle?: string,
  perspective?: CssValue.Length.t,
  perspectiveOrigin?: string,
  backfaceVisibility?: CssValue.Visibility.t,
  clipPath?: string,
  mask?: string,
  animation?: string,
  animationDelay?: string,
  animationDirection?: string,
  animationDuration?: string,
  animationFillMode?: string,
  animationIterationCount?: string,
  animationName?: string,
  animationPlayState?: string,
  animationTimingFunction?: string,
  transition?: string,
  transitionDelay?: string,
  transitionDuration?: string,
  transitionProperty?: string,
  transitionTimingFunction?: string,
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
  accentColor?: string,
  caretColor?: string,
  cursor?: CssValue.Cursor.t,
  pointerEvents?: CssValue.PointerEvents.t,
  resize?: CssValue.Resize.t,
  userSelect?: CssValue.UserSelect.t,
  touchAction?: string,
  scrollBehavior?: CssValue.ScrollBehavior.t,
  scrollMargin?: CssValue.Length.t,
  scrollPadding?: CssValue.Length.t,
  scrollSnapAlign?: string,
  scrollSnapStop?: string,
  scrollSnapType?: string,
  overscrollBehavior?: string,
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
  content?: string,
  quotes?: string,
  counterIncrement?: string,
  counterReset?: string,
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
let register: definition => string = Runtime.style

let lengthValue = CssValue.Length.toString
let displayValue = CssValue.Display.toString
let intValue = value => value->Int.toString
let floatValue = value => value->Float.toString

let media = (~query, style) => {condition: `@media ${query}`, style}
let supports = (~condition, style) => {condition: `@supports ${condition}`, style}
let container = (~query, style) => {condition: `@container ${query}`, style}

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
    ("grid-template-columns", css.gridTemplateColumns),
    ("grid-template-rows", css.gridTemplateRows),
    ("grid-auto-columns", css.gridAutoColumns),
    ("grid-auto-rows", css.gridAutoRows),
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
    ("color", css.color),
    ("font", css.font),
    ("font-family", css.fontFamily),
    ("font-feature-settings", css.fontFeatureSettings),
    ("font-kerning", css.fontKerning),
    ("font-optical-sizing", css.fontOpticalSizing),
    ("font-size", css.fontSize->mapOptional(CssValue.Length.toString)),
    ("font-stretch", css.fontStretch),
    ("font-style", css.fontStyle->mapOptional(CssValue.FontStyle.toString)),
    ("font-variant", css.fontVariant),
    ("font-weight", css.fontWeight->mapOptional(CssValue.FontWeight.toString)),
    ("letter-spacing", css.letterSpacing->mapOptional(CssValue.Length.toString)),
    ("line-height", css.lineHeight->mapOptional(CssValue.LineHeight.toString)),
  ]->declarationsFrom

let textDeclarations = css =>
  [
    ("text-align", css.textAlign->mapOptional(CssValue.TextAlign.toString)),
    ("text-align-last", css.textAlignLast->mapOptional(CssValue.TextAlign.toString)),
    ("text-decoration", css.textDecoration),
    ("text-decoration-color", css.textDecorationColor),
    ("text-decoration-line", css.textDecorationLine),
    ("text-decoration-style", css.textDecorationStyle),
    ("text-indent", css.textIndent->mapOptional(CssValue.Length.toString)),
    ("text-overflow", css.textOverflow->mapOptional(CssValue.TextOverflow.toString)),
    ("text-shadow", css.textShadow),
    ("text-transform", css.textTransform->mapOptional(CssValue.TextTransform.toString)),
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
    ("background-color", css.backgroundColor),
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
    ("border-color", css.borderColor),
    ("border-style", css.borderStyle->mapOptional(CssValue.BorderStyle.toString)),
    ("border-width", css.borderWidth->mapOptional(CssValue.Length.toString)),
    ("border-radius", css.borderRadius->mapOptional(CssValue.Length.toString)),
    ("border-top-left-radius", css.borderTopLeftRadius->mapOptional(CssValue.Length.toString)),
    ("border-top-right-radius", css.borderTopRightRadius->mapOptional(CssValue.Length.toString)),
    (
      "border-bottom-right-radius",
      css.borderBottomRightRadius->mapOptional(CssValue.Length.toString),
    ),
    (
      "border-bottom-left-radius",
      css.borderBottomLeftRadius->mapOptional(CssValue.Length.toString),
    ),
    ("outline", css.outline),
    ("outline-color", css.outlineColor),
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
    ("transform", css.transform),
    ("transform-origin", css.transformOrigin),
    ("transform-style", css.transformStyle),
    ("perspective", css.perspective->mapOptional(CssValue.Length.toString)),
    ("perspective-origin", css.perspectiveOrigin),
    ("backface-visibility", css.backfaceVisibility->mapOptional(CssValue.Visibility.toString)),
    ("clip-path", css.clipPath),
    ("mask", css.mask),
  ]->declarationsFrom

let motionDeclarations = css =>
  [
    ("animation", css.animation),
    ("animation-delay", css.animationDelay),
    ("animation-direction", css.animationDirection),
    ("animation-duration", css.animationDuration),
    ("animation-fill-mode", css.animationFillMode),
    ("animation-iteration-count", css.animationIterationCount),
    ("animation-name", css.animationName),
    ("animation-play-state", css.animationPlayState),
    ("animation-timing-function", css.animationTimingFunction),
    ("transition", css.transition),
    ("transition-delay", css.transitionDelay),
    ("transition-duration", css.transitionDuration),
    ("transition-property", css.transitionProperty),
    ("transition-timing-function", css.transitionTimingFunction),
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
  ]->declarationsFrom

let interactionDeclarations = css =>
  [
    ("appearance", css.appearance->mapOptional(CssValue.Appearance.toString)),
    ("accent-color", css.accentColor),
    ("caret-color", css.caretColor),
    ("cursor", css.cursor->mapOptional(CssValue.Cursor.toString)),
    ("pointer-events", css.pointerEvents->mapOptional(CssValue.PointerEvents.toString)),
    ("resize", css.resize->mapOptional(CssValue.Resize.toString)),
    ("user-select", css.userSelect->mapOptional(CssValue.UserSelect.toString)),
    ("touch-action", css.touchAction),
    ("scroll-behavior", css.scrollBehavior->mapOptional(CssValue.ScrollBehavior.toString)),
    ("scroll-margin", css.scrollMargin->mapOptional(CssValue.Length.toString)),
    ("scroll-padding", css.scrollPadding->mapOptional(CssValue.Length.toString)),
    ("scroll-snap-align", css.scrollSnapAlign),
    ("scroll-snap-stop", css.scrollSnapStop),
    ("scroll-snap-type", css.scrollSnapType),
    ("overscroll-behavior", css.overscrollBehavior),
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

let style = (css: css) => {
  let vars = switch css.vars {
  | Some(value) => value
  | None => []
  }

  register({
    vars,
    declarations: declarationsFor(css),
    nested: nestedFor(css),
  })
}

let class = style
