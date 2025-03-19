"use client";
import { contracts } from "@/contracts";
import { orderTypeConfig } from "@/domains/order/order-type-config";
import { useOrders } from "@/domains/order/use-orders";
import { useTrades } from "@/domains/trades/use-trades";
import {
  cn,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  type IComponentBaseProps,
  mp,
} from "@pfl-wsr/ui";
import React from "react";
import { useAccount } from "wagmi";
import { PanelCard } from "./panel-card";
import { AsyncButton } from "./async-button";

export const MyTransactions: React.FC<IComponentBaseProps> = (props) => {
  const { address: account } = useAccount();
  const { trades } = useTrades();
  const { orders, cancelOrder } = useOrders();

  return mp(
    props,
    <PanelCard requireConnect title={"My Transactions"}>
      <Tabs defaultValue="trades">
        <TabsList>
          <TabsTrigger value="trades">Trades</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="trades">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>DApp</TableHead>
                <TableHead>DApp/ETH</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {trades?.my.map((trade) => (
                <TableRow
                  key={trade.id}
                  className={cn(
                    orderTypeConfig[
                      trade.user === account
                        ? trade.orderType
                        : trade.fillOrderType
                    ].color,
                  )}
                >
                  <TableCell>{trade.time}</TableCell>
                  <TableCell>
                    {
                      orderTypeConfig[
                        trade.user === account
                          ? trade.orderType
                          : trade.fillOrderType
                      ].symbol
                    }
                    {trade.tokenAmountFormatted}
                  </TableCell>
                  <TableCell>{trade.tokenPrice}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="orders">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>DApp</TableHead>
                <TableHead>DAPP / ETH</TableHead>
                <TableHead>Operations</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {orders?.[contracts.Exchange.EOrderStatus.PENDING].my.map(
                (order) => (
                  <TableRow
                    key={order.id}
                    className={cn(orderTypeConfig[order.orderType].color)}
                  >
                    <TableCell>{order.time}</TableCell>
                    <TableCell>
                      {orderTypeConfig[order.orderType].symbol}
                      {order.tokenAmountFormatted}
                    </TableCell>
                    <TableCell>{order.tokenPrice}</TableCell>
                    <TableCell>
                      <AsyncButton
                        variant={"secondary"}
                        onClick={() => cancelOrder(order.id)}
                      >
                        Cancel
                      </AsyncButton>
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </PanelCard>,
  );
};
