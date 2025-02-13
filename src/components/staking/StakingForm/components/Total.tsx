import { Text, useWatch } from "@babylonlabs-io/bbn-core-ui";
import { useMemo } from "react";

import { usePrices } from "@/app/hooks/client/api/usePrices";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { satoshiToBtc } from "@/utils/btc";
import { maxDecimals } from "@/utils/maxDecimals";

const { coinSymbol } = getNetworkConfigBTC();

export function Total() {
  const [amount, feeAmount] = useWatch({ name: ["amount", "feeAmount"] });
  const { data: prices } = usePrices();

  const total = useMemo(
    () => maxDecimals(parseFloat(amount) + satoshiToBtc(feeAmount), 8),
    [amount, feeAmount],
  );

  const btcInUsd = prices?.[coinSymbol] ?? 0;
  const totalInUsd = (total * btcInUsd).toFixed(2);
  const totalInUsdDisplay = totalInUsd === "0.00" ? "" : `$${totalInUsd}`;

  return (
    <div className="flex flex-row items-start justify-between text-accent-primary">
      <Text variant="body1" className="font-bold">
        Total
      </Text>

      <div className="flex flex-col items-end justify-center">
        <Text variant="body1" className="font-bold">
          {total} {coinSymbol}
        </Text>
        <Text variant="body1" className="text-accent-secondary text-sm">
          {totalInUsdDisplay}
        </Text>
      </div>
    </div>
  );
}
