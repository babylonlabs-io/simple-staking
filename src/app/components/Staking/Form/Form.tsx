import { FinalityProvider as FinalityProviderInterface } from "@/app/api/getFinalityProviders";
import { StakingParams } from "@/app/types/stakingParams";
import { Loading } from "../Loading";
import { Fixed } from "./Fixed";
import { Regular } from "./Regular";
import { WalletNotConnected } from "./States/WalletNotConnected";
import { Message } from "./States/Message";
import stakingCapReached from "./States/staking-cap-reached.svg";
import stakingNotStarted from "./States/staking-not-started.svg";
import stakingUpgrading from "./States/staking-upgrading.svg";

interface FormProps {
  isWalletConnected: boolean;
  isLoading: boolean;
  isUpgrading: boolean | undefined;
  overTheCap: boolean;
  stakingParams: StakingParams | undefined;
  onConnect: () => void;
  onSign: (amountSat: number, termBlocks: number) => Promise<void>;
  selectedFinalityProvider: FinalityProviderInterface | undefined;
}

export const Form: React.FC<FormProps> = ({
  isWalletConnected,
  isLoading,
  isUpgrading,
  overTheCap,
  stakingParams,
  onConnect,
  onSign,
  selectedFinalityProvider,
}) => {
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
          "Staking is temporarily disabled due to cap reached.",
          "Please check your staking history to see if any of yourstake is tagged overflow.",
          "Overflow stake should be unbonded and withdrawn.",
        ]}
        icon={stakingCapReached}
      />
    );
  }
  // 6. Min and max terms are equal -> fixed term, no term input, amount, finality provider
  else if (stakingParams.minStakingTime === stakingParams.maxStakingTime) {
    return (
      <Fixed
        onSign={onSign}
        selectedFinalityProvider={selectedFinalityProvider}
        minStakingAmount={stakingParams.minStakingAmount}
        maxStakingAmount={stakingParams.maxStakingAmount}
        stakingTime={stakingParams.minStakingTime}
      />
    );
  }
  // 7. Regular form -> amount, term, finality provider
  else {
    return (
      <Regular
        onSign={onSign}
        selectedFinalityProvider={selectedFinalityProvider}
        minStakingAmount={stakingParams.minStakingAmount}
        maxStakingAmount={stakingParams.maxStakingAmount}
        minStakingTime={stakingParams.minStakingTime}
        maxStakingTime={stakingParams.maxStakingTime}
      />
    );
  }
};
