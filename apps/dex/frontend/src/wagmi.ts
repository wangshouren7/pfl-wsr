import { type Chain, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia, hardhat } from "wagmi/chains";
import { IS_DEV } from "./lib/env";

const sepoliaTest: Chain = {
  ...sepolia,
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_SEPOLIA_TEST_RPC_URL ?? ""],
    },
  },
};

export const config = getDefaultConfig({
  appName: "Dex",
  projectId: "YOUR_PROJECT_ID",
  chains: [sepoliaTest, ...(IS_DEV ? [hardhat] : [])],
  ssr: true,
});
