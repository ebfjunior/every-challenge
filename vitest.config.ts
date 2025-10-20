import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

const aliasMap = {
  "@/": `${path.join(rootDir, "src")}/`,
  "@prisma/": `${path.join(rootDir, "prisma")}/`,
};

export default defineConfig({
  resolve: {
    alias: aliasMap,
  },
  test: {
    environment: "node",
  },
});
