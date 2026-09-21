import * as Css from '../../../../src/Css.res.js';

const globalNested = Css.style(undefined, { custom: [['color', 'red']] });
Css.global('html, body', undefined, {
  selectors: [['a, &.ready', globalNested]],
});

const scopeNested = Css.style(undefined, { custom: [['color', 'blue']] });
Css.scope('.root', undefined, ':scope > h2, :scope > h3', undefined, {
  selectors: [['a, & + p', scopeNested]],
});
