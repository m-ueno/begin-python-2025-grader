import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  base: '/begin-python-2025-grader/',
  build: {
    outDir: 'dist'
  },
  optimizeDeps: {
    exclude: ['pyodide']
  }
});
