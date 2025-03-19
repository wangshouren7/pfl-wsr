"use client";

import { useMemoizedFn } from "@pfl-wsr/ui";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAccount,
  useReadContract,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";
import { decorateOrder, type IDecoratedOrder } from "./decorate-order";
import { contracts } from "@/contracts";
import { useTransactionFnWithToast } from "@/lib/use-async-fn-with-toast";
import { useContractConfig } from "@/contract-config";

export const useOrders = () => {
  const contractConfig = useContractConfig();
  const queryClient = useQueryClient();
  const { address: account } = useAccount();

  const { writeContractAsync } = useWriteContract();

  useWatchContractEvent({
    ...contractConfig.exchange,
    eventName: "Order",
    onLogs: () => {
      reload();
    },
  });

  const { data: orders, queryKey } = useReadContract({
    ...contractConfig.exchange,
    functionName: "getOrders",
    query: {
      select: (data) => {
        const orders = data.map(decorateOrder);

        const ret = {
          [contracts.Exchange.EOrderStatus.PENDING]: {
            [contracts.Exchange.EOrderType.BUY]: [] as IDecoratedOrder[],
            [contracts.Exchange.EOrderType.SELL]: [] as IDecoratedOrder[],
            my: [] as IDecoratedOrder[],
            all: [] as IDecoratedOrder[],
          },
          [contracts.Exchange.EOrderStatus.FILLED]: {
            [contracts.Exchange.EOrderType.BUY]: [] as IDecoratedOrder[],
            [contracts.Exchange.EOrderType.SELL]: [] as IDecoratedOrder[],
            my: [] as IDecoratedOrder[],
            all: [] as IDecoratedOrder[],
          },
          [contracts.Exchange.EOrderStatus.CANCELLED]: {
            [contracts.Exchange.EOrderType.BUY]: [] as IDecoratedOrder[],
            [contracts.Exchange.EOrderType.SELL]: [] as IDecoratedOrder[],
            my: [] as IDecoratedOrder[],
            all: [] as IDecoratedOrder[],
          },
        };

        for (const order of orders) {
          ret[order.status][order.orderType].push(order);
          ret[order.status].all.push(order);
          if (order.user === account) {
            ret[order.status].my.push(order);
          }
        }

        return ret;
      },
    },
  });

  const reload = useMemoizedFn(() => {
    queryClient.invalidateQueries({ queryKey });
  });

  const fillOrder = useTransactionFnWithToast(
    async (order: IDecoratedOrder) => {
      const tx = await writeContractAsync({
        ...contractConfig.exchange,
        functionName: "fillOrder",
        args: [order.id],
      });

      reload();

      return tx;
    },
  );

  const cancelOrder = useTransactionFnWithToast(async (id: bigint) => {
    const tx = await writeContractAsync({
      ...contractConfig.exchange,
      functionName: "cancelOrder",
      args: [id],
    });

    reload();

    return tx;
  });

  return {
    orders,
    fillOrder,
    cancelOrder,
    reload,
  };
};
