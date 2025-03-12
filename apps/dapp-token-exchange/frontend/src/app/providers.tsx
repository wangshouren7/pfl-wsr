"use client";

import type React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

import { config } from "../wagmi";
import { Toaster, TooltipProvider } from "@pfl-wsr/ui";

const queryClient = new QueryClient({
  // defaultOptions: {
  //   queries: {
  //     throwOnError: (error) => {
  //       logger.error("queryClient throwOnError ===========begin");
  //       logger.error("error.name", error.name);
  //       logger.error("error.cause", error.cause);
  //       logger.error("error.message", error.message);
  //       logger.error("error.stack", error.stack);
  //       logger.error("queryClient throwOnError ===========end");
  //       return false;
  //     },
  //   },
  // },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <TooltipProvider>
            {children}

            <Toaster richColors />
          </TooltipProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
