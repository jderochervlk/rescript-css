import * as CssValue from '../../../../src/CssValue.res.js';

const tagged = (TAG, ...payload) =>
  Object.fromEntries([['TAG', TAG], ...payload.map((value, index) => [`_${index}`, value])]);

const length = (TAG, value) => tagged(TAG, value);
const breadth = (value) => tagged('Breadth', value);
const ok = (result) => {
  if (result.TAG !== 'Ok') throw new Error('Expected a valid structured test value.');
  return result._0;
};
const trackLength = (value) => ok(CssValue.TrackLength.make(value));
const trackFraction = (value) => ok(CssValue.TrackFraction.make(value));
const repeatCount = (value) => ok(CssValue.RepeatCount.make(value));
const linearStop = (output, position) => ok(CssValue.Easing.linearStop(output, position));

const values = [
  CssValue.Color.toString('Transparent'),
  CssValue.Color.toString('CurrentColor'),
  CssValue.Color.toString(tagged('Named', 'rebeccapurple')),
  CssValue.Color.toString(tagged('Hex', '0f766e')),
  CssValue.Color.toString(tagged('Hex', '#fff')),
  CssValue.Color.toString(tagged('Rgb', { red: 255, green: 0, blue: 127.5 })),
  CssValue.Color.toString(tagged('Rgb', { red: 255, green: 0, blue: 0, alpha: 0.5 })),
  CssValue.Color.toString(
    tagged('Hsl', { hue: -30.5, saturation: 80.25, lightness: 45.5, alpha: 0.75 }),
  ),
  CssValue.Color.toString(tagged('Oklch', { lightness: 0.42, chroma: 0.09, hue: 210 })),
  CssValue.Color.toString(tagged('Var', 'var(--tone)')),
  CssValue.Color.toString(tagged('Raw', 'color(display-p3 1 0 0)')),
  CssValue.Time.toString(ok(CssValue.Time.ms(180.5))),
  CssValue.Time.toString(ok(CssValue.Time.seconds(-0.25))),
  CssValue.Time.toString(CssValue.Time.zero),
  CssValue.Time.toString(CssValue.Time.variable('var(--duration)')),
  CssValue.Time.toString(CssValue.Time.raw('calc(1s / 2)')),
  CssValue.Duration.toString(ok(CssValue.Duration.ms(180.5))),
  CssValue.Duration.toString(ok(CssValue.Duration.seconds(0.25))),
  CssValue.Duration.toString(CssValue.Duration.zero),
  CssValue.Duration.toString(CssValue.Duration.variable('var(--duration)')),
  CssValue.Duration.toString(CssValue.Duration.raw('calc(1s / 2)')),
  CssValue.Angle.toString(tagged('Deg', -12.5)),
  CssValue.Angle.toString(tagged('Rad', 1.5708)),
  CssValue.Angle.toString(tagged('Grad', 100.25)),
  CssValue.Angle.toString(tagged('Turn', 0.5)),
  CssValue.Angle.toString('Zero'),
  CssValue.Angle.toString(tagged('Var', 'var(--angle)')),
  CssValue.Angle.toString(tagged('Raw', 'calc(1turn / 8)')),
  CssValue.Easing.toString('Linear'),
  CssValue.Easing.toString('Ease'),
  CssValue.Easing.toString('EaseIn'),
  CssValue.Easing.toString('EaseOut'),
  CssValue.Easing.toString('EaseInOut'),
  CssValue.Easing.toString(ok(CssValue.Easing.cubicBezier(0.2, 0.8, 0.2, 1))),
  ...['JumpStart', 'JumpEnd', 'JumpNone', 'JumpBoth', 'Start', 'End'].map((position) =>
    CssValue.Easing.toString(ok(CssValue.Easing.steps(4, position))),
  ),
  CssValue.Easing.toString(
    ok(CssValue.Easing.linearFunction([linearStop(0), linearStop(0.75, 60), linearStop(1)])),
  ),
  CssValue.Easing.toString(tagged('Var', 'var(--easing)')),
  CssValue.Easing.toString(tagged('Raw', 'linear(0, 1)')),
  CssValue.TrackBreadth.toString('Auto'),
  CssValue.TrackBreadth.toString('MinContent'),
  CssValue.TrackBreadth.toString('MaxContent'),
  CssValue.TrackBreadth.toString(tagged('Fraction', trackFraction(1.5))),
  CssValue.TrackBreadth.toString(tagged('Length', trackLength(length('Rem', 2.25)))),
  CssValue.TrackBreadth.toString(
    tagged(
      'Minmax',
      tagged('MinimumLength', trackLength('Zero')),
      tagged('MaximumFraction', trackFraction(1)),
    ),
  ),
  CssValue.TrackBreadth.toString(tagged('FitContent', trackLength(length('Percent', 50.5)))),
  CssValue.TrackBreadth.toString(tagged('Var', 'var(--track)')),
  CssValue.TrackBreadth.toString(tagged('Raw', 'min(20ch, 40%)')),
  CssValue.TrackList.toString(
    tagged('Tracks', [
      tagged('LineNames', ['start', 'main']),
      breadth(tagged('Fraction', trackFraction(1))),
      tagged('Repeat', repeatCount(3), [
        tagged('RepeatBreadth', tagged('Length', trackLength(length('Px', 12)))),
      ]),
      tagged('AutoRepeat', 'AutoFill', [
        tagged('FixedBreadth', tagged('Length', trackLength(length('Px', 10)))),
      ]),
      tagged('AutoRepeat', 'AutoFit', [
        tagged(
          'FixedBreadth',
          tagged('Minmax', trackLength('Zero'), tagged('MaximumFraction', trackFraction(1))),
        ),
      ]),
    ]),
  ),
  CssValue.TrackList.toString(tagged('Subgrid', [])),
  CssValue.TrackList.toString(tagged('Subgrid', ['row-start', 'row-end'])),
  CssValue.TrackList.toString(tagged('Var', 'var(--tracks)')),
  CssValue.TrackList.toString(tagged('Raw', 'masonry')),
  CssValue.Transform.toString('None'),
  CssValue.Transform.toString(tagged('Translate', length('Rem', -0.5), length('Percent', 25))),
  CssValue.Transform.toString(tagged('TranslateX', length('Px', -1))),
  CssValue.Transform.toString(tagged('TranslateY', 'Zero')),
  CssValue.Transform.toString(
    tagged('Translate3d', length('Px', 1), length('Px', 2), length('Px', 3)),
  ),
  CssValue.Transform.toString(tagged('Scale', 1.25, 0.75)),
  CssValue.Transform.toString(tagged('ScaleUniform', -1.5)),
  CssValue.Transform.toString(tagged('ScaleX', 0.5)),
  CssValue.Transform.toString(tagged('ScaleY', 2)),
  CssValue.Transform.toString(tagged('Scale3d', 1, 0.5, -1)),
  CssValue.Transform.toString(tagged('Rotate', tagged('Deg', -12.5))),
  CssValue.Transform.toString(tagged('RotateX', tagged('Rad', 1.5))),
  CssValue.Transform.toString(tagged('RotateY', tagged('Grad', 100))),
  CssValue.Transform.toString(tagged('RotateZ', tagged('Turn', 0.25))),
  CssValue.Transform.toString(tagged('Rotate3d', 1, 0, 0.5, tagged('Deg', 45))),
  CssValue.Transform.toString(tagged('Skew', tagged('Deg', 10), tagged('Deg', -5.5))),
  CssValue.Transform.toString(tagged('SkewX', tagged('Turn', 0.1))),
  CssValue.Transform.toString(tagged('SkewY', 'Zero')),
  CssValue.Transform.toString(tagged('Perspective', length('Rem', 40.5))),
  CssValue.Transform.toString(tagged('Matrix', 1, 0.2, -0.1, 1, 12.5, -4)),
  CssValue.Transform.toString(
    tagged('Transforms', [
      tagged('TranslateX', length('Px', 2)),
      tagged('Rotate', tagged('Deg', 5)),
    ]),
  ),
  CssValue.Transform.toString(tagged('Var', 'var(--transform)')),
  CssValue.Transform.toString(tagged('Raw', 'translate3d(0, 0, 0)')),
];

const validationResults = [
  CssValue.Duration.ms(-1),
  CssValue.Duration.seconds(Number.POSITIVE_INFINITY),
  CssValue.Time.seconds(Number.NEGATIVE_INFINITY),
  CssValue.Easing.steps(0, 'JumpEnd'),
  CssValue.Easing.steps(1, 'JumpNone'),
  CssValue.Easing.cubicBezier(-0.1, 0, 0.5, 1),
  CssValue.Easing.cubicBezier(0.1, 0, Number.NaN, 1),
  CssValue.Easing.linearStop(Number.NaN, undefined),
  CssValue.Easing.linearStop(0.5, 101),
  CssValue.Easing.linearFunction([linearStop(0)]),
  CssValue.TrackLength.make(length('Rem', -1)),
  CssValue.TrackFraction.make(-1),
  CssValue.RepeatCount.make(0),
  CssValue.TranslateZLength.make(length('Percent', 10)),
  CssValue.BorderLength.make(length('Percent', 10)),
  CssValue.BorderLength.make(length('Px', -1)),
  CssValue.CornerRadius.circular('Auto'),
  CssValue.BorderRadius.single(length('Rem', -1)),
];

export { validationResults, values };
