globalThis[Symbol.for('@jvlk/rescript-css.collector')] = 'stale collector';

import * as Css from '../../../src/Css.res.js';

const button = Css.style(undefined, { custom: [['color', 'red']] });

export { button };
