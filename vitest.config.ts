import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@mychoice/domain": resolve(__dirname, "packages/domain/src/index.ts"),
      "@mychoice/governance-engine": resolve(__dirname, "packages/governance-engine/src/index.ts"),
      "@mychoice/parser": resolve(__dirname, "packages/parser/src/index.ts"),
    },
  },
  test: { include: ["packages/**/*.test.ts"] },
});
