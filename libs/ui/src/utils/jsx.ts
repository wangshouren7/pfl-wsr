import React from "react";

import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * merge props with jsx
 * @param props
 * @param jsx
 * @returns
 */
export function mp(props: any, jsx: React.ReactElement) {
  if (!React.isValidElement(jsx)) {
    return jsx;
  }

  if (React.Fragment === jsx.type) {
    return jsx;
  }

  const originalProps = jsx.props as any;
  return React.cloneElement(jsx, {
    ...originalProps,
    className: cn(originalProps.className, props.className),
    style: { ...originalProps.style, ...props.style },
  });
}
