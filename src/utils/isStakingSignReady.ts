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
): { isReady: boolean; reason: string } => {
  if (!fpSelected)
    return {
      isReady: false,
      reason: "Please select a finality provider",
    };

  // Amount parameters are ready
  const amountParamatersReady = minAmount && maxAmount;
  // App values are filled
  const amountValuesReady = amount >= minAmount && amount <= maxAmount;
  // Amount is ready
  const amountIsReady = amountParamatersReady && amountValuesReady;

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
  }
  return {
    isReady: true,
    reason: "",
  };
};
