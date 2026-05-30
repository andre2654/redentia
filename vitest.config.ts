import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url))

// Phase-0 harness: plain Vitest in the node environment, no Nuxt runtime boot.
// The first suites target pure modules (no auto-imports), so this stays fast and
// deterministic. Nuxt path aliases are wired up for future pure-file batches;
// composable/component suites that need the Nuxt runtime can opt in per-file with
// `// @vitest-environment nuxt` once @nuxt/test-utils is added.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.{test,spec}.ts'],
  },
  resolve: {
    alias: {
      '~~': r('./'),
      '@@': r('./'),
      '~': r('./app'),
      '@': r('./app'),
    },
  },
})
