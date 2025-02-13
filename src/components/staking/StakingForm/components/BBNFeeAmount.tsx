import { usePrices } from "@/app/hooks/client/api/usePrices";
import { getNetworkConfigBBN } from "@/config/network/bbn";

import { FeeItem } from "./FeeItem";

interface FeeStatsProps {
  amount?: string;
}

const { coinSymbol } = getNetworkConfigBBN();

export function BBNFeeAmount({ amount = "0" }: FeeStatsProps) {
  const { data: prices } = usePrices();

  const bbnInUsd = prices?.[coinSymbol] ?? 0;
  const feeInUsd = (parseFloat(amount) * bbnInUsd).toFixed(2);
  const feeInUsdDisplay = feeInUsd === "0.00" ? "-" : `$${feeInUsd}`;

  return (
    <FeeItem title={`${coinSymbol} Network Fee`} hint={feeInUsdDisplay}>
      {amount} {coinSymbol}
    </FeeItem>
  );
}
