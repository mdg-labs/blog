import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    include: ["vitest/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "astro:content": path.resolve(root, "vitest/mocks/astro-content.ts"),
      "astro/loaders": path.resolve(root, "vitest/mocks/astro-loaders.ts"),
    },
  },
});
