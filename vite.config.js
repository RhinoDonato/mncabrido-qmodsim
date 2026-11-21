import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        lab: resolve(import.meta.dirname, 'lab.html'),
        concepts: resolve(import.meta.dirname, 'concepts.html'),
        guides: resolve(import.meta.dirname, 'guides.html'),
        about: resolve(import.meta.dirname, 'about.html'),
      },
    },
  },
});
