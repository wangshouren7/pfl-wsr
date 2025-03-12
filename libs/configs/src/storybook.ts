import type { StorybookConfig } from "@storybook/nextjs";
import resolvePkg from "resolve-pkg";
// @ts-ignore
import { getDirname } from "cross-dirname";

const resolve = (pkg: string) => resolvePkg(pkg, { cwd: getDirname() })!;

const addons = [
  resolve("@storybook/addon-onboarding")!,
  resolve("@storybook/addon-links")!,
  resolve("@storybook/addon-essentials")!,
  resolve("@chromatic-com/storybook")!,
  resolve("@storybook/addon-interactions")!,
  resolve("@storybook/addon-storysource")!,
];

export const storybook: StorybookConfig = {
  stories: ["../src/**/*.stories.tsx"],
  addons,
  framework: {
    name: resolve("@storybook/nextjs")!,
    options: {},
  },
};

export default storybook;
