import { useState } from "react";

import { FinalityProvider as FinalityProviderInterface } from "@/app/api/getFinalityProviders";
import { StakingParams } from "@/app/types/stakingParams";
import { Loading } from "../Loading";
import { WalletNotConnected } from "./States/WalletNotConnected";
import { Message } from "./States/Message";
import stakingCapReached from "./States/staking-cap-reached.svg";
import stakingNotStarted from "./States/staking-not-started.svg";
import stakingUpgrading from "./States/staking-upgrading.svg";
import { PreviewModal } from "../../Modals/PreviewModal";
import { StakingAmount } from "./StakingAmount";
import { StakingTime } from "./StakingTime";

interface StakingFormProps {
  isWalletConnected: boolean;
  isLoading: boolean;
  isUpgrading: boolean | undefined;
  overTheCap: boolean;
  stakingParams: StakingParams | undefined;
  onConnect: () => void;
  onSign: (amountSat: number, stakingTimeBlocks: number) => Promise<void>;
  selectedFinalityProvider: FinalityProviderInterface | undefined;
}

export const StakingForm: React.FC<StakingFormProps> = ({
  isWalletConnected,
  isLoading,
  isUpgrading,
  overTheCap,
  stakingParams,
  onConnect,
  onSign,
  selectedFinalityProvider,
}) => {
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [stakingAmountBTC, setStakingAmountBTC] = useState(0);
  const [stakingTimeBlocks, setStakingTimeBlocks] = useState(0);

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
    stakingAmountReady && stakingTimeReady && selectedFinalityProvider;

  const handleSign = () => {
    // If the staking time is fixed, use the min staking time from the API
    const adjustedStakingTimeBlocks = stakingTimeFixed
      ? minStakingTimeBlocks
      : stakingTimeBlocks;

    onSign(amountSat, adjustedStakingTimeBlocks);

    // Reset the component state
    setStakingAmountBTC(0);
    setStakingTimeBlocks(0);
    setPreviewModalOpen(false);
  };

  // Rounding the input since 0.0006 * 1e8 is is 59999.999
  const amountSat = Math.round(stakingAmountBTC * 1e8);

  const handleStakingAmountChange = (inputAmountBTC: number) => {
    setStakingAmountBTC(inputAmountBTC);
  };

  const handleStakingTimeChange = (inputTimeBlocks: number) => {
    setStakingTimeBlocks(inputTimeBlocks);
  };

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
          finalityProvider={selectedFinalityProvider?.description.moniker}
          amountSat={amountSat}
          stakingTimeBlocks={
            stakingTimeFixed ? minStakingTimeBlocks : stakingTimeBlocks
          }
        />
      </div>
    </>
  );
};
