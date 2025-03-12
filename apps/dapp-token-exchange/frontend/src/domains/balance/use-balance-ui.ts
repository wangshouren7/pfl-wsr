"use client";

import { type Address, parseEther } from "viem";
import {
  useAccount,
  useBalance,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import { toast, useMap, useMemoizedFn } from "@pfl-wsr/ui";
import { formatUnits } from "@/lib/format";
import { logger } from "@/lib/logger";
import { contracts } from "@/contracts";
import { useAsyncFnWithToast } from "@/lib/use-async-fn-with-toast";

interface IToken {
  name: string;
  address: Address;
  symbol: string;
  exchangeAmount?: bigint;
  exchangeAmountFormatted: string;
  walletAmount?: bigint;
  walletAmountFormatted: string;
}

function useTokens(account: Address) {
  const { data: { value: etherOfWallet } = {}, refetch: refetchEther } =
    useBalance({
      address: account,
    });

  const result = useReadContracts({
    contracts: [
      {
        ...contracts.Exchange.config, // ether of exchange
        functionName: "balanceOf",
        args: [contracts.ETHER_ADDRESS, account],
      },
      {
        ...contracts.Token.config, // token of wallet
        functionName: "balanceOf",
        args: [account],
      },
      {
        ...contracts.Exchange.config, // token of exchange
        functionName: "balanceOf",
        args: [contracts.Token.config.address, account],
      },
      {
        ...contracts.Token.config, // symbol of token
        functionName: "symbol",
      },
    ],
  });

  const ethOfExchange = result.data?.[0]?.result;
  const tokenOfWallet = result.data?.[1]?.result;
  const tokenOfExchange = result.data?.[2]?.result;
  const tokenSymbol = result.data?.[3]?.result;

  const tokens: IToken[] = [
    {
      name: "Ether",
      address: contracts.ETHER_ADDRESS,
      symbol: "ETH",
      exchangeAmount: ethOfExchange,
      walletAmount: etherOfWallet,
      exchangeAmountFormatted: formatUnits(ethOfExchange),
      walletAmountFormatted: formatUnits(etherOfWallet),
    },
    {
      name: "Token",
      address: contracts.Token.config.address,
      symbol: tokenSymbol ?? "",
      exchangeAmount: tokenOfExchange,
      walletAmount: tokenOfWallet,
      exchangeAmountFormatted: formatUnits(tokenOfExchange),
      walletAmountFormatted: formatUnits(tokenOfWallet),
    },
  ];

  const reload = useMemoizedFn(() => {
    result.refetch();
    refetchEther();
  });

  return { tokens, reload };
}

function useTransact() {
  const { writeContractAsync } = useWriteContract({
    mutation: {
      onSuccess: (...args) => {
        logger.success("writeContractAsync success", args);
      },
      onError: (...args) => {
        logger.error("writeContractAsync error", args);
      },
      onMutate: (...args) => {
        logger.info("writeContractAsync mutate", args);
      },
      onSettled: (...args) => {
        logger.info("writeContractAsync settled", args);
      },
    },
  });

  const withdrawEther = useAsyncFnWithToast(
    async (value: bigint) => {
      if (value && value > 0) {
        await writeContractAsync({
          ...contracts.Exchange.config,
          functionName: "withdrawEther",
          args: [value],
        });
      }
    },
    { success: "Ether withdrawn" },
  );

  const withdrawToken = useAsyncFnWithToast(
    async (value: bigint) => {
      if (value && value > 0) {
        await writeContractAsync({
          ...contracts.Exchange.config,
          functionName: "withdrawToken",
          args: [contracts.Token.config.address, value],
        });
      }
    },
    {
      success: "Token withdrawn",
    },
  );

  const depositEther = useAsyncFnWithToast(
    async (value: bigint) => {
      if (value && value > 0) {
        await writeContractAsync({
          ...contracts.Exchange.config,
          functionName: "depositEther",
          value,
        });
      }
    },
    {
      success: "Ether deposited",
    },
  );

  const depositToken = useAsyncFnWithToast(
    async (value: bigint) => {
      if (value && value > 0) {
        await writeContractAsync({
          ...contracts.Token.config,
          functionName: "approve",
          args: [contracts.Exchange.config.address, value],
        });

        await writeContractAsync({
          ...contracts.Exchange.config,
          functionName: "depositToken",
          args: [contracts.Token.config.address, value],
        });
      }
    },
    {
      success: "Token deposited",
    },
  );

  return { withdrawEther, withdrawToken, depositEther, depositToken };
}

function useBalanceUI() {
  const { address: account } = useAccount();

  /*
   * address => input value
   */
  const valueMap = useMap<Address, number>()[1];
  const { tokens, reload: refresh } = useTokens(account ?? "0x");
  const { withdrawEther, withdrawToken, depositEther, depositToken } =
    useTransact();

  const onDeposit = useMemoizedFn((address: Address) => {
    const amount = parseEther(String(valueMap.get(address)));
    if (address === contracts.ETHER_ADDRESS) {
      depositEther(amount);
    } else {
      depositToken(amount);
    }
  });

  const onWithDraw = useMemoizedFn((address: Address) => {
    if (address === contracts.ETHER_ADDRESS) {
      withdrawEther(parseEther(String(valueMap.get(address))));
    } else {
      withdrawToken(parseEther(String(valueMap.get(address))));
    }
  });

  const onChangeValue = useMemoizedFn((address: Address, value: number) => {
    valueMap.set(address, value);
  });

  const getValue = useMemoizedFn((address: Address) => {
    return valueMap.get(address);
  });

  return {
    onDeposit,
    onWithDraw,
    onChangeValue,
    tokens,
    getValue,
    refresh,
  };
}

export { useBalanceUI };
