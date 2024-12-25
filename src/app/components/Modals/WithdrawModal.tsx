import { Text } from "@babylonlabs-io/bbn-core-ui";

import { getNetworkConfigBTC } from "@/config/network/btc";

import { ConfirmationModal } from "./ConfirmationModal";

interface WithdrawModalProps {
  processing: boolean;
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const { networkName } = getNetworkConfigBTC();

export const WithdrawModal = (props: WithdrawModalProps) => {
  return (
    <ConfirmationModal title="Withdraw" {...props}>
      <Text variant="body1" className="pt-8 pb-10">
        You are about to withdraw your stake. <br /> A transaction fee will be
        deduced from your stake by the {networkName} network.
      </Text>
    </ConfirmationModal>
  );
};
