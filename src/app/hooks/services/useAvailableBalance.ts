import { useWatch } from "@babylonlabs-io/core-ui";

import { useBalanceState } from "@/app/state/BalanceState";
import { satoshiToBtc } from "@/app/utils/btc";
import { maxDecimals } from "@/app/utils/maxDecimals";

import { useStakingService } from "./useStakingService";

const MAX_CONVERGENCE_ATTEMPTS = 10;

export function useAvailableBalance() {
  const { totalBtcBalance } = useBalanceState();
  const feeAmountSat = parseFloat(
    useWatch({ name: "feeAmount", defaultValue: "0" }) || "0",
  );

  const balanceBtc = satoshiToBtc(totalBtcBalance);
  const feeAmountBtc = satoshiToBtc(feeAmountSat);
  const { calculateFeeAmount } = useStakingService();

  function calculateAvailableBalance() {
    return maxDecimals(Math.max(balanceBtc - feeAmountBtc, 0), 8);
  }

  function calculateMaxStakingAmount(params: {
    finalityProvider: string;
    term: number;
    feeRate: number;
  }): number {
    const { finalityProvider, term, feeRate } = params;
    const availableBalance = calculateAvailableBalance();

    let amountBtc = availableBalance;
    let iterations = 0;

    while (iterations < MAX_CONVERGENCE_ATTEMPTS) {
      iterations += 1;

      const feeSat = calculateFeeAmount({
        finalityProvider,
        amount: amountBtc,
        term,
        feeRate,
      });

      const feeBtc = satoshiToBtc(feeSat);
      const nextAmount = maxDecimals(Math.max(balanceBtc - feeBtc, 0), 8);

      if (Math.abs(nextAmount - amountBtc) < 1e-8) {
        amountBtc = nextAmount;
        break;
      }

      amountBtc = nextAmount;
    }

    if (iterations >= MAX_CONVERGENCE_ATTEMPTS) {
      console.warn(
        `Max balance calculation did not converge after ${MAX_CONVERGENCE_ATTEMPTS} attempts. Final amount: ${amountBtc} BTC`,
      );
    }

    return amountBtc;
  }

  return {
    calculateAvailableBalance,
    totalBalance: balanceBtc,
    calculateMaxStakingAmount,
  };
}
