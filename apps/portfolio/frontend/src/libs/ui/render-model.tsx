"use client";
import { type IComponentBaseProps, mp } from "@pfl-wsr/ui";
import { Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { type ReactNode, Suspense } from "react";

interface RenderModelProps extends IComponentBaseProps {
  children: ReactNode;
}

const RenderModel = (props: RenderModelProps) => {
  const { children } = props;
  return mp(
    props,
    <Canvas
      className={"relative -z-10 h-screen w-screen"}
      dpr={[1, 2]}
      shadows={false}
      // dpr is the device pixel ratio. Here we are setting it to 1 and 2 for retina displays to
      // prevent blurriness in the model rendering on high resolution screens.
    >
      <Suspense fallback={null}>{children}</Suspense>
      <Environment preset="dawn" />
    </Canvas>,
  );
};

export default RenderModel;
