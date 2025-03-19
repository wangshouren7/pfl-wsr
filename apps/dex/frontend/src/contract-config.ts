// copied from @pfl-wsr/dex-contracts/ignition/deployments/chain-31337

import { useChainId } from "wagmi";
import { CHAIN_ID_TO_CONTRACT_CONFIG } from "@pfl-wsr/dex-contracts";
import { logger } from "./lib/logger";
import { keys } from "lodash-es";

const ETHER_ADDRESS = "0x0000000000000000000000000000000000000000";

export function useContractConfig() {
  const chainId = useChainId();

  logger.withTag(useContractConfig.name).info("chainId", chainId);

  const config =
    CHAIN_ID_TO_CONTRACT_CONFIG[
      chainId as keyof typeof CHAIN_ID_TO_CONTRACT_CONFIG
    ];

  if (!config) {
    return CHAIN_ID_TO_CONTRACT_CONFIG[
      keys(
        CHAIN_ID_TO_CONTRACT_CONFIG,
      )[0] as unknown as keyof typeof CHAIN_ID_TO_CONTRACT_CONFIG
    ];
  }

  return config;
}

export { TOKEN_EVENTS, EXCHANGE_EVENTS } from "@pfl-wsr/dex-contracts";

export { ETHER_ADDRESS };
