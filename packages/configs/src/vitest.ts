import react from "@vitejs/plugin-react";
import { existsSync } from "fs";
import tsConfigPaths from "vite-plugin-tsconfig-paths";
import { configDefaults, defineConfig } from "vitest/config";

const vitestConfig = defineConfig({
  plugins: [react(), tsConfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.ts?(x)", "src/**/*.test.*"],
    exclude: [
      ...configDefaults.exclude,
      "**/test-utils.ts",
      "./tests/setup.ts",
    ],
    setupFiles: existsSync("./tests/setup.ts") ? "./tests/setup.ts" : undefined,
    coverage: {
      include: ["src/**/*"],
      exclude: ["**/*.d.ts", "**/*.test.*", "**/*.stories.tsx"],
    },
  },
});

export default vitestConfig;
