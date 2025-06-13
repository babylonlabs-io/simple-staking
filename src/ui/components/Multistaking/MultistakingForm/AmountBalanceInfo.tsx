import { useWatch } from "@babylonlabs-io/core-ui";

import { getNetworkConfigBTC } from "@/ui/config/network/btc";
import { usePrice } from "@/ui/hooks/client/api/usePrices";
import { useBalanceState } from "@/ui/state/BalanceState";
import { useStakingState } from "@/ui/state/StakingState";
import { satoshiToBtc } from "@/ui/utils/btc";
import { calculateTokenValueInCurrency } from "@/ui/utils/formatCurrency";
import { maxDecimals } from "@/ui/utils/maxDecimals";

//TODO: Temporary disable max button until we implement https://github.com/babylonlabs-io/simple-staking/issues/1119
export const AmountBalanceInfo = () => {
  const { stakableBtcBalance } = useBalanceState();
  const btcAmount = useWatch({ name: "amount", defaultValue: "" });
  // const { setValue } = useFormContext();
  const { stakingInfo } = useStakingState();

  const { coinSymbol } = getNetworkConfigBTC();
  const btcInUsd = usePrice(coinSymbol);

  const btcAmountValue = parseFloat(btcAmount || "0");
  const btcAmountUsd = calculateTokenValueInCurrency(btcAmountValue, btcInUsd, {
    zeroDisplay: "$0.00",
  });
  const formattedBalance = satoshiToBtc(stakableBtcBalance);

  // const handleSetMaxBalance = () => {
  //   setValue("amount", formattedBalance.toString(), {
  //     shouldValidate: true,
  //     shouldDirty: true,
  //     shouldTouch: true,
  //   });
  // };

  const maxAmount = Math.min(
    stakableBtcBalance,
    stakingInfo?.maxStakingAmountSat || 0,
  );
  const minAmount = stakingInfo?.minStakingAmountSat;

  return (
    <div className="flex text-sm flex-row justify-between w-full content-center">
      <div>
        <div>
          Stakable:{" "}
          <span className="cursor-pointer">
            {maxDecimals(formattedBalance, 8)}
          </span>{" "}
          {coinSymbol}
        </div>
        <div>
          Min/Max: {satoshiToBtc(minAmount || 0)}/{satoshiToBtc(maxAmount)}{" "}
          {coinSymbol}
        </div>
      </div>
      <div>{btcAmountUsd} USD</div>
    </div>
  );
};
