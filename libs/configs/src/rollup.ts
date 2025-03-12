/* eslint-disable import/no-anonymous-default-export */

import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import fg from "fast-glob";
// @ts-ignore
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import preserveDirectives from "rollup-plugin-preserve-directives";
import { typescriptPaths } from "rollup-plugin-typescript-paths";
import type { RollupOptions, Plugin } from "rollup";

const rollup: RollupOptions = {
  input: fg.sync(["./src/**/*.{ts,tsx}", "!**/*.stories.*", "!**/*.test.*"]),
  output: [
    {
      format: "esm",
      preserveModules: true,
      preserveModulesRoot: "./src",
      dir: "./esm",
      sourcemap: true,
      entryFileNames: "[name].js",
    },
  ],
  plugins: [
    typescript({
      jsx: "react",
      compilerOptions: {
        declaration: true,
        outDir: "./esm",
        rootDir: "./src",
        incremental: false,
        jsx: "react-jsx",
        sourceMap: true,
      },
      exclude: ["**/*.stories.*", "**/*.test.*"],
    }),
    resolve(),
    typescriptPaths(),
    peerDepsExternal({
      includeDependencies: true,
    }),
    preserveDirectives(),
  ],
  onwarn: (warning, warn) => {
    if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
    warn(warning);
  },
  logLevel: "warn",
};

export default rollup;
export { rollup };
