import { getNetworkConfigBBN } from "@/config/network/bbn";

import { FeeItem } from "./FeeItem";

interface FeeStatsProps {
  amount?: string;
}

const { coinSymbol } = getNetworkConfigBBN();

export function BBNFeeAmount({ amount = "0" }: FeeStatsProps) {
  return (
    <FeeItem title="Babylon Network Fee">
      {amount} {coinSymbol}
    </FeeItem>
  );
}
