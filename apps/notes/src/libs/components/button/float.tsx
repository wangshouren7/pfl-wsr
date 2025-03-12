import { mp } from "@pfl-wsr/ui";
import React from "react";

export interface IFloatButtonProps extends React.ComponentProps<"div"> {
  children: React.ReactNode;
}

export const ButtonFixed: React.FC<IFloatButtonProps> = (props) => {
  return mp(
    props,
    <div className="bg-primary shadow-3xl inline-flex size-[70px] cursor-pointer items-center justify-center rounded-full duration-75 active:scale-95">
      {props.children}
    </div>
  );
};
