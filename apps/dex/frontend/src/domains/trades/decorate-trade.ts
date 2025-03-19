import { type contracts } from "@/contracts";
import { type Address } from "viem";
import {
  decorateBaseOrder,
  type IDecoratedBaseOrder,
} from "../order/decorate-order";

export interface IDecoratedTrade extends IDecoratedBaseOrder {
  userFill: Address;
}

export function decorateTrade(
  trade: contracts.Exchange.TradeEvent.OutputObject,
): IDecoratedTrade {
  const decoratedBaseOrder = decorateBaseOrder(trade);
  return {
    ...decoratedBaseOrder,
    userFill: trade.userFill as Address,
  } satisfies IDecoratedTrade;
}
