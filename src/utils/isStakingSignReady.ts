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
  itemSelected: boolean,
) => {
  if (!itemSelected) return false;

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
  // Staking time is fixed
  const timeIsFixed = minTime === maxTime;
  // Staking time is ready
  const timeIsReady = timeParametersReady && (timeValuesReady || timeIsFixed);

  return amountIsReady && timeIsReady && itemSelected;
};
