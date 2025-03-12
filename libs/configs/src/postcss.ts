import { Config } from "postcss-load-config";

const postcss: Config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export { postcss };
export default postcss;
