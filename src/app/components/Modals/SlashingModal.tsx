import { Text } from "@babylonlabs-io/bbn-core-ui";

import { BbnStakingParamsVersion } from "@/app/types/networkInfo";
import { NetworkConfig } from "@/config/network";

import { ConfirmationModal } from "./ConfirmationModal";

interface UnbondModalProps {
  processing: boolean;
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  networkConfig: NetworkConfig;
  param: BbnStakingParamsVersion | null;
}

export const SlashingModal = (props: UnbondModalProps) => {
  const { networkConfig, param } = props;
  const slashingRate = (param?.slashing?.slashingRate ?? 0) * 100;

  return (
    <ConfirmationModal title="Withdraw Balance" {...props}>
      <Text variant="body1" className="pt-8 pb-10">
        Your finality provider equivocated (double-voted) leading to{" "}
        {slashingRate}% of your stake getting slashed. You are about to withdraw
        the remaining balance. A transaction fee will be deducted from your
        stake by the {networkConfig.btc.networkName} network.
      </Text>
    </ConfirmationModal>
  );
};
