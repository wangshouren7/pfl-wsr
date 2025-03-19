"use client";

import {
  type IComponentBaseProps,
  mp,
  ReloadIcon,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@pfl-wsr/ui";
import React from "react";
import { useAccount } from "wagmi";
import { useOrders } from "@/domains/order/use-orders";
import { contracts } from "@/contracts";
import { PanelCard } from "./panel-card";
import { throttle } from "lodash-es";
import { AsyncButton } from "./async-button";
import { useBalanceUI } from "@/domains/balance/use-balance-ui";
import { useContractConfig } from "@/contract-config";

/** TODO sort filters */
export const OrderBook: React.FC<IComponentBaseProps> = (props) => {
  const contractConfig = useContractConfig();
  const { address: account } = useAccount();
  const { orders, fillOrder, reload } = useOrders();
  const { tokensMap } = useBalanceUI();

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
      action={<ReloadIcon cursor="pointer" onClick={reload} />}
      title={"Order Book"}
    >
      <Tabs defaultValue={contracts.Exchange.EOrderType.BUY}>
        <TabsList>
          <TabsTrigger value={contracts.Exchange.EOrderType.BUY}>
            Buy Orders
          </TabsTrigger>
          <TabsTrigger value={contracts.Exchange.EOrderType.SELL}>
            Sell Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value={contracts.Exchange.EOrderType.BUY}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>DApp</TableCell>
                <TableCell>DApp/ETH</TableCell>
                <TableCell>ETH</TableCell>
                <TableCell>Operations</TableCell>
              </TableRow>

              {buyOrders
                ?.sort((a, b) => b.tokenPrice - a.tokenPrice)
                .map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.tokenAmountFormatted}</TableCell>
                    <TableCell>{order.tokenPriceFormatted}</TableCell>
                    <TableCell>{order.etherAmountFormatted}</TableCell>
                    <TableCell>
                      {order.user !== account &&
                        tokensMap[contractConfig.token.address] &&
                        tokensMap[contractConfig.token.address]
                          .exchangeAmount! >= order.amountGet && (
                          <AsyncButton
                            variant={"secondary"}
                            onClick={throttle(() => fillOrder(order))}
                          >
                            Fill Order
                          </AsyncButton>
                        )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value={contracts.Exchange.EOrderType.SELL}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>DApp</TableCell>
                <TableCell>DApp/ETH</TableCell>
                <TableCell>ETH</TableCell>
                <TableCell>Operations</TableCell>
              </TableRow>

              {sellOrders
                ?.sort((a, b) => b.tokenPrice - a.tokenPrice)
                .map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.tokenAmountFormatted}</TableCell>
                    <TableCell>{order.tokenPriceFormatted}</TableCell>
                    <TableCell>{order.etherAmountFormatted}</TableCell>
                    <TableCell>
                      {order.user !== account &&
                        tokensMap[contractConfig.exchange.address] &&
                        tokensMap[contractConfig.exchange.address]
                          .exchangeAmount! >= order.amountGive && (
                          <AsyncButton
                            variant={"secondary"}
                            onClick={throttle(() => fillOrder(order))}
                          >
                            Fill Order
                          </AsyncButton>
                        )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </PanelCard>,
  );
};
