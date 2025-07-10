import { getNetworkConfigBBN } from "@/ui/legacy/config/network/bbn";
import { usePrice } from "@/ui/legacy/hooks/client/api/usePrices";
import { calculateTokenValueInCurrency } from "@/ui/legacy/utils/formatCurrency";

import { FeeItem } from "./FeeItem";
interface FeeStatsProps {
  amount?: string;
}

const { coinSymbol, displayUSD } = getNetworkConfigBBN();

export function BBNFeeAmount({ amount = "0" }: FeeStatsProps) {
  const bbnInUsd = usePrice(coinSymbol);
  const feeInUsd = calculateTokenValueInCurrency(parseFloat(amount), bbnInUsd);

  return (
    <FeeItem
      title={`${coinSymbol} Network Fee`}
      hint={displayUSD ? feeInUsd : undefined}
    >
      {amount} {coinSymbol}
    </FeeItem>
  );
}
