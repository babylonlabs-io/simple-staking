import { useCallback, useMemo, useState } from "react";

import { DELEGATION_ACTIONS as ACTIONS } from "@/app/constants";
import { ClientErrorCategory } from "@/app/constants/errorMessages";
import { ClientError } from "@/app/context/Error/errors";
import { useAppState } from "@/app/state";
import { useDelegationV2State } from "@/app/state/DelegationV2State";
import { useFinalityProviderState } from "@/app/state/FinalityProviderState";
import {
  DelegationV2,
  DelegationV2StakingState as State,
} from "@/app/types/delegationsV2";
import { ErrorType } from "@/app/types/errors";
import { BbnStakingParamsVersion } from "@/app/types/networkInfo";
import { validateDelegation } from "@/utils/delegations";
import { getBbnParamByVersion } from "@/utils/params";

import { useTransactionService } from "./useTransactionService";

export type ActionType = keyof typeof ACTIONS;

interface TxProps {
  stakingTxHashHex: string;
  stakingTxHex: string;
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
  slashing: {
    stakingSlashingTxHex: string;
    unbondingSlashingTxHex: string;
    spendingHeight: number;
  };
}

type DelegationCommand = (props: TxProps) => Promise<void>;

interface ConfirmationModalState {
  action: ActionType;
  delegation: DelegationV2;
  param: BbnStakingParamsVersion;
}

export function useDelegationService() {
  const [confirmationModal, setConfirmationModal] =
    useState<ConfirmationModalState | null>(null);
  const [processingDelegations, setProcessingDelegations] = useState<
    Record<string, boolean>
  >({});

  const { availableUTXOs = [], networkInfo } = useAppState();
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
    submitSlashingWithdrawalTx,
  } = useTransactionService();

  const { getSlashedFinalityProvider } = useFinalityProviderState();

  const validations = useMemo(
    () =>
      delegations.reduce(
        (acc, delegation) => ({
          ...acc,
          [delegation.stakingTxHashHex]: validateDelegation(
            delegation,
            availableUTXOs,
          ),
        }),
        {} as Record<string, { valid: boolean; error?: string }>,
      ),
    [delegations, availableUTXOs],
  );

  const processing = useMemo(
    () =>
      confirmationModal?.delegation
        ? processingDelegations[confirmationModal.delegation.stakingTxHashHex]
        : false,
    [confirmationModal, processingDelegations],
  );

  const slashedStatuses = useMemo(
    () =>
      delegations.reduce(
        (acc, delegation) => ({
          ...acc,
          [delegation.stakingTxHashHex]: {
            isSlashed:
              getSlashedFinalityProvider(
                delegation.finalityProviderBtcPksHex[0],
              ) !== null,
          },
        }),
        {} as Record<string, { isSlashed: boolean }>,
      ),
    [delegations, getSlashedFinalityProvider],
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

      [ACTIONS.UNBOND]: async ({
        stakingInput,
        paramsVersion,
        stakingTxHashHex,
        stakingTxHex,
        unbondingTxHex,
        covenantUnbondingSignatures,
      }: TxProps) => {
        if (!covenantUnbondingSignatures) {
          throw new ClientError({
            message: "Covenant unbonding signatures not found",
            category: ClientErrorCategory.CLIENT_TRANSACTION,
            type: ErrorType.UNBONDING,
          });
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

      [ACTIONS.WITHDRAW_ON_EARLY_UNBONDING]: async ({
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

      [ACTIONS.WITHDRAW_ON_EARLY_UNBONDING_SLASHING]: async ({
        stakingTxHashHex,
        stakingInput,
        paramsVersion,
        slashing,
      }) => {
        if (!slashing.unbondingSlashingTxHex) {
          throw new ClientError({
            message: "Unbonding slashing tx not found, can't submit withdrawal",
            category: ClientErrorCategory.CLIENT_TRANSACTION,
            type: ErrorType.UNBONDING,
          });
        }

        await submitSlashingWithdrawalTx(
          stakingInput,
          paramsVersion,
          slashing.unbondingSlashingTxHex,
        );

        updateDelegationStatus(
          stakingTxHashHex,
          State.INTERMEDIATE_EARLY_UNBONDING_SLASHING_WITHDRAWAL_SUBMITTED,
        );
      },

      [ACTIONS.WITHDRAW_ON_TIMELOCK]: async ({
        stakingInput,
        paramsVersion,
        stakingTxHashHex,
        stakingTxHex,
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

      [ACTIONS.WITHDRAW_ON_TIMELOCK_SLASHING]: async ({
        stakingInput,
        paramsVersion,
        stakingTxHashHex,
        slashing,
      }) => {
        if (!slashing.stakingSlashingTxHex) {
          throw new ClientError({
            message: "Slashing tx not found, can't submit withdrawal",
            category: ClientErrorCategory.CLIENT_TRANSACTION,
            type: ErrorType.WITHDRAW,
          });
        }

        await submitSlashingWithdrawalTx(
          stakingInput,
          paramsVersion,
          slashing.stakingSlashingTxHex,
        );

        updateDelegationStatus(
          stakingTxHashHex,
          State.INTERMEDIATE_TIMELOCK_SLASHING_WITHDRAWAL_SUBMITTED,
        );
      },
    }),
    [
      submitStakingTx,
      updateDelegationStatus,
      submitUnbondingTx,
      submitEarlyUnbondedWithdrawalTx,
      submitTimelockUnbondedWithdrawalTx,
      submitSlashingWithdrawalTx,
    ],
  );

  const openConfirmationModal = useCallback(
    (action: ActionType, delegation: DelegationV2) => {
      const param = getBbnParamByVersion(
        delegation.paramsVersion,
        networkInfo?.params.bbnStakingParams.versions || [],
      );

      setConfirmationModal({
        action,
        delegation,
        param,
      });
    },
    [networkInfo],
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
        slashing,
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
          paramsVersion,
          unbondingTxHex,
          covenantUnbondingSignatures,
          state,
          stakingInput,
          slashing,
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
    validations,
    hasMoreDelegations,
    confirmationModal,
    openConfirmationModal,
    closeConfirmationModal,
    fetchMoreDelegations,
    executeDelegationAction,
    slashedStatuses,
  };
}
