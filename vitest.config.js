import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 120000,
    include: ['test/**/*.{js,ts}'],
  },
  resolve: {
    alias: {
      '#(.*)': new URL('./node_modules/$1', import.meta.url).pathname
    }
  }
})