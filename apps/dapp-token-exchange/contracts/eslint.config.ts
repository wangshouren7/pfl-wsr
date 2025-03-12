import configs from "@pfl-wsr/configs/eslint";

const eslintConfig = [
  ...configs,
  {
    rules: {
      "no-console": false,
    },
  },
];

export default eslintConfig;
