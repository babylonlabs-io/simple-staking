import { Dispatch, SetStateAction, useState } from "react";
import { Transaction, networks } from "bitcoinjs-lib";

import { FinalityProvider } from "@/app/api/getFinalityProviders";
import { toLocalStorageDelegation } from "@/utils/local_storage/toLocalStorageDelegation";
import { signForm } from "@/utils/signForm";
import { getStakingTerm } from "@/utils/getStakingTerm";
import { FinalityProviders } from "./FinalityProviders/FinalityProviders";
import { Form } from "./Form/Form";
import { WalletProvider } from "@/utils/wallet/wallet_provider";
import { Delegation } from "@/app/api/getDelegations";
import { GlobalParamsVersion } from "@/app/api/getGlobalParams";

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
  const [finalityProvider, setFinalityProvider] = useState<FinalityProvider>();

  const stakingParams = paramWithContext?.currentVersion;
  const isUpgrading = paramWithContext?.isApprochingNextVersion;

  const handleSign = async (amountSat: number, termBlocks: number) => {
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
    const stakingAmount = amountSat;
    const stakingTerm = getStakingTerm(globalParamsVersion, termBlocks);
    let signedTxHex: string;
    try {
      signedTxHex = await signForm(
        globalParamsVersion,
        btcWallet,
        finalityProvider,
        stakingTerm,
        btcWalletNetwork,
        stakingAmount,
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
        stakingAmount,
        signedTxHex,
        stakingTerm,
      ),
      ...delegations,
    ]);

    setFinalityProvider(undefined);
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
          <Form
            isWalletConnected={isWalletConnected}
            isLoading={isLoading}
            stakingParams={stakingParams}
            isUpgrading={isUpgrading}
            overTheCap={overTheCap}
            onConnect={onConnect}
            onSign={handleSign}
            selectedFinalityProvider={finalityProvider}
          />
        </div>
      </div>
    </div>
  );
};
