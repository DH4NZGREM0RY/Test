import { defineConfig } from 'vitest/config';

/**
 * Vitest configuration.
 * - Unit + integration tests run against temp SQLite DBs (see tests/helpers/test-db.ts).
 * - Rendering tests need @napi-rs/canvas which is a native module — keep them in node env.
 * - Generous timeout: better-sqlite3 migrations and canvas renders are synchronous-heavy.
 */
export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'data'],
    pool: 'forks', // native modules (canvas, better-sqlite3) misbehave in worker threads
    testTimeout: 30_000,
    hookTimeout: 30_000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts'],
    },
    setupFiles: [],
  },
});
