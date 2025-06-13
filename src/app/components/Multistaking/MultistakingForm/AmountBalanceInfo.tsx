import { useWatch } from "@babylonlabs-io/core-ui";

import { getNetworkConfigBTC } from "@/app/config/network/btc";
import { usePrice } from "@/app/hooks/client/api/usePrices";
import { calculateTokenValueInCurrency } from "@/app/utils/formatCurrency";

export const AmountBalanceInfo = () => {
  const btcAmount = useWatch({ name: "amount", defaultValue: "" });

  const { coinSymbol } = getNetworkConfigBTC();
  const btcInUsd = usePrice(coinSymbol);

  const btcAmountValue = parseFloat(btcAmount || "0");
  const btcAmountUsd = calculateTokenValueInCurrency(btcAmountValue, btcInUsd, {
    zeroDisplay: "$0.00",
  });

  return (
    <div className="flex text-sm flex-row justify-between w-full content-center">
      <div />
      <div>{btcAmountUsd} USD</div>
    </div>
  );
};
