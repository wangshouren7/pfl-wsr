// @ts-expect-error eslint will use jiti to load this file
import configs from "@pfl-wsr/configs/eslint";

const eslintConfig = [
  ...configs,
  {
    rules: {
      "no-console": "off",
    },
  },
];

export default eslintConfig;
