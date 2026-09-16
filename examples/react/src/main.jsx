import { createRoot } from 'react-dom/client';
import { make as App } from './App.res.js';

const app = document.querySelector('#app');

if (app !== null) {
  createRoot(app).render(<App />);
}
