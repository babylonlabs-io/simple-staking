import { Dispatch, SetStateAction, useState } from "react";
import { Transaction, networks } from "bitcoinjs-lib";
import { useLocalStorage } from "usehooks-ts";

import { FinalityProvider as FinalityProviderInterface } from "@/app/types/finalityProviders";
import { toLocalStorageDelegation } from "@/utils/local_storage/toLocalStorageDelegation";
import { signForm } from "@/utils/signForm";
import { getStakingTerm } from "@/utils/getStakingTerm";
import { FinalityProviders } from "./FinalityProviders/FinalityProviders";
import { WalletProvider } from "@/utils/wallet/wallet_provider";
import { isStakingSignReady } from "@/utils/isStakingSignReady";
import { GlobalParamsVersion } from "@/app/types/globalParams";
import { Delegation } from "@/app/types/delegations";
import { LoadingView } from "@/app/components/Loading/Loading";
import { WalletNotConnected } from "./Form/States/WalletNotConnected";
import { Message } from "./Form/States/Message";
import { StakingTime } from "./Form/StakingTime";
import { StakingAmount } from "./Form/StakingAmount";
import { PreviewModal } from "../Modals/PreviewModal";
import stakingCapReached from "./Form/States/staking-cap-reached.svg";
import stakingNotStarted from "./Form/States/staking-not-started.svg";
import stakingUpgrading from "./Form/States/staking-upgrading.svg";
import { useError } from "@/app/context/Error/ErrorContext";
import { ErrorState } from "@/app/types/errors";
import { FeedbackModal } from "../Modals/FeedbackModal";

interface OverflowProperties {
  isOverTheCap: boolean;
  isApprochingCap: boolean;
}
interface StakingProps {
  finalityProviders: FinalityProviderInterface[] | undefined;
  isWalletConnected: boolean;
  isLoading: boolean;
  overflow: OverflowProperties;
  onConnect: () => void;
  finalityProvidersFetchNext: () => void;
  finalityProvidersHasNext: boolean;
  finalityProvidersIsFetchingMore: boolean;
  btcWallet: WalletProvider | undefined;
  btcWalletBalanceSat: number;
  btcWalletNetwork: networks.Network | undefined;
  address: string | undefined;
  publicKeyNoCoord: string;
  setDelegationsLocalStorage: Dispatch<SetStateAction<Delegation[]>>;
  paramWithContext:
    | {
        height: number;
        firstActivationHeight: number;
        currentVersion: GlobalParamsVersion | undefined;
        isApprochingNextVersion: boolean | undefined;
      }
    | undefined;
}

export const Staking: React.FC<StakingProps> = ({
  finalityProviders,
  isWalletConnected,
  overflow,
  onConnect,
  finalityProvidersFetchNext,
  finalityProvidersHasNext,
  finalityProvidersIsFetchingMore,
  isLoading,
  paramWithContext,
  btcWallet,
  btcWalletNetwork,
  address,
  publicKeyNoCoord,
  setDelegationsLocalStorage,
  btcWalletBalanceSat,
}) => {
  // Staking form state
  const [stakingAmountSat, setStakingAmountSat] = useState(0);
  const [stakingTimeBlocks, setStakingTimeBlocks] = useState(0);
  const [finalityProvider, setFinalityProvider] =
    useState<FinalityProviderInterface>();
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

  const stakingParams = paramWithContext?.currentVersion;
  const firstActivationHeight = paramWithContext?.firstActivationHeight;
  const height = paramWithContext?.height || 0;
  const isUpgrading = paramWithContext?.isApprochingNextVersion;
  const isBlockHeightUnderActivation =
    !stakingParams ||
    (height && firstActivationHeight && height < firstActivationHeight);
  const { showError } = useError();

  const handleResetState = () => {
    setFinalityProvider(undefined);
    setStakingAmountSat(0);
    setStakingTimeBlocks(0);
    setPreviewModalOpen(false);
    setResetFormInputs(!resetFormInputs);
  };

  const handleSign = async () => {
    try {
      if (!btcWallet) {
        throw new Error("Wallet not connected");
      } else if (!address) {
        throw new Error("Address is not set");
      } else if (!btcWalletNetwork) {
        throw new Error("Wallet network not connected");
      } else if (!paramWithContext || !paramWithContext.currentVersion) {
        throw new Error("Global params not loaded");
      } else if (!finalityProvider) {
        throw new Error("Finality provider not selected");
      }
      const { currentVersion: globalParamsVersion } = paramWithContext;
      const stakingTerm = getStakingTerm(
        globalParamsVersion,
        stakingTimeBlocks,
      );
      let signedTxHex: string;
      try {
        signedTxHex = await signForm(
          globalParamsVersion,
          btcWallet,
          finalityProvider,
          stakingTerm,
          btcWalletNetwork,
          stakingAmountSat,
          address,
          publicKeyNoCoord,
        );
        if (
          !feedbackModal.isOpen &&
          feedbackModal.type !== "success" &&
          !successFeedbackModalOpened
        ) {
          setFeedbackModal({ type: "success", isOpen: true });
        }
      } catch (error: Error | any) {
        throw error;
      }

      let txID;
      try {
        txID = await btcWallet.pushTx(signedTxHex);
      } catch (error: Error | any) {
        throw error;
      }

      // Update the local state with the new delegation
      setDelegationsLocalStorage((delegations) => [
        toLocalStorageDelegation(
          Transaction.fromHex(signedTxHex).getId(),
          publicKeyNoCoord,
          finalityProvider.btcPk,
          stakingAmountSat,
          signedTxHex,
          stakingTerm,
          height,
        ),
        ...delegations,
      ]);

      handleResetState();
    } catch (error: Error | any) {
      showError({
        error: {
          message: error.message,
          errorState: ErrorState.STAKING,
          errorTime: new Date(),
        },
        retryAction: handleSign,
      });
    }
  };

  // Select the finality provider from the list
  const handleChooseFinalityProvider = (btcPkHex: string) => {
    if (!finalityProviders) {
      throw new Error("Finality providers not loaded");
    }

    const found = finalityProviders.find((fp) => fp?.btcPk === btcPkHex);
    if (!found) {
      throw new Error("Finality provider not found");
    }

    setFinalityProvider(found);
  };

  const handleStakingAmountSatChange = (inputAmountSat: number) => {
    setStakingAmountSat(inputAmountSat);
  };

  const handleStakingTimeBlocksChange = (inputTimeBlocks: number) => {
    setStakingTimeBlocks(inputTimeBlocks);
  };

  const handlePreviewModalClose = (isOpen: boolean) => {
    setPreviewModalOpen(isOpen);
    if (
      !feedbackModal.isOpen &&
      feedbackModal.type !== "cancel" &&
      !cancelFeedbackModalOpened
    ) {
      setFeedbackModal({ type: "cancel", isOpen: true });
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

  const renderStakingForm = () => {
    // States of the staking form:
    // 1. Wallet is not connected
    if (!isWalletConnected) {
      return <WalletNotConnected onConnect={onConnect} />;
    }
    // 2. Wallet is connected but we are still loading the staking params
    else if (isLoading) {
      return <LoadingView />;
    }
    // 3. Staking has not started yet
    else if (isBlockHeightUnderActivation) {
      return (
        <Message
          title="Staking has not yet started"
          messages={[
            `The staking application will open once the next Bitcoin block height is the activation Bitcoin block height (${firstActivationHeight || "-"}).`,
            `The next Bitcoin block height is ${height || "-"}.`,
          ]}
          icon={stakingNotStarted}
        />
      );
    }
    // 4. Staking params upgrading
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
    // 5. Staking cap reached
    else if (overflow.isOverTheCap) {
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
    // 6. Staking form
    else {
      const {
        minStakingAmountSat,
        maxStakingAmountSat,
        minStakingTimeBlocks,
        maxStakingTimeBlocks,
      } = stakingParams;

      // Staking time is fixed
      const stakingTimeFixed = minStakingTimeBlocks === maxStakingTimeBlocks;

      // Takes into account the fixed staking time
      const stakingTimeBlocksWithFixed = stakingTimeFixed
        ? minStakingTimeBlocks
        : stakingTimeBlocks;

      // Check if the staking transaction is ready to be signed
      const signReady = isStakingSignReady(
        minStakingAmountSat,
        maxStakingAmountSat,
        minStakingTimeBlocks,
        maxStakingTimeBlocks,
        stakingAmountSat,
        stakingTimeBlocksWithFixed,
        !!finalityProvider,
      );

      return (
        <>
          <p>Set up staking terms</p>
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col">
              <StakingTime
                minStakingTimeBlocks={minStakingTimeBlocks}
                maxStakingTimeBlocks={maxStakingTimeBlocks}
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
            </div>
            {overflow.isApprochingCap && (
              <p className="text-center text-sm text-error">
                Staking cap is filling up. Your stake may <b>overflow</b>!
              </p>
            )}
            <button
              className="btn-primary btn mt-2 w-full"
              disabled={!signReady}
              onClick={() => setPreviewModalOpen(true)}
            >
              Preview
            </button>
            <PreviewModal
              open={previewModalOpen}
              onClose={handlePreviewModalClose}
              onSign={handleSign}
              finalityProvider={finalityProvider?.description.moniker}
              stakingAmountSat={stakingAmountSat}
              stakingTimeBlocks={stakingTimeBlocksWithFixed}
            />
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
            finalityProviders={finalityProviders}
            selectedFinalityProvider={finalityProvider}
            onFinalityProviderChange={handleChooseFinalityProvider}
            queryMeta={{
              next: finalityProvidersFetchNext,
              hasMore: finalityProvidersHasNext,
              isFetchingMore: finalityProvidersIsFetchingMore,
            }}
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
