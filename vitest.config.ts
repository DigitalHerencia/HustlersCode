import { defineConfig } from "vitest/config"
import path from "node:path"

const coverageThresholds = {
  lines: 70,
  functions: 70,
  branches: 60,
  statements: 70,
}

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup/vitest.setup.ts"],
    include: ["tests/unit/**/*.test.ts", "tests/server/**/*.test.ts"],
    exclude: ["tests/e2e/**/*"],
    testTimeout: 10000,
    hookTimeout: 10000,
    retry: process.env.CI ? 2 : 0,
    maxWorkers: process.env.CI ? 1 : undefined,
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "lcov"],
      include: ["lib/utils.ts"],
      exclude: ["**/*.d.ts", "**/*.test.ts"],
      thresholds: coverageThresholds,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
})
