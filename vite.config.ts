import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  base: '/push-chromatic-coach/',
  plugins: [svelte()],
  test: { environment: 'node' },
});
