import { UTXO } from "@babylonlabs-io/btc-staking-ts";
import { Transaction } from "bitcoinjs-lib";

import { ClientErrorCategory } from "@/app/constants/errorMessages";
import { ClientError } from "@/app/context/Error/errors";
import { BtcStakingInputs } from "@/app/hooks/services/useTransactionService";
import {
  DelegationV2StakingState as DelegationState,
  DelegationV2,
} from "@/app/types/delegationsV2";
import { ErrorType } from "@/app/types/errors";

/**
 * Clears the signatures from a transaction.
 * @param tx - The transaction to clear the signatures from.
 * @returns The transaction with the signatures cleared.
 */
export const clearTxSignatures = (tx: Transaction): Transaction => {
  tx.ins.forEach((input) => {
    input.script = Buffer.alloc(0);
    input.witness = [];
  });
  return tx;
};

/**
 * Extracts the first valid Schnorr signature from a signed transaction.
 * @param singedTransaction - The signed transaction.
 * @returns The first valid Schnorr signature or undefined if no valid signature is found.
 */
export const extractSchnorrSignaturesFromTransaction = (
  singedTransaction: Transaction,
): Buffer | undefined => {
  // Loop through each input to extract the witness signature
  for (const input of singedTransaction.ins) {
    if (input.witness && input.witness.length > 0) {
      const schnorrSignature = input.witness[0];

      // Check that it's a 64-byte Schnorr signature
      if (schnorrSignature.length === 64) {
        return schnorrSignature; // Return the first valid signature found
      }
    }
  }
  return undefined;
};
/**
 * Converts a Uint8Array to a hexadecimal string.
 * @param uint8Array - The Uint8Array to convert.
 * @returns The hexadecimal string.
 */
export const uint8ArrayToHex = (uint8Array: Uint8Array): string => {
  return Array.from(uint8Array)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

/**
 * Validates the staking input for a delegation.
 * @param stakingInput - The staking input to validate.
 * @throws A ClientError if the staking input is invalid.
 */
export const validateStakingInput = (stakingInput: BtcStakingInputs) => {
  if (!stakingInput.finalityProviderPkNoCoordHex)
    throw new ClientError({
      message: "Finality provider not selected",
      category: ClientErrorCategory.CLIENT_VALIDATION,
      type: ErrorType.STAKING,
    });
  if (!stakingInput.stakingAmountSat)
    throw new ClientError({
      message: "Staking amount not set",
      category: ClientErrorCategory.CLIENT_VALIDATION,
      type: ErrorType.STAKING,
    });
  if (!stakingInput.stakingTimelock)
    throw new ClientError({
      message: "Staking time not set",
      category: ClientErrorCategory.CLIENT_VALIDATION,
      type: ErrorType.STAKING,
    });
};

/**
 * Verifies that the transaction inputs are still available from the UTXOs set.
 * @param tx - The transaction to verify.
 * @param allUTXOs - The UTXOs set.
 * @returns True if the transaction inputs are still available, false otherwise.
 */

type Validator = (
  delegation: DelegationV2,
  utxos: UTXO[],
) => { valid: boolean; error?: string };

const VALIDATORS: Partial<Record<DelegationState, Validator>> = {
  [DelegationState.VERIFIED]: (delegation, utxos) => {
    const tx = Transaction.fromHex(delegation.stakingTxHex);
    const valid = tx.ins.every((input) =>
      utxos.find(
        (utxo) =>
          utxo.txid === Buffer.from(input.hash).reverse().toString("hex") &&
          utxo.vout === input.index,
      ),
    );

    if (!valid) {
      return {
        valid: false,
        error: "This stake is now invalid as the UTXO has already been used",
      };
    }

    return { valid: true };
  },
};

export const validateDelegation = (delegation: DelegationV2, utxos: UTXO[]) => {
  const validator = VALIDATORS[delegation.state];

  if (validator) {
    return validator(delegation, utxos);
  }

  return { valid: true };
};
