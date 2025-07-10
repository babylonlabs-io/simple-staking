import { maxDecimals } from "./maxDecimals";

export function formatBTCTvl(
  tvlInBtc: number,
  coinSymbol: string,
  rate?: number,
  displayUSD: boolean = true,
): string {
  const btcFormatted =
    tvlInBtc >= 1 ? maxDecimals(tvlInBtc, 2) : maxDecimals(tvlInBtc, 8);

  const usdPart =
    rate && displayUSD
      ? `($${(tvlInBtc * rate).toLocaleString("en", {
          notation: "compact",
          maximumFractionDigits: 2,
        })})`
      : "";

  return `${btcFormatted} ${coinSymbol} ${usdPart}`.trim();
}
