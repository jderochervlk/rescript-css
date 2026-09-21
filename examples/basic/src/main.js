import './GlobalStyles.res.js';
import './StructuredValues.res.js';
import './AdvancedRules.res.js';
import { html } from './Button.res.js';
import { html as cardHtml } from './Card.res.js';

document.querySelector('#app').innerHTML = `${html}${cardHtml}`;
