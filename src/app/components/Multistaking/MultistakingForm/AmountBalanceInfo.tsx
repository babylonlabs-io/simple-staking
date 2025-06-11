import { useFormContext, useWatch } from "@babylonlabs-io/core-ui";

import { getNetworkConfigBTC } from "@/app/config/network/btc";
import { usePrice } from "@/app/hooks/client/api/usePrices";
import { useBalanceState } from "@/app/state/BalanceState";
import { satoshiToBtc } from "@/app/utils/btc";
import { calculateTokenValueInCurrency } from "@/app/utils/formatCurrency";
import { maxDecimals } from "@/app/utils/maxDecimals";

export const AmountBalanceInfo = () => {
  const { totalBtcBalance } = useBalanceState();

  const btcAmount = useWatch({ name: "amount", defaultValue: "" });
  const { setValue } = useFormContext();

  const { coinSymbol } = getNetworkConfigBTC();
  const btcInUsd = usePrice(coinSymbol);

  const btcAmountValue = parseFloat(btcAmount || "0");
  const btcAmountUsd = calculateTokenValueInCurrency(btcAmountValue, btcInUsd, {
    zeroDisplay: "$0.00",
  });
  const formattedBalance = satoshiToBtc(totalBtcBalance);

  const handleSetMaxBalance = () => {
    setValue("amount", formattedBalance.toString(), {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  return (
    <div className="flex text-sm flex-row justify-between w-full content-center">
      <div>
        Stakable:{" "}
        <u className="cursor-pointer" onClick={handleSetMaxBalance}>
          {maxDecimals(formattedBalance, 8)}
        </u>{" "}
        {coinSymbol}
      </div>
      <div>{btcAmountUsd} USD</div>
    </div>
  );
};
