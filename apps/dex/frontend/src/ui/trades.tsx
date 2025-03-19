"use client";
import { orderTypeConfig } from "@/domains/order/order-type-config";
import { useTrades } from "@/domains/trades/use-trades";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type IComponentBaseProps,
  mp,
} from "@pfl-wsr/ui";
import React from "react";
import { PanelCard } from "./panel-card";

export const Trades: React.FC<IComponentBaseProps> = (props) => {
  const { trades } = useTrades();
  return mp(
    props,
    <PanelCard title={"Trades"}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>DAPP</TableHead>
            <TableHead>DAPP/Eth</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {trades?.all.map((trade) => (
            <TableRow
              key={trade.id}
              className={orderTypeConfig[trade.orderType].color}
            >
              <TableCell>{trade.time}</TableCell>
              <TableCell>{trade.tokenAmountFormatted}</TableCell>
              <TableCell>{trade.tokenPriceFormatted}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </PanelCard>,
  );
};
