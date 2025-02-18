import { maxDecimals } from "./maxDecimals";

export function formatBTCTvl(
  tvlInBtc: number,
  coinSymbol: string,
  usdValue?: number,
): string {
  const btcFormatted =
    tvlInBtc >= 1 ? maxDecimals(tvlInBtc, 2) : maxDecimals(tvlInBtc, 8);

  const usdPart = usdValue
    ? `($${usdValue.toLocaleString("en", {
        notation: "compact",
        maximumFractionDigits: 2,
      })})`
    : "";

  return `${btcFormatted} ${coinSymbol} ${usdPart}`.trim();
}
