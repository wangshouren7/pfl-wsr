import { type Meta, type StoryObj } from "@storybook/react";
import { FerrisWheel } from "./ferris-wheel";
import { Button } from "@pfl-wsr/ui";

const meta: Meta<typeof FerrisWheel> = {
  component: FerrisWheel,
  title: "Components/Effects/FerrisWheel",
  render: (args) => (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="size-2/3">
        <FerrisWheel {...args}>
          <Button>1</Button>
          <Button>2</Button>
          <Button>3</Button>
          <Button>4</Button>
          <Button>5</Button>
          <Button>6</Button>
        </FerrisWheel>
      </div>
    </div>
  ),
};

type Story = StoryObj<typeof FerrisWheel>;

export const Default: Story = {};

export const Reverse: Story = {
  args: {
    reverse: true,
  },
};

export const SlowSpeed: Story = {
  args: {
    speed: 0.1,
  },
};

export const NoPath: Story = {
  args: {
    path: false,
  },
};

export const Radius: Story = {
  args: {
    radius: (x) => x * 0.8,
    path: false,
  },
};

export const Delay: Story = {
  args: {
    delay: 1,
  },
};
export default meta;
