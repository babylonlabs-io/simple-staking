import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Tooltip } from "react-tooltip";
import { useLocalStorage } from "usehooks-ts";

import { UTXO_KEY } from "@/app/common/constants";
import { LoadingView } from "@/app/components/Loading/Loading";
import { EOIModal, EOIStepStatus } from "@/app/components/Modals/EOIModal";
import { useError } from "@/app/context/Error/ErrorContext";
import { useBTCWallet } from "@/app/context/wallet/BTCWalletProvider";
import {
  SigningStep,
  useTransactionService,
} from "@/app/hooks/services/useTransactionService";
import { useHealthCheck } from "@/app/hooks/useHealthCheck";
import { useAppState } from "@/app/state";
import { ErrorHandlerParam, ErrorState } from "@/app/types/errors";
import {
  FinalityProvider,
  FinalityProvider as FinalityProviderInterface,
} from "@/app/types/finalityProviders";
import { getFeeRateFromMempool } from "@/utils/getFeeRateFromMempool";
import { isStakingSignReady } from "@/utils/isStakingSignReady";

import { FeedbackModal } from "../Modals/FeedbackModal";
import { PendingVerificationModal } from "../Modals/PendingVerificationModal";
import { PreviewModal } from "../Modals/PreviewModal";

import { FinalityProviders } from "./FinalityProviders/FinalityProviders";
import { StakingAmount } from "./Form/StakingAmount";
import { StakingFee } from "./Form/StakingFee";
import { StakingTime } from "./Form/StakingTime";
import { Message } from "./Form/States/Message";
import { WalletNotConnected } from "./Form/States/WalletNotConnected";
import apiNotAvailable from "./Form/States/api-not-available.svg";
import geoRestricted from "./Form/States/geo-restricted.svg";

export const Staking = () => {
  const {
    availableUTXOs,
    totalBalance: btcWalletBalanceSat,
    isError,
    isLoading,
  } = useAppState();
  const {
    connected,
    address,
    publicKeyNoCoord,
    network: btcWalletNetwork,
    getNetworkFees,
  } = useBTCWallet();

  const disabled = isError;

  // Staking form state
  const [stakingAmountSat, setStakingAmountSat] = useState(0);
  const [stakingTimeBlocks, setStakingTimeBlocks] = useState(0);
  const [finalityProvider, setFinalityProvider] =
    useState<FinalityProviderInterface>();
  const [finalityProviders, setFinalityProviders] =
    useState<FinalityProvider[]>();
  // Selected fee rate, comes from the user input
  const [selectedFeeRate, setSelectedFeeRate] = useState(0);
  const [awaitingWalletResponse, setAwaitingWalletResponse] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [resetFormInputs, setResetFormInputs] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{
    type: "success" | "cancel" | null;
    isOpen: boolean;
  }>({ type: null, isOpen: false });
  const [successFeedbackModalOpened, setSuccessFeedbackModalOpened] =
    useLocalStorage<boolean>("bbn-staking-successFeedbackModalOpened", false);
  const [cancelFeedbackModalOpened, setCancelFeedbackModalOpened] =
    useLocalStorage<boolean>("bbn-staking-cancelFeedbackModalOpened ", false);

  const { createDelegationEoi, estimateStakingFee } = useTransactionService();
  const { params } = useAppState();
  const latestParam = params?.bbnStakingParams?.latestParam;

  const [pendingVerificationOpen, setPendingVerificationOpen] = useState(false);
  const [stakingTxHashHex, setStakingTxHashHex] = useState<
    string | undefined
  >();

  const [eoiModalOpen, setEoiModalOpen] = useState(false);
  const [eoiStatuses, setEoiStatuses] = useState({
    slashing: EOIStepStatus.UNSIGNED,
    unbonding: EOIStepStatus.UNSIGNED,
    reward: EOIStepStatus.UNSIGNED,
    eoi: EOIStepStatus.UNSIGNED,
  });

  // Mempool fee rates, comes from the network
  // Fetch fee rates, sat/vB
  const {
    data: mempoolFeeRates,
    isLoading: areMempoolFeeRatesLoading,
    error: mempoolFeeRatesError,
    isError: hasMempoolFeeRatesError,
    refetch: refetchMempoolFeeRates,
  } = useQuery({
    queryKey: ["mempool fee rates"],
    queryFn: getNetworkFees,
    enabled: connected && Boolean(getNetworkFees),
    refetchInterval: 60000, // 1 minute
    retry: (failureCount) => {
      return !isErrorOpen && failureCount <= 3;
    },
  });

  const { isErrorOpen, showError, captureError } = useError();
  const { isApiNormal, isGeoBlocked, apiMessage } = useHealthCheck();

  useEffect(() => {
    const handleError = ({
      error,
      hasError,
      errorState,
      refetchFunction,
    }: ErrorHandlerParam) => {
      if (hasError && error) {
        showError({
          error: {
            message: error.message,
            errorState,
          },
          retryAction: refetchFunction,
        });
      }
    };

    handleError({
      error: mempoolFeeRatesError,
      hasError: hasMempoolFeeRatesError,
      errorState: ErrorState.SERVER_ERROR,
      refetchFunction: refetchMempoolFeeRates,
    });
    captureError(mempoolFeeRatesError);
  }, [
    mempoolFeeRatesError,
    hasMempoolFeeRatesError,
    refetchMempoolFeeRates,
    showError,
    captureError,
  ]);

  const handleResetState = () => {
    setStakingTxHashHex(undefined);
    setPendingVerificationOpen(false);
    setEoiModalOpen(false);
    setEoiStatuses({
      slashing: EOIStepStatus.UNSIGNED,
      unbonding: EOIStepStatus.UNSIGNED,
      reward: EOIStepStatus.UNSIGNED,
      eoi: EOIStepStatus.UNSIGNED,
    });
    setAwaitingWalletResponse(false);
    setFinalityProvider(undefined);
    setStakingAmountSat(0);
    setStakingTimeBlocks(0);
    setSelectedFeeRate(0);
    setPreviewModalOpen(false);
    setResetFormInputs(!resetFormInputs);
  };

  const { minFeeRate, defaultFeeRate } = getFeeRateFromMempool(mempoolFeeRates);

  // Either use the selected fee rate or the fastest fee rate
  const feeRate = selectedFeeRate || defaultFeeRate;

  const queryClient = useQueryClient();

  const signingStepToStatusKey = (
    step: SigningStep,
  ): keyof typeof eoiStatuses | null => {
    switch (step) {
      case SigningStep.STAKING_SLASHING:
        return "slashing";
      case SigningStep.UNBONDING_SLASHING:
        return "unbonding";
      case SigningStep.PROOF_OF_POSSESSION:
        return "reward";
      case SigningStep.SEND_BBN:
        return "eoi";
      default:
        return null;
    }
  };

  const signingCallback = async (step: SigningStep, status: EOIStepStatus) => {
    setEoiStatuses((prevStatuses) => {
      const statusKey = signingStepToStatusKey(step);
      if (statusKey) {
        return {
          ...prevStatuses,
          [statusKey]: status,
        };
      }
      return prevStatuses;
    });
  };

  const handlePendingVerificationClose = () => {
    setPendingVerificationOpen(false);
    handleFeedbackModal("cancel");
    handleResetState();
  };

  const handleDelegationEoiCreation = async () => {
    try {
      if (!finalityProvider) {
        throw new Error("Finality provider not selected");
      }
      const eoiInput = {
        finalityProviderPkNoCoordHex: finalityProvider.btcPk,
        stakingAmountSat,
        stakingTimeBlocks,
        feeRate,
      };
      setAwaitingWalletResponse(true);
      setEoiModalOpen(true);
      const stakingTxHashHex = await createDelegationEoi(
        eoiInput,
        feeRate,
        signingCallback,
      );

      setStakingTxHashHex(stakingTxHashHex);
      setPendingVerificationOpen(true);
    } catch (error: Error | any) {
      showError({
        error: {
          message: error.message,
          errorState: ErrorState.STAKING,
        },
        noCancel: true,
        retryAction: () => {
          // in case of error, we need to partly reset the state
          setStakingAmountSat(0);
          setSelectedFeeRate(0);
          setPreviewModalOpen(false);
          setResetFormInputs(!resetFormInputs);
          // and refetch the UTXOs
          queryClient.invalidateQueries({ queryKey: [UTXO_KEY, address] });
        },
      });
    } finally {
      setAwaitingWalletResponse(false);
      setEoiModalOpen(false);
    }
  };

  // Memoize the staking fee calculation
  const stakingFeeSat = useMemo(() => {
    if (
      btcWalletNetwork &&
      address &&
      latestParam &&
      publicKeyNoCoord &&
      stakingAmountSat &&
      finalityProvider &&
      mempoolFeeRates &&
      availableUTXOs
    ) {
      try {
        // check that selected Fee rate (if present) is bigger than the min fee
        if (selectedFeeRate && selectedFeeRate < minFeeRate) {
          throw new Error("Selected fee rate is lower than the hour fee");
        }
        const memoizedFeeRate = selectedFeeRate || defaultFeeRate;

        const eoiInput = {
          finalityProviderPkNoCoordHex: finalityProvider.btcPk,
          stakingAmountSat,
          stakingTimeBlocks,
          feeRate: memoizedFeeRate,
        };
        // Calculate the staking fee
        return estimateStakingFee(eoiInput, memoizedFeeRate);
      } catch (error: Error | any) {
        let errorMsg = error?.message;
        // Turn the error message into a user-friendly message
        // The btc-staking-ts lib will be improved to return propert error types
        // in the future. For now, we need to handle the errors manually by
        // matching the error message.
        if (errorMsg.includes("Insufficient funds")) {
          errorMsg =
            "Not enough balance to cover staking amount and fees, please lower the staking amount";
        }
        // fees + staking amount can be more than the balance
        showError({
          error: {
            message: errorMsg,
            errorState: ErrorState.STAKING,
          },
          retryAction: () => setSelectedFeeRate(0),
        });
        setSelectedFeeRate(0);
        return 0;
      }
    } else {
      return 0;
    }
  }, [
    btcWalletNetwork,
    address,
    latestParam,
    publicKeyNoCoord,
    stakingAmountSat,
    finalityProvider,
    mempoolFeeRates,
    availableUTXOs,
    selectedFeeRate,
    minFeeRate,
    defaultFeeRate,
    stakingTimeBlocks,
    estimateStakingFee,
    showError,
  ]);

  // Select the finality provider from the list
  const handleChooseFinalityProvider = (btcPkHex: string) => {
    let found: FinalityProviderInterface | undefined;
    try {
      if (!finalityProviders) {
        throw new Error("Finality providers not loaded");
      }

      found = finalityProviders.find((fp) => fp?.btcPk === btcPkHex);
      if (!found) {
        throw new Error("Finality provider not found");
      }

      if (found.btcPk === publicKeyNoCoord) {
        throw new Error(
          "Cannot select a finality provider with the same public key as the wallet",
        );
      }
    } catch (error: any) {
      showError({
        error: {
          message: error.message,
          errorState: ErrorState.STAKING,
        },
        retryAction: () => handleChooseFinalityProvider(btcPkHex),
      });
      return;
    }

    setFinalityProvider(found);
  };

  const handleStakingAmountSatChange = (inputAmountSat: number) => {
    setStakingAmountSat(inputAmountSat);
  };

  const handleStakingTimeBlocksChange = (inputTimeBlocks: number) => {
    setStakingTimeBlocks(inputTimeBlocks);
  };

  // Show feedback modal only once for each type
  const handleFeedbackModal = (type: "success" | "cancel") => {
    if (!feedbackModal.isOpen && feedbackModal.type !== type) {
      const isFeedbackModalOpened =
        type === "success"
          ? successFeedbackModalOpened
          : cancelFeedbackModalOpened;
      if (!isFeedbackModalOpened) {
        setFeedbackModal({ type, isOpen: true });
      }
    }
  };

  const handlePreviewModalClose = () => {
    setPreviewModalOpen(false);
    handleFeedbackModal("cancel");
  };

  const handleCloseFeedbackModal = () => {
    if (feedbackModal.type === "success") {
      setSuccessFeedbackModalOpened(true);
    } else if (feedbackModal.type === "cancel") {
      setCancelFeedbackModalOpened(true);
    }
    setFeedbackModal({ type: null, isOpen: false });
  };

  const hasError = disabled || hasMempoolFeeRatesError;

  const renderStakingForm = () => {
    // States of the staking form:
    // Health check failed
    if (!isApiNormal || isGeoBlocked || hasError) {
      return (
        <Message
          title="Staking is not available"
          messages={!hasError ? [apiMessage || ""] : [""]}
          icon={isGeoBlocked ? geoRestricted : apiNotAvailable}
        />
      );
    }
    // Wallet is not connected
    else if (!connected) {
      return <WalletNotConnected />;
    }
    // Wallet is connected but we are still loading the staking params
    else if (isLoading || areMempoolFeeRatesLoading) {
      return <LoadingView />;
    }
    // Staking form
    else {
      if (!latestParam) {
        throw new Error("Staking params not loaded");
      }
      const {
        minStakingAmountSat,
        maxStakingAmountSat,
        minStakingTimeBlocks,
        maxStakingTimeBlocks,
        unbondingTime,
        unbondingFeeSat,
      } = latestParam;

      // Staking time is fixed
      const stakingTimeFixed = minStakingTimeBlocks === maxStakingTimeBlocks;

      // Takes into account the fixed staking time
      const stakingTimeBlocksWithFixed = stakingTimeFixed
        ? minStakingTimeBlocks
        : stakingTimeBlocks;

      // Check if the staking transaction is ready to be signed
      const { isReady: signReady, reason: signNotReadyReason } =
        isStakingSignReady(
          minStakingAmountSat,
          maxStakingAmountSat,
          minStakingTimeBlocks,
          maxStakingTimeBlocks,
          stakingAmountSat,
          stakingTimeBlocksWithFixed,
          Boolean(finalityProvider),
          stakingFeeSat,
        );

      const previewReady =
        signReady && feeRate && availableUTXOs && stakingAmountSat;

      return (
        <>
          <p>
            <strong>Step-2:</strong> Set up staking terms
          </p>
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col">
              <StakingTime
                minStakingTimeBlocks={minStakingTimeBlocks}
                maxStakingTimeBlocks={maxStakingTimeBlocks}
                unbondingTimeBlocks={unbondingTime}
                onStakingTimeBlocksChange={handleStakingTimeBlocksChange}
                reset={resetFormInputs}
              />
              <StakingAmount
                minStakingAmountSat={minStakingAmountSat}
                maxStakingAmountSat={maxStakingAmountSat}
                btcWalletBalanceSat={btcWalletBalanceSat}
                onStakingAmountSatChange={handleStakingAmountSatChange}
                reset={resetFormInputs}
              />
              {signReady && (
                <StakingFee
                  mempoolFeeRates={mempoolFeeRates}
                  stakingFeeSat={stakingFeeSat}
                  selectedFeeRate={selectedFeeRate}
                  onSelectedFeeRateChange={setSelectedFeeRate}
                  reset={resetFormInputs}
                />
              )}
            </div>
            <span
              className="cursor-pointer text-xs"
              data-tooltip-id="tooltip-staking-preview"
              data-tooltip-content={signNotReadyReason}
              data-tooltip-place="top"
            >
              <button
                className="btn-primary btn mt-2 w-full"
                disabled={!previewReady}
                onClick={() => setPreviewModalOpen(true)}
              >
                Preview
              </button>
              <Tooltip id="tooltip-staking-preview" className="tooltip-wrap" />
            </span>
            {previewReady && (
              <PreviewModal
                isOpen={previewModalOpen}
                onClose={handlePreviewModalClose}
                onSign={handleDelegationEoiCreation}
                finalityProvider={finalityProvider?.description.moniker}
                finalityProviderAvatar={finalityProvider?.description.identity}
                stakingAmountSat={stakingAmountSat}
                stakingTimeBlocks={stakingTimeBlocksWithFixed}
                stakingFeeSat={stakingFeeSat}
                feeRate={feeRate}
                unbondingFeeSat={unbondingFeeSat}
                awaitingWalletResponse={awaitingWalletResponse}
              />
            )}
          </div>
        </>
      );
    }
  };

  return (
    <div className="card flex flex-col gap-2 bg-base-300 p-4 shadow-sm lg:flex-1">
      <h3 className="mb-4 font-bold">Staking</h3>
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex flex-1 flex-col gap-4 lg:basis-3/5 xl:basis-2/3">
          <FinalityProviders
            onFinalityProvidersLoad={setFinalityProviders}
            selectedFinalityProvider={finalityProvider}
            onFinalityProviderChange={handleChooseFinalityProvider}
          />
        </div>
        <div className="divider m-0 lg:divider-horizontal lg:m-0" />
        <div className="flex flex-1 flex-col gap-4 lg:basis-2/5 xl:basis-1/3">
          {renderStakingForm()}
        </div>
      </div>
      <FeedbackModal
        open={feedbackModal.isOpen}
        onClose={handleCloseFeedbackModal}
        type={feedbackModal.type}
      />
      {stakingTxHashHex && (
        <PendingVerificationModal
          open={pendingVerificationOpen}
          onClose={handlePendingVerificationClose}
          stakingTxHash={stakingTxHashHex}
          awaitingWalletResponse={awaitingWalletResponse}
        />
      )}
      <EOIModal
        statuses={eoiStatuses}
        open={eoiModalOpen}
        onClose={() => setEoiModalOpen(false)}
      />
    </div>
  );
};
