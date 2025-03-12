"use client";
import { contracts } from "@/contracts";
import { useQuery } from "@tanstack/react-query";
import { type RequiredDeep } from "type-fest";
import { getLogs } from "viem/actions";
import { useAccount, usePublicClient, useWatchContractEvent } from "wagmi";
import { decorateTrade, type IDecoratedTrade } from "./decorate-trade";

export function useTrades() {
  const { address: account } = useAccount();
  const client = usePublicClient();

  const { data: trades, refetch } = useQuery({
    queryKey: ["trades"],
    queryFn: async () => {
      const ret = {
        filledByMe: [] as IDecoratedTrade[],
        createdByMe: [] as IDecoratedTrade[],
        all: [] as IDecoratedTrade[],
        my: [] as IDecoratedTrade[],
      };

      if (!client) {
        return ret;
      }

      const logs = await getLogs(client, {
        address: contracts.Exchange.config.address,
        event: contracts.Exchange.events.Trade,
        fromBlock: 0n,
        toBlock: "latest",
      });

      for (const log of logs) {
        const trade = decorateTrade(log.args as RequiredDeep<typeof log.args>);

        ret.all.push(trade);
        if (trade.user === account || trade.userFill === account) {
          ret.my.push(trade);

          if (trade.userFill === account) {
            ret.filledByMe.push(trade);
          } else if (trade.user === account) {
            ret.createdByMe.push(trade);
          }
        }
      }

      return ret;
    },
  });

  useWatchContractEvent({
    ...contracts.Exchange.config,
    eventName: "Trade",
    onLogs: () => {
      refetch();
    },
  });

  return { trades, refetch };
}
