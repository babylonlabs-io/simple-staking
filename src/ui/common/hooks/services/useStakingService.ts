import { useCallback } from "react";

import { getDelegationV2 } from "@/ui/common/api/getDelegationsV2";
import { ONE_SECOND } from "@/ui/common/constants";
import { useError } from "@/ui/common/context/Error/ErrorProvider";
import { useBTCWallet } from "@/ui/common/context/wallet/BTCWalletProvider";
import { useCosmosWallet } from "@/ui/common/context/wallet/CosmosWalletProvider";
import { ClientError } from "@/ui/common/errors";
import { ERROR_CODES } from "@/ui/common/errors/codes";
import { useLogger } from "@/ui/common/hooks/useLogger";
import { useDelegationV2State } from "@/ui/common/state/DelegationV2State";
import {
  StakingStep,
  useStakingState,
  type FormFields,
} from "@/ui/common/state/StakingState";
import {
  DelegationV2StakingState as DelegationState,
  DelegationV2,
} from "@/ui/common/types/delegationsV2";
import { retry } from "@/ui/common/utils";
import { btcToSatoshi } from "@/ui/common/utils/btc";

import { useBbnTransaction } from "../client/rpc/mutation/useBbnTransaction";

import { useTransactionService } from "./useTransactionService";

export function useStakingService() {
  const { setFormData, goToStep, setProcessing, setVerifiedDelegation, reset } =
    useStakingState();
  const { sendBbnTx } = useBbnTransaction();
  const { refetch: refetchDelegations } = useDelegationV2State();
  const { addDelegation, updateDelegationStatus } = useDelegationV2State();
  const { estimateStakingFee, createDelegationEoi, submitStakingTx } =
    useTransactionService();
  const { handleError } = useError();
  const { publicKeyNoCoord, address: btcAddress } = useBTCWallet();
  const { bech32Address } = useCosmosWallet();
  const logger = useLogger();

  const calculateFeeAmount = useCallback(
    ({
      finalityProviders,
      amount,
      term,
      feeRate,
    }: Omit<FormFields, "feeAmount">) => {
      const eoiInput = {
        finalityProviderPksNoCoordHex: finalityProviders || [],
        stakingAmountSat: btcToSatoshi(amount),
        stakingTimelock: term,
        feeRate: feeRate,
      };
      return estimateStakingFee(eoiInput, feeRate);
    },
    [estimateStakingFee],
  );

  const displayPreview = useCallback(
    (formFields: FormFields) => {
      setFormData(formFields);
      goToStep(StakingStep.PREVIEW);
    },
    [setFormData, goToStep],
  );

  const createEOI = useCallback(
    async ({ feeRate }: FormFields) => {
      try {
        const newInput = {
          fps: [
            "2b48b92bb0191ffff18d7b339c079cf5863526b470ed847bcf5541dcfeacac5d",
            "87f6994f25863ebf0717d1b8a76fa26b3625f17bcbdf6b06c167ab1dfac534e7",
          ],
          amount: 10000,
          timelock: 60000,
        };

        const eoiInput = {
          finalityProviderPksNoCoordHex: newInput.fps || [],
          stakingAmountSat: newInput.amount,
          stakingTimelock: newInput.timelock,
          feeRate: feeRate + 1,
        };
        setProcessing(true);
        console.log("@@@@@@@ before createDelegationEoi");
        const { stakingTxHash, signedBabylonTx } = await createDelegationEoi(
          eoiInput,
          feeRate,
        );
        console.log("stakingTxHash", stakingTxHash);

        // Send the transaction
        goToStep(StakingStep.EOI_SEND_BBN);
        await sendBbnTx(signedBabylonTx);

        addDelegation({
          stakingAmount: newInput.amount,
          stakingTxHashHex: stakingTxHash,
          startHeight: 0,
          state: DelegationState.INTERMEDIATE_PENDING_VERIFICATION,
        });

        goToStep(StakingStep.VERIFYING);

        const delegation = await retry(
          () => getDelegationV2(stakingTxHash),
          (delegation) => delegation?.state === DelegationState.VERIFIED,
          5 * ONE_SECOND,
        );

        setVerifiedDelegation(delegation as DelegationV2);
        refetchDelegations();
        goToStep(StakingStep.VERIFIED);
        setProcessing(false);
      } catch (error: any) {
        const metadata = {
          userPublicKey: publicKeyNoCoord,
          btcAddress: btcAddress,
          babylonAddress: bech32Address,
        };
        const clientError = new ClientError(
          ERROR_CODES.TRANSACTION_PREPARATION_ERROR,
          "Error creating EOI",
          { cause: error as Error },
        );
        logger.error(clientError, {
          data: metadata,
        });
        handleError({
          error,
          metadata,
        });
        reset();
      }
    },
    [
      setProcessing,
      createDelegationEoi,
      goToStep,
      sendBbnTx,
      addDelegation,
      setVerifiedDelegation,
      handleError,
      reset,
      refetchDelegations,
      publicKeyNoCoord,
      btcAddress,
      bech32Address,
      logger,
    ],
  );

  const stakeDelegation = useCallback(
    async (delegation: DelegationV2) => {
      try {
        setProcessing(true);

        const { stakingTxHashHex } = delegation;

        await submitStakingTx();
        updateDelegationStatus(
          stakingTxHashHex,
          DelegationState.INTERMEDIATE_PENDING_BTC_CONFIRMATION,
        );
        reset();
        goToStep(StakingStep.FEEDBACK_SUCCESS);
      } catch (error: any) {
        const clientError = new ClientError(
          ERROR_CODES.TRANSACTION_SUBMISSION_ERROR,
          "Error submitting staking transaction",
          { cause: error as Error },
        );
        logger.error(clientError);
        reset();
        handleError({
          error,
          displayOptions: {
            retryAction: () => stakeDelegation(delegation),
          },
          metadata: {
            stakingTxHash: delegation.stakingTxHashHex,
            userPublicKey: publicKeyNoCoord,
            btcAddress: btcAddress,
            babylonAddress: bech32Address,
          },
        });
      }
    },
    [
      updateDelegationStatus,
      submitStakingTx,
      goToStep,
      setProcessing,
      reset,
      handleError,
      publicKeyNoCoord,
      btcAddress,
      bech32Address,
      logger,
    ],
  );

  return { calculateFeeAmount, displayPreview, createEOI, stakeDelegation };
}
