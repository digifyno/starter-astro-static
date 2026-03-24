import { defineConfig } from 'vitest/config';

export default defineConfig({
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
        statements: 21,
        branches: 23,
        functions: 20,
        lines: 21,
      },
    },
  },
});
