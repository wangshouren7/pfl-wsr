"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
  type IComponentBaseProps,
  mp,
} from "@pfl-wsr/ui";
import React from "react";
import { useAccount } from "wagmi";
import { ConnectWallet } from "./connect-wallet";

interface IPanelCardProps extends IComponentBaseProps {
  children: React.ReactNode;
  title: React.ReactNode;
  action?: React.ReactNode;
  requireConnect?: boolean;
  centerContent?: boolean;
}

export const PanelCard: React.FC<IPanelCardProps> = (props) => {
  const needConnect = !useAccount().address && props.requireConnect;
  return mp(
    props,
    <Card className="relative flex h-full flex-col overflow-auto rounded-[30px]">
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-2">
            {props.title} {!needConnect && props.action}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className={cn("flex flex-1 flex-col gap-4 overflow-auto")}>
        {needConnect ? (
          <div className="flex h-full items-center justify-center">
            <ConnectWallet />
          </div>
        ) : (
          props.children
        )}
      </CardContent>
    </Card>,
  );
};
