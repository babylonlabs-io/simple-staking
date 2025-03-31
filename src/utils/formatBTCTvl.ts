import { maxDecimals } from "./maxDecimals";

export function formatBTCTvl(
  tvlInBtc: number,
  coinSymbol: string,
  rate?: number,
): string {
  const btcFormatted =
    tvlInBtc >= 1 ? maxDecimals(tvlInBtc, 2) : maxDecimals(tvlInBtc, 8);

  const usdPart = rate
    ? `($${(tvlInBtc * rate).toLocaleString("en", {
        notation: "compact",
        maximumFractionDigits: 2,
      })})`
    : "";

  return `${btcFormatted} ${coinSymbol} ${usdPart}`.trim();
}
