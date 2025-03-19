"use client";
import { lg } from "@/domains/logger";
import { cn, useSize } from "@pfl-wsr/ui";
import React, { type ComponentProps, useImperativeHandle, useRef } from "react";

export interface FerrisWheelProps extends ComponentProps<"div"> {
  className?: string;
  children?: React.ReactNode;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  radius?: (
    /** Math.min(width, height) / 2 */
    originalValue: number,
    size: {
      /** Container width */
      width: number;
      /** Container height */
      height: number;
    },
  ) => number;
  path?: boolean;
  speed?: number;
}

export const FerrisWheel = React.forwardRef(function FerrisWheel(
  {
    className,
    children,
    reverse,
    duration = 20,
    radius,
    path = true,
    speed = 1,
    delay = 0,
    ...props
  }: FerrisWheelProps,
  ref,
) {
  const calculatedDuration = duration / speed;

  const container = useRef<HTMLDivElement>(null);
  const { width, height } = useSize(container) ?? {};

  let finalRadius: number;
  if (!width || !height) {
    finalRadius = 0;
  } else {
    const originalValue = Math.min(width, height) / 2;
    finalRadius = radius?.(originalValue, { width, height }) ?? originalValue;
  }

  useImperativeHandle(ref, () => {
    lg.log(props, ref, container);
    return container.current;
  });

  return (
    <div
      {...props}
      ref={container}
      className={cn(
        `relative flex h-full w-full items-center justify-center rounded-full`,
        className,
      )}
      data-component={FerrisWheel.name}
    >
      {path && finalRadius > 0 && (
        <svg
          className="pointer-events-none absolute inset-0 size-full"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="stroke-black/10 stroke-1 dark:stroke-white/10"
            cx="50%"
            cy="50%"
            fill="none"
            r={finalRadius}
          />
        </svg>
      )}
      <div
        className={cn(
          `group relative flex animate-spin items-center justify-center delay-[var(--delay)] duration-[var(--duration)] hover:paused`,
          { "[animation-direction:reverse]": reverse },
        )}
        hidden={!finalRadius}
        style={
          {
            "--duration": `${calculatedDuration}s`,
            "--delay": `${delay}s`,
          } as React.CSSProperties
        }
      >
        {React.Children.map(children, (child, index) => {
          const angle = (360 / React.Children.count(children)) * index;
          return (
            <div
              className={cn(
                `absolute flex items-center justify-center rounded-full`,
              )}
              style={{
                transform: `rotate(calc(${angle}deg)) translateY(calc(${finalRadius}px)) rotate(calc(-${angle}deg))`,
              }}
            >
              <div
                className={cn(
                  "animate-spin delay-[var(--delay)] duration-[var(--duration)] group-hover:paused",
                  {
                    "[animation-direction:reverse]": !reverse,
                  },
                )}
              >
                {child}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
