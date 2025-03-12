import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
  hardhat,
  localhost,
} from "wagmi/chains";
import { IS_DEV } from "./lib/env";

export const config = getDefaultConfig({
  appName: "Dapp Token Exchange",
  projectId: "YOUR_PROJECT_ID",
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    ...(IS_DEV
      ? [
          hardhat,
          {
            ...localhost,
            id: 1337,
            name: "Ganache",
            rpcUrls: {
              default: {
                http: ["http://localhost:7545"],
              },
            },
          },
        ]
      : []),
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [sepolia] : []),
  ],
  ssr: true,
});
