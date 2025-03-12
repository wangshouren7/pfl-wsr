import sharedConfig from "@pfl-wsr/configs/storybook";
import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  ...sharedConfig,
  stories: ["../src/**/*.stories.tsx"],
  staticDirs: ["../public"],
};
export default config;
