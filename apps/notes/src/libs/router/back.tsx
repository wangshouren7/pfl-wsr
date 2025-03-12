"use client";

import { ButtonIcon } from "@libs/components/button/icon";
import { IconBack } from "@libs/components/icon/back";
import { IComponentBaseProps, mp } from "@pfl-wsr/ui";
import { useRouter } from "next/navigation";
import React from "react";

export interface IBackProps extends IComponentBaseProps {}

export const Back: React.FC<IBackProps> = (props) => {
  try {
    const router = useRouter();
    return mp(
      props,
      <ButtonIcon onClick={() => router.back()}>
        <IconBack />
      </ButtonIcon>
    );
  } catch (error) {
    // for without next router provider
    return mp(
      props,
      <ButtonIcon>
        <IconBack />
      </ButtonIcon>
    );
  }
};
