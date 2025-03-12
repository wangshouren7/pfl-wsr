import type { Meta, StoryObj } from "@storybook/react";
import { Lens } from "./lens";

const meta = {
  title: "Components/MagicUI/Lens",
  component: Lens,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    zoomFactor: { control: "number" },
    lensSize: { control: "number" },
    isStatic: { control: "boolean" },
    duration: { control: "number" },
    lensColor: { control: "color" },
  },
} satisfies Meta<typeof Lens>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="flex h-[300px] w-[400px] items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-2xl text-white">
        Hover to zoom
      </div>
    ),
    zoomFactor: 1.3,
    lensSize: 170,
    duration: 0.1,
    lensColor: "black",
  },
};

export const StaticLens: Story = {
  args: {
    ...Default.args,
    isStatic: true,
    position: { x: 200, y: 150 },
  },
};
