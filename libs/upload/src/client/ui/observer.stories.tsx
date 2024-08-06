import { Meta, StoryFn } from "@storybook/react";

import { interval } from "rxjs";
import { Observer } from "./observer";

export default {
  component: Observer,
} as Meta<typeof Observer>;

export const Base: StoryFn<typeof Observer> = () => {
  const observable = interval(1000);
  return <Observer observable={observable}>{(x) => x}</Observer>;
};

export const PassValue: StoryFn<typeof Observer> = () => {
  return <Observer observable={100}>{(x) => x}</Observer>;
};
