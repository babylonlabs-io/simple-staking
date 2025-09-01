import { useCallback, useMemo, useState } from "react";

import { DELEGATION_ACTIONS as ACTIONS } from "@/ui/common/constants";
import { ClientError, ERROR_CODES } from "@/ui/common/errors";
import { useUtxoValidation } from "@/ui/common/hooks/services/useUtxoValidation";
import { useLogger } from "@/ui/common/hooks/useLogger";
import { useAppState } from "@/ui/common/state";
import { useDelegationV2State } from "@/ui/common/state/DelegationV2State";
import { useFinalityProviderState } from "@/ui/common/state/FinalityProviderState";
import {
  DelegationV2,
  DelegationWithFP,
  DelegationV2StakingState as State,
} from "@/ui/common/types/delegationsV2";
import { FinalityProvider } from "@/ui/common/types/finalityProviders";
import { BbnStakingParamsVersion } from "@/ui/common/types/networkInfo";
import { getBbnParamByVersion } from "@/ui/common/utils/params";

import { useStakingExpansionState } from "../../state/StakingExpansionState";

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
    finalityProviderPksNoCoordHex: string[];
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
  delegation: DelegationWithFP;
  param: BbnStakingParamsVersion;
}

export function useDelegationService() {
  const [confirmationModal, setConfirmationModal] =
    useState<ConfirmationModalState | null>(null);
  const [processingDelegations, setProcessingDelegations] = useState<
    Record<string, boolean>
  >({});
  const logger = useLogger();

  const { networkInfo } = useAppState();
  const {
    delegations = [],
    fetchMoreDelegations,
    hasMoreDelegations,
    isLoading: isDelegationLoading,
    isFetchingNextPage,
    updateDelegationStatus,
    setDelegationV2StepOptions,
  } = useDelegationV2State();

  const {
    submitStakingTx,
    submitUnbondingTx,
    submitEarlyUnbondedWithdrawalTx,
    submitTimelockUnbondedWithdrawalTx,
    submitSlashingWithdrawalTx,
  } = useTransactionService();

  const { isFetching: isFPLoading, finalityProviderMap } =
    useFinalityProviderState();

  const { isExpansionModalOpen } = useStakingExpansionState();

  // Stop loading when any expansion modal is open
  const isLoading =
    (isDelegationLoading || isFPLoading) && !isExpansionModalOpen;

  const delegationsWithFP = useMemo(
    () =>
      delegations.map((d) => ({
        ...d,
        fp: finalityProviderMap.get(
          d.finalityProviderBtcPksHex[0],
        ) as FinalityProvider,
      })),
    [delegations, finalityProviderMap],
  );

  const validations = useUtxoValidation(delegations);

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

      [ACTIONS.UNBOND]: async ({
        stakingInput,
        paramsVersion,
        stakingTxHashHex,
        stakingTxHex,
        unbondingTxHex,
        covenantUnbondingSignatures,
      }: TxProps) => {
        if (!covenantUnbondingSignatures) {
          const clientError = new ClientError(
            ERROR_CODES.VALIDATION_ERROR,
            "Covenant unbonding signatures not found",
          );
          throw clientError;
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
          const clientError = new ClientError(
            ERROR_CODES.VALIDATION_ERROR,
            "Unbonding slashing tx not found, can't submit withdrawal",
          );
          throw clientError;
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
          const clientError = new ClientError(
            ERROR_CODES.VALIDATION_ERROR,
            "Slashing tx not found, can't submit withdrawal",
          );
          throw clientError;
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
    (action: ActionType, delegation: DelegationWithFP) => {
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

  const closeConfirmationModal = useCallback(() => {
    setConfirmationModal(null);
    setDelegationV2StepOptions(undefined);
  }, [setDelegationV2StepOptions]);

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

      const stakingInput = {
        finalityProviderPksNoCoordHex: finalityProviderBtcPksHex,
        stakingAmountSat: stakingAmount,
        stakingTimelock,
      };

      logger.info("Executing delegation action", {
        action,
        delegationState: state,
        stakingTxHashHex,
        paramsVersion,
        slashingSpendingHeight: slashing?.spendingHeight,
      });

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
    [COMMANDS, closeConfirmationModal, toggleProcessingDelegation, logger],
  );

  return {
    processing,
    isLoading,
    delegations: delegationsWithFP,
    validations,
    hasMoreDelegations,
    confirmationModal,
    isFetchingNextPage,
    openConfirmationModal,
    closeConfirmationModal,
    fetchMoreDelegations,
    executeDelegationAction,
  };
}
