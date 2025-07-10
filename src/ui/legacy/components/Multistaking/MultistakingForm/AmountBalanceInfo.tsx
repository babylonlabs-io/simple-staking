import { useWatch } from "@babylonlabs-io/core-ui";

import { getNetworkConfigBTC } from "@/ui/legacy/config/network/btc";
import { usePrice } from "@/ui/legacy/hooks/client/api/usePrices";
import { useBalanceState } from "@/ui/legacy/state/BalanceState";
import { satoshiToBtc } from "@/ui/legacy/utils/btc";
import { calculateTokenValueInCurrency } from "@/ui/legacy/utils/formatCurrency";
import { maxDecimals } from "@/ui/legacy/utils/maxDecimals";

const { coinSymbol, displayUSD } = getNetworkConfigBTC();

//TODO: Temporary disable max button until we implement https://github.com/babylonlabs-io/simple-staking/issues/1119
export const AmountBalanceInfo = () => {
  const { stakableBtcBalance } = useBalanceState();

  const btcAmount = useWatch({ name: "amount", defaultValue: "" });
  // const { setValue } = useFormContext();
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

  return (
    <div className="flex text-sm flex-row justify-between w-full content-center">
      <div>
        Stakable:{" "}
        <span className="cursor-default">
          {maxDecimals(formattedBalance, 8)}
        </span>{" "}
        {coinSymbol}
      </div>
      {displayUSD && <div>{btcAmountUsd} USD</div>}
    </div>
  );
};
