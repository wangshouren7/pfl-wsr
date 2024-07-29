const defineConfig = require("eslint-define-config").defineConfig;

module.exports = defineConfig({
  extends: [
    "next/core-web-vitals",
    "plugin:tailwindcss/recommended",
    "plugin:storybook/recommended",
    "prettier",
  ],
  rules: {
    "import/no-cycle": "error",
    "react/jsx-sort-props": [
      "error",
      {
        shorthandFirst: true,
        callbacksLast: true,
        reservedFirst: true,
      },
    ],
    "no-console": "error",
  },
  overrides: [
    // {
    //   files: ["*.ts", "*.tsx"],
    //   rules: {
    //   }
    // },
  ],
});
