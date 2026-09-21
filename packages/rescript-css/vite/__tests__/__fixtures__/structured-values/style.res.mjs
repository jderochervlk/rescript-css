import * as Css from '../../../../src/Css.res.js';

Css.style(undefined, {
  gridTemplateColumns: {
    TAG: 'Tracks',
    _0: [
      { TAG: 'LineNames', _0: ['main-start'] },
      {
        TAG: 'AutoRepeat',
        _0: 'AutoFit',
        _1: [
          {
            TAG: 'FixedBreadth',
            _0: {
              TAG: 'Minmax',
              _0: { TAG: 'Rem', _0: 12 },
              _1: { TAG: 'MaximumFraction', _0: 1 },
            },
          },
        ],
      },
      { TAG: 'LineNames', _0: ['main-end'] },
    ],
  },
  color: { TAG: 'Oklch', _0: { lightness: 0.42, chroma: 0.09, hue: 210 } },
  backgroundColor: { TAG: 'Hex', _0: 'f8fafc' },
  transform: {
    TAG: 'Transforms',
    _0: [
      { TAG: 'TranslateY', _0: { TAG: 'Px', _0: -1 } },
      { TAG: 'Rotate', _0: { TAG: 'Deg', _0: 2.5 } },
    ],
  },
  animationDelay: { TAG: 'S', _0: -0.25 },
  animationDuration: { TAG: 'Ms', _0: 180.5 },
  animationTimingFunction: {
    TAG: 'CubicBezier',
    _0: { x1: 0.2, y1: 0.8, x2: 0.2, y2: 1 },
  },
});
