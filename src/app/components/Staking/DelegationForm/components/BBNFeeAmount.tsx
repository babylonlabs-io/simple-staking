import { getNetworkConfigBBN } from "@/app/config/network/bbn";
import { usePrice } from "@/app/hooks/client/api/usePrices";
import { calculateTokenValueInCurrency } from "@/app/utils/formatCurrency";

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
