/* eslint-disable import/no-anonymous-default-export */

import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import fg from "fast-glob";
// @ts-ignore
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
import preserveDirectives from "rollup-plugin-preserve-directives";
import { typescriptPaths } from "rollup-plugin-typescript-paths";

/** @type {import('rollup').RollupOptions} */
export default {
  input: fg.sync([
    "./src/**/*.{ts,tsx,css}",
    "!**/*.stories.*",
    "!**/*.test.*",
  ]),
  output: [
    {
      format: "esm",
      preserveModules: true,
      preserveModulesRoot: "./src",
      dir: "./esm",
      sourcemap: true,
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
    postcss({ extract: true }),
    renameStyleFilePlugin("styles.css"),
  ],
  onwarn: (warning, warn) => {
    if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
    warn(warning);
  },
  logLevel: "warn",
};

/**
 * @type {(fileName: string) => import('rollup').Plugin}
 */
function renameStyleFilePlugin(fileName) {
  return {
    name: "rename-style-file-plugin",
    generateBundle: async function (_, bundle) {
      for (const key in bundle) {
        if (key.endsWith(".css") && bundle[key].type === "asset") {
          this.info(`Renaming ${key} to ${fileName}`);
          this.emitFile({
            ...bundle[key],
            fileName,
          });
          delete bundle[key];
        }
      }
    },
  };
}
