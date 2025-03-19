import { useMemoizedFn } from "@pfl-wsr/ui";
import { type Address } from "viem";
import { useChainId } from "wagmi";

const chainBrowserMap = {
  11155111: "https://sepolia.etherscan.io",
  84532: "https://base-sepolia.etherscan.io",
  137: "https://polygonscan.com",
  8453: "https://basescan.org",
  42161: "https://arbiscan.io",
};

export const useGetTransactionUrl = () => {
  const chainId = useChainId();

  const getTransactionUrl = useMemoizedFn((tx: Address) => {
    const url = chainBrowserMap[chainId as keyof typeof chainBrowserMap];
    return url ? `${url}/tx/${tx}` : undefined;
  });

  return getTransactionUrl;
};
