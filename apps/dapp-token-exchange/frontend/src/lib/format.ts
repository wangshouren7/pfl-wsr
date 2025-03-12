import { formatUnits as _formatUnits } from "viem";

export function formatUnits(value: bigint | undefined, decimals: number = 18) {
  return typeof value === "bigint"
    ? _formatUnits(value as bigint, decimals)
    : "-";
}
