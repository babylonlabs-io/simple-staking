import { useFormContext, useWatch } from "@babylonlabs-io/core-ui";
import { useEffect } from "react";

import { getNetworkConfigBTC } from "@/app/config/network/btc";
import { usePrice } from "@/app/hooks/client/api/usePrices";
import { useBalanceState } from "@/app/state/BalanceState";
import { useMultistakingState } from "@/app/state/MultistakingState";
import { satoshiToBtc } from "@/app/utils/btc";
import { calculateTokenValueInCurrency } from "@/app/utils/formatCurrency";
import { maxDecimals } from "@/app/utils/maxDecimals";

export const AmountBalanceInfo = () => {
  const { totalBtcBalance } = useBalanceState();
  const { isMaxBalanceMode, setIsMaxBalanceMode } = useMultistakingState();

  const btcAmount = useWatch({ name: "amount", defaultValue: "" });
  const { setValue } = useFormContext();

  const { coinSymbol } = getNetworkConfigBTC();
  const btcInUsd = usePrice(coinSymbol);

  const btcAmountValue = parseFloat(btcAmount || "0");
  const btcAmountUsd = calculateTokenValueInCurrency(btcAmountValue, btcInUsd, {
    zeroDisplay: "$0.00",
  });

  const balanceBtc = satoshiToBtc(totalBtcBalance);

  const feeAmountSat = parseFloat(
    useWatch({ name: "feeAmount", defaultValue: "0" }) || "0",
  );
  const feeAmountBtc = satoshiToBtc(feeAmountSat);

  const availableBalanceBtc = Math.max(balanceBtc - feeAmountBtc, 0);

  useEffect(() => {
    if (isMaxBalanceMode) {
      setValue("amount", availableBalanceBtc.toString(), {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [isMaxBalanceMode, availableBalanceBtc, setValue]);

  const handleSetMaxBalance = () => {
    setIsMaxBalanceMode(true);
    setValue("amount", availableBalanceBtc.toString(), {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  return (
    <div className="flex text-sm flex-row justify-between w-full content-center">
      <div>
        Balance:{" "}
        <u className="cursor-pointer" onClick={handleSetMaxBalance}>
          {maxDecimals(availableBalanceBtc, 8)}
        </u>{" "}
        {coinSymbol}
      </div>
      <div>{btcAmountUsd} USD</div>
    </div>
  );
};
