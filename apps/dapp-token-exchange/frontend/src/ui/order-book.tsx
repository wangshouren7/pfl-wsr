"use client";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  IComponentBaseProps,
  mp,
  ReloadIcon,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@pfl-wsr/ui";
import React from "react";
import { useAccount } from "wagmi";
import { useOrders } from "@/domains/order/use-orders";
import { contracts } from "@/contracts";
import { PanelCard } from "./panel-card";

/** TODO sort filters */
export const OrderBook: React.FC<IComponentBaseProps> = (props) => {
  const { address: account } = useAccount();
  const { orders, fillOrder, reload } = useOrders();

  const buyOrders =
    orders?.[contracts.Exchange.EOrderStatus.PENDING]?.[
      contracts.Exchange.EOrderType.BUY
    ];
  const sellOrders =
    orders?.[contracts.Exchange.EOrderStatus.PENDING]?.[
      contracts.Exchange.EOrderType.SELL
    ];

  return mp(
    props,
    <PanelCard
      title={"Order Book"}
      extra={<ReloadIcon cursor="pointer" onClick={reload} />}
    >
      <Table>
        <TableBody>
          {sellOrders
            ?.sort((a, b) => b.tokenPrice - a.tokenPrice)
            .map((order) => (
              <TableRow key={order.id} className="text-red-500">
                <TableCell>{order.tokenAmountFormatted}</TableCell>
                <TableCell>{order.tokenPriceFormatted}</TableCell>
                <TableCell>{order.etherAmountFormatted}</TableCell>
                <TableCell>
                  <Button
                    hidden={order.user === account}
                    onClick={() => fillOrder(order)}
                  >
                    Fill Order
                  </Button>
                </TableCell>
              </TableRow>
            ))}

          <TableRow>
            <TableCell>DApp</TableCell>
            <TableCell>DApp/ETH</TableCell>
            <TableCell>ETH</TableCell>
            <TableCell>Operations</TableCell>
          </TableRow>

          {buyOrders
            ?.sort((a, b) => b.tokenPrice - a.tokenPrice)
            .map((order) => (
              <TableRow key={order.id} className="text-green-500">
                <TableCell>{order.tokenAmountFormatted}</TableCell>
                <TableCell>{order.tokenPriceFormatted}</TableCell>
                <TableCell>{order.etherAmountFormatted}</TableCell>
                <TableCell>
                  <Button
                    hidden={order.user === account}
                    onClick={() => fillOrder(order)}
                  >
                    Fill Order
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </PanelCard>,
  );
};
