import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const pluginEntry = fileURLToPath(new URL('./vite/vite-plugin.ts', import.meta.url));

export default defineConfig({
  build: {
    lib: {
      entry: pluginEntry,
      formats: ['es'],
      fileName: 'vite',
    },
    rollupOptions: {
      external: ['vite', /^node:/u],
    },
  },
});
