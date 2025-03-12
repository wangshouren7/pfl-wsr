"use client";

import { toast, useMemoizedFn } from "@pfl-wsr/ui";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAccount,
  useReadContract,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";
import { decorateOrder, type IDecoratedOrder } from "./decorate-order";
import { contracts } from "@/contracts";
import { logger } from "@/lib/logger";
import { useAsyncFnWithToast } from "@/lib/use-async-fn-with-toast";

export const useOrders = () => {
  const queryClient = useQueryClient();
  const { address: account } = useAccount();

  const { writeContractAsync } = useWriteContract();

  useWatchContractEvent({
    ...contracts.Exchange.config,
    eventName: "Order",
    onLogs: () => {
      reload();
    },
  });

  const { data: orders, queryKey } = useReadContract({
    ...contracts.Exchange.config,
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

  const fillOrder = useAsyncFnWithToast(
    async (order: IDecoratedOrder) => {
      await writeContractAsync({
        ...contracts.Exchange.config,
        functionName: "fillOrder",
        args: [order.id],
      });

      reload();
    },
    {
      success: "Order filled",
    },
  );

  const cancelOrder = useAsyncFnWithToast(
    async (id: bigint) => {
      await writeContractAsync({
        ...contracts.Exchange.config,
        functionName: "cancelOrder",
        args: [id],
      });

      reload();
    },
    {
      success: "Order cancelled",
    },
  );

  return {
    orders,
    fillOrder,
    cancelOrder,
    reload,
  };
};
