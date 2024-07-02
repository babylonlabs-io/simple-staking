import { Transaction } from "bitcoinjs-lib";

const FEE_TOLERANCE_COEFFICIENT = 2;

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
