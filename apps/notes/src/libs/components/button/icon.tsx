import * as React from "react";

import { cn, mp } from "@pfl-wsr/ui";

export interface IIconButtonProps extends React.ComponentProps<"button"> {
  children: React.ReactNode;
}

export const ButtonIcon: React.FC<IIconButtonProps> = ({
  className,
  children,
  ...props
}) => {
  return mp(
    props,
    <button
      {...props}
      className={cn(
        "rounded-lg size-[50px] cursor-pointer items-center justify-center bg-secondary duration-75",
        !props.hidden && "inline-flex",
        !props.disabled && "active:scale-95",
        props.disabled && "opacity-50"
      )}
    >
      {children}
    </button>
  );
};
