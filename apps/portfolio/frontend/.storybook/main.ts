import type { StorybookConfig } from "@storybook/experimental-nextjs-vite";
import vitePluginTsconfigPaths from "vite-plugin-tsconfig-paths";

import { join, dirname } from "path";

/**
 * This function is used to resolve the absolute path of a package. It is needed
 * in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-onboarding"),
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/experimental-addon-test"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/experimental-nextjs-vite"),
    options: {},
  },

  viteFinal: (config) => {
    config.plugins?.unshift(vitePluginTsconfigPaths());
    return config;
  },

  staticDirs: ["../public"],
};
export default config;
