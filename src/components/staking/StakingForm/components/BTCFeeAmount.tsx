import { useWatch } from "@babylonlabs-io/bbn-core-ui";

import { usePrices } from "@/app/hooks/client/api/usePrices";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { satoshiToBtc } from "@/utils/btc";

import { FeeItem } from "./FeeItem";

const { coinSymbol } = getNetworkConfigBTC();

export function BTCFeeAmount() {
  const feeAmount = useWatch({ name: "feeAmount" });

  const { data: prices } = usePrices();

  const btcInUsd = prices?.[coinSymbol] ?? 0;
  const feeInUsd = (satoshiToBtc(parseFloat(feeAmount)) * btcInUsd).toFixed(2);
  const feeInUsdDisplay = feeInUsd === "0.00" ? "" : `$${feeInUsd}`;

  return (
    <FeeItem title={`${coinSymbol} Network Fee`} hint={feeInUsdDisplay}>
      {satoshiToBtc(parseFloat(feeAmount))} {coinSymbol}
    </FeeItem>
  );
}
