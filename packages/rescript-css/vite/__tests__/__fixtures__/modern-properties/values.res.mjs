import * as CssValue from '../../../../src/CssValue.res.js';

const tagged = (TAG, ...payload) =>
  Object.fromEntries([['TAG', TAG], ...payload.map((value, index) => [`_${index}`, value])]);
const px = (value) => tagged('Px', value);
const rem = (value) => tagged('Rem', value);
const deg = (value) => tagged('Deg', value);
const cases = [];
const add = (serializer, values) => {
  for (const [value, expected] of values) cases.push([serializer(value), expected]);
};

add(CssValue.ForcedColorAdjust.toString, [
  ['Auto', 'auto'],
  ['None', 'none'],
  ['PreserveParentColor', 'preserve-parent-color'],
  [tagged('Var', 'var(--forced)'), 'var(--forced)'],
  [tagged('Raw', 'revert-layer'), 'revert-layer'],
]);
add(CssValue.PrintColorAdjust.toString, [
  ['Economy', 'economy'],
  ['Exact', 'exact'],
  [tagged('Var', 'var(--print)'), 'var(--print)'],
  [tagged('Raw', 'revert-layer'), 'revert-layer'],
]);
add(CssValue.TextWrap.toString, [
  ['Wrap', 'wrap'],
  ['NoWrap', 'nowrap'],
  ['Balance', 'balance'],
  ['Pretty', 'pretty'],
  ['Stable', 'stable'],
  [tagged('Var', 'var(--wrap)'), 'var(--wrap)'],
  [tagged('Raw', 'wrap pretty'), 'wrap pretty'],
]);
add(CssValue.TextWrapMode.toString, [
  ['Wrap', 'wrap'],
  ['NoWrap', 'nowrap'],
  [tagged('Var', 'var(--wrap-mode)'), 'var(--wrap-mode)'],
  [tagged('Raw', 'revert-layer'), 'revert-layer'],
]);
add(CssValue.TextWrapStyle.toString, [
  ['Auto', 'auto'],
  ['Balance', 'balance'],
  ['Stable', 'stable'],
  ['Pretty', 'pretty'],
  ['AvoidShortLastLine', 'avoid-short-last-line'],
  [tagged('Var', 'var(--wrap-style)'), 'var(--wrap-style)'],
  [tagged('Raw', 'revert-layer'), 'revert-layer'],
]);
add(CssValue.TextOrientation.toString, [
  ['Mixed', 'mixed'],
  ['Upright', 'upright'],
  ['Sideways', 'sideways'],
  [tagged('Var', 'var(--orientation)'), 'var(--orientation)'],
  [tagged('Raw', 'sideways-right'), 'sideways-right'],
]);
add(CssValue.UnicodeBidi.toString, [
  ['Normal', 'normal'],
  ['Embed', 'embed'],
  ['Isolate', 'isolate'],
  ['BidiOverride', 'bidi-override'],
  ['IsolateOverride', 'isolate-override'],
  ['Plaintext', 'plaintext'],
  [tagged('Raw', 'revert-layer'), 'revert-layer'],
]);
add(CssValue.LineClamp.toString, [
  ['None', 'none'],
  [tagged('Lines', 3), '3'],
  [tagged('Var', 'var(--lines)'), 'var(--lines)'],
  [tagged('Raw', '3 "…"'), '3 "…"'],
]);
add(CssValue.FontSynthesis.toString, [
  ['None', 'none'],
  [
    tagged('Values', ['Weight', 'Style', 'SmallCaps', 'Position']),
    'weight style small-caps position',
  ],
  [tagged('Var', 'var(--synthesis)'), 'var(--synthesis)'],
  [tagged('Raw', 'weight'), 'weight'],
]);
add(CssValue.FontSizeAdjust.toString, [
  ['None', 'none'],
  [tagged('Number', 0.5), '0.5'],
  ['FromFont', 'from-font'],
  [tagged('Metric', 'ExHeight', 0.5), 'ex-height 0.5'],
  [tagged('Metric', 'CapHeight', 0.6), 'cap-height 0.6'],
  [tagged('Metric', 'ChWidth', 0.7), 'ch-width 0.7'],
  [tagged('Metric', 'IcWidth', 0.8), 'ic-width 0.8'],
  [tagged('Metric', 'IcHeight', 0.9), 'ic-height 0.9'],
  [tagged('MetricFromFont', 'CapHeight'), 'cap-height from-font'],
  [tagged('Var', 'var(--adjust)'), 'var(--adjust)'],
  [tagged('Raw', '0.52'), '0.52'],
]);
add(CssValue.HangingPunctuation.toString, [
  ['None', 'none'],
  [tagged('Values', ['First', 'Last', 'ForceEnd', 'AllowEnd']), 'first last force-end allow-end'],
  [tagged('Var', 'var(--hanging)'), 'var(--hanging)'],
  [tagged('Raw', 'first'), 'first'],
]);
add(CssValue.OverscrollBehavior.toString, [
  ['Auto', 'auto'],
  ['Contain', 'contain'],
  ['None', 'none'],
  [tagged('Var', 'var(--overscroll)'), 'var(--overscroll)'],
  [tagged('Raw', 'revert-layer'), 'revert-layer'],
]);
add(CssValue.TransformBox.toString, [
  ['ContentBox', 'content-box'],
  ['BorderBox', 'border-box'],
  ['FillBox', 'fill-box'],
  ['StrokeBox', 'stroke-box'],
  ['ViewBox', 'view-box'],
  [tagged('Raw', 'revert-layer'), 'revert-layer'],
]);
add(CssValue.Translate.toString, [
  ['None', 'none'],
  [tagged('X', rem(1)), '1rem'],
  [tagged('XY', rem(1), tagged('Percent', 20)), '1rem 20%'],
  [tagged('XYZ', px(1), px(2), px(3)), '1px 2px 3px'],
  [tagged('Var', 'var(--translate)'), 'var(--translate)'],
  [tagged('Raw', 'calc(1rem + 1px)'), 'calc(1rem + 1px)'],
]);
add(CssValue.Rotate.toString, [
  ['None', 'none'],
  [tagged('Angle', deg(45)), '45deg'],
  [tagged('X', deg(10)), 'x 10deg'],
  [tagged('Y', deg(20)), 'y 20deg'],
  [tagged('Z', deg(30)), 'z 30deg'],
  [tagged('Axis', 1, 0.5, -1, deg(40)), '1 0.5 -1 40deg'],
  [tagged('Var', 'var(--rotate)'), 'var(--rotate)'],
  [tagged('Raw', 'z 0.5turn'), 'z 0.5turn'],
]);
add(CssValue.Scale.toString, [
  ['None', 'none'],
  [tagged('Uniform', tagged('Number', 1.2)), '1.2'],
  [tagged('XY', tagged('Number', 1.2), tagged('Percent', 80)), '1.2 80%'],
  [tagged('XYZ', tagged('Number', 1), tagged('Percent', 50), tagged('Number', -1)), '1 50% -1'],
  [tagged('Var', 'var(--scale)'), 'var(--scale)'],
  [tagged('Raw', 'calc(1 + 0.1)'), 'calc(1 + 0.1)'],
]);
add(CssValue.LengthPair.toString, [
  [tagged('One', rem(1)), '1rem'],
  [tagged('Two', rem(1), px(2)), '1rem 2px'],
  [tagged('Var', 'var(--logical-spacing)'), 'var(--logical-spacing)'],
  [tagged('Raw', '1rem calc(2rem + 1px)'), '1rem calc(2rem + 1px)'],
]);
add(CssValue.BorderWidthValue.toString, [
  ['Thin', 'thin'],
  ['Medium', 'medium'],
  ['Thick', 'thick'],
  [tagged('Length', px(2)), '2px'],
  [tagged('Var', 'var(--border-width)'), 'var(--border-width)'],
  [tagged('Raw', 'calc(1px + 0.1rem)'), 'calc(1px + 0.1rem)'],
]);
add(CssValue.LogicalBorderWidth.toString, [
  [tagged('One', 'Thin'), 'thin'],
  [tagged('Two', 'Thin', tagged('Length', px(2))), 'thin 2px'],
  [tagged('Raw', '1px var(--border-width)'), '1px var(--border-width)'],
]);
add(CssValue.BorderWidth.toString, [
  [tagged('One', 'Thin'), 'thin'],
  [tagged('Two', 'Thin', 'Medium'), 'thin medium'],
  [tagged('Three', 'Thin', 'Medium', 'Thick'), 'thin medium thick'],
  [tagged('Four', 'Thin', 'Medium', 'Thick', tagged('Length', px(4))), 'thin medium thick 4px'],
  [tagged('Raw', '1px 2px'), '1px 2px'],
]);
add(CssValue.CornerRadius.toString, [
  [tagged('Circular', rem(1)), '1rem'],
  [tagged('Elliptical', rem(1), tagged('Percent', 50)), '1rem 50%'],
  [tagged('Var', 'var(--corner-radius)'), 'var(--corner-radius)'],
  [tagged('Raw', 'calc(1rem + 1px)'), 'calc(1rem + 1px)'],
]);
add(CssValue.BorderRadius.toString, [
  [tagged('Circular', tagged('One', rem(1))), '1rem'],
  [
    tagged(
      'Elliptical',
      tagged('Two', rem(1), rem(2)),
      tagged(
        'Four',
        tagged('Percent', 10),
        tagged('Percent', 20),
        tagged('Percent', 30),
        tagged('Percent', 40),
      ),
    ),
    '1rem 2rem / 10% 20% 30% 40%',
  ],
  [tagged('Var', 'var(--border-radius)'), 'var(--border-radius)'],
  [tagged('Raw', '1rem / 50%'), '1rem / 50%'],
]);
add(CssValue.OffsetRotate.toString, [
  ['Auto', 'auto'],
  [tagged('AutoAngle', deg(45)), 'auto 45deg'],
  ['Reverse', 'reverse'],
  [tagged('ReverseAngle', deg(-10)), 'reverse -10deg'],
  [tagged('Angle', deg(20)), '20deg'],
  [tagged('Var', 'var(--offset-rotate)'), 'var(--offset-rotate)'],
  [tagged('Raw', 'auto 0.5turn'), 'auto 0.5turn'],
]);
add(CssValue.TransitionBehavior.toString, [
  ['Normal', 'normal'],
  ['AllowDiscrete', 'allow-discrete'],
  [tagged('Var', 'var(--behavior)'), 'var(--behavior)'],
  [tagged('Raw', 'revert-layer'), 'revert-layer'],
]);
add(CssValue.PositionTryOrder.toString, [
  ['Normal', 'normal'],
  ['MostWidth', 'most-width'],
  ['MostHeight', 'most-height'],
  ['MostBlockSize', 'most-block-size'],
  ['MostInlineSize', 'most-inline-size'],
  [tagged('Raw', 'revert-layer'), 'revert-layer'],
]);
add(CssValue.PositionVisibility.toString, [
  ['Always', 'always'],
  [
    tagged('Conditions', ['AnchorValid', 'AnchorVisible', 'NoOverflow']),
    'anchor-valid anchor-visible no-overflow',
  ],
  [tagged('Var', 'var(--visibility)'), 'var(--visibility)'],
  [tagged('Raw', 'anchor-visible'), 'anchor-visible'],
]);
add(CssValue.Alpha.toString, [
  [tagged('Number', 0.6), '0.6'],
  [tagged('Percent', 75), '75%'],
  [tagged('Var', 'var(--alpha)'), 'var(--alpha)'],
  [tagged('Raw', 'calc(1 / 2)'), 'calc(1 / 2)'],
]);
add(CssValue.Paint.toString, [
  ['None', 'none'],
  [tagged('Color', tagged('Hex', '336699')), '#336699'],
  ['ContextFill', 'context-fill'],
  ['ContextStroke', 'context-stroke'],
  [tagged('Url', '#gradient'), 'url(#gradient)'],
  [tagged('Var', 'var(--paint)'), 'var(--paint)'],
  [tagged('Raw', 'url(#paint) red'), 'url(#paint) red'],
]);
add(CssValue.FillRule.toString, [
  ['Nonzero', 'nonzero'],
  ['Evenodd', 'evenodd'],
  [tagged('Var', 'var(--rule)'), 'var(--rule)'],
  [tagged('Raw', 'revert-layer'), 'revert-layer'],
]);
add(CssValue.StrokeLinecap.toString, [
  ['Butt', 'butt'],
  ['Round', 'round'],
  ['Square', 'square'],
  [tagged('Var', 'var(--cap)'), 'var(--cap)'],
  [tagged('Raw', 'revert-layer'), 'revert-layer'],
]);
add(CssValue.StrokeLinejoin.toString, [
  ['Arcs', 'arcs'],
  ['Bevel', 'bevel'],
  ['Miter', 'miter'],
  ['MiterClip', 'miter-clip'],
  ['Round', 'round'],
  [tagged('Var', 'var(--join)'), 'var(--join)'],
  [tagged('Raw', 'revert-layer'), 'revert-layer'],
]);
add(CssValue.StrokeDasharray.toString, [
  ['None', 'none'],
  [tagged('Values', [px(4), px(2)]), '4px 2px'],
  [tagged('Var', 'var(--dash)'), 'var(--dash)'],
  [tagged('Raw', '4 2'), '4 2'],
]);
add(CssValue.PaintOrder.toString, [
  ['Normal', 'normal'],
  [tagged('Values', ['Fill', 'Stroke', 'Markers']), 'fill stroke markers'],
  [tagged('Var', 'var(--order)'), 'var(--order)'],
  [tagged('Raw', 'stroke'), 'stroke'],
]);
add(CssValue.VectorEffect.toString, [
  ['None', 'none'],
  ['NonScalingStroke', 'non-scaling-stroke'],
  ['NonScalingSize', 'non-scaling-size'],
  ['NonRotation', 'non-rotation'],
  ['FixedPosition', 'fixed-position'],
  [tagged('Raw', 'revert-layer'), 'revert-layer'],
]);
add(CssValue.BoxDecorationBreak.toString, [
  ['Slice', 'slice'],
  ['Clone', 'clone'],
  [tagged('Var', 'var(--decoration)'), 'var(--decoration)'],
  [tagged('Raw', 'revert-layer'), 'revert-layer'],
]);
add(CssValue.BreakBetween.toString, [
  ['Auto', 'auto'],
  ['Avoid', 'avoid'],
  ['Always', 'always'],
  ['All', 'all'],
  ['AvoidPage', 'avoid-page'],
  ['Page', 'page'],
  ['Left', 'left'],
  ['Right', 'right'],
  ['Recto', 'recto'],
  ['Verso', 'verso'],
  ['AvoidColumn', 'avoid-column'],
  ['Column', 'column'],
  ['AvoidRegion', 'avoid-region'],
  ['Region', 'region'],
  [tagged('Raw', 'revert-layer'), 'revert-layer'],
]);
add(CssValue.BreakInside.toString, [
  ['Auto', 'auto'],
  ['Avoid', 'avoid'],
  ['AvoidPage', 'avoid-page'],
  ['AvoidColumn', 'avoid-column'],
  ['AvoidRegion', 'avoid-region'],
  [tagged('Raw', 'revert-layer'), 'revert-layer'],
]);
add(CssValue.FieldSizing.toString, [
  ['Fixed', 'fixed'],
  ['Content', 'content'],
  [tagged('Var', 'var(--field)'), 'var(--field)'],
  [tagged('Raw', 'revert-layer'), 'revert-layer'],
]);
add(CssValue.InterpolateSize.toString, [
  ['NumericOnly', 'numeric-only'],
  ['AllowKeywords', 'allow-keywords'],
  [tagged('Var', 'var(--interpolate)'), 'var(--interpolate)'],
  [tagged('Raw', 'revert-layer'), 'revert-layer'],
]);
add(CssValue.ContainIntrinsicAxis.toString, [
  ['None', 'none'],
  [tagged('Length', rem(18)), '18rem'],
  ['AutoNone', 'auto none'],
  [tagged('AutoLength', rem(20)), 'auto 20rem'],
  [tagged('Var', 'var(--intrinsic)'), 'var(--intrinsic)'],
  [tagged('Raw', 'auto 300px'), 'auto 300px'],
]);

export { cases };
