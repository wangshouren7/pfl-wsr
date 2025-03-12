import type { Meta, StoryObj } from "@storybook/react";
import { PulsatingButton } from "./pulsating-button";

const meta = {
  title: "Components/MagicUI/PulsatingButton",
  component: PulsatingButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    pulseColor: { control: "color" },
    duration: { control: "text" },
  },
} satisfies Meta<typeof PulsatingButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Click me",
    pulseColor: "#0096ff",
    duration: "1.5s",
  },
};

export const CustomColor: Story = {
  args: {
    children: "Custom Color",
    pulseColor: "#ff0000",
    duration: "1.5s",
  },
};

export const SlowPulse: Story = {
  args: {
    children: "Slow Pulse",
    pulseColor: "#0096ff",
    duration: "3s",
  },
};
