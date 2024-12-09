import { Text } from "@babylonlabs-io/bbn-core-ui";

import { DelegationV2 } from "@/app/types/delegationsV2";
import { getNetworkConfig } from "@/config/network.config";

import { ConfirmationModal } from "./ConfirmationModal";

interface UnbondModalProps {
  processing: boolean;
  open: boolean;
  delegation: DelegationV2 | null;
  onClose: () => void;
  onSubmit: () => void;
}
const { networkName, coinName } = getNetworkConfig();

export const UnbondModal = ({
  open,
  onClose,
  onSubmit,
  processing,
}: UnbondModalProps) => {
  return (
    <ConfirmationModal
      title="Unbonding"
      processing={processing}
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <Text variant="body1" className="pb-8 pt-4">
        You are about to unbond your stake before its expiration. A transaction
        fee of 0.00005 {coinName} will be deduced from your stake by the{" "}
        {networkName} network.
        <br />
        <br />
        The expected unbonding time will be about 7 days. After unbonded, you
        will need to use this dashboard to withdraw your stake for it to appear
        in your wallet.
      </Text>
    </ConfirmationModal>
  );
};
