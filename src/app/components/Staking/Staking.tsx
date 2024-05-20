import { Dispatch, SetStateAction, useState } from "react";
import { Transaction, networks } from "bitcoinjs-lib";

import { FinalityProvider as FinalityProviderInterface } from "@/app/types/finalityProviders";
import { toLocalStorageDelegation } from "@/utils/local_storage/toLocalStorageDelegation";
import { signForm } from "@/utils/signForm";
import { getStakingTerm } from "@/utils/getStakingTerm";
import { FinalityProviders } from "./FinalityProviders/FinalityProviders";
import { WalletProvider } from "@/utils/wallet/wallet_provider";
import { isStakingSignReady } from "@/utils/isStakingSignReady";
import { GlobalParamsVersion } from "@/app/types/globalParams";
import { Delegation } from "@/app/types/delegations";
import { LoadingView } from "../Loading/Loading";
import { WalletNotConnected } from "./Form/States/WalletNotConnected";
import { Message } from "./Form/States/Message";
import { StakingTime } from "./Form/StakingTime";
import { StakingAmount } from "./Form/StakingAmount";
import { PreviewModal } from "../Modals/PreviewModal";
import stakingCapReached from "./Form/States/staking-cap-reached.svg";
import stakingNotStarted from "./Form/States/staking-not-started.svg";
import stakingUpgrading from "./Form/States/staking-upgrading.svg";

const stakingFeeSat = 500;

interface StakingProps {
  finalityProviders: FinalityProviderInterface[] | undefined;
  isWalletConnected: boolean;
  isLoading: boolean;
  overTheCap: boolean;
  onConnect: () => void;
  finalityProvidersFetchNext: () => void;
  finalityProvidersHasNext: boolean;
  finalityProvidersIsFetchingMore: boolean;
  btcWallet: WalletProvider | undefined;
  btcWalletNetwork: networks.Network | undefined;
  address: string | undefined;
  publicKeyNoCoord: string;
  setDelegationsLocalStorage: Dispatch<SetStateAction<Delegation[]>>;
  paramWithContext:
    | {
        currentVersion: GlobalParamsVersion | undefined;
        isApprochingNextVersion: boolean | undefined;
      }
    | undefined;
}

export const Staking: React.FC<StakingProps> = ({
  finalityProviders,
  isWalletConnected,
  overTheCap,
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
}) => {
  // Staking form state
  const [stakingAmountSat, setStakingAmountSat] = useState(0);
  const [stakingTimeBlocks, setStakingTimeBlocks] = useState(0);
  const [finalityProvider, setFinalityProvider] =
    useState<FinalityProviderInterface>();
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const stakingParams = paramWithContext?.currentVersion;
  const isUpgrading = paramWithContext?.isApprochingNextVersion;

  const handleResetState = () => {
    setFinalityProvider(undefined);
    setStakingAmountSat(0);
    setStakingTimeBlocks(0);
    setPreviewModalOpen(false);
  };

  const handleSign = async () => {
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
    const stakingTerm = getStakingTerm(globalParamsVersion, stakingTimeBlocks);
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
        stakingFeeSat,
        publicKeyNoCoord,
      );
    } catch (error: Error | any) {
      // TODO Show Popup
      console.error(error?.message || "Error signing the form");
      throw error;
    }

    let txID;
    try {
      txID = await btcWallet.pushTx(signedTxHex);
    } catch (error: Error | any) {
      console.error(error?.message || "Broadcasting staking transaction error");
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
      ),
      ...delegations,
    ]);

    handleResetState();
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
    else if (!stakingParams) {
      return (
        <Message
          title="Staking has not yet started"
          messages={[
            "The staking application will open once the staking activation height has been reached.",
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
    else if (overTheCap) {
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
                stakingTimeBlocks={stakingTimeBlocks}
                onStakingTimeBlocksChange={handleStakingTimeBlocksChange}
              />
              <StakingAmount
                minStakingAmountSat={minStakingAmountSat}
                maxStakingAmountSat={maxStakingAmountSat}
                stakingAmountSat={stakingAmountSat}
                onStakingAmountSatChange={handleStakingAmountSatChange}
              />
            </div>
            <button
              className="btn-primary btn mt-2 w-full"
              disabled={!signReady}
              onClick={() => setPreviewModalOpen(true)}
            >
              Preview
            </button>
            <PreviewModal
              open={previewModalOpen}
              onClose={setPreviewModalOpen}
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
    </div>
  );
};
