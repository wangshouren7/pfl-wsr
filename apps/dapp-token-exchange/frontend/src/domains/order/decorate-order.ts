import { contracts } from "@/contracts";
import { formatUnits } from "@/lib/format";
import dayjs from "dayjs";
import { divide, round } from "mathjs";
import { type Address } from "viem";

export interface IDecoratedBaseOrder {
  id: bigint;
  user: Address;
  etherAmount: bigint;
  tokenAmount: bigint;
  etherAmountFormatted: number;
  tokenAmountFormatted: number;
  tokenPriceFormatted: number;
  tokenPrice: number;
  orderType: contracts.Exchange.EOrderType;
  /** The order type of the fill order, opposite to orderType */
  fillOrderType: contracts.Exchange.EOrderType;
  timestamp: bigint;
  time: string;
}

export interface IDecoratedOrder extends IDecoratedBaseOrder {
  status: contracts.Exchange.EOrderStatus;
}

export function decorateBaseOrder({
  id,
  user,
  amountGet,
  tokenGive,
  amountGive,
  timestamp,
}: Omit<
  contracts.Exchange.Contract._OrderStruct,
  "status"
>): IDecoratedBaseOrder {
  let etherAmount: bigint;
  let tokenAmount: bigint;
  let orderType: contracts.Exchange.EOrderType;
  if (tokenGive === contracts.ETHER_ADDRESS) {
    // buy
    orderType = contracts.Exchange.EOrderType.BUY;
    etherAmount = BigInt(amountGive);
    tokenAmount = BigInt(amountGet);
  } else {
    // sell
    orderType = contracts.Exchange.EOrderType.SELL;
    etherAmount = BigInt(amountGet);
    tokenAmount = BigInt(amountGive);
  }

  const etherAmountFormatted = +formatUnits(etherAmount);
  const tokenAmountFormatted = +formatUnits(tokenAmount);
  const tokenPrice = +divide(
    etherAmountFormatted,
    tokenAmountFormatted,
  ).toString();

  const tokenPriceFormatted = round(tokenPrice, 5);

  return {
    id: BigInt(id),
    user: user as Address,
    etherAmount,
    tokenAmount,
    etherAmountFormatted,
    tokenAmountFormatted,
    tokenPriceFormatted,
    tokenPrice,
    orderType,
    fillOrderType:
      orderType === contracts.Exchange.EOrderType.BUY
        ? contracts.Exchange.EOrderType.SELL
        : contracts.Exchange.EOrderType.BUY,
    timestamp: BigInt(timestamp),
    time: dayjs(Number(timestamp) * 1000).format("YYYY-MM-DD HH:mm:ss"),
  } satisfies IDecoratedBaseOrder;
}

export function decorateOrder({
  status,
  ...rest
}: contracts.Exchange.Contract._OrderStruct): IDecoratedOrder {
  return {
    ...decorateBaseOrder(rest),
    status: status as contracts.Exchange.EOrderStatus,
  } satisfies IDecoratedOrder;
}
