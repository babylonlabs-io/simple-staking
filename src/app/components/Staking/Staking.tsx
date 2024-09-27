import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Transaction } from "bitcoinjs-lib";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { Tooltip } from "react-tooltip";
import { useLocalStorage } from "usehooks-ts";

import {
  OVERFLOW_HEIGHT_WARNING_THRESHOLD,
  OVERFLOW_TVL_WARNING_THRESHOLD,
  UTXO_KEY,
} from "@/app/common/constants";
import { LoadingView } from "@/app/components/Loading/Loading";
import { useError } from "@/app/context/Error/ErrorContext";
import { useGlobalParams } from "@/app/context/api/GlobalParamsProvider";
import { useStakingStats } from "@/app/context/api/StakingStatsProvider";
import { useWallet } from "@/app/context/wallet/WalletProvider";
import { useHealthCheck } from "@/app/hooks/useHealthCheck";
import { Delegation } from "@/app/types/delegations";
import { ErrorHandlerParam, ErrorState } from "@/app/types/errors";
import {
  FinalityProvider,
  FinalityProvider as FinalityProviderInterface,
} from "@/app/types/finalityProviders";
import { getNetworkConfig } from "@/config/network.config";
import {
  createStakingTx,
  signStakingTx,
} from "@/utils/delegations/signStakingTx";
import { getFeeRateFromMempool } from "@/utils/getFeeRateFromMempool";
import {
  getCurrentGlobalParamsVersion,
  ParamsWithContext,
} from "@/utils/globalParams";
import { isStakingSignReady } from "@/utils/isStakingSignReady";
import { toLocalStorageDelegation } from "@/utils/local_storage/toLocalStorageDelegation";
import type { UTXO } from "@/utils/wallet/wallet_provider";

import { FeedbackModal } from "../Modals/FeedbackModal";
import { PreviewModal } from "../Modals/PreviewModal";

import { FinalityProviders } from "./FinalityProviders/FinalityProviders";
import { StakingAmount } from "./Form/StakingAmount";
import { StakingFee } from "./Form/StakingFee";
import { StakingTime } from "./Form/StakingTime";
import { Message } from "./Form/States/Message";
import { WalletNotConnected } from "./Form/States/WalletNotConnected";
import apiNotAvailable from "./Form/States/api-not-available.svg";
import geoRestricted from "./Form/States/geo-restricted.svg";
import stakingCapReached from "./Form/States/staking-cap-reached.svg";
import stakingNotStarted from "./Form/States/staking-not-started.svg";
import stakingUpgrading from "./Form/States/staking-upgrading.svg";

interface OverflowProperties {
  isHeightCap: boolean;
  overTheCapRange: boolean;
  approchingCapRange: boolean;
}

interface StakingProps {
  btcHeight: number | undefined;
  disabled?: boolean;
  isLoading: boolean;
  btcWalletBalanceSat?: number;
  setDelegationsLocalStorage: Dispatch<SetStateAction<Delegation[]>>;
  availableUTXOs?: UTXO[] | undefined;
}

export const Staking: React.FC<StakingProps> = ({
  btcHeight,
  disabled = false,
  isLoading,
  setDelegationsLocalStorage,
  btcWalletBalanceSat,
  availableUTXOs,
}) => {
  const {
    connected,
    address,
    publicKeyNoCoord,
    walletProvider: btcWallet,
    network: btcWalletNetwork,
  } = useWallet();

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
  const [paramWithCtx, setParamWithCtx] = useState<
    ParamsWithContext | undefined
  >();
  const [overflow, setOverflow] = useState<OverflowProperties>({
    isHeightCap: false,
    overTheCapRange: false,
    approchingCapRange: false,
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
    queryFn: async () => {
      if (btcWallet?.getNetworkFees) {
        return await btcWallet.getNetworkFees();
      }
    },
    enabled: !!btcWallet?.getNetworkFees,
    refetchInterval: 60000, // 1 minute
    retry: (failureCount) => {
      return !isErrorOpen && failureCount <= 3;
    },
  });

  const stakingStats = useStakingStats();

  // load global params and calculate the current staking params
  const globalParams = useGlobalParams();
  useEffect(() => {
    if (!btcHeight || !globalParams.data) {
      return;
    }
    const paramCtx = getCurrentGlobalParamsVersion(
      btcHeight + 1,
      globalParams.data,
    );
    setParamWithCtx(paramCtx);
  }, [btcHeight, globalParams]);

  // Calculate the overflow properties
  useEffect(() => {
    if (!paramWithCtx || !paramWithCtx.currentVersion || !btcHeight) {
      return;
    }
    const nextBlockHeight = btcHeight + 1;
    const { stakingCapHeight, stakingCapSat, confirmationDepth } =
      paramWithCtx.currentVersion;
    // Use height based cap than value based cap if it is set
    if (stakingCapHeight) {
      setOverflow({
        isHeightCap: true,
        overTheCapRange:
          nextBlockHeight >= stakingCapHeight + confirmationDepth,
        /*
          When btc height is approching the staking cap height,
          there is higher chance of overflow due to tx not being included in the next few blocks on time
          We also don't take the confirmation depth into account here as majority
          of the delegation will be overflow after the cap is reached, unless btc fork happens but it's unlikely
        */
        approchingCapRange:
          nextBlockHeight >=
          stakingCapHeight - OVERFLOW_HEIGHT_WARNING_THRESHOLD,
      });
    } else if (stakingCapSat && stakingStats.data) {
      const { activeTVLSat, unconfirmedTVLSat } = stakingStats.data;
      setOverflow({
        isHeightCap: false,
        overTheCapRange: stakingCapSat <= activeTVLSat,
        approchingCapRange:
          stakingCapSat * OVERFLOW_TVL_WARNING_THRESHOLD < unconfirmedTVLSat,
      });
    }
  }, [paramWithCtx, btcHeight, stakingStats]);

  const { coinName } = getNetworkConfig();
  const stakingParams = paramWithCtx?.currentVersion;
  const firstActivationHeight = paramWithCtx?.firstActivationHeight;
  const isUpgrading = paramWithCtx?.isApprochingNextVersion;
  const isBlockHeightUnderActivation =
    !stakingParams ||
    (btcHeight &&
      firstActivationHeight &&
      btcHeight + 1 < firstActivationHeight);

  const { isErrorOpen, showError } = useError();
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
  }, [
    mempoolFeeRatesError,
    hasMempoolFeeRatesError,
    refetchMempoolFeeRates,
    showError,
  ]);

  const handleResetState = () => {
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

  const handleSign = async () => {
    try {
      // Prevent the modal from closing
      setAwaitingWalletResponse(true);
      // Initial validation
      if (!btcWallet) throw new Error("Wallet is not connected");
      if (!address) throw new Error("Address is not set");
      if (!btcWalletNetwork) throw new Error("Wallet network is not connected");
      if (!finalityProvider)
        throw new Error("Finality provider is not selected");
      if (!paramWithCtx || !paramWithCtx.currentVersion)
        throw new Error("Global params not loaded");
      if (!feeRate) throw new Error("Fee rates not loaded");
      if (!availableUTXOs || availableUTXOs.length === 0)
        throw new Error("No available balance");

      const { currentVersion: globalParamsVersion } = paramWithCtx;
      // Sign the staking transaction
      const { stakingTxHex, stakingTerm } = await signStakingTx(
        btcWallet,
        globalParamsVersion,
        stakingAmountSat,
        stakingTimeBlocks,
        finalityProvider.btcPk,
        btcWalletNetwork,
        address,
        publicKeyNoCoord,
        feeRate,
        availableUTXOs,
      );
      // Invalidate UTXOs
      queryClient.invalidateQueries({ queryKey: [UTXO_KEY, address] });
      // UI
      handleFeedbackModal("success");
      handleLocalStorageDelegations(stakingTxHex, stakingTerm);
      handleResetState();
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
    }
  };

  // Save the delegation to local storage
  const handleLocalStorageDelegations = (
    signedTxHex: string,
    stakingTerm: number,
  ) => {
    // Get the transaction ID
    const newTxId = Transaction.fromHex(signedTxHex).getId();

    setDelegationsLocalStorage((delegations) => {
      // Check if the delegation with the same transaction ID already exists
      const exists = delegations.some(
        (delegation) => delegation.stakingTxHashHex === newTxId,
      );

      // If it doesn't exist, add the new delegation
      if (!exists) {
        return [
          toLocalStorageDelegation(
            newTxId,
            publicKeyNoCoord,
            finalityProvider!.btcPk,
            stakingAmountSat,
            signedTxHex,
            stakingTerm,
          ),
          ...delegations,
        ];
      }

      // If it exists, return the existing delegations unchanged
      return delegations;
    });
  };

  // Memoize the staking fee calculation
  const stakingFeeSat = useMemo(() => {
    if (
      btcWalletNetwork &&
      address &&
      publicKeyNoCoord &&
      stakingAmountSat &&
      finalityProvider &&
      paramWithCtx?.currentVersion &&
      mempoolFeeRates &&
      availableUTXOs
    ) {
      try {
        // check that selected Fee rate (if present) is bigger than the min fee
        if (selectedFeeRate && selectedFeeRate < minFeeRate) {
          throw new Error("Selected fee rate is lower than the hour fee");
        }
        const memoizedFeeRate = selectedFeeRate || defaultFeeRate;
        // Calculate the staking fee
        const { stakingFeeSat } = createStakingTx(
          paramWithCtx.currentVersion,
          stakingAmountSat,
          stakingTimeBlocks,
          finalityProvider.btcPk,
          btcWalletNetwork,
          address,
          publicKeyNoCoord,
          memoizedFeeRate,
          availableUTXOs,
        );
        return stakingFeeSat;
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
    publicKeyNoCoord,
    stakingAmountSat,
    stakingTimeBlocks,
    finalityProvider,
    paramWithCtx,
    mempoolFeeRates,
    selectedFeeRate,
    availableUTXOs,
    showError,
    defaultFeeRate,
    minFeeRate,
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

  const handlePreviewModalClose = (isOpen: boolean) => {
    setPreviewModalOpen(isOpen);
    handleFeedbackModal("cancel");
  };

  const showOverflowWarning = (overflow: OverflowProperties) => {
    if (overflow.isHeightCap) {
      return (
        <Message
          title="Staking window closed"
          messages={[
            "Staking is temporarily disabled due to the staking window being closed.",
            "Please check your staking history to see if any of your stake is tagged overflow.",
            "Overflow stake should be unbonded and withdrawn.",
          ]}
          icon={stakingCapReached}
        />
      );
    } else {
      return (
        <Message
          title="Staking cap reached"
          messages={[
            "Staking is temporarily disabled due to the staking cap getting reached.",
            "Please check your staking history to see if any of your stake is tagged overflow.",
            "Overflow stake should be unbonded and withdrawn.",
          ]}
          icon={stakingCapReached}
        />
      );
    }
  };

  const handleCloseFeedbackModal = () => {
    if (feedbackModal.type === "success") {
      setSuccessFeedbackModalOpened(true);
    } else if (feedbackModal.type === "cancel") {
      setCancelFeedbackModalOpened(true);
    }
    setFeedbackModal({ type: null, isOpen: false });
  };

  const showApproachingCapWarning = () => {
    if (!overflow.approchingCapRange) {
      return;
    }
    if (overflow.isHeightCap) {
      return (
        <p className="text-center text-sm text-error">
          Staking window is closing. Your stake may <b>overflow</b>!
        </p>
      );
    }
    return (
      <p className="text-center text-sm text-error">
        Staking cap is filling up. Your stake may <b>overflow</b>!
      </p>
    );
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
    // Staking has not started yet
    else if (isBlockHeightUnderActivation) {
      return (
        <Message
          title="Staking has not yet started"
          messages={[
            `Staking will be activated once ${coinName} block height reaches ${
              firstActivationHeight ? firstActivationHeight - 1 : "-"
            }. The current ${coinName} block height is ${btcHeight || "-"}.`,
          ]}
          icon={stakingNotStarted}
        />
      );
    }
    // Staking params upgrading
    else if (isUpgrading) {
      return (
        <Message
          title="Staking parameters upgrading"
          messages={[
            "The staking parameters are getting upgraded, staking will be re-enabled soon.",
          ]}
          icon={stakingUpgrading}
        />
      );
    }
    // Staking cap reached
    else if (overflow.overTheCapRange) {
      return showOverflowWarning(overflow);
    }
    // Staking form
    else {
      const {
        minStakingAmountSat,
        maxStakingAmountSat,
        minStakingTimeBlocks,
        maxStakingTimeBlocks,
        unbondingTime,
        confirmationDepth,
        unbondingFeeSat,
      } = stakingParams;

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
          !!finalityProvider,
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
                unbondingTimeBlocks={stakingParams.unbondingTime}
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
            {showApproachingCapWarning()}
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
                open={previewModalOpen}
                onClose={handlePreviewModalClose}
                onSign={handleSign}
                finalityProvider={finalityProvider?.description.moniker}
                stakingAmountSat={stakingAmountSat}
                stakingTimeBlocks={stakingTimeBlocksWithFixed}
                stakingFeeSat={stakingFeeSat}
                confirmationDepth={confirmationDepth}
                feeRate={feeRate}
                unbondingTimeBlocks={unbondingTime}
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
    </div>
  );
};
