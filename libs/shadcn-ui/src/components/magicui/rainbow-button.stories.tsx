import type { Meta, StoryObj } from "@storybook/react";
import { RainbowButton } from "./rainbow-button";

const meta = {
  title: "Components/MagicUI/RainbowButton",
  component: RainbowButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RainbowButton>;

export default meta;
type Story = StoryObj<typeof RainbowButton>;

export const Default: Story = {
  args: {
    children: "彩虹按钮",
  },
};

export const LongText: Story = {
  args: {
    children: "这是一个很长的彩虹按钮文本",
  },
};

export const Disabled: Story = {
  args: {
    children: "禁用状态",
    disabled: true,
  },
};

export const CustomClassName: Story = {
  args: {
    children: "自定义样式",
    className: "text-lg font-bold",
  },
};

export const AsLink: Story = {
  args: {
    children: "链接样式",
    onClick: () => window.open("https://example.com", "_blank"),
    className: "cursor-pointer",
  },
};
