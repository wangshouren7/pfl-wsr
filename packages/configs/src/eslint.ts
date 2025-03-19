import { FlatCompat } from "@eslint/eslintrc";
import storybook from "eslint-plugin-storybook";
import { includeIgnoreFile } from "@eslint/compat";
import { findUpMultipleSync } from "find-up";
import { uniq } from "lodash-es";
import { configsPath, workspaceRoot } from "./utils";
import { type Linter } from "eslint";
import unusedImports from "eslint-plugin-unused-imports";
import prettier from "eslint-plugin-prettier/recommended";

const compat = new FlatCompat({
  baseDirectory: configsPath,
});

const ignores = uniq(
  findUpMultipleSync(".gitignore", { stopAt: workspaceRoot })
    .map((file) => includeIgnoreFile(file).ignores)
    .flat()
    .filter(Boolean) as string[],
);

export default [
  {
    ignores,
  },
  {
    // automatically remove unused imports
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "no-unused-vars": "off", // or "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
    rules: {
      // react
      "react/jsx-sort-props": [
        "error",
        {
          shorthandFirst: true,
          callbacksLast: true,
          reservedFirst: true,
        },
      ],

      // basic code styles
      "no-console": "error",

      // import
      "import/no-cycle": "error",
      "import/no-duplicates": ["error", { "prefer-inline": true }],
      "import/no-commonjs": "error",
      "import/exports-last": "error",
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-anonymous-default-export": "error",
      "@typescript-eslint/no-explicit-any": "warn",

      // typescript
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],
    },
  }),

  // config files
  {
    files: ["*.config.*"],
    rules: {
      "import/no-anonymous-default-export": "off",
    },
  },

  // storybook
  ...storybook.configs["flat/recommended"],

  // prettier
  prettier,
] satisfies Linter.Config[];
