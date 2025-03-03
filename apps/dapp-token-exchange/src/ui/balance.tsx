"use client";
import {
  ETHER_ADDRESS,
  exchangeContractConfig,
  tokenContractConfig,
} from "@/contractConfig";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  RainbowButton,
  ShimmerButton,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useControl,
  useMemoizedFn,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@npcs/ui";
import { formatUnits, parseEther } from "viem";
import React, { useEffect } from "react";
import {
  useAccount,
  useBalance,
  useReadContract,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import { useQueryClient } from "@tanstack/react-query";

interface IBalanceProps {
  account: `0x${string}`;
}

export const Balance: React.FC<IBalanceProps> = ({ account }) => {
  const queryClient = useQueryClient();

  const ethBalance = useBalance({
    address: account,
  });

  const tokenBalanceInWallet = useReadContract({
    ...tokenContractConfig,
    functionName: "balanceOf",
    args: [account],
  });

  const ethBalanceInExchange = useReadContract({
    ...exchangeContractConfig,
    functionName: "balanceOf",
    args: [ETHER_ADDRESS, account],
  });

  const tokenBalanceInExchange = useReadContract({
    ...exchangeContractConfig,
    functionName: "balanceOf",
    args: [tokenContractConfig.address, account],
  });

  const tokenSymbol = useReadContract({
    ...tokenContractConfig,
    functionName: "symbol",
  });

  const tokens = [
    {
      name: "Ether",
      address: ETHER_ADDRESS,
      symbol: "ETH",
      exchangeAmount: ethBalanceInExchange.data
        ? formatUnits(ethBalanceInExchange.data, 18)
        : 0,
      walletAmount: ethBalance.data?.formatted,
    },
    {
      name: "Token",
      address: tokenContractConfig.address,
      symbol: tokenSymbol.data,
      exchangeAmount: tokenBalanceInExchange.data
        ? formatUnits(tokenBalanceInExchange.data, 18)
        : 0,
      walletAmount: tokenBalanceInWallet.data
        ? formatUnits(tokenBalanceInWallet.data, 18)
        : 0,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance</CardTitle>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Exchange</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead>Operations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map((token) => (
                <TableRow key={token.name}>
                  <TableCell className="font-medium">{token.name}</TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>{token.exchangeAmount}</span>
                      </TooltipTrigger>
                      <TooltipContent>{token.exchangeAmount}</TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>{token.walletAmount}</span>
                      </TooltipTrigger>
                      <TooltipContent>{token.walletAmount}</TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="space-x-4">
                    <RainbowButton>Deposit</RainbowButton>
                    <RainbowButton>Withdraw</RainbowButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </CardHeader>
    </Card>
  );
};

interface IExchangeBalanceProps {
  account: `0x${string}`;
}

const ExchangeBalance: React.FC<IExchangeBalanceProps> = ({ account }) => {
  const [ethDepositAmount] = useControl<string>({ initialValue: "" });
  const [tokenDepositAmount] = useControl<string>({ initialValue: "" });

  const queryClient = useQueryClient();

  const ethBalanceInExchange = useReadContract({
    ...exchangeContractConfig,
    functionName: "balanceOf",
    args: [ETHER_ADDRESS, account],
  });

  const tokenBalanceInExchange = useReadContract({
    ...exchangeContractConfig,
    functionName: "balanceOf",
    args: [tokenContractConfig.address, account],
  });

  const tokenSymbol = useReadContract({
    ...tokenContractConfig,
    functionName: "symbol",
  });

  const { writeContract } = useWriteContract({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries(ethBalanceInExchange);
        queryClient.invalidateQueries(tokenBalanceInExchange);
      },
    },
  });

  const onEthDeposit = useMemoizedFn(async () => {
    const amount = parseFloat(ethDepositAmount.value ?? "");

    if (amount && amount > 0) {
      await writeContract({
        ...exchangeContractConfig,
        functionName: "depositEther",
        value: parseEther(amount.toString()),
      });
    }
  });

  const onTokenDeposit = useMemoizedFn(async () => {
    const amount = parseFloat(tokenDepositAmount.value ?? "");

    if (amount && amount > 0) {
      await writeContract({
        ...tokenContractConfig,
        functionName: "approve",
        args: [exchangeContractConfig.address, parseEther(amount.toString())],
      });

      writeContract({
        ...exchangeContractConfig,
        functionName: "depositToken",
        args: [tokenContractConfig.address, parseEther(amount.toString())],
      });
    }
  });

  return (
    <div>
      <div>
        {ethBalanceInExchange.data
          ? formatUnits(ethBalanceInExchange.data, 18)
          : 0}{" "}
        ETH
      </div>
      <div>
        {tokenBalanceInExchange.data
          ? formatUnits(tokenBalanceInExchange.data, 18)
          : 0}{" "}
        {tokenSymbol.data}
      </div>

      <div className="flex items-center gap-4">
        <div className="whitespace-nowrap">Deposit Eth</div>
        <Input {...ethDepositAmount} type="number" />{" "}
        <ShimmerButton onClick={onEthDeposit}>Deposit</ShimmerButton>
      </div>

      <div className="flex items-center gap-4">
        <div className="whitespace-nowrap">Deposit Token</div>
        <Input {...tokenDepositAmount} type="number" />{" "}
        <ShimmerButton onClick={onTokenDeposit}>Deposit</ShimmerButton>
      </div>
    </div>
  );
};

interface IWalletBalanceProps {
  account: `0x${string}`;
}

const WalletBalance: React.FC<IWalletBalanceProps> = ({ account }) => {
  const [ethWithdrawAmount] = useControl<string>({ initialValue: "" });
  const [tokenWithdrawAmount] = useControl<string>({ initialValue: "" });

  const queryClient = useQueryClient();

  const ethBalance = useBalance({
    address: account,
  });

  const tokenBalanceInWallet = useReadContract({
    ...tokenContractConfig,
    functionName: "balanceOf",
    args: [account],
  });

  const tokenSymbol = useReadContract({
    ...tokenContractConfig,
    functionName: "symbol",
  });

  const { writeContract } = useWriteContract({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries(ethBalance);
        queryClient.invalidateQueries(tokenBalanceInWallet);
      },
    },
  });

  const onEthWithdraw = useMemoizedFn(() => {
    const amount = parseFloat(ethWithdrawAmount.value ?? "");

    if (amount && amount > 0) {
      writeContract({
        ...exchangeContractConfig,
        functionName: "withdrawEther",
        args: [parseEther(amount.toString())],
      });
    }
  });

  const onTokenWithdraw = useMemoizedFn(() => {
    const amount = parseFloat(tokenWithdrawAmount.value ?? "");

    if (amount && amount > 0) {
      writeContract({
        ...exchangeContractConfig,
        functionName: "withdrawToken",
        args: [tokenContractConfig.address, parseEther(amount.toString())],
      });
    }
  });

  return (
    <div>
      <div>
        {ethBalance.data?.formatted} {ethBalance.data?.symbol}
      </div>
      <div>
        {tokenBalanceInWallet.data
          ? formatUnits(tokenBalanceInWallet.data, 18)
          : 0}{" "}
        {tokenSymbol.data}
      </div>

      <div className="flex items-center gap-4">
        <div className="whitespace-nowrap">Withdraw Eth</div>
        <Input {...ethWithdrawAmount} type="number" />{" "}
        <ShimmerButton onClick={onEthWithdraw}>Withdraw</ShimmerButton>
      </div>

      <div className="flex items-center gap-4">
        <div className="whitespace-nowrap">Withdraw Token</div>
        <Input {...tokenWithdrawAmount} type="number" />{" "}
        <ShimmerButton onClick={onTokenWithdraw}>Withdraw</ShimmerButton>
      </div>
    </div>
  );
};
