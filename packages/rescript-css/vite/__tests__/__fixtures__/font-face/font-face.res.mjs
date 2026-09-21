import * as Css from '../../../../src/Css.res.js';

Css.fontFace(undefined, {
  family: 'Inter "Display"\\Alt',
  src: [
    Css.localFontSource('Inter "Local"\\Alt'),
    Css.fontSource('/fonts/inter"variable\\alt.woff2', 'woff2"test\\kind', [
      'variations',
      'color-COLRv1',
    ]),
  ],
  style: 'Normal',
  weight: '100 900',
  stretch: '75% 125%',
  display: 'Swap',
  unicodeRange: 'U+0000-00FF, U+0131',
  featureSettings: '"liga" 1, "kern" 0',
  variationSettings: '"wght" 650, "wdth" 110',
  ascentOverride: '90%',
  descentOverride: '20%',
  lineGapOverride: '0%',
  sizeAdjust: '105%',
});

Css.fontFace(undefined, {
  family: 'Inter "Display"\\Alt',
  src: [Css.fontSource('/fonts/inter-italic.woff2', 'woff2')],
  style: 'Italic',
  weight: '100 900',
  display: 'Fallback',
});
