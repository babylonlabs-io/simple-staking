import { Transaction } from "bitcoinjs-lib";

const FEE_TOLERANCE_COEFFICIENT = 2;

export interface BbnGasFee {
  amount: { denom: string; amount: string }[];
  gas: string;
}

/**
 * Performs a safety check on the estimated transaction fee.
 * The function calculates the expected transaction fee based on the transaction
 * virtual size and the provided fee rate. It then defines an acceptable range
 * for the estimated fee using the FEE_TOLERANCE_COEFFICIENT.
 * If the estimated fee is outside this acceptable range, an error is thrown
 * indicating whether the fee is too high or too low.
 *
 * @param {Transaction} tx - The Bitcoin transaction object.
 * @param {number} feeRate - The fee rate in satoshis per byte.
 * @param {number} estimatedFee - The estimated fee for the transaction in satoshis.
 * @throws Will throw an error if the estimated fee is too high or too low compared to the calculated fee.
 */
export const txFeeSafetyCheck = (
  tx: Transaction,
  feeRate: number,
  estimatedFee: number,
) => {
  const txFee = tx.virtualSize() * feeRate;
  const lowerBound = txFee / FEE_TOLERANCE_COEFFICIENT;
  const upperBound = txFee * FEE_TOLERANCE_COEFFICIENT;

  if (estimatedFee > upperBound) {
    throw new Error("Estimated fee is too high");
  } else if (estimatedFee < lowerBound) {
    throw new Error("Estimated fee is too low");
  }
};

/**
 * Estimates the gas fee for a given message.
 * @param {Function} simulateClient - The simulate function from the stargate client.
 * @param {string} bech32Address - The bech32 address of the user.
 * @param {Object} msg - The message to estimate the fee for.
 * @returns {Promise<BbnGasFee>} An object containing the gas fee and gas wanted.
 */
export const estimateBbnGasFee = async <T>(
  simulateClient: (
    address: string,
    messages: T[],
    options?: string,
  ) => Promise<number>,
  bech32Address: string,
  msg: T,
): Promise<BbnGasFee> => {
  // estimate gas
  const gasEstimate = await simulateClient(
    bech32Address,
    [msg],
    `estimate ${typeof msg} fee`,
  );
  // TODO: The gas calculation need to be improved
  // https://github.com/babylonlabs-io/simple-staking/issues/320
  const gasWanted = Math.ceil(gasEstimate * 1.5);
  return {
    amount: [{ denom: "ubbn", amount: (gasWanted * 0.01).toFixed(0) }],
    gas: gasWanted.toString(),
  };
};
