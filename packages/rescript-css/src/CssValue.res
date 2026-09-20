let floatWithUnit = (value, unit) => `${value->Float.toString}${unit}`
let intWithUnit = (value, unit) => `${value->Int.toString}${unit}`
let floatToString = value => value->Float.toString

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
    | Weight(value) => value->Int.toString
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
