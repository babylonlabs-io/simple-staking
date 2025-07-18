import { UTXO } from "@babylonlabs-io/btc-staking-ts";
import { Transaction } from "bitcoinjs-lib";

import { ClientError, ERROR_CODES } from "@/ui/legacy/errors";
import { BtcStakingInputs } from "@/ui/legacy/hooks/services/useTransactionService";
import {
  DelegationV2StakingState as DelegationState,
  DelegationV2,
} from "@/ui/legacy/types/delegationsV2";

/**
 * Validates the staking input for a delegation.
 * @param stakingInput - The staking input to validate.
 * @throws An error if the staking input is invalid.
 */
export const validateStakingInput = (stakingInput: BtcStakingInputs) => {
  if (
    !stakingInput.finalityProviderPksNoCoordHex ||
    stakingInput.finalityProviderPksNoCoordHex.length === 0
  ) {
    throw new ClientError(
      ERROR_CODES.VALIDATION_ERROR,
      "Finality provider public keys (finalityProviderPksNoCoordHex) are required for staking input.",
    );
  }
  if (!stakingInput.stakingAmountSat) {
    throw new ClientError(
      ERROR_CODES.VALIDATION_ERROR,
      "Staking amount (stakingAmountSat) is required for staking input.",
    );
  }
  if (!stakingInput.stakingTimelock) {
    throw new ClientError(
      ERROR_CODES.VALIDATION_ERROR,
      "Staking timelock (stakingTimelock) is required for staking input.",
    );
  }
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
