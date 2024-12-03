import { useCallback, useMemo } from "react";

import { DELEGATION_ACTIONS as ACTIONS } from "@/app/constants";
import { useDelegationV2State } from "@/app/state/DelegationV2State";
import { DelegationV2StakingState as State } from "@/app/types/delegationsV2";

import { useTransactionService } from "./useTransactionService";

export type ActionType = keyof typeof ACTIONS;

interface TxProps {
  stakingTxHashHex: string;
  stakingTxHex: string;
  finalityProviderPk: string;
  stakingAmount: number;
  paramsVersion: number;
  stakingTime: number;
  unbondingTxHex: string;
  covenantUnbondingSignatures?: {
    covenantBtcPkHex: string;
    signatureHex: string;
  }[];
  state: State;
  stakingInput: {
    finalityProviderPkNoCoordHex: string;
    stakingAmountSat: number;
    stakingTimeBlocks: number;
  };
  slashingTxHex: string;
  unbondingSlashingTxHex: string;
}

type DelegationCommand = (props: TxProps) => Promise<void>;

export function useDelegationService() {
  const {
    delegations = [],
    fetchMoreDelegations,
    hasMoreDelegations,
    isLoading,
    findDelegationByTxHash,
    updateDelegationStatus,
  } = useDelegationV2State();

  const {
    submitStakingTx,
    submitUnbondingTx,
    submitEarlyUnbondedWithdrawalTx,
    submitTimelockUnbondedWithdrawalTx,
  } = useTransactionService();

  const COMMANDS: Record<ActionType, DelegationCommand> = useMemo(
    () => ({
      [ACTIONS.STAKE]: async ({
        stakingInput,
        paramsVersion,
        stakingTxHashHex,
        stakingTxHex,
      }: TxProps) => {
        await submitStakingTx(
          stakingInput,
          paramsVersion,
          stakingTxHashHex,
          stakingTxHex,
        );

        updateDelegationStatus(
          stakingTxHashHex,
          State.INTERMEDIATE_PENDING_BTC_CONFIRMATION,
        );
      },

      [ACTIONS.UNBOUND]: async ({
        stakingInput,
        paramsVersion,
        stakingTxHashHex,
        stakingTxHex,
        unbondingTxHex,
        covenantUnbondingSignatures,
      }: TxProps) => {
        if (!covenantUnbondingSignatures) {
          throw new Error("Covenant unbonding signatures not found");
        }

        await submitUnbondingTx(
          stakingInput,
          paramsVersion,
          stakingTxHex,
          unbondingTxHex,
          covenantUnbondingSignatures.map((sig) => ({
            btcPkHex: sig.covenantBtcPkHex,
            sigHex: sig.signatureHex,
          })),
        );

        updateDelegationStatus(
          stakingTxHashHex,
          State.INTERMEDIATE_UNBONDING_SUBMITTED,
        );
      },

      [ACTIONS.WITHDRAW_ON_EARLY_UNBOUNDING]: async ({
        stakingTxHashHex,
        stakingInput,
        paramsVersion,
        unbondingTxHex,
      }: TxProps) => {
        await submitEarlyUnbondedWithdrawalTx(
          stakingInput,
          paramsVersion,
          unbondingTxHex,
        );

        updateDelegationStatus(
          stakingTxHashHex,
          State.INTERMEDIATE_EARLY_UNBONDING_WITHDRAWAL_SUBMITTED,
        );
      },

      [ACTIONS.WITHDRAW_ON_TIMELOCK]: async ({
        stakingInput,
        paramsVersion,
        stakingTxHex,
        stakingTxHashHex,
      }: TxProps) => {
        await submitTimelockUnbondedWithdrawalTx(
          stakingInput,
          paramsVersion,
          stakingTxHex,
        );

        updateDelegationStatus(
          stakingTxHashHex,
          State.INTERMEDIATE_TIMELOCK_WITHDRAWAL_SUBMITTED,
        );
      },

      [ACTIONS.WITHDRAW_ON_EARLY_UNBOUNDING_SLASHING]: async ({
        stakingInput,
        paramsVersion,
        unbondingSlashingTxHex,
        stakingTxHashHex,
      }) => {
        if (!unbondingSlashingTxHex) {
          throw new Error(
            "Unbonding slashing tx not found, can't submit withdrawal",
          );
        }
        await submitEarlyUnbondedWithdrawalTx(
          stakingInput,
          paramsVersion,
          unbondingSlashingTxHex,
        );

        updateDelegationStatus(
          stakingTxHashHex,
          State.INTERMEDIATE_EARLY_UNBONDING_SLASHING_WITHDRAWAL_SUBMITTED,
        );
      },

      [ACTIONS.WITHDRAW_ON_TIMELOCK_SLASHING]: async ({
        stakingInput,
        paramsVersion,
        slashingTxHex,
        stakingTxHashHex,
      }) => {
        if (!slashingTxHex) {
          throw new Error("Slashing tx not found, can't submit withdrawal");
        }
        await submitEarlyUnbondedWithdrawalTx(
          stakingInput,
          paramsVersion,
          slashingTxHex,
        );

        updateDelegationStatus(
          stakingTxHashHex,
          State.INTERMEDIATE_TIMELOCK_WITHDRAWAL_SUBMITTED,
        );
      },
    }),
    [
      updateDelegationStatus,
      submitStakingTx,
      submitUnbondingTx,
      submitEarlyUnbondedWithdrawalTx,
      submitTimelockUnbondedWithdrawalTx,
    ],
  );

  const executeDelegationAction = useCallback(
    async (action: string, txHash: string) => {
      const d = findDelegationByTxHash(txHash);

      if (!d) {
        throw new Error("Delegation not found: " + txHash);
      }

      const {
        stakingTxHashHex,
        stakingTxHex,
        finalityProviderBtcPksHex,
        stakingAmount,
        paramsVersion,
        stakingTime,
        unbondingTxHex,
        covenantUnbondingSignatures,
        state,
        slashingTxHex,
        unbondingSlashingTxHex,
      } = d;

      const finalityProviderPk = finalityProviderBtcPksHex[0];
      const stakingInput = {
        finalityProviderPkNoCoordHex: finalityProviderPk,
        stakingAmountSat: stakingAmount,
        stakingTimeBlocks: stakingTime,
      };

      const execute = COMMANDS[action as ActionType];

      await execute?.({
        stakingTxHashHex,
        stakingTxHex,
        stakingAmount,
        paramsVersion,
        stakingTime,
        unbondingTxHex,
        covenantUnbondingSignatures,
        finalityProviderPk,
        state,
        stakingInput,
        slashingTxHex,
        unbondingSlashingTxHex,
      });
    },
    [COMMANDS, findDelegationByTxHash],
  );

  return {
    isLoading,
    delegations,
    hasMoreDelegations,
    fetchMoreDelegations,
    executeDelegationAction,
  };
}
