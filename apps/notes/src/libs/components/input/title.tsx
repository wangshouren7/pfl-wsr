"use client";

import { cn, mp } from "@pfl-wsr/ui";
import { useControllableValue } from "ahooks";
import React, { ComponentProps } from "react";

export interface IInputContentProps extends ComponentProps<"input"> {}

export const InputTitle: React.FC<IInputContentProps> = (props) => {
  const [value, onChange] = useControllableValue<string>(props);
  if (props.readOnly) {
    return mp(
      props,
      <div
        {...props}
        className={cn(
          "bg-transparent w-full border-none text-4xl text-gray-300 placeholder:text-gray-300 focus:outline-none"
        )}
      >
        {value}
      </div>
    );
  }

  return mp(
    props,
    <input
      placeholder="Title"
      {...props}
      className={cn(
        "bg-transparent w-full border-none text-4xl text-gray-300 placeholder:text-gray-300 focus:outline-none"
      )}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};
