import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  IComponentBaseProps,
  mp,
} from "@pfl-wsr/ui";
import React from "react";

interface IPanelCardProps extends IComponentBaseProps {
  children: React.ReactNode;
  title: React.ReactNode;
  extra?: React.ReactNode;
}

export const PanelCard: React.FC<IPanelCardProps> = (props) => {
  return mp(
    props,
    <Card className="flex h-full flex-col overflow-auto">
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-2">
            {props.title} {props.extra}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 overflow-auto">
        {props.children}
      </CardContent>
    </Card>,
  );
};
