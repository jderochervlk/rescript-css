import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { rescriptCss } from '@jvlk/rescript-css/vite';

const exampleRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [rescriptCss()],
  root: exampleRoot,
});
