import { useWatch } from "@babylonlabs-io/core-ui";

import { getNetworkConfigBTC } from "@/ui/config/network/btc";
import { usePrice } from "@/ui/hooks/client/api/usePrices";
import { satoshiToBtc } from "@/ui/utils/btc";
import { calculateTokenValueInCurrency } from "@/ui/utils/formatCurrency";

import { FeeItem } from "./FeeItem";

const { coinSymbol } = getNetworkConfigBTC();

export function BTCFeeAmount() {
  const feeAmount = useWatch({ name: "feeAmount" });

  const btcInUsd = usePrice(coinSymbol);
  const formattedFeeAmount = parseFloat(feeAmount || "0");
  const feeInUsd = calculateTokenValueInCurrency(
    satoshiToBtc(formattedFeeAmount),
    btcInUsd,
  );

  return (
    <FeeItem title={`${coinSymbol} Network Fee`} hint={feeInUsd}>
      {satoshiToBtc(formattedFeeAmount)} {coinSymbol}
    </FeeItem>
  );
}
