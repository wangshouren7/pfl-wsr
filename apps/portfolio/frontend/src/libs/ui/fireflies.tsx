"use client";
import { type IComponentBaseProps, mp, useInterval } from "@pfl-wsr/ui";
import React, { useState } from "react";

interface IFirefly {
  id: number;
  top: string;
  left: string;
  animationDuration: string;
  size: number;
}

// Configuration for creating a single firefly (position, animation duration)
const createFirefly = (): IFirefly => ({
  id: Math.random(), // Random ID as unique identifier
  top: `${Math.random() * 100}%`, // Random vertical position (0-100%)
  left: `${Math.random() * 100}%`, // Random horizontal position (0-100%)
  animationDuration: `${Math.random() * 5 + 5}s`, // Random animation duration between 5-10 seconds
  size: Math.random() * 4 + 8, // Random size between 8-12px
});

export const Fireflies = (props: IComponentBaseProps) => {
  const [fireflies, setFireflies] = useState<IFirefly[]>([]); // Store all fireflies states

  useInterval(() => {
    const newFirefly = createFirefly();
    setFireflies((currentFireflies) => [
      ...currentFireflies.slice(-14), // Keep last 14 to control total number
      newFirefly, // Add new firefly
    ]);
  }, 1000);

  return mp(
    props,
    <div className="fixed top-0 left-0 -z-10 h-full w-full overflow-hidden">
      {fireflies.map((firefly) => (
        <div
          key={firefly.id}
          className="absolute rounded-full" // Circular radial gradient background
          style={{
            top: firefly.top,
            left: firefly.left,
            backgroundImage: `radial-gradient(50% 50% at 50% 50%, rgba(253, 255, 80, 0.5) 0%, rgba(217, 217, 217, 0) 100%)`,
            width: firefly.size,
            height: firefly.size,
            // Apply custom move animation (requires CSS keyframes)
            animation: `move ${firefly.animationDuration} infinite alternate`,
            // move: Animation name (defined in CSS @keyframes)
            // ${firefly.animationDuration}: Duration from firefly's random value
            // infinite: Loop indefinitely
            // alternate: Reverse direction each cycle (breathing effect)
          }}
        ></div>
      ))}
    </div>,
  );
};
