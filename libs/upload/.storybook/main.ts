import type { StorybookConfig } from "@storybook/nextjs";

import sharedConfig from "@npcs/storybook-config";

const config: StorybookConfig = {
  ...sharedConfig,
  stories: ["../src/**/*.stories.tsx"],
};

export default config;
