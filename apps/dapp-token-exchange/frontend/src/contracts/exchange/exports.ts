export {
  EXCHANGE_CONTRACT_CONFIG as config,
  EXCHANGE_CONTRACT_EVENTS as events,
} from "@pfl-wsr/dapp-token-exchange-contracts/contracts/Exchange";

export type {
  Exchange as Contract,
  DepositEvent,
  CancelEvent,
  OrderEvent,
  TradeEvent,
  WithdrawEvent,
  ExchangeInterface as Interface,
} from "@pfl-wsr/dapp-token-exchange-contracts/typechain-types/Exchange";

export enum EOrderStatus {
  PENDING,
  FILLED,
  CANCELLED,
}

export enum EOrderType {
  BUY = "buy",
  SELL = "sell",
}
