/* eslint-disable import/no-anonymous-default-export */

import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
import preserveDirectives from "rollup-plugin-preserve-directives";
import { typescriptPaths } from "rollup-plugin-typescript-paths";

/** @type {import('rollup').RollupOptions} */
export default {
  input: ["./src/components/index.ts", "./src/jsx.ts", "./src/index.css"],
  output: {
    format: "esm",
    preserveModules: true,
    preserveModulesRoot: "./src",
    dir: "./esm",
    sourcemap: true,
  },
  watch: {
    include: "./src",
    buildDelay: 300,
  },
  plugins: [
    typescript({ jsx: "react", tsconfig: "./tsconfig.build.json" }),
    resolve(),
    commonjs(),
    typescriptPaths({
      tsConfigPath: "./tsconfig.build.json",
    }),
    peerDepsExternal({
      includeDependencies: true,
    }),
    preserveDirectives(),
    postcss({ extract: true }),
  ],
  onwarn: (warning, warn) => {
    if (
      warning.code === "MODULE_LEVEL_DIRECTIVE" ||
      warning.message.includes("'React' refers to a UMD global")
    )
      return;
    console.log(warning.code);

    warn(warning);
  },
};
