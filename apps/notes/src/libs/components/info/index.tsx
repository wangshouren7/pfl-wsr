import { ButtonIcon } from "@libs/components/button/icon";
import { IconInfo } from "@libs/components/icon/info";
import { REPO } from "@libs/constants/repo";
import { IComponentBaseProps, mp } from "@pfl-wsr/ui";
import Link from "next/link";
import React from "react";

export interface IInfoProps extends IComponentBaseProps {}

export const InfoButton: React.FC<IInfoProps> = (props) => {
  return mp(
    props,
    <Link href={REPO} target="_blank">
      <ButtonIcon>
        <IconInfo />
      </ButtonIcon>
    </Link>
  );
};
