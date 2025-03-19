import { writeFileSync } from "fs";
import { artifacts } from "hardhat";
import { format } from "prettier";
import { getDeployedChainIdToAddresses } from "./utils";

async function generateIndex() {
  const chainIdToAddresses = await getDeployedChainIdToAddresses();

  const tokenAbi = (await artifacts.readArtifact("Token")).abi;
  const exchangeAbi = (await artifacts.readArtifact("Exchange")).abi;
  const tokenEvents = tokenAbi
    .filter((abi) => abi.type === "event")
    .reduce((acc, abi) => {
      acc[abi.name] = abi;
      return acc;
    }, {});

  const exchangeEvents = exchangeAbi
    .filter((abi) => abi.type === "event")
    .reduce((acc, abi) => {
      acc[abi.name] = abi;
      return acc;
    }, {});

  const code = `
  // The contract config for Frontend usage.
  // Automatically generated.

  export * from "./typechain-types";
  
  export const TOKEN_ABI = ${JSON.stringify(tokenAbi, null, 2)} as const;
  export const EXCHANGE_ABI = ${JSON.stringify(exchangeAbi, null, 2)} as const;

  export const TOKEN_EVENTS = ${JSON.stringify(tokenEvents, null, 2)} as const;
  export const EXCHANGE_EVENTS = ${JSON.stringify(exchangeEvents, null, 2)} as const;

  export const CHAIN_ID_TO_CONTRACT_CONFIG = {
    ${Object.entries(chainIdToAddresses)
      .map(([chainId, addresses]) => {
        return `
      ${chainId}: {
        token: {
          address: "${addresses.Token}",
          abi: TOKEN_ABI,
        },
        exchange: {
          address: "${addresses.Exchange}",
          abi: EXCHANGE_ABI,
        },
      },
      `;
      })
      .join("\n")}
  } as const;
   
  `;

  writeFileSync(`./index.ts`, await format(code, { parser: "typescript" }));
}

generateIndex();
