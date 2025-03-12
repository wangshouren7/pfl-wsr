import { contracts } from "@/contracts";

export const orderTypeConfig = {
  [contracts.Exchange.EOrderType.BUY]: {
    color: "text-green-500",
    symbol: "+",
  },
  [contracts.Exchange.EOrderType.SELL]: {
    color: "text-red-500",
    symbol: "-",
  },
};
