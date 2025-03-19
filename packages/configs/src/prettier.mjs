/** @type {import("prettier").Config} */
const prettierConfig = {
  plugins: ["prettier-plugin-jsdoc", "prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./src/app/globals.css",
  tailwindFunctions: ["cn"],
};

export default prettierConfig;
