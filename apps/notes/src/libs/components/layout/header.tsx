import { cn, IComponentBaseProps, mp } from "@pfl-wsr/ui";
import React from "react";

export interface IHeaderLayoutProps extends IComponentBaseProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  leftClassName?: string;
  rightClassName?: string;
}

export const HeaderLayout: React.FC<IHeaderLayoutProps> = ({
  left,
  right,
  leftClassName,
  rightClassName,
  ...props
}) => {
  return mp(
    props,
    <header className="bg-primary flex items-center justify-between gap-5 pb-9">
      <div key={"left"} className={leftClassName}>
        {left}
      </div>

      <div key="right" className={cn("flex gap-5", rightClassName)}>
        {right}
      </div>
    </header>
  );
};
