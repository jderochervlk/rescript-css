import * as Css from '../../../../src/Css.res.js';

Css.layerOrder(['tokens', 'base']);

const tone = Css.$$var('teal');
Css.registerVars([tone]);

Css.registerProperty(Css.namedLayer('tokens'), {
  name: '--progress',
  syntax: '<number> | "auto"',
  inherits: false,
  initialValue: '0',
});

Css.scope(
  '.article:is(main, aside)',
  '.comments[data-state="open"]',
  ':scope > h2',
  Css.namedLayer('base'),
  {
    color: { TAG: 'Var', _0: tone },
    a: Css.style(undefined, { color: { TAG: 'Named', _0: 'rebeccapurple' } }),
    media: [Css.media('(width >= 48rem)', Css.style(undefined, { fontFamily: 'serif' }))],
  },
);

Css.page(undefined, undefined, [
  ['size', 'A4'],
  ['margin', '2cm'],
]);

Css.page('invoice:first', Css.namedLayer('base'), [
  ['page-orientation', 'upright'],
  ['marks', 'crop cross'],
]);

const card = Css.style(undefined, { background: 'white' });
Css.global('body', undefined, { color: { TAG: 'Named', _0: 'black' } });

export { tone, card };
