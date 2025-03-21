import { Text } from "@babylonlabs-io/core-ui";

import { usePrice } from "@/app/hooks/client/api/usePrices";
import { useBbnQuery } from "@/app/hooks/client/rpc/queries/useBbnQuery";
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
  const {
    balanceQuery: { data: bbnBalance = 0 },
  } = useBbnQuery();

  return (
    <div className="flex flex-col gap-2">
      <FeeItem title={`${coinSymbol} Network Fee`} hint={feeInUsd}>
        {amount} {coinSymbol}
      </FeeItem>
      {bbnBalance === 0 && (
        <Text variant="caption" className="text-error-500">
          * You need{" "}
          {amount !== "0"
            ? `${amount} ${coinSymbol}`
            : `sufficient ${coinSymbol}`}{" "}
          in your wallet to cover network fees
        </Text>
      )}
    </div>
  );
}
