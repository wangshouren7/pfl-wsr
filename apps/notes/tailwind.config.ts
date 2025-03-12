import sharedConfig from "@pfl-wsr/configs/tailwindcss";
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./{src,.storybook}/**/*.{tsx,css}"],
  theme: {
    fontSize: {
      base: "18px",
      lg: "20px",
      xl: "24px",
      "2xl": "28px",
      "3xl": "44px",
      "4xl": "48px",
    },
    borderRadius: () => ({
      DEFAULT: "5px",
      md: "10px",
      lg: "15px",
      xl: "20px",
      "2xl": "30px",
      full: "9999px",
    }),
    boxShadow: {
      "3xl": "-5px 5px 10px rgba(0, 0, 0, 1)",
    },
    extend: {
      backgroundColor: {
        primary: "rgba(var(--bg-primary), <alpha-value>)",
        secondary: "rgba(var(--bg-secondary), <alpha-value>)",
      },
      colors: {
        "gray-300": "rgba(var(--gray-300), <alpha-value>)",
        "green-300": "rgba(var(--green-300), <alpha-value>)",
        "red-300": "rgba(var(--red-300), <alpha-value>)",
      },
      textColor: {
        primary: "rgba(var(--text-primary), <alpha-value>)",
        secondary: "rgba(var(--text-secondary), <alpha-value>)",
      },
    },
  },
  presets: [sharedConfig],
};

export default config;
