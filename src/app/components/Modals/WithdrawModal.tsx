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
      <div className="font-medium text-callout text-itemSecondaryDefault text-pretty pt-8 pb-10">
        You are about to withdraw your stake. <br /> A transaction fee will be
        deduced from your stake by the {networkName} network.
      </div>
    </ConfirmationModal>
  );
};
