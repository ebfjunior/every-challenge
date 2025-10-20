import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(new URL(".", import.meta.url)));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.join(rootDir, "src"),
      "@prisma": path.join(rootDir, "prisma"),
      "@tests": path.join(rootDir, "tests"),
    },
  },
  test: {
    environment: "node",
  },
});
