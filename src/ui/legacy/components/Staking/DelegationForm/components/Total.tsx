import { Text, useWatch } from "@babylonlabs-io/core-ui";
import { useMemo } from "react";

import { getNetworkConfigBTC } from "@/ui/legacy/config/network/btc";
import { usePrice } from "@/ui/legacy/hooks/client/api/usePrices";
import { satoshiToBtc } from "@/ui/legacy/utils/btc";
import { calculateTokenValueInCurrency } from "@/ui/legacy/utils/formatCurrency";
import { maxDecimals } from "@/ui/legacy/utils/maxDecimals";

const { coinSymbol, displayUSD } = getNetworkConfigBTC();

export function Total() {
  const [amount, feeAmount] = useWatch({ name: ["amount", "feeAmount"] });

  const total = useMemo(
    () =>
      maxDecimals(parseFloat(amount || "0") + satoshiToBtc(feeAmount || 0), 8),
    [amount, feeAmount],
  );

  const btcInUsd = usePrice(coinSymbol);
  const totalInUsd = calculateTokenValueInCurrency(total, btcInUsd);

  return (
    <div className="flex flex-row items-start justify-between text-accent-primary">
      <Text variant="body1" className="font-bold">
        Total
      </Text>

      <div className="flex flex-col items-end justify-center">
        <Text variant="body1" className="font-bold">
          {total} {coinSymbol}
        </Text>
        {displayUSD && (
          <Text variant="body1" className="text-accent-secondary text-sm">
            {totalInUsd}
          </Text>
        )}
      </div>
    </div>
  );
}
