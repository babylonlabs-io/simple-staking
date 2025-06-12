import { useFormContext, useWatch } from "@babylonlabs-io/core-ui";
import { useEffect } from "react";

import { getNetworkConfigBTC } from "@/app/config/network/btc";
import { usePrice } from "@/app/hooks/client/api/usePrices";
import { useAvailableBalance } from "@/app/hooks/services/useAvailableBalance";
import { useMultistakingState } from "@/app/state/MultistakingState";
import { calculateTokenValueInCurrency } from "@/app/utils/formatCurrency";
import { maxDecimals } from "@/app/utils/maxDecimals";

export const AmountBalanceInfo = () => {
  const { isMaxBalanceMode, setIsMaxBalanceMode, isProviderSelected } =
    useMultistakingState();

  const btcAmount = useWatch({ name: "amount", defaultValue: "" });
  const { setValue } = useFormContext();

  const { coinSymbol } = getNetworkConfigBTC();
  const btcInUsd = usePrice(coinSymbol);

  const { calculateAvailableBalance } = useAvailableBalance();
  const availableBalance = calculateAvailableBalance();

  const btcAmountValue = parseFloat(btcAmount || "0");
  const btcAmountUsd = calculateTokenValueInCurrency(btcAmountValue, btcInUsd, {
    zeroDisplay: "$0.00",
  });

  useEffect(() => {
    if (isMaxBalanceMode) {
      setValue("amount", availableBalance.toString(), {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [isMaxBalanceMode, availableBalance, setValue]);

  const handleSetMaxBalance = () => {
    if (!isProviderSelected) {
      return;
    }

    setIsMaxBalanceMode(true);
    setValue("amount", availableBalance.toString(), {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  return (
    <div className="flex text-sm flex-row justify-between w-full content-center">
      <div>
        Stakable:{" "}
        <u
          className={
            isProviderSelected
              ? "cursor-pointer"
              : "cursor-not-allowed opacity-50"
          }
          onClick={handleSetMaxBalance}
          aria-disabled={!isProviderSelected}
        >
          {maxDecimals(availableBalance, 8)}
        </u>{" "}
        {coinSymbol}
      </div>
      <div>{btcAmountUsd} USD</div>
    </div>
  );
};
