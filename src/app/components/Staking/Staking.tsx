import { Dispatch, SetStateAction, useState } from "react";
import { Transaction, networks } from "bitcoinjs-lib";

import { FinalityProvider } from "@/app/api/getFinalityProviders";
import { toLocalStorageDelegation } from "@/utils/local_storage/toLocalStorageDelegation";
import { signForm } from "@/utils/signForm";
import { getStakingTerm } from "@/utils/getStakingTerm";
import { FinalityProviders } from "./FinalityProviders/FinalityProviders";
import { WalletProvider } from "@/utils/wallet/wallet_provider";
import { Delegation } from "@/app/api/getDelegations";
import { GlobalParamsVersion } from "@/app/api/getGlobalParams";
import { WalletNotConnected } from "./Form/States/WalletNotConnected";
import { Loading } from "./Loading";
import { Message } from "./Form/States/Message";
import { StakingTime } from "./Form/StakingTime";
import { StakingAmount } from "./Form/StakingAmount";
import { PreviewModal } from "../Modals/PreviewModal";
import stakingCapReached from "./Form/States/staking-cap-reached.svg";
import stakingNotStarted from "./Form/States/staking-not-started.svg";
import stakingUpgrading from "./Form/States/staking-upgrading.svg";

const stakingFee = 500;

interface StakingProps {
  finalityProviders: FinalityProvider[] | undefined;
  paramWithContext:
    | {
        currentVersion: GlobalParamsVersion | undefined;
        isApprochingNextVersion: boolean | undefined;
      }
    | undefined;
  isWalletConnected: boolean;
  isLoading: boolean;
  overTheCap: boolean;
  onConnect: () => void;
  btcWallet: WalletProvider | undefined;
  btcWalletNetwork: networks.Network | undefined;
  address: string | undefined;
  publicKeyNoCoord: string;
  setDelegationsLocalStorage: Dispatch<SetStateAction<Delegation[]>>;
}

export const Staking: React.FC<StakingProps> = ({
  finalityProviders,
  isWalletConnected,
  isLoading,
  overTheCap,
  onConnect,
  paramWithContext,
  btcWallet,
  btcWalletNetwork,
  address,
  publicKeyNoCoord,
  setDelegationsLocalStorage,
}) => {
  // Staking form state
  const [stakingAmountBTC, setStakingAmountBTC] = useState(0);
  const [stakingTimeBlocks, setStakingTimeBlocks] = useState(0);
  const [finalityProvider, setFinalityProvider] = useState<FinalityProvider>();
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const stakingParams = paramWithContext?.currentVersion;
  const isUpgrading = paramWithContext?.isApprochingNextVersion;

  const handleSign = async (amountSat: number, stakingTimeBlocks: number) => {
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
    const stakingAmountSat = amountSat;
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
        stakingFee,
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
        finalityProvider.btc_pk,
        stakingAmountSat,
        signedTxHex,
        stakingTerm,
      ),
      ...delegations,
    ]);

    setFinalityProvider(undefined);
    setStakingAmountBTC(0);
    setStakingTimeBlocks(0);
    setPreviewModalOpen(false);
  };

  // Select the finality provider from the list
  const handleChooseFinalityProvider = (btcPkHex: string) => {
    if (!finalityProviders) {
      return;
    }
    const found = finalityProviders.find((fp) => fp?.btc_pk === btcPkHex);
    if (found) {
      setFinalityProvider(found);
    }
  };

  const handleStakingAmountChange = (inputAmountBTC: number) => {
    setStakingAmountBTC(inputAmountBTC);
  };

  const handleStakingTimeChange = (inputTimeBlocks: number) => {
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
      return <Loading />;
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

      const minAmountBTC = minStakingAmountSat ? minStakingAmountSat / 1e8 : 0;
      const maxAmountBTC = maxStakingAmountSat ? maxStakingAmountSat / 1e8 : 0;

      // API data is ready
      const stakingAmountAPIReady = minStakingAmountSat && maxStakingAmountSat;
      // App inputs are filled
      const stakingAmountAppReady =
        stakingAmountBTC >= minAmountBTC && stakingAmountBTC <= maxAmountBTC;
      // Amount is ready
      const stakingAmountReady = stakingAmountAPIReady && stakingAmountAppReady;

      // API data is ready
      const stakingTimeAPIReady = minStakingTimeBlocks && maxStakingTimeBlocks;
      // App inputs are filled
      const stakingTimeAppReady =
        stakingTimeBlocks >= minStakingTimeBlocks &&
        stakingTimeBlocks <= maxStakingTimeBlocks;
      // Staking time is fixed
      const stakingTimeFixed = minStakingTimeBlocks === maxStakingTimeBlocks;
      // Staking time is ready
      const stakingTimeReady =
        stakingTimeAPIReady && (stakingTimeAppReady || stakingTimeFixed);

      const signReady =
        stakingAmountReady && stakingTimeReady && finalityProvider;

      // Rounding the input since 0.0006 * 1e8 is is 59999.999
      const amountSat = Math.round(stakingAmountBTC * 1e8);

      return (
        <>
          <p>Set up staking terms</p>
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col">
              <StakingTime
                minStakingTimeBlocks={minStakingTimeBlocks}
                maxStakingTimeBlocks={maxStakingTimeBlocks}
                stakingTimeBlocks={stakingTimeBlocks}
                onStakingTimeChange={handleStakingTimeChange}
              />
              <StakingAmount
                minStakingAmountBTC={minAmountBTC}
                maxStakingAmountBTC={maxAmountBTC}
                stakingAmountBTC={stakingAmountBTC}
                onStakingAmountChange={handleStakingAmountChange}
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
              amountSat={amountSat}
              stakingTimeBlocks={
                stakingTimeFixed ? minStakingTimeBlocks : stakingTimeBlocks
              }
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
