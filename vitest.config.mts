import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Next compiles JSX itself; here esbuild's automatic runtime is enough (no extra React plugin needed).
  esbuild: { jsx: "automatic" },
  resolve: { alias: { "@": path.resolve(__dirname, "src"), "@config": path.resolve(__dirname, "site.config.ts") } },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
