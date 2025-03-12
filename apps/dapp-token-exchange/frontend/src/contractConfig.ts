// copied from @pfl-wsr/dapp-token-exchange-contracts/ignition/deployments/chain-31337

const ETHER_ADDRESS = "0x0000000000000000000000000000000000000000";

export { ETHER_ADDRESS };
export {
  TOKEN_CONTRACT_CONFIG,
  TOKEN_CONTRACT_EVENTS,
} from "@pfl-wsr/dapp-token-exchange-contracts/contracts/Token";
export {
  EXCHANGE_CONTRACT_CONFIG,
  EXCHANGE_CONTRACT_EVENTS,
} from "@pfl-wsr/dapp-token-exchange-contracts/contracts/Exchange";

export type {
  Exchange,
  Token,
} from "@pfl-wsr/dapp-token-exchange-contracts/typechain-types";
