import { useWatch } from "@babylonlabs-io/bbn-core-ui";

import { usePrice } from "@/app/hooks/client/api/usePrices";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { satoshiToBtc } from "@/utils/btc";
import { calculateTokenValueInCurrency } from "@/utils/formatCurrency";

import { FeeItem } from "./FeeItem";

const { coinSymbol } = getNetworkConfigBTC();

export function BTCFeeAmount() {
  const feeAmount = useWatch({ name: "feeAmount" });

  const btcInUsd = usePrice(coinSymbol);
  const formattedFeeAmount = parseFloat(feeAmount);
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
