import { FinalityProvider } from "@/app/types/finalityProviders";

// Check if the staking transaction is ready to be signed
export const stakingSignReady = (
  // API values
  minStakingAmountSat: number,
  maxStakingAmountSat: number,
  minStakingTimeBlocks: number,
  maxStakingTimeBlocks: number,
  // Input values
  stakingAmountSat: number,
  stakingTimeBlocks: number,
  finalityProvider: FinalityProvider | undefined,
) => {
  if (!finalityProvider) return false;

  // API data is ready
  const stakingAmountAPIReady = minStakingAmountSat && maxStakingAmountSat;
  // App inputs are filled
  const stakingAmountAppReady =
    stakingAmountSat >= minStakingAmountSat &&
    stakingAmountSat <= maxStakingAmountSat;
  // Amount is ready
  const stakingAmountReady = stakingAmountAPIReady && stakingAmountAppReady;

  // API data is ready
  const stakingTimeAPIReady = minStakingTimeBlocks && maxStakingTimeBlocks;
  // App inputs are filled
  const stakingTimeAppReady =
    stakingTimeBlocks >= minStakingTimeBlocks &&
    stakingTimeBlocks <= maxStakingTimeBlocks;
  // Staking time is fixed
  const stakingTimeFixed = minStakingTimeBlocks === maxStakingTimeBlocks;
  // Staking time is ready
  const stakingTimeReady =
    stakingTimeAPIReady && (stakingTimeAppReady || stakingTimeFixed);

  return stakingAmountReady && stakingTimeReady && finalityProvider;
};
