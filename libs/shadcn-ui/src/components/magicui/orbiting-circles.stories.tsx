import type { Meta, StoryObj } from "@storybook/react";
import { OrbitingCircles } from "./orbiting-circles";

const meta = {
  title: "Components/MagicUI/OrbitingCircles",
  component: OrbitingCircles,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    reverse: { control: "boolean" },
    duration: { control: "number" },
    radius: { control: "number" },
    path: { control: "boolean" },
    iconSize: { control: "number" },
    speed: { control: "number" },
  },
} satisfies Meta<typeof OrbitingCircles>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: [
      <div key="1" className="rounded-full bg-blue-500 p-2" />,
      <div key="2" className="rounded-full bg-red-500 p-2" />,
      <div key="3" className="rounded-full bg-green-500 p-2" />,
    ],
    radius: 160,
    duration: 20,
    path: true,
    iconSize: 30,
    speed: 1,
  },
};

export const Reversed: Story = {
  args: {
    ...Default.args,
    reverse: true,
  },
};
