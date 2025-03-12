import { Config } from "prettier";

const prettierConfig: Config = {
  plugins: ["prettier-plugin-jsdoc", "prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./src/app/globals.css",
  tailwindFunctions: ["cn"],
};

export default prettierConfig;
