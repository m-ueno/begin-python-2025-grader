import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  base: '/python-grader-client/',  // GitHub Pagesのリポジトリ名に合わせて変更してください
  build: {
    outDir: 'dist'
  },
  optimizeDeps: {
    exclude: ['pyodide']
  }
});
