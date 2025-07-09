import { useWatch } from "@babylonlabs-io/core-ui";

import { getNetworkConfigBTC } from "@/ui/common/config/network/btc";
import { usePrice } from "@/ui/common/hooks/client/api/usePrices";
import { satoshiToBtc } from "@/ui/common/utils/btc";
import { calculateTokenValueInCurrency } from "@/ui/common/utils/formatCurrency";

import { FeeItem } from "./FeeItem";

const { coinSymbol, displayUSD } = getNetworkConfigBTC();

export function BTCFeeAmount() {
  const feeAmount = useWatch({ name: "feeAmount" });

  const btcInUsd = usePrice(coinSymbol);
  const formattedFeeAmount = parseFloat(feeAmount || "0");
  const feeInUsd = calculateTokenValueInCurrency(
    satoshiToBtc(formattedFeeAmount),
    btcInUsd,
  );

  return (
    <FeeItem
      title={`${coinSymbol} Network Fee`}
      hint={displayUSD ? feeInUsd : undefined}
    >
      {satoshiToBtc(formattedFeeAmount)} {coinSymbol}
    </FeeItem>
  );
}
