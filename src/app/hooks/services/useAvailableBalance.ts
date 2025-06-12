import { useWatch } from "@babylonlabs-io/core-ui";

import { useBalanceState } from "@/app/state/BalanceState";
import { satoshiToBtc } from "@/app/utils/btc";
import { maxDecimals } from "@/app/utils/maxDecimals";

export function useAvailableBalance() {
  const { totalBtcBalance } = useBalanceState();
  const feeAmountSat = parseFloat(
    useWatch({ name: "feeAmount", defaultValue: "0" }) || "0",
  );

  const balanceBtc = satoshiToBtc(totalBtcBalance);
  const feeAmountBtc = satoshiToBtc(feeAmountSat);

  function calculateAvailableBalance() {
    return maxDecimals(Math.max(balanceBtc - feeAmountBtc, 0), 8);
  }

  return {
    calculateAvailableBalance,
    totalBalance: balanceBtc,
  };
}
