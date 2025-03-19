export type {
  Exchange as Contract,
  DepositEvent,
  CancelEvent,
  OrderEvent,
  TradeEvent,
  WithdrawEvent,
  ExchangeInterface as Interface,
} from "@pfl-wsr/dex-contracts/typechain-types/Exchange";

export enum EOrderStatus {
  PENDING,
  FILLED,
  CANCELLED,
}

export enum EOrderType {
  BUY = "buy",
  SELL = "sell",
}
