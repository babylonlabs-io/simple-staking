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
  fpSelected: boolean,
  stakingFeeSat: number,
  bbnBalance: number,
): { isReady: boolean; reason: string } => {
  if (!fpSelected)
    return {
      isReady: false,
      reason: "Please select a finality provider",
    };

  // Amount parameters are ready
  const amountParametersReady = minAmount && maxAmount;
  // App values are filled
  const amountValuesReady = amount >= minAmount && amount <= maxAmount;
  // Amount is ready
  const amountIsReady = amountParametersReady && amountValuesReady;

  // Time parameters are ready
  const timeParametersReady = minTime && maxTime;
  // App values are filled
  const timeValuesReady = time >= minTime && time <= maxTime;
  // Staking time is ready
  const timeIsReady = timeParametersReady && timeValuesReady;
  if (!amountIsReady) {
    return {
      isReady: false,
      reason: "Please enter a valid stake amount",
    };
  } else if (!timeIsReady) {
    return {
      isReady: false,
      reason: "Please enter a valid staking period",
    };
  } else if (stakingFeeSat === 0) {
    // This is a temporary solution when the fee is not calculated or throw an error
    // the staking fee is set to 0 by stakingFeeSat from staking.tsx
    return {
      isReady: false,
      reason: "Not enough funds to cover fees for staking",
    };
  } else if (bbnBalance === 0) {
    return {
      isReady: false,
      reason: "Insufficient BABY Balance in Babylon Wallet",
    };
  }
  return {
    isReady: true,
    reason: "",
  };
};
