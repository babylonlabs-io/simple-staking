import { usePrice } from "@/app/hooks/client/api/usePrices";
import { getNetworkConfigBBN } from "@/config/network/bbn";
import { calculateTokenValueInCurrency } from "@/utils/formatCurrency";

import { FeeItem } from "./FeeItem";
interface FeeStatsProps {
  amount?: string;
}
const { coinSymbol } = getNetworkConfigBBN();
export function BBNFeeAmount({ amount = "0" }: FeeStatsProps) {
  const bbnInUsd = usePrice(coinSymbol);
  const feeInUsd = calculateTokenValueInCurrency(parseFloat(amount), bbnInUsd);

  return (
    <FeeItem title={`${coinSymbol} Network Fee`} hint={feeInUsd}>
      {amount} {coinSymbol}
    </FeeItem>
  );
}
