/**
 * Vite + Vitest configuration.
 *
 * `base` is '/' because Vercel serves from the domain root rather than a
 * repository subpath, and the static build lands in `dist/`, the directory Vercel
 * publishes.
 *
 * The `test` block keeps a single source of truth for the Vitest environment:
 * jsdom, globals enabled (tsconfig declares `vitest/globals`), and the shared
 * setup file that installs jest-dom matchers plus the controllable
 * `window.matchMedia` stub used by the motion-preference and viewport tests.
 */
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
});
