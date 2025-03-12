import { addons } from "@storybook/manager-api";
import { themes } from "@storybook/theming";

addons.setConfig({
  theme: {
    brandTitle: "Storybook for @pfl-wsr/notes",
    ...themes.dark,
  },
});
