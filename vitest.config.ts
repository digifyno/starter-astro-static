import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      'astro:content': fileURLToPath(new URL('./src/__mocks__/astro-content.ts', import.meta.url)),
      'astro/zod': 'zod',
      'astro/loaders': fileURLToPath(new URL('./src/__mocks__/astro-loaders.ts', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.mjs'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts', 'src/**/*.mjs'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.mjs', 'src/env.d.ts'],
      thresholds: {
        statements: 50,
        branches: 50,
        functions: 55,
        lines: 51,
      },
    },
  },
});
