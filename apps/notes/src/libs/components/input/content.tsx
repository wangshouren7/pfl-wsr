"use client";
import { mp } from "@pfl-wsr/ui";
import { useControllableValue } from "ahooks";
import React, { ComponentProps } from "react";

export interface IInputContentProps extends ComponentProps<"textarea"> {}

export const InputContent: React.FC<IInputContentProps> = (props) => {
  const [value, onChange] = useControllableValue<string>(props);
  if (props.readOnly) {
    return mp(
      props,
      <div className="w-full resize-none border-none bg-transparent text-gray-300 placeholder:text-gray-300 focus:outline-none">
        {value}
      </div>
    );
  }

  return mp(
    props,
    <textarea
      {...props}
      className="w-full resize-none border-none bg-transparent text-gray-300 placeholder:text-gray-300 focus:outline-none"
      placeholder="Type something..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};
