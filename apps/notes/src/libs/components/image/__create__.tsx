/* eslint-disable jsx-a11y/alt-text */

import { cn, mp } from "@pfl-wsr/ui";
import Image, { ImageProps } from "next/image";
import React from "react";

export type IImageProps = Omit<ImageProps, "src">;

export const createImageComponent = (displayName: string, src: string) => {
  const FC: React.FC<IImageProps> = (props) => {
    return mp(
      props,
      <Image
        {...props}
        className={cn(props.onClick && "cursor-pointer", "select-none")}
        src={src}
      />
    );
  };

  FC.displayName = displayName;

  return FC;
};
