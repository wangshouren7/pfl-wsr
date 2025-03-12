import type { Preview } from "@storybook/react";
import "../src/styles.css";

import { Toaster } from "../src/components/ui";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => {
      return (
        <>
          <Story />

          <Toaster />
        </>
      );
    },
  ],
};

export default preview;
