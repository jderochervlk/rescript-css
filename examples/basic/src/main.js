import { html } from './Button.res.js';
import { html as cardHtml } from './Card.res.js';

document.querySelector('#app').innerHTML = `${html}${cardHtml}`;
