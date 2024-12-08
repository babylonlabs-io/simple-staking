import { Text } from "@babylonlabs-io/bbn-core-ui";

import { DelegationV2 } from "@/app/types/delegationsV2";
import { getNetworkConfig } from "@/config/network.config";
import { satoshiToBtc } from "@/utils/btc";

import { ConfirmationModal } from "./ConfirmationModal";

const config = getNetworkConfig();

interface UnbondModalProps {
  processing: boolean;
  open: boolean;
  delegation: DelegationV2 | null;
  onClose: () => void;
  onSubmit: () => void;
}

export const UnbondModal = ({ delegation, ...props }: UnbondModalProps) => {
  return (
    <ConfirmationModal title="Unbounding" {...props}>
      <Text variant="body1" className="pt-6 pb-16">
        You are about to unbond your stake before its expiration. A transaction
        fee of {satoshiToBtc(delegation?.stakingAmount ?? 0)} {config.coinName}{" "}
        will be deduced from your stake by the BTC signet network.
        <br />
        <br />
        The expected unbonding time will be about 7 days. After unbonded, you
        will need to use this dashboard to withdraw your stake for it to appear
        in your wallet.
      </Text>
    </ConfirmationModal>
  );
};
