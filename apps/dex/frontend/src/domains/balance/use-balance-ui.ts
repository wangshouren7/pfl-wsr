"use client";

import { type Address, parseEther } from "viem";
import {
  useAccount,
  useBalance,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import { useMap, useMemoizedFn } from "@pfl-wsr/ui";
import { formatUnits } from "@/lib/format";
import { logger } from "@/lib/logger";
import { contracts } from "@/contracts";
import { useRunTransactionFnWithToast } from "@/lib/use-async-fn-with-toast";
import { useContractConfig } from "@/contract-config";
import { keyBy } from "lodash-es";

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

  const contractConfig = useContractConfig();

  const result = useReadContracts({
    contracts: [
      {
        ...contractConfig.exchange, // ether of exchange
        functionName: "balanceOf",
        args: [contracts.ETHER_ADDRESS, account],
      },
      {
        ...contractConfig.token, // token of wallet
        functionName: "balanceOf",
        args: [account],
      },
      {
        ...contractConfig.exchange, // token of exchange
        functionName: "balanceOf",
        args: [contractConfig.token.address, account],
      },
      {
        ...contractConfig.token, // symbol of token
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
      address: contractConfig.token.address,
      symbol: tokenSymbol ?? "",
      exchangeAmount: tokenOfExchange,
      walletAmount: tokenOfWallet,
      exchangeAmountFormatted: formatUnits(tokenOfExchange),
      walletAmountFormatted: formatUnits(tokenOfWallet),
    },
  ];

  const tokensMap = keyBy(tokens, "address");

  const reload = useMemoizedFn(() => {
    result.refetch();
    refetchEther();
  });

  return { tokens, reload, tokensMap };
}

function useTransact() {
  const runTransactionFnWithToast = useRunTransactionFnWithToast();
  const contractConfig = useContractConfig();
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

  const withdrawEther = useMemoizedFn(async (value: bigint) => {
    if (value && value > 0) {
      return await runTransactionFnWithToast(() =>
        writeContractAsync({
          ...contractConfig.exchange,
          functionName: "withdrawEther",
          args: [value],
        }),
      );
    }
  });

  const withdrawToken = useMemoizedFn(async (value: bigint) => {
    if (value && value > 0) {
      return await runTransactionFnWithToast(() =>
        writeContractAsync({
          ...contractConfig.exchange,
          functionName: "withdrawToken",
          args: [contractConfig.token.address, value],
        }),
      );
    }
  });

  const depositEther = useMemoizedFn(async (value: bigint) => {
    if (value && value > 0) {
      await runTransactionFnWithToast(() =>
        writeContractAsync({
          ...contractConfig.exchange,
          functionName: "depositEther",
          value,
        }),
      );
    }
  });

  const depositToken = useMemoizedFn(async (value: bigint) => {
    if (value && value > 0) {
      await runTransactionFnWithToast(() =>
        writeContractAsync({
          ...contractConfig.token,
          functionName: "approve",
          args: [contractConfig.exchange.address, value],
        }),
      );

      await runTransactionFnWithToast(() =>
        writeContractAsync({
          ...contractConfig.exchange,
          functionName: "depositToken",
          args: [contractConfig.token.address, value],
        }),
      );
    }
  });

  return { withdrawEther, withdrawToken, depositEther, depositToken };
}

function useBalanceUI() {
  const { address: account } = useAccount();

  /*
   * address => input value
   */
  const valueMap = useMap<Address, number>()[1];
  const { tokens, reload: refresh, tokensMap } = useTokens(account ?? "0x");
  const { withdrawEther, withdrawToken, depositEther, depositToken } =
    useTransact();

  const onDeposit = useMemoizedFn((address: Address) => {
    const amount = parseEther(String(valueMap.get(address)));
    if (address === contracts.ETHER_ADDRESS) {
      return depositEther(amount);
    }

    return depositToken(amount);
  });

  const onWithDraw = useMemoizedFn((address: Address) => {
    if (address === contracts.ETHER_ADDRESS) {
      return withdrawEther(parseEther(String(valueMap.get(address))));
    }

    return withdrawToken(parseEther(String(valueMap.get(address))));
  });

  const onChangeValue = useMemoizedFn((address: Address, value: number) => {
    valueMap.set(address, value);
  });

  const getValue = useMemoizedFn((address: Address) => {
    const value = valueMap.get(address);
    return value === 0 ? undefined : value;
  });

  return {
    onDeposit,
    onWithDraw,
    onChangeValue,
    tokens,
    getValue,
    refresh,
    tokensMap,
  };
}

export { useBalanceUI };
