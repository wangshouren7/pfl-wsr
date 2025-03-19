import { clsx, type ClassValue } from "clsx";
import React from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Merge props with jsx
 *
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

export function patchSearchParams(
  params: URLSearchParams = new URLSearchParams(),
  patch: Record<string, string>,
) {
  const searchParams = new URLSearchParams(params?.toString() ?? "");

  Object.entries(patch).forEach(([name, value]) => {
    if (value) {
      searchParams.set(name, value);
    } else {
      searchParams.delete(name);
    }
  });

  return searchParams;
}
