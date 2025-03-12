import type { Meta, StoryObj } from "@storybook/react";
import { IconCloud } from "./icon-cloud";

const meta = {
  title: "Components/MagicUI/IconCloud",
  component: IconCloud,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof IconCloud>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icons: [
      <svg
        key="1"
        fill="currentColor"
        height="100"
        viewBox="0 0 24 24"
        width="100"
      >
        <circle cx="12" cy="12" r="10" />
      </svg>,
      <svg
        key="2"
        fill="currentColor"
        height="100"
        viewBox="0 0 24 24"
        width="100"
      >
        <rect height="16" width="16" x="4" y="4" />
      </svg>,
      <svg
        key="3"
        fill="currentColor"
        height="100"
        viewBox="0 0 24 24"
        width="100"
      >
        <polygon points="12 2 22 22 2 22" />
      </svg>,
    ],
  },
};

export const WithImages: Story = {
  args: {
    images: [
      "https://placekitten.com/40/40",
      "https://placekitten.com/41/41",
      "https://placekitten.com/42/42",
    ],
  },
};
