import type { StorybookConfig } from "@storybook/nextjs";

import sharedConfig from "@pfl-wsr/configs/storybook";

const config: StorybookConfig = {
  ...sharedConfig,
  stories: ["../src/**/*.stories.tsx"],
};

export default config;
