import { useWatch } from "@babylonlabs-io/core-ui";

import { usePrice } from "@/app/hooks/client/api/usePrices";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { satoshiToBtc } from "@/utils/btc";
import { calculateTokenValueInCurrency } from "@/utils/formatCurrency";

import { FeeItem } from "./FeeItem";

const { coinSymbol } = getNetworkConfigBTC();

export function BTCFeeAmount() {
  const feeAmount = useWatch({ name: "feeAmount" });

  const btcInUsd = usePrice(coinSymbol);
  const formattedFeeAmount = feeAmount ? parseFloat(feeAmount) : 0;
  const btcAmount = isNaN(formattedFeeAmount)
    ? 0
    : satoshiToBtc(formattedFeeAmount);
  const feeInUsd = calculateTokenValueInCurrency(btcAmount, btcInUsd, {
    zeroDisplay: "$0.00",
  });

  return (
    <FeeItem title={`${coinSymbol} Network Fee`} hint={feeInUsd}>
      {btcAmount} {coinSymbol}
    </FeeItem>
  );
}
