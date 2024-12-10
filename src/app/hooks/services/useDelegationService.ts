import { useCallback, useMemo, useState } from "react";

import { DELEGATION_ACTIONS as ACTIONS } from "@/app/constants";
import { useDelegationV2State } from "@/app/state/DelegationV2State";
import {
  DelegationV2,
  DelegationV2StakingState as State,
} from "@/app/types/delegationsV2";

import { useTransactionService } from "./useTransactionService";

export type ActionType = keyof typeof ACTIONS;

interface TxProps {
  stakingTxHashHex: string;
  stakingTxHex: string;
  stakingHeight: number;
  paramsVersion: number;
  unbondingTxHex: string;
  covenantUnbondingSignatures?: {
    covenantBtcPkHex: string;
    signatureHex: string;
  }[];
  state: State;
  stakingInput: {
    finalityProviderPkNoCoordHex: string;
    stakingAmountSat: number;
    stakingTimelock: number;
  };
  slashingTxHex: string;
  unbondingSlashingTxHex: string;
}

type DelegationCommand = (props: TxProps) => Promise<void>;

interface ConfirmationModalState {
  action: ActionType;
  delegation: DelegationV2;
}

export function useDelegationService() {
  const [confirmationModal, setConfirmationModal] =
    useState<ConfirmationModalState | null>(null);
  const [processingDelegations, setProcessingDelegations] = useState<
    Record<string, boolean>
  >({});

  const {
    delegations = [],
    fetchMoreDelegations,
    hasMoreDelegations,
    isLoading,
    updateDelegationStatus,
  } = useDelegationV2State();

  const {
    submitStakingTx,
    submitUnbondingTx,
    submitEarlyUnbondedWithdrawalTx,
    submitTimelockUnbondedWithdrawalTx,
  } = useTransactionService();

  const processing = useMemo(
    () =>
      confirmationModal?.delegation
        ? processingDelegations[confirmationModal.delegation.stakingTxHashHex]
        : false,
    [confirmationModal, processingDelegations],
  );

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
        stakingHeight,
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
          stakingHeight,
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
        stakingHeight,
        unbondingTxHex,
      }: TxProps) => {
        await submitEarlyUnbondedWithdrawalTx(
          stakingInput,
          stakingHeight,
          unbondingTxHex,
        );

        updateDelegationStatus(
          stakingTxHashHex,
          State.INTERMEDIATE_EARLY_UNBONDING_WITHDRAWAL_SUBMITTED,
        );
      },

      [ACTIONS.WITHDRAW_ON_EARLY_UNBOUNDING_SLASHING]: async ({
        stakingTxHashHex,
        stakingInput,
        stakingHeight,
        unbondingSlashingTxHex,
      }) => {
        if (!unbondingSlashingTxHex) {
          throw new Error(
            "Unbonding slashing tx not found, can't submit withdrawal",
          );
        }

        await submitEarlyUnbondedWithdrawalTx(
          stakingInput,
          stakingHeight,
          unbondingSlashingTxHex,
        );

        updateDelegationStatus(
          stakingTxHashHex,
          State.INTERMEDIATE_EARLY_UNBONDING_SLASHING_WITHDRAWAL_SUBMITTED,
        );
      },

      [ACTIONS.WITHDRAW_ON_TIMELOCK]: async ({
        stakingInput,
        stakingHeight,
        stakingTxHashHex,
        stakingTxHex,
      }: TxProps) => {
        await submitTimelockUnbondedWithdrawalTx(
          stakingInput,
          stakingHeight,
          stakingTxHex,
        );

        updateDelegationStatus(
          stakingTxHashHex,
          State.INTERMEDIATE_TIMELOCK_WITHDRAWAL_SUBMITTED,
        );
      },

      [ACTIONS.WITHDRAW_ON_TIMELOCK_SLASHING]: async ({
        stakingInput,
        stakingHeight,
        stakingTxHashHex,
        slashingTxHex,
      }) => {
        if (!slashingTxHex) {
          throw new Error("Slashing tx not found, can't submit withdrawal");
        }

        await submitTimelockUnbondedWithdrawalTx(
          stakingInput,
          stakingHeight,
          slashingTxHex,
        );

        updateDelegationStatus(
          stakingTxHashHex,
          State.INTERMEDIATE_TIMELOCK_SLASHING_WITHDRAWAL_SUBMITTED,
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

  const openConfirmationModal = useCallback(
    (action: ActionType, delegation: DelegationV2) => {
      setConfirmationModal({
        action,
        delegation,
      });
    },
    [],
  );

  const closeConfirmationModal = useCallback(
    () => void setConfirmationModal(null),
    [],
  );

  const toggleProcessingDelegation = useCallback(
    (id: string, processing: boolean) => {
      setProcessingDelegations((state) => ({ ...state, [id]: processing }));
    },
    [],
  );

  const executeDelegationAction = useCallback(
    async (action: string, delegation: DelegationV2) => {
      const {
        stakingTxHashHex,
        stakingTxHex,
        finalityProviderBtcPksHex,
        stakingAmount,
        paramsVersion,
        stakingTimelock,
        unbondingTxHex,
        covenantUnbondingSignatures,
        state,
        slashingTxHex,
        unbondingSlashingTxHex,
        startHeight,
      } = delegation;

      const finalityProviderPk = finalityProviderBtcPksHex[0];
      const stakingInput = {
        finalityProviderPkNoCoordHex: finalityProviderPk,
        stakingAmountSat: stakingAmount,
        stakingTimelock,
      };

      const execute = COMMANDS[action as ActionType];

      try {
        toggleProcessingDelegation(stakingTxHashHex, true);

        await execute?.({
          stakingTxHashHex,
          stakingTxHex,
          stakingHeight: startHeight,
          paramsVersion,
          unbondingTxHex,
          covenantUnbondingSignatures,
          state,
          stakingInput,
          slashingTxHex,
          unbondingSlashingTxHex,
        });

        closeConfirmationModal();
      } finally {
        toggleProcessingDelegation(stakingTxHashHex, false);
      }
    },
    [COMMANDS, closeConfirmationModal, toggleProcessingDelegation],
  );

  return {
    processing,
    isLoading,
    delegations,
    hasMoreDelegations,
    confirmationModal,
    openConfirmationModal,
    closeConfirmationModal,
    fetchMoreDelegations,
    executeDelegationAction,
  };
}
