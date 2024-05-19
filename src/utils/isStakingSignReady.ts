import { FinalityProvider } from "@/app/types/finalityProviders";

// Check if the staking transaction is ready to be signed
export const isStakingSignReady = (
  // Parameter min and max values
  minAmount: number,
  maxAmount: number,
  minTime: number,
  maxTime: number,
  // Actual values
  amount: number,
  time: number,
  finalityProvider: FinalityProvider | undefined,
) => {
  if (!finalityProvider) return false;

  // API data is ready
  const stakingAmountAPIReady = minAmount && maxAmount;
  // App inputs are filled
  const stakingAmountAppReady = amount >= minAmount && amount <= maxAmount;
  // Amount is ready
  const stakingAmountReady = stakingAmountAPIReady && stakingAmountAppReady;

  // API data is ready
  const stakingTimeAPIReady = minTime && maxTime;
  // App inputs are filled
  const stakingTimeAppReady = time >= minTime && time <= maxTime;
  // Staking time is fixed
  const stakingTimeFixed = minTime === maxTime;
  // Staking time is ready
  const stakingTimeReady =
    stakingTimeAPIReady && (stakingTimeAppReady || stakingTimeFixed);

  return stakingAmountReady && stakingTimeReady && finalityProvider;
};
