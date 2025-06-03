import { Text } from "@babylonlabs-io/core-ui";

import { SignDetails } from "@/app/components/SignDetails/SignDetails";
import { useStakingState } from "@/app/state/StakingState";
import { getNetworkConfigBTC } from "@/config/network/btc";
import { satoshiToBtc } from "@/utils/btc";
import { maxDecimals } from "@/utils/maxDecimals";
import { blocksToDisplayTime } from "@/utils/time";

import { ConfirmationModal } from "./ConfirmationModal";

interface UnbondModalProps {
  processing: boolean;
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  unbondingFeeSat: number | undefined;
  unbondingTimeInBlocks: number | undefined;
}
const { networkName, coinSymbol } = getNetworkConfigBTC();

export const UnbondModal = ({
  open,
  onClose,
  onSubmit,
  processing,
  unbondingFeeSat,
  unbondingTimeInBlocks,
}: UnbondModalProps) => {
  const { currentStakingStepOptions } = useStakingState();

  if (!unbondingTimeInBlocks || !unbondingFeeSat) {
    return null;
  }

  const formattedUnbondingTime = blocksToDisplayTime(unbondingTimeInBlocks);
  const unbondingFeeBtc = maxDecimals(satoshiToBtc(unbondingFeeSat), 8);

  return (
    <ConfirmationModal
      title="Unbond"
      processing={processing}
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <Text variant="body1" className="pb-8 pt-4">
        You are about to unbond your stake before its expiration. A transaction
        fee of {unbondingFeeBtc} {coinSymbol} will be deduced from your stake by
        the {networkName} network.
        <br />
        The expected unbonding time will be about {formattedUnbondingTime}.
        After unbonded, you will need to use this dashboard to withdraw your
        stake for it to appear in your wallet.
      </Text>
      {currentStakingStepOptions && (
        <div className="border border-secondary-strokeLight p-4 mb-8 bg-primary-contrast/50 rounded max-h-60 overflow-y-auto flex flex-col gap-4">
          <SignDetails details={currentStakingStepOptions} />
        </div>
      )}
    </ConfirmationModal>
  );
};
